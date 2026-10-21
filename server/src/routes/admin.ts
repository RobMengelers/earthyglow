import { Prisma, type OrderStatus } from '@prisma/client'
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
        colorId: z.string().trim().min(1).max(80).optional(),
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

// A coupon code the shop hands out. The type decides what it does: free
// shipping, a percentage off the subtotal or a fixed amount off. `maxUses`
// makes it a one-time code and `expiresAt` gives it an end date.
const couponSchema = z.object({
  code: z.string().trim().min(1, 'Enter the code').max(40),
  description: z.string().trim().max(200).optional(),
  type: z.enum(['free_shipping', 'percent', 'fixed_amount']),
  percentOff: z.number().int().min(1).max(100).optional(),
  amountOffCents: z.number().int().min(1).optional(),
  maxUses: z.number().int().min(1).max(100000).optional(),
  expiresAt: z.string().trim().max(40).optional(),
})

// Materials and recipes. Amounts arrive as strings (comma or dot decimal) so
// the forms can mirror how the shop speaks about them: "2,5 kg wax".
const materialCreateSchema = z.object({
  name: z.string().trim().min(1, 'Name the material').max(80),
  unit: z.string().trim().min(1, 'Give the unit, e.g. kg or g').max(12),
  quantity: z
    .string()
    .trim()
    .regex(/^\d{1,5}([,.]\d{1,3})?$/, 'Enter the amount on hand, e.g. 5 or 2,5'),
})

const materialStockSchema = z.object({
  amount: z
    .string()
    .trim()
    .regex(/^-?\d{1,5}([,.]\d{1,3})?$/, 'Enter the amount to add, e.g. 2,5'),
})

const recipeCreateSchema = z.object({
  productId: z.string().trim().min(1, 'Choose the product this recipe makes').max(100),
  ingredients: z
    .array(
      z.object({
        materialId: z.string().trim().min(1),
        amount: z.string().trim().regex(/^\d{1,5}([,.]\d{1,3})?$/, 'Enter how much the recipe uses, e.g. 0,05'),
      }),
    )
    .min(1, 'Add at least one material to the recipe')
    .max(20),
  fields: z
    .array(
      z.object({
        label: z.string().trim().min(1, 'Name the field').max(60),
        value: z.string().trim().min(1, 'Fill in the value').max(300),
      }),
    )
    .max(20)
    .optional()
    .default([]),
})

function parseDecimal(value: string): number | null {
  const parsed = Number.parseFloat(value.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
}

// How many recipes' worth of a product the leftover stock can still make for
// one ingredient. The 1e-9 absorbs the binary float dust a division like
// 2,5 / 0,05 leaves behind, so "exactly 50" is not cut down to 49.
function possibleUnits(quantity: number, amount: number): number {
  if (!(amount > 0)) return 0
  return Math.max(0, Math.floor((quantity + 1e-9) / amount))
}

type RecipeWithRelations = {
  id: string
  product: { id: string; name: string }
  ingredients: {
    materialId: string
    amount: number
    material: { id: string; name: string; unit: string; quantity: number }
  }[]
  fields: { label: string; value: string }[]
}

// A recipe is only makeable while every ingredient it uses still has stock;
// the tightest ingredient decides how many of the product remain possible.
function serializeRecipe(recipe: RecipeWithRelations) {
  const ingredients = recipe.ingredients.map((ingredient) => ({
    materialId: ingredient.materialId,
    amount: ingredient.amount,
    material: ingredient.material,
    possibleUnits: possibleUnits(ingredient.material.quantity, ingredient.amount),
  }))
  return {
    id: recipe.id,
    product: recipe.product,
    ingredients,
    fields: recipe.fields.map((field) => ({ label: field.label, value: field.value })),
    possibleUnits:
      ingredients.length === 0
        ? 0
        : Math.min(...ingredients.map((ingredient) => ingredient.possibleUnits)),
  }
}

const RECIPE_INCLUDE = {
  product: { select: { id: true, name: true } },
  ingredients: { include: { material: true } },
  fields: { orderBy: { id: 'asc' as const } },
}

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
          _count: { select: { variants: true, colors: true } },
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
      // The colour tells the shop what to pour, so it is recorded just like the
      // variant — and it comes from the database, never from the form.
      if (product._count.colors > 0 && !item.colorId) {
        return reply
          .code(400)
          .send({ error: `Please choose a colour for "${product.name}"` })
      }
      const color = item.colorId
        ? await prisma.productColor.findFirst({
            where: { id: item.colorId, productId: product.id, active: true },
          })
        : null
      if (item.colorId && !color) {
        return reply
          .code(400)
          .send({ error: `Colour for "${product.name}" is not available` })
      }
      // The admin's price wins (market/trade discount), but the name, variant
      // and colour are always the database's so the invoice stays truthful.
      const unitPriceCents = item.unitPriceCents
      lines.push({
        productId: product.id,
        name: product.name,
        variantId: item.variantId ?? null,
        variantLabel: variant?.label ?? null,
        colorId: item.colorId ?? null,
        colorLabel: color?.label ?? null,
        unitPriceCents,
        quantity: item.quantity,
        lineTotalCents: unitPriceCents * item.quantity,
        position: lines.length,
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
        include: { customer: true, items: { orderBy: [{ position: 'asc' }, { id: 'asc' }] } },
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

  // The orders list is keyset-paginated so a shop that has grown past a few
  // hundred orders still loads a bounded page. Status, fulfilment and the free
  // text search are all applied in the database (the client only ever holds the
  // pages it has scrolled to). Ordering by (createdAt, id) is total, so the
  // opaque `nextCursor` (the last id on the page) always resumes cleanly.
  const ORDERS_PAGE_SIZE = 50
  const ORDERS_MAX_PAGE_SIZE = 100

  app.get(
    '/api/admin/orders',
    { preHandler: requireAdmin },
    async (request) => {
      const query = request.query as {
        status?: string
        q?: string
        fulfilment?: string
        cursor?: string
        limit?: string
      }

      const statusFilter =
        query.status && (ORDER_STATUSES as string[]).includes(query.status)
          ? (query.status as OrderStatus)
          : undefined
      const search = (query.q ?? '').trim()
      const onlyOpen = query.fulfilment === 'open'
      const parsedLimit = Number.parseInt(query.limit ?? '', 10)
      const limit = Number.isFinite(parsedLimit)
        ? Math.min(Math.max(parsedLimit, 1), ORDERS_MAX_PAGE_SIZE)
        : ORDERS_PAGE_SIZE
      const cursor =
        typeof query.cursor === 'string' && query.cursor.length > 0
          ? query.cursor
          : undefined

      const where: Prisma.OrderWhereInput = {}
      if (statusFilter) where.status = statusFilter
      if (onlyOpen) where.fulfillmentStatus = 'open'
      if (search !== '') {
        where.OR = [
          { orderNumber: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          {
            customer: {
              is: {
                OR: [
                  { firstName: { contains: search, mode: 'insensitive' } },
                  { lastName: { contains: search, mode: 'insensitive' } },
                  { email: { contains: search, mode: 'insensitive' } },
                ],
              },
            },
          },
        ]
      }

      const [counts, matched, paid, rows] = await Promise.all([
        prisma.order.groupBy({ by: ['status'], _count: true }),
        prisma.order.aggregate({ where, _count: true }),
        // "€X paid" in the header: the paid value of everything matching the
        // current filters, not just the page that happens to be loaded.
        prisma.order.aggregate({
          where: { AND: [where, { status: 'paid' }] },
          _sum: { totalCents: true },
        }),
        prisma.order.findMany({
          where,
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          // One extra row tells us whether another page exists without a count.
          take: limit + 1,
          ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
          omit: { invoicePdf: true },
          include: {
            customer: true,
            items: { orderBy: [{ position: 'asc' }, { id: 'asc' }] },
          },
        }),
      ])

      const hasMore = rows.length > limit
      const page = hasMore ? rows.slice(0, limit) : rows
      const nextCursor = hasMore ? page[page.length - 1]!.id : null

      // Ids only: the PDFs themselves are tens of KB each, so the list view
      // must not drag them (or the ids of every order ever archived) over the
      // wire — just the archived flag for the orders on the page.
      const orderIds = page.map((order) => order.id)
      const archivedIds = new Set(
        orderIds.length === 0
          ? []
          : (
              await prisma.order.findMany({
                where: { id: { in: orderIds }, invoicePdf: { not: null } },
                select: { id: true },
              })
            ).map((row) => row.id),
      )

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
        orders: page.map((order) => ({
          ...order,
          hasInvoicePdf: archivedIds.has(order.id),
        })),
        nextCursor,
        total: matched._count,
        paidTotalCents: paid._sum.totalCents ?? 0,
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
          include: { customer: true, items: { orderBy: [{ position: 'asc' }, { id: 'asc' }] } },
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

  // ---- Coupon codes ----

  // Every coupon with how often it was used, so the shop can see which codes
  // are running and which ones are used up.
  app.get('/api/admin/coupons', { preHandler: requireAdmin }, async () => {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { redemptions: true } } },
    })
    return {
      coupons: coupons.map((coupon) => {
        const { _count, ...rest } = coupon
        return {
          ...rest,
          // How many orders used the code. The counter on the row is what the
          // one-time limit is checked against.
          redemptions: _count.redemptions,
        }
      }),
    }
  })

  // Creates a coupon. The type decides what the code does, so a Christmas
  // percentage code or a one-time offer is a row, not a new kind of code.
  app.post('/api/admin/coupons', { preHandler: requireAdmin }, async (request, reply) => {
    const parsed = couponSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply
        .code(400)
        .send({ error: parsed.error.issues[0]?.message ?? 'Invalid coupon' })
    }
    const data = parsed.data
    const code = data.code.toUpperCase()

    const existing = await prisma.coupon.findUnique({ where: { code } })
    if (existing) {
      return reply.code(400).send({ error: `The code ${code} already exists` })
    }

    if (data.type === 'percent' && !data.percentOff) {
      return reply.code(400).send({ error: 'Enter the percentage to take off' })
    }
    if (data.type === 'fixed_amount' && !data.amountOffCents) {
      return reply.code(400).send({ error: 'Enter the amount to take off' })
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        description: data.description || null,
        type: data.type,
        percentOff: data.type === 'percent' ? data.percentOff ?? null : null,
        amountOffCents:
          data.type === 'fixed_amount' ? data.amountOffCents ?? null : null,
        maxUses: data.maxUses ?? null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    })
    return { coupon: { ...coupon, usedCount: 0 } }
  })

  // Switches a code on or off, which is how a code is retired without
  // deleting the orders that used it.
  app.patch('/api/admin/coupons/:id', { preHandler: requireAdmin }, async (request, reply) => {
    const params = request.params as { id: string }
    const body = request.body as { active?: unknown }
    if (typeof body.active !== 'boolean') {
      return reply.code(400).send({ error: 'Invalid coupon' })
    }
    try {
      const coupon = await prisma.coupon.update({
        where: { id: params.id },
        data: { active: body.active },
      })
      return { coupon }
    } catch {
      return reply.code(404).send({ error: 'Coupon not found' })
    }
  })

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

  // The materials & recipes tab: stock on hand per material, every recipe
  // with its product, ingredients and free fields, and — derived live from
  // the leftover stock — how many of each product can still be made.
  app.get('/api/admin/materials', { preHandler: requireAdmin }, async () => {
    const [materials, recipes] = await Promise.all([
      prisma.material.findMany({ orderBy: { name: 'asc' } }),
      prisma.recipe.findMany({
        orderBy: { createdAt: 'desc' },
        include: RECIPE_INCLUDE,
      }),
    ])
    return { materials, recipes: recipes.map(serializeRecipe) }
  })

  // Adds a new material type (wax, scent, …) with its starting amount.
  app.post('/api/admin/materials', { preHandler: requireAdmin }, async (request, reply) => {
    const parsed = materialCreateSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply
        .code(400)
        .send({ error: parsed.error.issues[0]?.message ?? 'Invalid material' })
    }
    const quantity = parseDecimal(parsed.data.quantity)
    if (quantity === null || quantity < 0) {
      return reply.code(400).send({ error: 'Enter the amount on hand, e.g. 5 or 2,5' })
    }

    const material = await prisma.material.create({
      data: { name: parsed.data.name, unit: parsed.data.unit, quantity },
    })
    return { material }
  })

  // Tops up (or corrects) the stock of an existing material. A negative
  // amount is allowed so a spillage or correction can be recorded, but the
  // stock itself may never end up below zero.
  app.post(
    '/api/admin/materials/:id/stock',
    { preHandler: requireAdmin },
    async (request, reply) => {
      const parsed = materialStockSchema.safeParse(request.body)
      if (!parsed.success) {
        return reply
          .code(400)
          .send({ error: parsed.error.issues[0]?.message ?? 'Invalid amount' })
      }
      const amount = parseDecimal(parsed.data.amount)
      if (amount === null || amount === 0) {
        return reply.code(400).send({ error: 'Enter the amount to add, e.g. 2,5' })
      }

      const params = request.params as { id: string }
      const material = await prisma.material.findUnique({ where: { id: params.id } })
      if (!material) return reply.code(404).send({ error: 'Material not found' })

      const quantity = material.quantity + amount
      if (quantity < 0) {
        return reply
          .code(400)
          .send({ error: `That would take the ${material.name.toLowerCase()} below zero (${material.quantity} ${material.unit} on hand)` })
      }

      const updated = await prisma.material.update({
        where: { id: material.id },
        data: { quantity },
      })
      return { material: updated }
    },
  )

  app.delete(
    '/api/admin/materials/:id',
    { preHandler: requireAdmin },
    async (request, reply) => {
      const params = request.params as { id: string }
      try {
        await prisma.material.delete({ where: { id: params.id } })
      } catch {
        // Also hit when the material is still used by a recipe (Restrict).
        const used = await prisma.recipeIngredient.count({ where: { materialId: params.id } })
        if (used > 0) {
          return reply
            .code(409)
            .send({ error: 'This material is used in a recipe. Remove it from the recipe first.' })
        }
        return reply.code(404).send({ error: 'Material not found' })
      }
      return { ok: true }
    },
  )

  // A recipe belongs to one catalog product and lists how much of each
  // material one product consumes, plus any free key/value details.
  app.post('/api/admin/recipes', { preHandler: requireAdmin }, async (request, reply) => {
    const parsed = recipeCreateSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply
        .code(400)
        .send({ error: parsed.error.issues[0]?.message ?? 'Invalid recipe' })
    }

    const product = await prisma.product.findUnique({
      where: { id: parsed.data.productId },
      select: { id: true },
    })
    if (!product) {
      return reply.code(400).send({ error: 'That product no longer exists' })
    }

    const materials = await prisma.material.findMany({
      where: { id: { in: parsed.data.ingredients.map((line) => line.materialId) } },
      select: { id: true, name: true },
    })
    const byId = new Map(materials.map((material) => [material.id, material]))

    const ingredients = []
    for (const line of parsed.data.ingredients) {
      const material = byId.get(line.materialId)
      if (!material) {
        return reply.code(400).send({ error: 'That material no longer exists' })
      }
      const amount = parseDecimal(line.amount)
      if (amount === null || amount <= 0) {
        return reply
          .code(400)
          .send({ error: `Enter how much ${material.name.toLowerCase()} the recipe uses, e.g. 0,05` })
      }
      ingredients.push({ materialId: material.id, amount })
    }

    const recipe = await prisma.recipe.create({
      data: {
        productId: product.id,
        ingredients: { create: ingredients },
        fields: {
          create: parsed.data.fields.map((field) => ({
            label: field.label,
            value: field.value,
          })),
        },
      },
      include: RECIPE_INCLUDE,
    })
    return { recipe: serializeRecipe(recipe) }
  })

  app.delete(
    '/api/admin/recipes/:id',
    { preHandler: requireAdmin },
    async (request, reply) => {
      const params = request.params as { id: string }
      try {
        await prisma.recipe.delete({ where: { id: params.id } })
      } catch {
        return reply.code(404).send({ error: 'Recipe not found' })
      }
      return { ok: true }
    },
  )
}
