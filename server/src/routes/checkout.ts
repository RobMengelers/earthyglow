import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { createPayment } from '../mollie.js'
import { prisma } from '../prisma.js'

const FREE_SHIPPING_THRESHOLD_CENTS = 2500
const SHIPPING_CENTS = 495

const bodySchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1),
  customer: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.email(),
    phone: z.string().optional().default(''),
  }),
  shipping: z.object({
    address: z.string().min(1),
    postalCode: z.string().min(1),
    city: z.string().min(1),
    country: z.string().min(1),
  }),
  notes: z.string().optional().default(''),
})

function createOrderNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5)
  const random = Math.random().toString(36).toUpperCase().slice(2, 5)
  return `EG-${stamp}${random}`
}

export async function checkoutRoutes(app: FastifyInstance) {
  app.post('/api/checkout', async (request, reply) => {
    const parsed = bodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply
        .code(400)
        .send({ error: parsed.error.issues[0]?.message ?? 'Invalid request' })
    }

    const { items, customer, shipping, notes } = parsed.data

    const lines = []
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.id },
        select: { id: true, name: true, priceCents: true, active: true },
      })
      if (!product || !product.active) {
        return reply
          .code(400)
          .send({ error: `Product "${item.id}" is not available` })
      }
      lines.push({
        product,
        quantity: item.quantity,
        lineTotalCents: product.priceCents * item.quantity,
      })
    }

    // Prices are always recomputed here; the client cannot influence totals.
    const subtotalCents = lines.reduce(
      (sum, line) => sum + line.lineTotalCents,
      0,
    )
    const shippingCents =
      subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_CENTS
    const totalCents = subtotalCents + shippingCents
    const orderNumber = createOrderNumber()

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
          items: {
            create: lines.map((line) => ({
              productId: line.product.id,
              name: line.product.name,
              unitPriceCents: line.product.priceCents,
              quantity: line.quantity,
              lineTotalCents: line.lineTotalCents,
            })),
          },
        },
      })

      const payment = await createPayment({
        orderId: order.id,
        orderNumber,
        totalCents,
        description: `EarthyGlow order ${orderNumber}`,
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
