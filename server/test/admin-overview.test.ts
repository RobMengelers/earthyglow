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

type RecentRow = Record<string, unknown>

// Recent orders as the route asked for them, tagged so the archived-id lookup
// can answer differently per order.
function recentRow(id: string, archived: boolean): RecentRow {
  return {
    id,
    orderNumber: `EG-${id}`,
    status: 'paid',
    totalCents: 1000,
    createdAt: new Date('2026-09-30T12:00:00.000Z'),
    // Prisma returns every scalar column on the omitted shape, so the stub
    // includes the bytes: dropping `omit` must fail the test.
    invoicePdf: archived ? Buffer.from('%PDF') : null,
    customer: { firstName: 'Robin', lastName: 'Jansen', email: 'robin@example.com' },
    items: [],
    __archived: archived,
  }
}

function stubOverview(
  t: { after: (fn: () => void) => void },
  options: {
    rows?: RecentRow[]
    revenue?: number
    previousRevenue?: number
    unfulfilled?: number
    customerCount?: number
  } = {},
) {
  const restore: (() => void)[] = []
  const stub = (target: object, key: string, impl: unknown) => {
    const original = Reflect.get(target, key)
    Reflect.set(target, key, impl)
    restore.push(() => { Reflect.set(target, key, original) })
  }
  t.after(() => { for (const undo of restore) undo() })

  const rows = options.rows ?? [recentRow('a', true), recentRow('b', false)]
  const findManyCalls: { where?: Record<string, unknown>; select?: unknown; take?: number }[] = []

  stub(prisma.order, 'groupBy', async () => [
    { status: 'paid', _count: 4 },
    { status: 'pending', _count: 1 },
  ])
  stub(prisma.order, 'aggregate', async (args: { where: Record<string, unknown> }) => {
    // The route asks twice: the last 30 days and the 30 before that.
    const isPrevious = (args.where.paidAt as { lt?: Date }).lt !== undefined
    return {
      _sum: {
        totalCents: isPrevious
          ? (options.previousRevenue ?? 8000)
          : (options.revenue ?? 12500),
      },
    }
  })
  stub(prisma.order, 'count', async () => options.unfulfilled ?? 3)
  stub(prisma.customer, 'count', async () => options.customerCount ?? 9)
  stub(prisma.order, 'findMany', async (args: Record<string, unknown>) => {
    findManyCalls.push(args)
    if (args.select) {
      const where = (args.where ?? {}) as { id?: { in?: string[] } }
      const wanted = new Set(where.id?.in ?? [])
      return rows
        .filter((row) => wanted.has(row.id as string) && row.__archived === true)
        .map((row) => ({ id: row.id }))
    }
    return rows.map((row) => {
      const rest: Record<string, unknown> = { ...row }
      delete rest.__archived
      // Mirror Prisma so dropping `omit` from the query fails the test.
      for (const key of Object.keys((args.omit ?? {}) as Record<string, boolean>)) {
        delete rest[key]
      }
      return rest
    })
  })

  return { findManyCalls }
}

async function fetchOverview() {
  const app = Fastify()
  await app.register(adminRoutes)
  const login = await app.inject({
    method: 'POST',
    url: '/api/admin/login',
    payload: { username: 'naomi', password: 'hunter2' },
  })
  const response = await app.inject({
    method: 'GET',
    url: '/api/admin/overview',
    headers: { authorization: `Bearer ${login.json().token}` },
  })
  return { app, response }
}

test('overview reports status counts, revenue and work waiting', async (t) => {
  stubOverview(t)
  const { response } = await fetchOverview()
  assert.equal(response.statusCode, 200)

  const body = response.json()
  assert.deepEqual(body.stats, { paid: 4, pending: 1 })
  assert.equal(body.revenueCents, 12500)
  assert.equal(body.previousRevenueCents, 8000)
  assert.equal(body.unfulfilledCount, 3)
  assert.equal(body.customerCount, 9)
  assert.equal(body.recentOrders.length, 2)
})

test('overview flags which recent orders have an archived invoice', async (t) => {
  stubOverview(t)
  const { response } = await fetchOverview()
  const orders = response.json().recentOrders
  assert.equal(orders[0].hasInvoicePdf, true)
  assert.equal(orders[1].hasInvoicePdf, false)
})

test('overview never sends invoice pdf bytes', async (t) => {
  stubOverview(t)
  const { response } = await fetchOverview()
  for (const order of response.json().recentOrders) {
    assert.ok(!('invoicePdf' in order), 'invoicePdf must be omitted')
  }
})

test('overview only asks for the archived flag of the orders it shows', async (t) => {
  const { findManyCalls } = stubOverview(t)
  await fetchOverview()

  const rowsCall = findManyCalls.find((call) => call.take === 6)
  assert.ok(rowsCall, 'should fetch the recent orders in one query')
  assert.equal(rowsCall.select, undefined, 'the recent query must include items')

  const idCalls = findManyCalls.filter((call) => call.select)
  assert.equal(idCalls.length, 1, 'one ids-only query for the archive flags')
  assert.deepEqual((idCalls[0].where as { id: { in: string[] } }).id.in, ['a', 'b'])
})

test('overview skips the archive lookup when there are no orders', async (t) => {
  const { findManyCalls } = stubOverview(t, { rows: [] })
  const { response } = await fetchOverview()

  assert.equal(response.statusCode, 200)
  assert.deepEqual(response.json().recentOrders, [])
  assert.equal(findManyCalls.length, 1, 'no wasted archive query')
  assert.equal(response.json().revenueCents, 12500)
})

test('overview requires an admin token', async (t) => {
  stubOverview(t)
  const app = Fastify()
  await app.register(adminRoutes)
  const response = await app.inject({ method: 'GET', url: '/api/admin/overview' })
  assert.equal(response.statusCode, 401)
})
