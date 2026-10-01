import test from 'node:test'
import assert from 'node:assert/strict'
import Fastify from 'fastify'

process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test'
process.env.MOLLIE_API_KEY = ''
process.env.RESEND_API_KEY = ''
process.env.ADMIN_USERNAME = 'naomi'
process.env.ADMIN_PASSWORD = 'hunter2'
process.env.NODE_ENV = 'test'

const { prisma } = await import('../src/prisma.js')
const { adminRoutes } = await import('../src/routes/admin.js')

const ARCHIVED_PDF = Buffer.from(
  '%PDF-1.7\n% archived original invoice bytes\n%%EOF\n',
  'latin1',
)

function makeOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: 'order-1',
    orderNumber: 'EG-AB12CD',
    status: 'paid',
    paidAt: new Date('2026-03-04T10:00:00.000Z'),
    updatedAt: new Date('2026-03-04T10:00:00.000Z'),
    address: 'Kleinstraat 12',
    postalCode: '1234 AB',
    city: 'Amsterdam',
    country: 'Netherlands',
    subtotalCents: 4200,
    shippingCents: 550,
    totalCents: 4750,
    invoiceSentAt: new Date('2026-03-04T10:00:05.000Z'),
    invoicePdf: ARCHIVED_PDF,
    customer: {
      firstName: 'Robin',
      lastName: 'van  Dijk',
      email: 'robin@example.com',
    },
    items: [
      {
        name: 'Amber Bloom candle',
        variantLabel: 'Small',
        quantity: 2,
        unitPriceCents: 2100,
        lineTotalCents: 4200,
      },
    ],
    ...overrides,
  }
}

async function authedApp() {
  const app = Fastify()
  await app.register(adminRoutes)
  const login = await app.inject({
    method: 'POST',
    url: '/api/admin/login',
    payload: { username: 'naomi', password: 'hunter2' },
  })
  assert.equal(login.statusCode, 200)
  return { app, token: login.json().token as string }
}

test('invoice download returns the archived bytes verbatim', async (t) => {
  const original = Reflect.get(prisma.order, 'findUnique')
  Reflect.set(prisma.order, 'findUnique', async () => makeOrder())
  t.after(() => { Reflect.set(prisma.order, 'findUnique', original) })

  const { app, token } = await authedApp()
  const response = await app.inject({
    method: 'GET',
    url: '/api/admin/orders/order-1/invoice',
    headers: { authorization: `Bearer ${token}` },
  })

  assert.equal(response.statusCode, 200)
  assert.equal(response.headers['content-type'], 'application/pdf')
  assert.equal(
    response.headers['content-disposition'],
    'attachment; filename="invoice-EG-AB12CD.pdf"',
  )
  // Served as stored: not re-rendered from live order data.
  assert.deepEqual(response.rawPayload, ARCHIVED_PDF)
})

test('invoice download requires an admin token', async () => {
  const { app } = await authedApp()
  const response = await app.inject({
    method: 'GET',
    url: '/api/admin/orders/order-1/invoice',
  })
  assert.equal(response.statusCode, 401)
})

test('invoice download rejects orders with no archived pdf', async (t) => {
  const original = Reflect.get(prisma.order, 'findUnique')
  Reflect.set(
    prisma.order,
    'findUnique',
    async (args: { where: { id: string } }) =>
      args.where.id === 'missing'
        ? null
        : makeOrder({ invoicePdf: null }),
  )
  t.after(() => { Reflect.set(prisma.order, 'findUnique', original) })

  const { app, token } = await authedApp()
  const headers = { authorization: `Bearer ${token}` }

  const notArchived = await app.inject({
    method: 'GET',
    url: '/api/admin/orders/order-1/invoice',
    headers,
  })
  assert.equal(notArchived.statusCode, 409)
  assert.equal(notArchived.json().error, 'No archived invoice for this order')

  const missing = await app.inject({
    method: 'GET',
    url: '/api/admin/orders/missing/invoice',
    headers,
  })
  assert.equal(missing.statusCode, 404)
})

test('orders list reports hasInvoicePdf without leaking pdf bytes', async (t) => {
  const restore: (() => void)[] = []
  const stub = (key: string, impl: unknown) => {
    const original = Reflect.get(prisma.order, key)
    Reflect.set(prisma.order, key, impl)
    restore.push(() => { Reflect.set(prisma.order, key, original) })
  }
  t.after(() => { for (const undo of restore) undo() })

  stub('groupBy', async () => [{ status: 'paid', _count: 2 }])
  stub('findMany', async (args: { select?: { id?: boolean }; omit?: Record<string, boolean> }) => {
    // Only the id-only "which orders are archived" query passes `select`.
    if (args.select) return [{ id: 'order-2' }]
    const rows = [makeOrder({ id: 'order-1' }), makeOrder({ id: 'order-2' })]
    // Mirror Prisma: `omit` is what keeps the bytea column out of the response,
    // so dropping it from the query must make this test fail.
    for (const row of rows) {
      for (const key of Object.keys(args.omit ?? {})) {
        delete (row as Record<string, unknown>)[key]
      }
    }
    return rows
  })

  const { app, token } = await authedApp()
  const response = await app.inject({
    method: 'GET',
    url: '/api/admin/orders',
    headers: { authorization: `Bearer ${token}` },
  })

  assert.equal(response.statusCode, 200)
  const body = response.json()
  assert.equal(body.orders.length, 2)
  assert.deepEqual(
    body.orders.map((order: { id: string; hasInvoicePdf: boolean }) => [
      order.id,
      order.hasInvoicePdf,
    ]),
    [['order-1', false], ['order-2', true]],
  )
  assert.ok(!('invoicePdf' in body.orders[0]), 'raw bytes must not be serialised')
})
