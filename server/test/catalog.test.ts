import assert from 'node:assert/strict'
import { after, afterEach, test } from 'node:test'
import Fastify from 'fastify'
import { products } from '../../src/data/products.ts'
import { reconcileCatalogItems } from '../../src/cart/catalog.ts'
import type { CartItem } from '../../src/cart/CartContext.ts'

// Never connect to a database or payment provider in these tests.
process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test'
process.env.MOLLIE_API_KEY = ''
process.env.RESEND_API_KEY = ''
process.env.NODE_ENV = 'test'
const { prisma } = await import('../src/prisma.js')
const { checkoutRoutes } = await import('../src/routes/checkout.js')
const { catalogRoutes } = await import('../src/routes/catalog.js')
const app = Fastify()
await app.register(checkoutRoutes)
await app.register(catalogRoutes)
after(() => app.close())
const restore: (() => void)[] = []
function stub(target: object, key: string, implementation: unknown) {
  const original = Reflect.get(target, key)
  Reflect.set(target, key, implementation)
  restore.push(() => { Reflect.set(target, key, original) })
}
afterEach(() => { restore.splice(0).reverse().forEach((reset) => reset()) })

const bundle: CartItem = {
  id: 'column:column-bundle', productId: 'column', name: 'Column candle',
  image: '', collectionTitle: '', quantity: 2, priceCents: 1995,
  variantId: 'column-bundle', variantLabel: 'Bundle',
}

test('cart refresh retains bundle prices and updates them from variant prices', () => {
  const catalog = [{ id: 'column', name: 'Column candle', priceCents: 995,
    variants: [{ id: 'column-bundle', label: 'Bundle', priceCents: 1995 }] }]
  const items = [bundle]
  assert.equal(reconcileCatalogItems(items, catalog), items)
  catalog[0].variants[0].priceCents = 2095
  assert.equal(reconcileCatalogItems(items, catalog)[0].priceCents, 2095)
  assert.equal(bundle.priceCents, 1995)
})

test('older API responses never reduce a variant to its base price', () => {
  assert.equal(reconcileCatalogItems([bundle], [{ id: 'column', name: 'Column candle', priceCents: 995 }])[0].priceCents, 1995)
})

test('base products still reconcile their prices', () => {
  const item = { ...bundle, variantId: undefined, variantLabel: undefined }
  assert.equal(reconcileCatalogItems([item], [{ id: 'column', name: 'Column candle', priceCents: 995 }])[0].priceCents, 995)
})

function mockCatalog() {
  stub(prisma.product, 'findUnique', async ({ where }: { where: { id: string } }) => {
    const product = products.find((p) => p.id === where.id)
    return product ? { ...product, active: !product.soldOut, _count: { variants: product.variants?.length ?? 0 } } : null
  })
  stub(prisma.productVariant, 'findFirst', async ({ where }: { where: { id: string; productId: string } }) =>
    products.find((p) => p.id === where.productId)?.variants?.find((v) => v.id === where.id) ?? null)
}

function checkout(items: object[]) {
  return app.inject({ method: 'POST', url: '/api/checkout', payload: {
    items,
    customer: { firstName: 'Test', lastName: 'Customer', email: 'test@example.com' },
    shipping: { address: 'Test 1', city: 'Test', postalCode: '1000AA', country: 'Netherlands', countryCode: 'NL' },
  } })
}

test('checkout rejects missing, mismatched and unknown variants before creating an order', async () => {
  mockCatalog()
  for (const item of [
    { id: 'column', quantity: 1 },
    { id: 'column', quantity: 1, variantId: 'shell-bundle' },
    { id: 'column', quantity: 1, variantId: 'column-bundle', variantLabel: 'Small' },
    { id: 'column', quantity: 1, variantId: 'does-not-exist' },
  ]) {
    const response = await checkout([item])
    assert.equal(response.statusCode, 400, response.body)
  }
})

test('checkout saves server-priced bundle and Halloween lines', async () => {
  mockCatalog()
  stub(prisma.customer, 'upsert', async () => ({ id: 'test-customer' }))
  let saved: { items: { create: { variantLabel?: string; unitPriceCents: number; lineTotalCents: number }[] } } | undefined
  stub(prisma.order, 'create', async ({ data }: { data: NonNullable<typeof saved> }) => {
    saved = data
    return { id: 'test-order', status: 'pending' }
  })
  stub(prisma.order, 'update', async () => ({}))
  const response = await checkout([
    { id: 'column', quantity: 2, variantId: 'column-bundle', variantLabel: 'Bundle', priceCents: 1 },
    { id: 'pumpkin-boo', quantity: 1, priceCents: 1 },
    { id: 'pumpkin-spice-wax-melts', quantity: 1 },
  ])
  assert.equal(response.statusCode, 200, response.body)
  assert.equal(response.json().subtotalCents, 5380)
  assert.equal(response.json().shippingCents, 0)
  assert.equal(response.json().totalCents, 5380)
  assert.deepEqual(saved?.items.create.map((line) => [line.variantLabel, line.unitPriceCents, line.lineTotalCents]), [
    ['Bundle', 1995, 3990], [undefined, 895, 895], [undefined, 495, 495],
  ])
})

test('catalog exposes active variant prices for cart reconciliation', async () => {
  stub(prisma.product, 'findMany', async (query: { select: { variants: { where: { active: boolean } } }; where: { active: boolean } }) => {
    assert.equal(query.where.active, true)
    assert.equal(query.select.variants.where.active, true)
    return [{ id: 'column', name: 'Column candle', priceCents: 995, variants: [{ id: 'column-bundle', label: 'Bundle', priceCents: 1995 }] }]
  })
  const response = await app.inject('/api/catalog')
  assert.equal(response.statusCode, 200)
  assert.equal(response.json().products[0].variants[0].priceCents, 1995)
})
