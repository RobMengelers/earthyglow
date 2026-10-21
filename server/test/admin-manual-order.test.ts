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

const CANDLE = {
  id: 'coconut-beach',
  name: 'Coconut Beach',
  priceCents: 1495,
  active: true,
  _count: { variants: 2 },
}

const VARIANT = { id: 'sea-star', label: 'Sea star', priceCents: 1795 }

const COLORS = [
  { id: 'pink', label: 'Pink' },
  { id: 'brown', label: 'Brown' },
]

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

const FULL_CUSTOMER = {
  firstName: 'Robin',
  lastName: 'Jansen',
  email: 'robin@example.com',
}

const FULL_SHIPPING = {
  address: 'Kleinstraat 12',
  postalCode: '1234 AB',
  city: 'Amsterdam',
  country: 'Netherlands',
}

const BLANK_CUSTOMER = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
}

const BLANK_SHIPPING = {
  address: '',
  postalCode: '',
  city: '',
  country: '',
}

type Flow = {
  created: Record<string, unknown>[]
  customerUpserts: Record<string, unknown>[]
  customerCreates: Record<string, unknown>[]
  get lastOrderData(): Record<string, unknown> | undefined
}

// Stubs the catalog lookups plus the customer/order writes and captures what
// the route tried to persist.
function stubFlow(
  t: { after: (fn: () => void) => void },
  options: { variantMissing?: boolean; withColors?: boolean; colorMissing?: boolean } = {},
): Flow {
  const restore: (() => void)[] = []
  const stub = (target: object, key: string, impl: unknown) => {
    const original = Reflect.get(target, key)
    Reflect.set(target, key, impl)
    restore.push(() => { Reflect.set(target, key, original) })
  }
  t.after(() => { for (const undo of restore) undo() })

  const created: Record<string, unknown>[] = []
  const customerUpserts: Record<string, unknown>[] = []
  const customerCreates: Record<string, unknown>[] = []

  stub(prisma.product, 'findUnique', async () => ({
    ...CANDLE,
    _count: { variants: CANDLE._count.variants, colors: options.withColors ? COLORS.length : 0 },
  }))
  stub(prisma.productVariant, 'findFirst', async () =>
    options.variantMissing ? null : VARIANT,
  )
  stub(prisma.productColor, 'findFirst', async () =>
    options.colorMissing ? null : COLORS[0],
  )
  stub(prisma.customer, 'upsert', async (args: Record<string, unknown>) => {
    customerUpserts.push(args)
    return { id: 'customer-1', email: 'robin@example.com', ...FULL_CUSTOMER, phone: null }
  })
  stub(prisma.customer, 'create', async (args: { data: Record<string, unknown> }) => {
    customerCreates.push(args.data)
    return { id: 'customer-walkin', ...args.data }
  })
  stub(prisma.order, 'create', async (args: { data: Record<string, unknown>; omit?: Record<string, boolean> }) => {
    created.push(args.data)
    const row: Record<string, unknown> = {
      id: 'order-new',
      orderNumber: 'EG-NEW123',
      status: 'paid',
      ...args.data,
      // Prisma returns every scalar column on create, so the stub must too or
      // the `omit` guard cannot fail.
      invoicePdf: null,
      customer: { id: 'customer-1', ...FULL_CUSTOMER, phone: null },
      items: [],
    }
    // Mirror Prisma so dropping `omit` from the query fails the test.
    for (const key of Object.keys(args.omit ?? {})) delete row[key]
    return row
  })
  stub(prisma.order, 'update', async () => ({}))
  // archiveInvoiceForOrder re-reads the order with customer + items.
  stub(prisma.order, 'findUnique', async () => ({
    id: 'order-new',
    orderNumber: 'EG-NEW123',
    status: 'paid',
    paidAt: new Date('2026-09-30T12:00:00.000Z'),
    updatedAt: new Date('2026-09-30T12:00:00.000Z'),
    address: '-',
    postalCode: '-',
    city: '-',
    country: '-',
    subtotalCents: 1795,
    shippingCents: 0,
    totalCents: 1795,
    invoicePdf: null,
    customer: { firstName: '-', lastName: '-', email: null },
    items: [
      {
        name: 'Coconut Beach',
        variantLabel: 'Sea star',
        quantity: 1,
        unitPriceCents: 1795,
        lineTotalCents: 1795,
      },
    ],
  }))

  return {
    created,
    customerUpserts,
    customerCreates,
    get lastOrderData() { return created[created.length - 1] },
  }
}

test('manual order stores an admin-edited unit price', async (t) => {
  const flow = stubFlow(t)
  const { app, token } = await authedApp()

  const response = await app.inject({
    method: 'POST',
    url: '/api/admin/orders',
    headers: { authorization: `Bearer ${token}` },
    payload: {
      customer: FULL_CUSTOMER,
      shipping: FULL_SHIPPING,
      // Market price, deliberately not the catalog's 1795.
      items: [
        { productId: 'coconut-beach', variantId: 'sea-star', unitPriceCents: 1200, quantity: 2 },
      ],
    },
  })

  assert.equal(response.statusCode, 200)
  const data = flow.lastOrderData!
  const items = data.items.create as Record<string, unknown>[]
  assert.equal(items[0].unitPriceCents, 1200, 'edited price must win')
  assert.equal(items[0].lineTotalCents, 2400)
  assert.equal(data.subtotalCents, 2400)
  assert.equal(data.totalCents, 2400)
  // Name and variant still come from the database, not the client.
  assert.equal(items[0].name, 'Coconut Beach')
  assert.equal(items[0].variantLabel, 'Sea star')
})

test('manual order accepts a zero price', async (t) => {
  const flow = stubFlow(t)
  const { app, token } = await authedApp()

  const response = await app.inject({
    method: 'POST',
    url: '/api/admin/orders',
    headers: { authorization: `Bearer ${token}` },
    payload: {
      customer: FULL_CUSTOMER,
      shipping: FULL_SHIPPING,
      items: [{ productId: 'coconut-beach', variantId: 'sea-star', unitPriceCents: 0, quantity: 1 }],
    },
  })

  assert.equal(response.statusCode, 200)
  assert.equal(flow.lastOrderData!.totalCents, 0)
})

test('manual order rejects a negative price and a non-integer one', async (t) => {
  stubFlow(t)
  const { app, token } = await authedApp()
  const headers = { authorization: `Bearer ${token}` }
  const base = { customer: FULL_CUSTOMER, shipping: FULL_SHIPPING }

  const negative = await app.inject({
    method: 'POST',
    url: '/api/admin/orders',
    headers,
    payload: {
      ...base,
      items: [{ productId: 'coconut-beach', variantId: 'sea-star', unitPriceCents: -1, quantity: 1 }],
    },
  })
  assert.equal(negative.statusCode, 400)

  const fractional = await app.inject({
    method: 'POST',
    url: '/api/admin/orders',
    headers,
    payload: {
      ...base,
      items: [{ productId: 'coconut-beach', variantId: 'sea-star', unitPriceCents: 12.5, quantity: 1 }],
    },
  })
  assert.equal(fractional.statusCode, 400)
})

test('a fully blank manual order is stored with dashes and no email', async (t) => {
  const flow = stubFlow(t)
  const { app, token } = await authedApp()

  const response = await app.inject({
    method: 'POST',
    url: '/api/admin/orders',
    headers: { authorization: `Bearer ${token}` },
    payload: {
      customer: BLANK_CUSTOMER,
      shipping: BLANK_SHIPPING,
      items: [{ productId: 'coconut-beach', variantId: 'sea-star', unitPriceCents: 1795, quantity: 1 }],
    },
  })

  assert.equal(response.statusCode, 200)
  const body = response.json()
  assert.equal(body.hasInvoicePdf, true, 'invoice is still archived')

  const data = flow.lastOrderData!
  assert.equal(data.address, '-')
  assert.equal(data.postalCode, '-')
  assert.equal(data.city, '-')
  assert.equal(data.country, '-')

  // No email means a fresh walk-in customer rather than an upsert on a
  // placeholder, which would collide on the unique index.
  assert.equal(flow.customerUpserts.length, 0)
  assert.equal(flow.customerCreates.length, 1)
  const customer = flow.customerCreates[0]
  assert.equal(customer.email, null)
  assert.equal(customer.firstName, '-')
  assert.equal(customer.lastName, '-')
  assert.equal(customer.phone, null)
})

test('omitted customer and shipping objects behave like blank ones', async (t) => {
  const flow = stubFlow(t)
  const { app, token } = await authedApp()

  const response = await app.inject({
    method: 'POST',
    url: '/api/admin/orders',
    headers: { authorization: `Bearer ${token}` },
    payload: {
      items: [{ productId: 'coconut-beach', variantId: 'sea-star', unitPriceCents: 1795, quantity: 1 }],
    },
  })

  assert.equal(response.statusCode, 200)
  const data = flow.lastOrderData!
  assert.equal(data.address, '-')
  assert.equal(data.city, '-')
  assert.equal(flow.customerCreates.length, 1)
  assert.equal(flow.customerCreates[0].email, null)
})

test('a partially filled customer keeps what was typed', async (t) => {
  const flow = stubFlow(t)
  const { app, token } = await authedApp()

  await app.inject({
    method: 'POST',
    url: '/api/admin/orders',
    headers: { authorization: `Bearer ${token}` },
    payload: {
      customer: { firstName: 'Sanne', email: '  ' },
      shipping: { city: 'Den Haag' },
      items: [{ productId: 'coconut-beach', variantId: 'sea-star', unitPriceCents: 1795, quantity: 1 }],
    },
  })

  const customer = flow.customerCreates[0]
  assert.equal(customer.firstName, 'Sanne')
  assert.equal(customer.lastName, '-', 'blank last name becomes a dash')
  assert.equal(customer.email, null, 'whitespace-only email is not an email')
  const data = flow.lastOrderData!
  assert.equal(data.city, 'Den Haag')
  assert.equal(data.address, '-')
  assert.equal(data.country, '-')
})

test('an email is normalised and the customer is reused', async (t) => {
  const flow = stubFlow(t)
  const { app, token } = await authedApp()

  const response = await app.inject({
    method: 'POST',
    url: '/api/admin/orders',
    headers: { authorization: `Bearer ${token}` },
    payload: {
      customer: { ...FULL_CUSTOMER, email: '  Robin@Example.COM ' },
      shipping: FULL_SHIPPING,
      items: [{ productId: 'coconut-beach', variantId: 'sea-star', unitPriceCents: 1795, quantity: 1 }],
    },
  })

  assert.equal(response.statusCode, 200)
  assert.equal(flow.customerCreates.length, 0)
  const where = (flow.customerUpserts[0].where as { email: string }).email
  assert.equal(where, 'robin@example.com')
})

test('manual order has no shipping and no payment method', async (t) => {
  const flow = stubFlow(t)
  const { app, token } = await authedApp()

  await app.inject({
    method: 'POST',
    url: '/api/admin/orders',
    headers: { authorization: `Bearer ${token}` },
    payload: {
      customer: FULL_CUSTOMER,
      shipping: FULL_SHIPPING,
      items: [{ productId: 'coconut-beach', variantId: 'sea-star', unitPriceCents: 1795, quantity: 3 }],
    },
  })

  const data = flow.lastOrderData!
  assert.equal(data.shippingCents, 0, 'an in-person sale is never shipped')
  assert.equal(data.totalCents, data.subtotalCents)
  assert.ok(!('paymentMethod' in data), 'payment method is no longer collected')
  assert.equal(data.status, 'paid')
})

test('manual order requires a product and a price on every line', async (t) => {
  const flow = stubFlow(t)
  const { app, token } = await authedApp()
  const headers = { authorization: `Bearer ${token}` }
  const base = { customer: FULL_CUSTOMER, shipping: FULL_SHIPPING }

  const noProduct = await app.inject({
    method: 'POST',
    url: '/api/admin/orders',
    headers,
    payload: { ...base, items: [{ unitPriceCents: 100, quantity: 1 }] },
  })
  assert.equal(noProduct.statusCode, 400)

  const noPrice = await app.inject({
    method: 'POST',
    url: '/api/admin/orders',
    headers,
    payload: { ...base, items: [{ productId: 'coconut-beach', variantId: 'sea-star', quantity: 1 }] },
  })
  assert.equal(noPrice.statusCode, 400)

  const noItems = await app.inject({
    method: 'POST',
    url: '/api/admin/orders',
    headers,
    payload: { ...base, items: [] },
  })
  assert.equal(noItems.statusCode, 400)

  assert.equal(flow.created.length, 0, 'must not persist a rejected order')
})

test('manual order requires a variant when the product has options', async (t) => {
  const flow = stubFlow(t)
  const { app, token } = await authedApp()

  const response = await app.inject({
    method: 'POST',
    url: '/api/admin/orders',
    headers: { authorization: `Bearer ${token}` },
    payload: {
      customer: FULL_CUSTOMER,
      shipping: FULL_SHIPPING,
      items: [{ productId: 'coconut-beach', unitPriceCents: 1495, quantity: 1 }],
    },
  })

  assert.equal(response.statusCode, 400)
  assert.match(response.json().error, /choose an option/)
  assert.equal(flow.created.length, 0)
})

test('manual order rejects a variant that does not belong to the product', async (t) => {
  stubFlow(t, { variantMissing: true })
  const { app, token } = await authedApp()

  const response = await app.inject({
    method: 'POST',
    url: '/api/admin/orders',
    headers: { authorization: `Bearer ${token}` },
    payload: {
      customer: FULL_CUSTOMER,
      shipping: FULL_SHIPPING,
      items: [{ productId: 'coconut-beach', variantId: 'ghost', unitPriceCents: 100, quantity: 1 }],
    },
  })

  assert.equal(response.statusCode, 400)
  assert.match(response.json().error, /not available/)
})

test('manual order requires a colour when the product comes in colours', async (t) => {
  const flow = stubFlow(t, { withColors: true })
  const { app, token } = await authedApp()

  const response = await app.inject({
    method: 'POST',
    url: '/api/admin/orders',
    headers: { authorization: `Bearer ${token}` },
    payload: {
      customer: FULL_CUSTOMER,
      shipping: FULL_SHIPPING,
      items: [{ productId: 'coconut-beach', variantId: 'sea-star', unitPriceCents: 1795, quantity: 1 }],
    },
  })

  assert.equal(response.statusCode, 400)
  assert.match(response.json().error, /choose a colour/)
  assert.equal(flow.created.length, 0)
})

test('manual order rejects a colour that does not belong to the product', async (t) => {
  stubFlow(t, { withColors: true, colorMissing: true })
  const { app, token } = await authedApp()

  const response = await app.inject({
    method: 'POST',
    url: '/api/admin/orders',
    headers: { authorization: `Bearer ${token}` },
    payload: {
      customer: FULL_CUSTOMER,
      shipping: FULL_SHIPPING,
      items: [{ productId: 'coconut-beach', variantId: 'sea-star', colorId: 'ghost', unitPriceCents: 1795, quantity: 1 }],
    },
  })

  assert.equal(response.statusCode, 400)
  assert.match(response.json().error, /not available/)
})

test('manual order stores the colour from the database, not from the form', async (t) => {
  const flow = stubFlow(t, { withColors: true })
  const { app, token } = await authedApp()

  const response = await app.inject({
    method: 'POST',
    url: '/api/admin/orders',
    headers: { authorization: `Bearer ${token}` },
    payload: {
      customer: FULL_CUSTOMER,
      shipping: FULL_SHIPPING,
      items: [{ productId: 'coconut-beach', variantId: 'sea-star', colorId: 'pink', unitPriceCents: 1795, quantity: 1 }],
    },
  })

  assert.equal(response.statusCode, 200)
  const items = (flow.lastOrderData!.items as { create: Record<string, unknown>[] }).create
  assert.equal(items[0].colorId, 'pink')
  assert.equal(items[0].colorLabel, 'Pink')
})

test('manual order create response never carries the pdf bytes', async (t) => {
  stubFlow(t)
  const { app, token } = await authedApp()

  const response = await app.inject({
    method: 'POST',
    url: '/api/admin/orders',
    headers: { authorization: `Bearer ${token}` },
    payload: {
      customer: FULL_CUSTOMER,
      shipping: FULL_SHIPPING,
      items: [{ productId: 'coconut-beach', variantId: 'sea-star', unitPriceCents: 1795, quantity: 1 }],
    },
  })

  assert.equal(response.statusCode, 200)
  assert.ok(!('invoicePdf' in response.json().order), 'invoicePdf must be omitted')
})

test('manual order requires an admin token', async (t) => {
  stubFlow(t)
  const { app } = await authedApp()
  const response = await app.inject({
    method: 'POST',
    url: '/api/admin/orders',
    payload: {
      items: [{ productId: 'coconut-beach', variantId: 'sea-star', unitPriceCents: 1795, quantity: 1 }],
    },
  })
  assert.equal(response.statusCode, 401)
})
