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
    withoutVatRevenue?: number
    expenses?: number
    previousExpenses?: number
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
  const dateWindows: { revenue: { gte?: Date; lt?: Date }; expenses: { gte?: Date; lt?: Date } }[] = []

  let productionCalls = 0
  let revenueCalls = 0
  let expenseCalls = 0
  stub(prisma.recipe, 'findMany', async () => [
    { productId: 'candle', costCents: 121 },
    { productId: 'candle', costCents: 999 },
    { productId: 'unset', costCents: null },
    { productId: 'free', costCents: 0 },
  ])
  stub(prisma.orderItem, 'groupBy', async (args: { where: { order: { status: string; paidAt: { lt?: Date } } } }) => {
    assert.equal(args.where.order.status, 'paid')
    return [
      { productId: 'candle', name: 'Candle', _sum: { quantity: productionCalls++ % 2 === 1 ? 2 : 3 } },
      { productId: 'unset', name: 'Unset', _sum: { quantity: 1 } },
      { productId: 'absent', name: 'Absent', _sum: { quantity: 2 } },
      { productId: 'free', name: 'Free', _sum: { quantity: 1 } },
      { productId: 'free', name: 'Free renamed', _sum: { quantity: 3 } },
      { productId: 'custom', name: 'Gift wrapping', _sum: { quantity: 2 } },
      { productId: 'custom', name: 'Bespoke candle', _sum: { quantity: 1 } },
    ]
  })
  stub(prisma.order, 'groupBy', async (args: { by: string[]; where: Record<string, unknown> }) => {
    if (args.by.includes('status')) return [
      { status: 'paid', _count: 4 },
      { status: 'pending', _count: 1 },
    ]
    // The route asks twice: the current window and the same window before it.
    const isPrevious = revenueCalls++ % 2 === 1
    dateWindows.push({
      revenue: {
        gte: (args.where.paidAt as { gte?: Date }).gte,
        lt: (args.where.paidAt as { lt?: Date }).lt,
      },
      expenses: {},
    })
    const total = isPrevious ? (options.previousRevenue ?? 8000) : (options.revenue ?? 12500)
    const withoutVat = options.withoutVatRevenue ?? 0
    return [
      { pricesIncludeVat: true, _sum: { totalCents: total - withoutVat } },
      { pricesIncludeVat: false, _sum: { totalCents: withoutVat } },
    ]
  })
  stub(prisma.purchase, 'aggregate', async (args: { where: Record<string, unknown> }) => {
    const isPrevious = expenseCalls++ % 2 === 1
    dateWindows[dateWindows.length - 1].expenses = {
      gte: (args.where.dateBought as { gte?: Date }).gte,
      lt: (args.where.dateBought as { lt?: Date }).lt,
    }
    return {
      _sum: {
        costCents: isPrevious
          ? (options.previousExpenses ?? 2000)
          : (options.expenses ?? 3500),
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

  return { findManyCalls, dateWindows }
}

async function fetchOverview(period = '', anchor = '') {
  const app = Fastify()
  await app.register(adminRoutes)
  const login = await app.inject({
    method: 'POST',
    url: '/api/admin/login',
    payload: { username: 'naomi', password: 'hunter2' },
  })
  const params = new URLSearchParams()
  if (period) params.set('period', period)
  if (anchor) params.set('anchor', anchor)
  const query = params.toString()
  const response = await app.inject({
    method: 'GET',
    url: `/api/admin/overview${query ? `?${query}` : ''}`,
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
  assert.equal(body.expensesCents, 3500)
  assert.equal(body.previousExpensesCents, 2000)
  assert.equal(body.profitCents, 12500 - 363)
  assert.equal(body.previousProfitCents, 8000 - 242)
  assert.equal(body.productionCostCents, 363)
  assert.equal(body.previousProductionCostCents, 242)
  assert.equal(body.profitAfterPurchasesCents, 12500 - 3500)
  assert.equal(body.missingCostUnits, 3)
  assert.equal(body.previousMissingCostUnits, 3)
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

test('overview compares the same calendar window before it for the requested period', async (t) => {
  const { dateWindows } = stubOverview(t)
  await fetchOverview()
  await fetchOverview('quarter')

  // dateWindows fills per fetch: [current, previous] then [current, previous].
  const defaultPrevious = dateWindows[1]
  const quarterPrevious = dateWindows[3]

  const shopDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Amsterdam', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
  const [year, month] = shopDate.split('-').map(Number)
  assert.equal(defaultPrevious.revenue.gte!.toISOString(), new Date(Date.UTC(year, month - 2, 1)).toISOString())
  assert.equal(defaultPrevious.revenue.lt!.toISOString(), new Date(Date.UTC(year, month - 1, 1)).toISOString())
  assert.equal(dateWindows[0].revenue.lt!.toISOString(), new Date(Date.UTC(year, month, 1)).toISOString())

  const quarterStartMonth = Math.floor((month - 1) / 3) * 3
  assert.equal(dateWindows[2].revenue.gte!.toISOString(), new Date(Date.UTC(year, quarterStartMonth, 1)).toISOString())
  assert.equal(dateWindows[2].revenue.lt!.toISOString(), new Date(Date.UTC(year, quarterStartMonth + 3, 1)).toISOString())
  assert.equal(quarterPrevious.revenue.gte!.toISOString(), new Date(Date.UTC(year, quarterStartMonth - 3, 1)).toISOString())
  assert.equal(quarterPrevious.revenue.lt!.toISOString(), new Date(Date.UTC(year, quarterStartMonth, 1)).toISOString())
})

test('overview can be anchored to a specific month or quarter', async (t) => {
  const { dateWindows } = stubOverview(t)
  await fetchOverview('month', '2026-02-01')
  await fetchOverview('quarter', '2026-11-01')

  // February 2026, compared with January 2026.
  assert.equal(dateWindows[0].revenue.gte!.toISOString(), '2026-02-01T00:00:00.000Z')
  assert.equal(dateWindows[0].revenue.lt!.toISOString(), '2026-03-01T00:00:00.000Z')
  assert.equal(dateWindows[1].revenue.gte!.toISOString(), '2026-01-01T00:00:00.000Z')
  assert.equal(dateWindows[1].revenue.lt!.toISOString(), '2026-02-01T00:00:00.000Z')

  // An anchor in November resolves to Q4 2026, compared with Q3 2026.
  assert.equal(dateWindows[2].revenue.gte!.toISOString(), '2026-10-01T00:00:00.000Z')
  assert.equal(dateWindows[2].revenue.lt!.toISOString(), '2027-01-01T00:00:00.000Z')
  assert.equal(dateWindows[3].revenue.gte!.toISOString(), '2026-07-01T00:00:00.000Z')
  assert.equal(dateWindows[3].revenue.lt!.toISOString(), '2026-10-01T00:00:00.000Z')
})

test('this month handles year rollover and leap-year February', async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2028-01-15T12:00:00Z') })
  const { dateWindows } = stubOverview(t)
  await fetchOverview('month')
  assert.equal(dateWindows[0].revenue.gte!.toISOString(), '2028-01-01T00:00:00.000Z')
  assert.equal(dateWindows[1].revenue.gte!.toISOString(), '2027-12-01T00:00:00.000Z')
  t.mock.timers.setTime(new Date('2028-02-29T12:00:00Z').getTime())
  await fetchOverview('month')
  assert.equal(dateWindows[2].revenue.gte!.toISOString(), '2028-02-01T00:00:00.000Z')
  assert.equal(dateWindows[2].revenue.lt!.toISOString(), '2028-03-01T00:00:00.000Z')
})

test('overview extracts VAT only from checked orders in both periods', async (t) => {
  stubOverview(t, { revenue: 24200, previousRevenue: 36300, withoutVatRevenue: 12100 })
  const { app, response } = await fetchOverview()
  t.after(() => app.close())
  assert.equal(response.statusCode, 200)
  const body = response.json()
  assert.equal(body.revenueCents, 24200)
  assert.equal(body.netRevenueCents, 22100)
  assert.equal(body.previousRevenueCents, 36300)
  assert.equal(body.previousNetRevenueCents, 32100)
})

test('overview groups sold products and keeps custom items out of missing recipes', async (t) => {
  stubOverview(t)
  const { app, response } = await fetchOverview()
  t.after(() => app.close())
  assert.equal(response.statusCode, 200)
  const body = response.json()
  assert.deepEqual(body.soldItems, [
    { productId: 'free', name: 'Free', quantity: 4, recipeStatus: 'ready' },
    { productId: 'candle', name: 'Candle', quantity: 3, recipeStatus: 'ready' },
    { productId: 'absent', name: 'Absent', quantity: 2, recipeStatus: 'missing' },
    { productId: 'custom', name: 'Gift wrapping', quantity: 2, recipeStatus: 'custom' },
    { productId: 'custom', name: 'Bespoke candle', quantity: 1, recipeStatus: 'custom' },
    { productId: 'unset', name: 'Unset', quantity: 1, recipeStatus: 'no-cost' },
  ])
  assert.equal(body.missingCostUnits, 3)
  assert.equal(body.productionCostCents, 363)
})

test('profit uses exact option recipes before variant, color and product defaults', async (t) => {
  stubOverview(t)
  const originalSales = prisma.orderItem.groupBy
  const originalRecipes = prisma.recipe.findMany
  t.after(() => { prisma.orderItem.groupBy = originalSales; prisma.recipe.findMany = originalRecipes })
  Reflect.set(prisma.orderItem, 'groupBy', async () => [
    { productId: 'candle', name: 'Candle', variantId: 'large', colorId: 'pink', _sum: { quantity: 2 } },
    { productId: 'candle', name: 'Candle', variantId: 'large', colorId: 'white', _sum: { quantity: 1 } },
    { productId: 'candle', name: 'Candle', variantId: 'small', colorId: 'pink', _sum: { quantity: 1 } },
    { productId: 'candle', name: 'Candle', variantId: 'small', colorId: 'white', _sum: { quantity: 1 } },
  ])
  Reflect.set(prisma.recipe, 'findMany', async () => [
    { productId: 'candle', costCents: 100, variantId: null, colorId: null },
    { productId: 'candle', costCents: 200, variantId: null, colorId: 'pink' },
    { productId: 'candle', costCents: 300, variantId: 'large', colorId: null },
    { productId: 'candle', costCents: 400, variantId: 'large', colorId: 'pink' },
  ])
  const { app, response } = await fetchOverview()
  t.after(() => app.close())
  assert.equal(response.statusCode, 200)
  assert.equal(response.json().productionCostCents, 1400)
  assert.equal(response.json().missingCostUnits, 0)
})
