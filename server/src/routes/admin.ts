import type { OrderStatus } from '@prisma/client'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import {
  adminJwtSecret,
  secureEqual,
  signAdminToken,
  verifyAdminToken,
} from '../admin-auth.js'
import { env } from '../env.js'
import { archiveInvoiceForOrder, MISSING_DETAIL, sendFulfillmentEmail, sendOrderInvoice, sendRefundEmail } from '../email.js'
import { refundPayment } from '../mollie.js'
import { createOrderNumber } from '../order-number.js'
import { prisma } from '../prisma.js'

const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'paid',
  'failed',
  'expired',
  'canceled',
  'refunded',
]

// A sale made in person. Every customer detail is optional: blanks become "-"
// in the non-nullable text columns (and NULL for email, which is unique), so a
// cash sale at a market stall needs nothing but a product and a price.
// The unit price is admin-editable on purpose — a trade or market price is a
// legitimate thing to record — but the product name and variant always come
// from the database so an invoice can never carry a bogus line.
const dashIfBlank = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : MISSING_DETAIL))

// An empty string is treated as "not given" rather than an invalid address, so
// a form that posts empty fields does not bounce off the API.
const optionalEmail = z.preprocess(
  (value) =>
    typeof value === 'string' && value.trim().length === 0 ? undefined : value,
  // Trim first, then validate: `z.email()` checks the value as it arrives, so
  // a pasted address with stray spaces would otherwise be rejected.
  z.string().trim().max(254).pipe(z.email()).optional(),
)

const manualOrderSchema = z.object({
  // `.prefault` keeps the whole object optional while still running the blank
  // handling above, so `{ customer: {} }`, `{ customer: {} }` omitted entirely
  // and a fully filled object all end up valid.
  customer: z
    .object({
      firstName: dashIfBlank(80),
      lastName: dashIfBlank(80),
      email: optionalEmail,
      phone: z.string().trim().max(30).optional(),
    })
    .prefault({}),
  shipping: z
    .object({
      address: dashIfBlank(200),
      postalCode: dashIfBlank(20),
      city: dashIfBlank(80),
      country: dashIfBlank(100),
    })
    .prefault({}),
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1).max(100),
        variantId: z.string().trim().min(1).max(80).optional(),
        unitPriceCents: z.number().int().min(0).max(1_000_000),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1)
    .max(50),
  notes: z.string().trim().max(500).optional().default(''),
  sendInvoiceEmail: z.boolean().optional().default(false),
})

// The shop prices everything VAT-inclusive at 21% (see the invoice), so a
// purchase's receipt total is split exactly the way invoices are: net is what
// is left after pulling the included VAT out of the gross price.
const VAT_INCLUSIVE_RATE_21 = 121
export function includedVatSplit(costCents: number): {
  netCents: number
  vatCents: number
} {
  const netCents = Math.round((costCents * 100) / VAT_INCLUSIVE_RATE_21)
  return { netCents, vatCents: costCents - netCents }
}

// Purchases arrive as a JSON form; cost is the number typed by the admin (with
// a comma or a dot as the decimal separator) and is parsed into cents server
// side so a malformed value can never pollute the books.
const purchaseFieldsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose the date it was bought'),
  description: z.string().trim().min(1, 'Describe what you bought').max(300),
  cost: z.string().regex(/^\d{1,7}([,.]\d{1,2})?$/, 'Enter the total cost in euros, e.g. 24,50'),
})

const purchaseDocumentSchema = z.object({
  name: z.string().trim().min(1).max(200),
  type: z.string().trim().max(120).default('application/octet-stream'),
  // Base64 of the uploaded file. The cap keeps a single receipt/document
  // manageable (~15 MB of decoded bytes) without unbounded request bodies.
  data: z.string().min(1).max(20 * 1024 * 1024),
})

function eurosToCents(value: string): number | null {
  const normalized = value.replace(',', '.')
  const parsed = Number.parseFloat(normalized)
  if (!Number.isFinite(parsed)) return null
  return Math.round(parsed * 100)
}

// A calendar date entered on the form, anchored at midday UTC so converting to
// local dates never shifts it onto the previous or next day.
function dateBoughtFromForm(value: string): Date {
  return new Date(`${value}T12:00:00.000Z`)
}

// Filenames come from the browser and could carry quotes, path separators or
// other bytes that are unsafe in a Content-Disposition header.
function safeFileName(name: string): string {
  const cleaned = Array.from(name.trim())
    .filter(
      (char) =>
        char.charCodeAt(0) >= 32 &&
        char !== '"' &&
        char !== '\\' &&
        char !== '/',
    )
    .join('')
    .replace(/\s+/g, ' ')
  return cleaned.length > 0 ? cleaned.slice(0, 120) : 'document'
}

export async function adminRoutes(app: FastifyInstance) {
  // Admin auth is only available when an ADMIN_PASSWORD is configured.
  const enabled = env.ADMIN_PASSWORD.length > 0

  app.post(
    '/api/admin/login',
    { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    async (request, reply) => {
      if (!enabled) {
        return reply.code(404).send({ error: 'Not found' })
      }

      const body = request.body as { username?: unknown; password?: unknown }
      const username = typeof body?.username === 'string' ? body.username : ''
      const password = typeof body?.password === 'string' ? body.password : ''

      if (
        !secureEqual(username, env.ADMIN_USERNAME) ||
        !secureEqual(password, env.ADMIN_PASSWORD)
      ) {
        return reply.code(401).send({ error: 'Invalid credentials' })
      }

      const secret = adminJwtSecret(env.ADMIN_USERNAME, env.ADMIN_PASSWORD)
      return reply.send({
        token: signAdminToken(secret),
        expiresIn: 12 * 60 * 60,
      })
    },
  )

  async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
    const header = request.headers.authorization
    const token = header?.startsWith('Bearer ') ? header.slice(7) : ''
    if (
      !enabled ||
      !token ||
      !verifyAdminToken(
        token,
        adminJwtSecret(env.ADMIN_USERNAME, env.ADMIN_PASSWORD),
      )
    ) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }
    return undefined
  }

  app.get(
    '/api/admin/session',
    { preHandler: requireAdmin },
    async () => ({ ok: true }),
  )

  // Records a sale made in person. The order is born paid (the money changed
  // hands in the shop) and its invoice PDF is archived immediately, so the
  // download button works without ever going through the email flow.
  app.post('/api/admin/orders', { preHandler: requireAdmin }, async (request, reply) => {
    const parsed = manualOrderSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply
        .code(400)
        .send({ error: parsed.error.issues[0]?.message ?? 'Invalid order' })
    }

    const { customer, shipping, items, notes, sendInvoiceEmail } = parsed.data

    const lines = []
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: {
          id: true,
          name: true,
          active: true,
          _count: { select: { variants: true } },
        },
      })
      if (!product || !product.active) {
        return reply
          .code(400)
          .send({ error: `Product "${item.productId}" is not available` })
      }
      if (product._count.variants > 0 && !item.variantId) {
        return reply
          .code(400)
          .send({ error: `Please choose an option for "${product.name}"` })
      }
      const variant = item.variantId
        ? await prisma.productVariant.findFirst({
            where: { id: item.variantId, productId: product.id, active: true },
          })
        : null
      if (item.variantId && !variant) {
        return reply
          .code(400)
          .send({ error: `Variant for "${product.name}" is not available` })
      }
      // The admin's price wins (market/trade discount), but the name and
      // variant are always the database's so the invoice stays truthful.
      const unitPriceCents = item.unitPriceCents
      lines.push({
        productId: product.id,
        name: product.name,
        variantId: item.variantId ?? null,
        variantLabel: variant?.label ?? null,
        unitPriceCents,
        quantity: item.quantity,
        lineTotalCents: unitPriceCents * item.quantity,
      })
    }

    // An in-person sale has no shipping: the customer is standing right there.
    const shippingCents = 0
    const subtotalCents = lines.reduce(
      (sum, line) => sum + line.lineTotalCents,
      0,
    )
    const totalCents = subtotalCents
    const orderNumber = createOrderNumber()
    const email = customer.email ? customer.email.toLowerCase() : null

    try {
      // Dedupe on email when there is one. Without an email there is nothing to
      // match on, so each walk-in gets its own customer row rather than
      // colliding on a shared placeholder.
      const dbCustomer = email
        ? await prisma.customer.upsert({
            where: { email },
            create: {
              email,
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
        : await prisma.customer.create({
            data: {
              email: null,
              firstName: customer.firstName,
              lastName: customer.lastName,
              phone: customer.phone || null,
            },
          })

      const order = await prisma.order.create({
        data: {
          orderNumber,
          customerId: dbCustomer.id,
          status: 'paid',
          paidAt: new Date(),
          subtotalCents,
          shippingCents,
          totalCents,
          currency: 'EUR',
          address: shipping.address,
          postalCode: shipping.postalCode,
          city: shipping.city,
          country: shipping.country,
          notes: notes || null,
          items: { create: lines },
        },
        // The PDF is archived after this insert, so `omit` also keeps the
        // response free of the bytea column.
        omit: { invoicePdf: true },
        include: { customer: true, items: { orderBy: { id: 'asc' } } },
      })

      // Archive before replying so the row is downloadable the moment the admin
      // sees it. A failure here is logged but must not lose the order.
      let hasInvoicePdf = false
      try {
        hasInvoicePdf = (await archiveInvoiceForOrder(order.id)) !== null
      } catch (error) {
        request.log.error(
          { error, orderId: order.id },
          'Could not archive invoice for manual order',
        )
      }

      if (sendInvoiceEmail) {
        try {
          if (await sendOrderInvoice(order.orderNumber)) {
            const sentAt = new Date()
            await prisma.order.update({
              where: { id: order.id },
              data: { invoiceSentAt: sentAt },
            })
            return { order: { ...order, invoiceSentAt: sentAt }, hasInvoicePdf: true }
          }
        } catch (error) {
          request.log.error(
            { error, orderId: order.id },
            'Manual order saved but the invoice email failed',
          )
          return reply.code(502).send({
            error:
              'Order saved, but the invoice email could not be sent. Download the PDF and email it yourself.',
            order: { ...order, hasInvoicePdf },
          })
        }
      }

      return { order, hasInvoicePdf }
    } catch (error) {
      request.log.error({ error }, 'Could not create manual order')
      return reply.code(500).send({ error: 'Could not save the order' })
    }
  })

  app.get(
    '/api/admin/orders',
    { preHandler: requireAdmin },
    async (request) => {
      const query = request.query as { status?: string }
      const where =
        query.status && (ORDER_STATUSES as string[]).includes(query.status)
          ? { status: query.status as OrderStatus }
          : {}

      const [counts, orders, archived] = await Promise.all([
        prisma.order.groupBy({ by: ['status'], _count: true }),
        prisma.order.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: 300,
          omit: { invoicePdf: true },
          include: {
            customer: true,
            items: { orderBy: { id: 'asc' } },
          },
        }),
        // Ids only: the PDFs themselves are tens of KB each and the list view
        // must not drag hundreds of them over the wire.
        prisma.order.findMany({
          where: { invoicePdf: { not: null } },
          select: { id: true },
        }),
      ])

      const archivedIds = new Set(archived.map((row) => row.id))

      const stats: Record<string, number> = {
        pending: 0,
        paid: 0,
        failed: 0,
        expired: 0,
        canceled: 0,
        refunded: 0,
      }
      for (const row of counts) stats[row.status] = row._count

      return {
        stats,
        orders: orders.map((order) => ({
          ...order,
          hasInvoicePdf: archivedIds.has(order.id),
        })),
      }
    },
  )

  // Powers the dashboard: status counts, how the last 30 days / quarter / year
  // compare to the same window before it, what still needs shipping, and the
  // newest orders. Aggregated in the database so the landing page stays cheap
  // as the table grows. `period` picks the window; anything else falls back to
  // 30 days.
  const OVERVIEW_DAYS: Record<string, number> = {
    '30d': 30,
    quarter: 90,
    year: 365,
  }
  app.get('/api/admin/overview', { preHandler: requireAdmin }, async (request) => {
    const query = request.query as { period?: string }
    const days = OVERVIEW_DAYS[query.period ?? '30d'] ?? 30
    const now = Date.now()
    const DAY = 24 * 60 * 60 * 1000
    const periodStart = new Date(now - days * DAY)
    const previousPeriodStart = new Date(now - 2 * days * DAY)

    const [counts, revenue, previousRevenue, expenses, previousExpenses, unfulfilledCount, customerCount, recent] =
      await Promise.all([
        prisma.order.groupBy({ by: ['status'], _count: true }),
        prisma.order.aggregate({
          _sum: { totalCents: true },
          where: { status: 'paid', paidAt: { gte: periodStart } },
        }),
        prisma.order.aggregate({
          _sum: { totalCents: true },
          where: {
            status: 'paid',
            paidAt: { gte: previousPeriodStart, lt: periodStart },
          },
        }),
        prisma.purchase.aggregate({
          _sum: { costCents: true },
          where: { dateBought: { gte: periodStart } },
        }),
        prisma.purchase.aggregate({
          _sum: { costCents: true },
          where: { dateBought: { gte: previousPeriodStart, lt: periodStart } },
        }),
        // "Paid but never marked processed" is the shop's real to-do list.
        prisma.order.count({ where: { status: 'paid', fulfillmentStatus: 'open' } }),
        prisma.customer.count(),
        prisma.order.findMany({
          orderBy: { createdAt: 'desc' },
          take: 6,
          omit: { invoicePdf: true },
          include: { customer: true, items: { orderBy: { id: 'asc' } } },
        }),
      ])

    const cachedIds = recent.map((order) => order.id)
    const archivedIds = new Set(
      cachedIds.length === 0
        ? []
        : (
            await prisma.order.findMany({
              where: {
                id: { in: cachedIds },
                invoicePdf: { not: null },
              },
              select: { id: true },
            })
          ).map((row) => row.id),
    )

    const stats: Record<string, number> = {}
    for (const row of counts) stats[row.status] = row._count

    const revenueCents = revenue._sum.totalCents ?? 0
    const previousRevenueCents = previousRevenue._sum.totalCents ?? 0
    const expensesCents = expenses._sum.costCents ?? 0
    const previousExpensesCents = previousExpenses._sum.costCents ?? 0

    return {
      stats,
      revenueCents,
      previousRevenueCents,
      expensesCents,
      previousExpensesCents,
      profitCents: revenueCents - expensesCents,
      previousProfitCents: previousRevenueCents - previousExpensesCents,
      unfulfilledCount,
      customerCount,
      recentOrders: recent.map((order) => ({
        ...order,
        hasInvoicePdf: archivedIds.has(order.id),
      })),
    }
  })

  // The purchases page: every recorded purchase, newest first. The document
  // bytes stay out of the list response (they are served by their own route).
  app.get('/api/admin/purchases', { preHandler: requireAdmin }, async () => {
    const purchases = await prisma.purchase.findMany({
      orderBy: { dateBought: 'desc' },
      omit: { documentBytes: true },
    })
    return {
      purchases: purchases.map((purchase) => ({
        ...purchase,
        ...includedVatSplit(purchase.costCents),
        hasDocument: purchase.documentName !== null,
      })),
    }
  })

  // Records a purchase. `date` is the day it was bought, `description` the free
  // text, `cost` the VAT-inclusive total (split into net + 21% VAT), and
  // `document` is an optional base64-encoded receipt.
  app.post(
    '/api/admin/purchases',
    { preHandler: requireAdmin, bodyLimit: 21 * 1024 * 1024 },
    async (request, reply) => {
      const body = request.body as Record<string, unknown>
      const fields = purchaseFieldsSchema.safeParse({
        date: body.date,
        description: body.description,
        cost: body.cost,
      })
      if (!fields.success) {
        return reply
          .code(400)
          .send({ error: fields.error.issues[0]?.message ?? 'Invalid purchase' })
      }

      const costCents = eurosToCents(fields.data.cost)
      if (costCents === null || costCents <= 0) {
        return reply
          .code(400)
          .send({ error: 'Enter the total cost in euros, e.g. 24,50' })
      }

      let parsedDocument: z.infer<typeof purchaseDocumentSchema> | null = null
      if (body.document !== undefined && body.document !== null) {
        const parsed = purchaseDocumentSchema.safeParse(body.document)
        if (!parsed.success) {
          return reply.code(400).send({ error: 'The uploaded document is not valid' })
        }
        parsedDocument = parsed.data
      }

      const purchase = await prisma.purchase.create({
        data: {
          dateBought: dateBoughtFromForm(fields.data.date),
          description: fields.data.description,
          costCents,
          documentName: parsedDocument ? safeFileName(parsedDocument.name) : null,
          documentMime: parsedDocument ? parsedDocument.type : null,
          documentBytes: parsedDocument
            ? Buffer.from(parsedDocument.data, 'base64')
            : null,
        },
        omit: { documentBytes: true },
      })

      return {
        purchase: {
          ...purchase,
          ...includedVatSplit(purchase.costCents),
          hasDocument: purchase.documentName !== null,
        },
      }
    },
  )

  app.delete(
    '/api/admin/purchases/:id',
    { preHandler: requireAdmin },
    async (request, reply) => {
      const params = request.params as { id: string }
      try {
        await prisma.purchase.delete({ where: { id: params.id } })
      } catch {
        return reply.code(404).send({ error: 'Purchase not found' })
      }
      return { ok: true }
    },
  )

  // Serves the document (receipt) that was attached to a purchase, so the admin
  // can open the original file exactly as it was uploaded.
  app.get(
    '/api/admin/purchases/:id/document',
    { preHandler: requireAdmin },
    async (request, reply) => {
      const params = request.params as { id: string }
      const purchase = await prisma.purchase.findUnique({
        where: { id: params.id },
        select: { documentName: true, documentMime: true, documentBytes: true },
      })
      if (!purchase || !purchase.documentBytes || !purchase.documentName) {
        return reply.code(404).send({ error: 'No document for this purchase' })
      }
      return reply
        .type(purchase.documentMime ?? 'application/octet-stream')
        .header(
          'Content-Disposition',
          `attachment; filename="${purchase.documentName}"`,
        )
        .send(Buffer.from(purchase.documentBytes))
    },
  )

  app.patch('/api/admin/orders/:id/fulfillment', { preHandler: requireAdmin }, async (request, reply) => {
    const body = request.body as { status?: unknown; carrier?: unknown; trackingCode?: unknown }
    const status = body.status === 'processed' ? 'processed' : body.status === 'open' ? 'open' : null
    if (!status) return reply.code(400).send({ error: 'Invalid fulfillment status' })
    if (status === 'processed' && (typeof body.carrier !== 'string' || !body.carrier.trim() || typeof body.trackingCode !== 'string' || !body.trackingCode.trim())) {
      return reply.code(400).send({ error: 'Carrier and tracking code are required' })
    }
    const params = request.params as { id: string }
    const order = await prisma.order.findUnique({ where: { id: params.id }, include: { customer: true } })
    if (!order) return reply.code(404).send({ error: 'Order not found' })
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { fulfillmentStatus: status, carrier: typeof body.carrier === 'string' && body.carrier.trim() ? body.carrier.trim() : order.carrier, trackingCode: typeof body.trackingCode === 'string' && body.trackingCode.trim() ? body.trackingCode.trim() : order.trackingCode, fulfilledAt: status === 'processed' ? new Date() : null, fulfillmentEmailSentAt: status === 'open' ? null : order.fulfillmentEmailSentAt },
      include: { customer: true, items: true },
    })
    if (status === 'processed' && !order.fulfillmentEmailSentAt) {
      try {
        const emailSent = await sendFulfillmentEmail(updated)
        if (emailSent) {
          await prisma.order.update({ where: { id: order.id }, data: { fulfillmentEmailSentAt: new Date() } })
        }
      } catch (error) {
        request.log.error({ error, orderId: order.id }, 'Fulfillment email failed after order was processed')
      }
    }
    return updated
  })

  // Serves the PDF bytes that were archived when the invoice was emailed, so
  // the downloaded file is verbatim identical to the one the customer received.
  app.get('/api/admin/orders/:id/invoice', { preHandler: requireAdmin }, async (request, reply) => {
    const params = request.params as { id: string }
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      select: { orderNumber: true, invoicePdf: true },
    })
    if (!order) return reply.code(404).send({ error: 'Order not found' })
    if (!order.invoicePdf) {
      return reply.code(409).send({ error: 'No archived invoice for this order' })
    }
    return reply
      .type('application/pdf')
      .header('Content-Disposition', `attachment; filename="invoice-${order.orderNumber}.pdf"`)
      .send(Buffer.from(order.invoicePdf))
  })

  app.post('/api/admin/orders/:id/refund', { preHandler: requireAdmin }, async (request, reply) => {
    const params = request.params as { id: string }
    const order = await prisma.order.findUnique({ where: { id: params.id }, include: { customer: true } })
    if (!order) return reply.code(404).send({ error: 'Order not found' })
    if (order.status === 'refunded') return reply.code(409).send({ error: 'Order is already refunded' })
    if (order.status !== 'paid') return reply.code(400).send({ error: 'Only paid orders can be refunded' })
    if (!order.molliePaymentId) {
      return reply.code(409).send({ error: 'This order has no Mollie payment to refund' })
    }
    await refundPayment(order.molliePaymentId, order.totalCents)
    const updated = await prisma.order.update({ where: { id: order.id }, data: { status: 'refunded' }, include: { customer: true, items: true } })
    try {
      await sendRefundEmail(updated)
    } catch (error) {
      request.log.error({ error, orderId: order.id }, 'Refund succeeded but refund email failed')
    }
    return updated
  })
}
