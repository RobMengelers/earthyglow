import type { FastifyInstance } from 'fastify'
import { PaymentLineType } from '@mollie/api-client'
import { z } from 'zod'
import { createPayment } from '../mollie.js'
import { createOrderNumber } from '../order-number.js'
import { prisma } from '../prisma.js'

const SHIPPING_ZONES = {
  netherlands: { code: 'NL', label: 'Netherlands', rateCents: 699, freeThresholdCents: 2500 },
  international: { code: 'XX', label: 'International', rateCents: 1295, freeThresholdCents: 5000 },
} as const

const KLARNA_COUNTRIES = new Set([
  'AT', 'BE', 'CZ', 'DE', 'DK', 'ES', 'FI', 'FR', 'GB', 'GR',
  'HU', 'IE', 'IT', 'NL', 'NO', 'PL', 'PT', 'RO', 'SE', 'SK', 'CH',
])

const VAT_RATE = 21

function mollieAmount(cents: number) {
  return { currency: 'EUR', value: (cents / 100).toFixed(2) }
}

function vatCentsIncluded(cents: number) {
  return Math.round((cents * VAT_RATE) / (100 + VAT_RATE))
}

const bodySchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(100),
        quantity: z.number().int().min(1).max(99),
        variantId: z.string().trim().min(1).max(80).optional(),
        variantLabel: z.string().trim().min(1).max(120).optional(),
      }),
    )
    .min(1)
    .max(50),
  customer: z.object({
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    email: z.email().trim().max(254),
    phone: z.string().trim().max(30).optional().default(''),
  }),
  shipping: z.object({
    address: z.string().trim().min(1).max(200),
    postalCode: z.string().trim().min(1).max(20),
    city: z.string().trim().min(1).max(80),
    country: z.string().trim().min(1).max(100),
    countryCode: z
      .string()
      .trim()
      .regex(/^[A-Za-z]{2}$/, 'Invalid country code')
      .transform((value) => value.toUpperCase()),
  }),
  notes: z.string().trim().max(500).optional().default(''),
  paymentMethod: z.string().trim().min(2).max(40).optional(),
})

export async function checkoutRoutes(app: FastifyInstance) {
  app.post('/api/checkout', { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, async (request, reply) => {
    const parsed = bodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply
        .code(400)
        .send({ error: parsed.error.issues[0]?.message ?? 'Invalid request' })
    }

    const { items, customer, shipping, notes, paymentMethod } = parsed.data

    const lines = []
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.id },
        select: { id: true, name: true, priceCents: true, active: true, _count: { select: { variants: true } } },
      })
      if (!product || !product.active) {
        return reply
          .code(400)
          .send({ error: `Product "${item.id}" is not available` })
      }
      if (product._count.variants > 0 && !item.variantId) {
        return reply.code(400).send({
          error: `Please choose an option for "${product.name}" on its product page and add it to your cart again.`,
        })
      }
      const variant = item.variantId
        ? await prisma.productVariant.findFirst({
            where: { id: item.variantId, productId: product.id, active: true },
          })
        : null
      if (item.variantId && !variant) {
        return reply.code(400).send({ error: `Variant for "${product.name}" is not available` })
      }
      if (item.variantId && item.variantLabel && variant?.label !== item.variantLabel) {
        return reply.code(400).send({ error: 'Invalid product variant' })
      }
      const unitPriceCents = variant?.priceCents ?? product.priceCents
      lines.push({
        product,
        quantity: item.quantity,
        variantId: item.variantId,
        variantLabel: variant?.label,
        unitPriceCents,
        lineTotalCents: unitPriceCents * item.quantity,
      })
    }

    // Prices are always recomputed here; the client cannot influence totals.
    const subtotalCents = lines.reduce(
      (sum, line) => sum + line.lineTotalCents,
      0,
    )
    const zone =
      shipping.countryCode === SHIPPING_ZONES.netherlands.code
        ? SHIPPING_ZONES.netherlands
        : SHIPPING_ZONES.international
    const shippingCents =
      subtotalCents >= zone.freeThresholdCents ? 0 : zone.rateCents
    const totalCents = subtotalCents + shippingCents
    const orderNumber = createOrderNumber()

    if (paymentMethod === 'klarna' && !KLARNA_COUNTRIES.has(shipping.countryCode)) {
      return reply.code(400).send({
        error: 'Klarna is not available for the selected shipping country. Please choose another payment method.',
      })
    }

    const paymentLines =
      paymentMethod === 'klarna'
        ? [
            ...lines.map((line) => ({
              type: PaymentLineType.physical,
              description: line.variantLabel
                ? `${line.product.name} (${line.variantLabel})`
                : line.product.name,
              quantity: line.quantity,
              unitPrice: mollieAmount(line.unitPriceCents),
              totalAmount: mollieAmount(line.lineTotalCents),
              vatRate: `${VAT_RATE}.00`,
              vatAmount: mollieAmount(vatCentsIncluded(line.lineTotalCents)),
            })),
            ...(shippingCents > 0
              ? [
                  {
                    type: PaymentLineType.shipping_fee,
                    description: 'Shipping',
                    quantity: 1,
                    unitPrice: mollieAmount(shippingCents),
                    totalAmount: mollieAmount(shippingCents),
                    vatRate: `${VAT_RATE}.00`,
                    vatAmount: mollieAmount(vatCentsIncluded(shippingCents)),
                  },
                ]
              : []),
          ]
        : undefined

    const billingAddress =
      paymentMethod === 'klarna'
        ? {
            givenName: customer.firstName,
            familyName: customer.lastName,
            streetAndNumber: shipping.address,
            postalCode: shipping.postalCode,
            city: shipping.city,
            country: shipping.countryCode,
            email: customer.email,
          }
        : undefined

    const shippingAddress =
      paymentMethod === 'klarna'
        ? {
            givenName: customer.firstName,
            familyName: customer.lastName,
            streetAndNumber: shipping.address,
            postalCode: shipping.postalCode,
            city: shipping.city,
            country: shipping.countryCode,
          }
        : undefined

    try {
      const db = prisma
      const dbCustomer = await db.customer.upsert({
        where: { email: customer.email.toLowerCase() },
        create: {
          email: customer.email.toLowerCase(),
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone || null,
        },
        update: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone || null,
        },
      })

      const order = await db.order.create({
        data: {
          orderNumber,
          customerId: dbCustomer.id,
          status: 'pending',
          subtotalCents,
          shippingCents,
          totalCents,
          currency: 'EUR',
          address: shipping.address,
          postalCode: shipping.postalCode,
          city: shipping.city,
          country: shipping.country,
          notes: notes || null,
          paymentMethod: paymentMethod ?? null,
          items: {
            create: lines.map((line, index) => ({
              productId: line.product.id,
              name: line.product.name,
              variantId: line.variantId,
              variantLabel: line.variantLabel,
              unitPriceCents: line.unitPriceCents,
              quantity: line.quantity,
              lineTotalCents: line.lineTotalCents,
              position: index,
            })),
          },
        },
      })

      const payment = await createPayment({
        orderId: order.id,
        orderNumber,
        totalCents,
        description: `EarthyGlow order ${orderNumber}`,
        method: paymentMethod,
        lines: paymentLines,
        billingAddress,
        shippingAddress,
      })

      await db.order.update({
        where: { id: order.id },
        data: { molliePaymentId: payment.id },
      })

      return reply.send({
        orderNumber,
        status: order.status,
        subtotalCents,
        shippingCents,
        totalCents,
        checkoutUrl: payment.checkoutUrl,
      })
    } catch (error) {
      request.log.error(error, 'Checkout failed')
      return reply.code(502).send({ error: 'Could not start the payment' })
    }
  })
}
