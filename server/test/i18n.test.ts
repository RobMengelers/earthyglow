import assert from 'node:assert/strict'
import { after, afterEach, test } from 'node:test'
import Fastify from 'fastify'
import { products } from '../../src/data/products.ts'
import { productDescriptions, collectionCopy, seasonCopy } from '../../src/data/catalog-i18n.ts'
import { collections } from '../../src/data/products.ts'
import { holidays, seasons } from '../../src/data/seasons.ts'
import { OPTION_LABEL_KEYS as STOREFRONT_OPTION_KEYS, optionLabel as storefrontOptionLabel } from '../../src/i18n/options.ts'
import { detectLocale, localizePath, stripLocale } from '../../src/i18n/locales.ts'
import { describeLine } from '../src/order-line.ts'
import { OPTION_LABEL_KEYS, optionLabel } from '../src/i18n.ts'

// Never connect to a database or payment provider in these tests.
process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test'
process.env.MOLLIE_API_KEY = ''
process.env.RESEND_API_KEY = ''
process.env.NODE_ENV = 'test'
const { prisma } = await import('../src/prisma.js')
const { checkoutRoutes } = await import('../src/routes/checkout.js')
const { couponRoutes } = await import('../src/routes/coupons.js')
const { archiveInvoiceForOrder } = await import('../src/email.js')
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

// ---- Storefront language rules ----

test('the visitor language comes from the cookie first, then the browser, then English', () => {
  assert.equal(detectLocale('lang=de', 'nl-NL,nl;q=0.9'), 'de')
  assert.equal(detectLocale(null, 'nl-NL,nl;q=0.9,en;q=0.8'), 'nl')
  assert.equal(detectLocale('other=1', 'fr-FR,fr;q=0.9,de;q=0.5'), 'de')
  assert.equal(detectLocale(null, 'en;q=0.4,de;q=0.8'), 'de')
  assert.equal(detectLocale(null, 'fr-FR'), 'en')
  assert.equal(detectLocale('lang=xx', null), 'en')
})

test('site paths gain and lose their language prefix', () => {
  assert.equal(localizePath('nl', '/'), '/nl')
  assert.equal(localizePath('de', '/shop?season=winter'), '/de/shop?season=winter')
  assert.equal(localizePath('en', '/nl/product/column'), '/en/product/column')
  assert.equal(stripLocale('/nl'), '/')
  assert.equal(stripLocale('/de/policies/refund-policy'), '/policies/refund-policy')
  assert.equal(stripLocale('/nlx/shop'), '/nlx/shop')
})

test('every product, collection and season has Dutch and German copy', () => {
  for (const locale of ['nl', 'de'] as const) {
    for (const product of products) {
      assert.ok(productDescriptions[locale][product.id], `${locale} description for ${product.id}`)
    }
    for (const collection of collections) {
      assert.ok(collectionCopy[locale][collection.id], `${locale} copy for collection ${collection.id}`)
    }
    for (const season of [...seasons, ...holidays]) {
      assert.ok(seasonCopy[locale][season.id], `${locale} copy for season ${season.id}`)
    }
  }
})

test('every option label of the catalog is translated, the same way in the shop and the API', () => {
  assert.deepEqual([...OPTION_LABEL_KEYS].sort(), [...STOREFRONT_OPTION_KEYS].sort())
  const labels = new Set<string>()
  for (const product of products) {
    for (const option of [...(product.variants ?? []), ...(product.colors ?? []), ...(product.variantGroups ?? [])]) {
      labels.add(option.label)
    }
  }
  for (const label of labels) {
    for (const locale of ['nl', 'de'] as const) {
      assert.equal(optionLabel(label, locale), storefrontOptionLabel(label, locale), label)
      assert.ok(OPTION_LABEL_KEYS.includes(label), `missing translation for option "${label}"`)
    }
  }
})

test('order lines name their options in the order language', () => {
  assert.equal(describeLine('Column candle', 'Small', 'Pink', 'nl'), 'Column candle (Klein, Roze)')
  assert.equal(describeLine('Column candle', 'Large', 'White', 'de'), 'Column candle (Groß, Weiß)')
  assert.equal(describeLine('Column candle', 'Small', 'Pink'), 'Column candle (Small, Pink)')
})

// ---- The API ----

function mockCatalog() {
  stub(prisma.product, 'findUnique', async ({ where }: { where: { id: string } }) => {
    const product = products.find((p) => p.id === where.id)
    return product
      ? {
          ...product,
          active: !product.soldOut,
          _count: { variants: product.variants?.length ?? 0, colors: product.colors?.length ?? 0 },
        }
      : null
  })
  stub(prisma.productVariant, 'findFirst', async ({ where }: { where: { id: string; productId: string } }) =>
    products.find((p) => p.id === where.productId)?.variants?.find((v) => v.id === where.id) ?? null)
  stub(prisma.productColor, 'findFirst', async ({ where }: { where: { id: string; productId: string } }) =>
    products.find((p) => p.id === where.productId)?.colors?.find((c) => c.id === where.id) ?? null)
}

function checkout(locale: string | undefined, items: object[] = [{ id: 'column', quantity: 1, variantId: 'column-small', colorId: 'pink' }]) {
  return app.inject({
    method: 'POST',
    url: '/api/checkout',
    payload: {
      items,
      customer: { firstName: 'Test', lastName: 'Customer', email: 'test@example.com' },
      shipping: { address: 'Test 1', city: 'Test', postalCode: '1000AA', country: 'Germany', countryCode: 'DE' },
      ...(locale ? { locale } : {}),
    },
  })
}

test('the checkout stores the shopping language and returns to the confirmation page in it', async () => {
  mockCatalog()
  stub(prisma, '$transaction', async (fn: (tx: typeof prisma) => unknown) => fn(prisma))
  stub(prisma.customer, 'upsert', async () => ({ id: 'test-customer' }))
  stub(prisma.order, 'update', async () => ({}))
  let saved: { locale?: string } | undefined
  stub(prisma.order, 'create', async ({ data }: { data: typeof saved }) => {
    saved = data
    return { id: 'test-order', status: 'pending' }
  })

  const response = await checkout('de')
  assert.equal(response.statusCode, 200, response.body)
  assert.equal(saved?.locale, 'de')
  assert.match(response.json().checkoutUrl, /\/de\/checkout\/confirmation\?order=/)
})

test('a checkout without a language stays English', async () => {
  mockCatalog()
  stub(prisma, '$transaction', async (fn: (tx: typeof prisma) => unknown) => fn(prisma))
  stub(prisma.customer, 'upsert', async () => ({ id: 'test-customer' }))
  stub(prisma.order, 'update', async () => ({}))
  let saved: { locale?: string } | undefined
  stub(prisma.order, 'create', async ({ data }: { data: typeof saved }) => {
    saved = data
    return { id: 'test-order', status: 'pending' }
  })

  const response = await checkout(undefined)
  assert.equal(response.statusCode, 200, response.body)
  assert.equal(saved?.locale, 'en')
  assert.match(response.json().checkoutUrl, /\/en\/checkout\/confirmation\?order=/)
})

test('checkout and coupon errors are written in the shopping language', async () => {
  mockCatalog()
  const missingColour = await checkout('nl', [{ id: 'column', quantity: 1, variantId: 'column-small' }])
  assert.equal(missingColour.statusCode, 400)
  assert.match(missingColour.json().error, /Kies een kleur/)

  const invalid = await checkout('de', [])
  assert.equal(invalid.statusCode, 400)
  assert.match(invalid.json().error, /Bitte prüfe das Formular/)

  stub(prisma.coupon, 'findUnique', async () => null)
  const coupon = await app.inject({ method: 'POST', url: '/api/coupons/validate', payload: { code: 'NOPE', locale: 'de' } })
  assert.equal(coupon.statusCode, 404)
  assert.equal(coupon.json().error, 'Dieser Gutscheincode ist nicht gültig.')
})

test('the invoice PDF renders in Dutch and German', async () => {
  for (const locale of ['nl', 'de']) {
    let stored: Buffer | undefined
    stub(prisma.order, 'findUnique', async () => ({
      id: 'order-1',
      orderNumber: 'EG-TEST01',
      locale,
      invoicePdf: null,
      paidAt: new Date('2026-11-03T10:00:00.000Z'),
      updatedAt: new Date('2026-11-03T10:00:00.000Z'),
      address: 'Hauptstraße 1',
      postalCode: '10115',
      city: 'Berlin',
      country: 'Germany',
      pricesIncludeVat: true,
      subtotalCents: 1990,
      shippingCents: 1295,
      totalCents: 3285,
      discountCents: 0,
      couponCode: null,
      couponType: null,
      customer: { firstName: 'Jürgen', lastName: 'Groß', email: 'j@example.de' },
      items: [
        { name: 'Column candle', variantLabel: 'Large', colorLabel: 'White', quantity: 2, unitPriceCents: 995, lineTotalCents: 1990 },
      ],
    }))
    stub(prisma.order, 'update', async ({ data }: { data: { invoicePdf: Buffer } }) => {
      stored = data.invoicePdf
      return {}
    })
    const pdf = await archiveInvoiceForOrder('order-1')
    assert.ok(pdf && Buffer.from(pdf).subarray(0, 5).toString() === '%PDF-', `${locale} invoice is a PDF`)
    assert.ok(stored, `${locale} invoice is archived`)
    restore.splice(0).reverse().forEach((reset) => reset())
  }
})
