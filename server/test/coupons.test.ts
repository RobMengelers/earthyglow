import assert from 'node:assert/strict'
import { after, afterEach, test } from 'node:test'
import Fastify from 'fastify'
import { products } from '../../src/data/products.ts'
import {
  couponProblem,
  priceWithCoupon,
  type Coupon,
} from '../src/coupon.ts'

// Never connect to a database or payment provider in these tests.
process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test'
process.env.MOLLIE_API_KEY = ''
process.env.RESEND_API_KEY = ''
process.env.NODE_ENV = 'test'
const { prisma } = await import('../src/prisma.js')
const { checkoutRoutes } = await import('../src/routes/checkout.js')
const { couponRoutes } = await import('../src/routes/coupons.js')
const app = Fastify()
await app.register(checkoutRoutes)
await app.register(couponRoutes)
after(() => app.close())
const restore: (() => void)[] = []
function stub(target: object, key: string, implementation: unknown) {
  const original = Reflect.get(target, key)
  Reflect.set(target, key, implementation)
  restore.push(() => { Reflect.set(target, key, original) })
}
afterEach(() => { restore.splice(0).reverse().forEach((reset) => reset()) })

const ZONE = { rateCents: 699, freeThresholdCents: 2500 }

function coupon(overrides: Partial<Coupon> = {}): Coupon {
  return {
    id: 'coupon_glowfam',
    code: 'GLOWFAM',
    description: 'Free shipping for friends and family',
    type: 'free_shipping',
    percentOff: null,
    amountOffCents: null,
    maxUses: null,
    usedCount: 0,
    startsAt: null,
    expiresAt: null,
    active: true,
    ...overrides,
  }
}

// ---- The rules, without a database ----

test('a free-shipping coupon takes the shipping off the order', () => {
  const prices = priceWithCoupon(coupon(), { subtotalCents: 1995, zone: ZONE })
  assert.equal(prices.shippingCents, 0)
  assert.equal(prices.discountCents, 0)
  assert.equal(prices.totalCents, 1995)
})

test('a percentage coupon takes a share off the subtotal', () => {
  const prices = priceWithCoupon(
    coupon({ type: 'percent', percentOff: 20 }),
    { subtotalCents: 1995, zone: ZONE },
  )
  assert.equal(prices.discountCents, 399)
  assert.equal(prices.shippingCents, 699)
  assert.equal(prices.totalCents, 2295)
})

test('a percentage coupon never takes more than the subtotal', () => {
  const prices = priceWithCoupon(
    coupon({ type: 'percent', percentOff: 150 }),
    { subtotalCents: 1995, zone: ZONE },
  )
  // The percentage is capped at 100, so the products are free; the shipping
  // is not part of the subtotal and is still charged.
  assert.equal(prices.discountCents, 1995)
  assert.equal(prices.shippingCents, 699)
  assert.equal(prices.totalCents, 699)
})

test('the free-shipping threshold is judged after the discount', () => {
  const prices = priceWithCoupon(
    coupon({ type: 'percent', percentOff: 20 }),
    { subtotalCents: 2500, zone: ZONE },
  )
  // €25,00 - 20% is under the €25,00 threshold, so shipping is charged.
  assert.equal(prices.discountCents, 500)
  assert.equal(prices.shippingCents, 699)
})

test('an order without a coupon keeps the normal shipping', () => {
  const prices = priceWithCoupon(null, { subtotalCents: 1995, zone: ZONE })
  assert.equal(prices.discountCents, 0)
  assert.equal(prices.shippingCents, 699)
  assert.equal(prices.totalCents, 2694)
})

test('a coupon that is not active, expired or used up is refused', () => {
  const now = new Date('2026-10-21T12:00:00.000Z')
  assert.equal(couponProblem(coupon(), now), null)
  assert.match(
    couponProblem(coupon({ active: false }), now) ?? '',
    /not active/,
  )
  assert.match(
    couponProblem(coupon({ expiresAt: new Date('2026-10-20T12:00:00.000Z') }), now) ?? '',
    /expired/,
  )
  assert.match(
    couponProblem(coupon({ maxUses: 1, usedCount: 1 }), now) ?? '',
    /already been used/,
  )
  assert.equal(
    couponProblem(coupon({ startsAt: new Date('2026-12-01T12:00:00.000Z') }), now),
    'This coupon code is not active yet.',
  )
})

// ---- The endpoints ----

function mockCatalog() {
  stub(prisma.product, 'findUnique', async ({ where }: { where: { id: string } }) => {
    const product = products.find((p) => p.id === where.id)
    return product
      ? {
          ...product,
          active: !product.soldOut,
          _count: {
            variants: product.variants?.length ?? 0,
            colors: product.colors?.length ?? 0,
          },
        }
      : null
  })
  stub(prisma.productVariant, 'findFirst', async ({ where }: { where: { id: string; productId: string } }) =>
    products.find((p) => p.id === where.productId)?.variants?.find((v) => v.id === where.id) ?? null)
  stub(prisma.productColor, 'findFirst', async ({ where }: { where: { id: string; productId: string } }) =>
    products.find((p) => p.id === where.productId)?.colors?.find((c) => c.id === where.id) ?? null)
}

// The checkout writes the order inside a transaction; the tests run it
// straight against the stubs.
function mockOrderWrites() {
  stub(prisma, '$transaction', async (fn: (tx: typeof prisma) => unknown) => fn(prisma))
  stub(prisma.customer, 'upsert', async () => ({ id: 'test-customer' }))
  stub(prisma.order, 'create', async () => ({ id: 'test-order', status: 'pending' }))
  stub(prisma.order, 'update', async () => ({}))
}

function validate(code: string) {
  return app.inject({
    method: 'POST',
    url: '/api/coupons/validate',
    payload: { code },
  })
}

function checkout(items: object[], couponCode?: string) {
  return app.inject({
    method: 'POST',
    url: '/api/checkout',
    payload: {
      items,
      customer: { firstName: 'Test', lastName: 'Customer', email: 'test@example.com' },
      shipping: { address: 'Test 1', city: 'Test', postalCode: '1000AA', country: 'Netherlands', countryCode: 'NL' },
      ...(couponCode ? { couponCode } : {}),
    },
  })
}

test('a good code is confirmed with what it does', async () => {
  stub(prisma.coupon, 'findUnique', async () => coupon())
  const response = await validate('glowfam')
  assert.equal(response.statusCode, 200)
  assert.equal(response.json().code, 'GLOWFAM')
  assert.equal(response.json().type, 'free_shipping')
  assert.equal(response.json().summary, 'Free shipping')
})

test('an unknown code is refused', async () => {
  stub(prisma.coupon, 'findUnique', async () => null)
  const response = await validate('NOPE')
  assert.equal(response.statusCode, 404)
  assert.match(response.json().error, /not valid/)
})

test('an expired code is refused', async () => {
  stub(prisma.coupon, 'findUnique', async () =>
    coupon({ expiresAt: new Date('2020-01-01T00:00:00.000Z') }))
  const response = await validate('GLOWFAM')
  assert.equal(response.statusCode, 400)
  assert.match(response.json().error, /expired/)
})

test('the checkout takes the shipping off with a free-shipping code', async () => {
  mockCatalog()
  mockOrderWrites()
  stub(prisma.coupon, 'findUnique', async () => coupon())
  let claimed = 0
  stub(prisma.coupon, 'updateMany', async () => {
    claimed += 1
    return { count: 1 }
  })
  let redemption: { couponId: string; orderId: string } | undefined
  stub(prisma.couponRedemption, 'create', async ({ data }: { data: typeof redemption }) => {
    redemption = data
    return { id: 'test-redemption' }
  })
  let saved: { couponCode?: string; couponType?: string; discountCents?: number } | undefined
  stub(prisma.order, 'create', async ({ data }: { data: typeof saved }) => {
    saved = data
    return { id: 'test-order', status: 'pending' }
  })

  const response = await checkout(
    [{ id: 'column', quantity: 1, variantId: 'column-small', colorId: 'pink' }],
    'GLOWFAM',
  )

  assert.equal(response.statusCode, 200, response.body)
  assert.equal(response.json().subtotalCents, 995)
  assert.equal(response.json().shippingCents, 0)
  assert.equal(response.json().totalCents, 995)
  assert.equal(response.json().couponCode, 'GLOWFAM')
  assert.equal(saved?.couponCode, 'GLOWFAM')
  assert.equal(saved?.couponType, 'free_shipping')
  assert.equal(saved?.discountCents, 0)
  assert.equal(claimed, 1)
  assert.equal(redemption?.couponId, 'coupon_glowfam')
  assert.equal(redemption?.orderId, 'test-order')
})

test('the checkout takes a percentage off the subtotal', async () => {
  mockCatalog()
  mockOrderWrites()
  stub(prisma.coupon, 'findUnique', async () =>
    coupon({ id: 'coupon_xmas', code: 'XMAS20', type: 'percent', percentOff: 20 }))
  stub(prisma.coupon, 'updateMany', async () => ({ count: 1 }))
  stub(prisma.couponRedemption, 'create', async () => ({ id: 'test-redemption' }))
  let saved: { discountCents?: number; couponCode?: string } | undefined
  stub(prisma.order, 'create', async ({ data }: { data: typeof saved }) => {
    saved = data
    return { id: 'test-order', status: 'pending' }
  })

  const response = await checkout(
    [{ id: 'column', quantity: 1, variantId: 'column-small', colorId: 'pink' }],
    'xmas20',
  )

  assert.equal(response.statusCode, 200, response.body)
  assert.equal(response.json().subtotalCents, 995)
  assert.equal(response.json().discountCents, 199)
  assert.equal(response.json().shippingCents, 699)
  assert.equal(response.json().totalCents, 1495)
  assert.equal(saved?.discountCents, 199)
  assert.equal(saved?.couponCode, 'XMAS20')
})

test('the checkout refuses a code that does not exist', async () => {
  mockCatalog()
  mockOrderWrites()
  stub(prisma.coupon, 'findUnique', async () => null)
  const response = await checkout(
    [{ id: 'column', quantity: 1, variantId: 'column-small', colorId: 'pink' }],
    'NOPE',
  )
  assert.equal(response.statusCode, 400)
  assert.equal(response.json().couponInvalid, true)
})

test('a one-time code can only be spent once', async () => {
  mockCatalog()
  mockOrderWrites()
  stub(prisma.coupon, 'findUnique', async () =>
    coupon({ maxUses: 1, usedCount: 0 }))
  // The claim only lands while the code still has a use left.
  stub(prisma.coupon, 'updateMany', async () => ({ count: 0 }))
  const response = await checkout(
    [{ id: 'column', quantity: 1, variantId: 'column-small', colorId: 'pink' }],
    'GLOWFAM',
  )
  assert.equal(response.statusCode, 400)
  assert.match(response.json().error, /already been used/)
})

test('a coupon is handed back when the payment never starts', async () => {
  mockCatalog()
  mockOrderWrites()
  stub(prisma.coupon, 'findUnique', async () => coupon())
  stub(prisma.coupon, 'updateMany', async () => ({ count: 1 }))
  stub(prisma.couponRedemption, 'create', async () => ({ id: 'test-redemption' }))
  let released = 0
  stub(prisma.coupon, 'update', async ({ data }: { data: { usedCount: { decrement: number } } }) => {
    released += data.usedCount.decrement
    return {}
  })
  let deleted = 0
  stub(prisma.couponRedemption, 'deleteMany', async () => {
    deleted += 1
    return { count: 1 }
  })
  // The order is written, but the payment never starts.
  stub(prisma.order, 'update', async () => {
    throw new Error('payment failed')
  })

  const response = await checkout(
    [{ id: 'column', quantity: 1, variantId: 'column-small', colorId: 'pink' }],
    'GLOWFAM',
  )

  assert.equal(response.statusCode, 502)
  assert.equal(released, 1)
  assert.equal(deleted, 1)
})
