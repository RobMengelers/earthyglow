import { collections, productLowestCents, products, type Product } from '../data/products'
import { localizedDescription } from '../data/catalog-i18n'
import {
  absoluteUrl,
  HANDLING_DAYS,
  localizedUrl,
  SHIPPING_COUNTRIES,
  shippingRateFor,
  SITE_URL,
  TRANSIT_DAYS,
} from '../lib/seo'
import { DEFAULT_LOCALE, isLocale, type Locale } from '../i18n/locales'

// Google Merchant Center product feed, one file per language
// (/feeds/google-nl.xml, -en, -de). Each item carries its own shipping for
// every country the checkout ships to, so Merchant Center never has to guess
// where the shop delivers.

const CHANNEL_TITLE: Record<Locale, string> = {
  nl: 'EarthyGlow – handgegoten sojawaskaarsen',
  en: 'EarthyGlow – hand-poured soy wax candles',
  de: 'EarthyGlow – handgegossene Sojawachskerzen',
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

const tag = (name: string, value: string | number) => `<g:${name}>${escapeXml(String(value))}</g:${name}>`

const euros = (cents: number) => `${(cents / 100).toFixed(2)} EUR`

function googleCategory(product: Product): string {
  return product.id.includes('wax-melts')
    ? 'Home & Garden > Decor > Home Fragrances > Wax Tarts'
    : 'Home & Garden > Decor > Home Fragrances > Candles'
}

function feedItem(product: Product, locale: Locale): string {
  const priceCents = productLowestCents(product)
  const images = (product.images?.length ? product.images : [product.image]).map(absoluteUrl)
  const collection = collections.find((c) => c.products.includes(product))
  const shipping = SHIPPING_COUNTRIES.map(
    (country) =>
      '      <g:shipping>' +
      tag('country', country) +
      tag('price', `${shippingRateFor(country, priceCents)} EUR`) +
      tag('min_transit_time', TRANSIT_DAYS.min) +
      tag('max_transit_time', TRANSIT_DAYS.max) +
      '</g:shipping>',
  )
  const lines = [
    tag('id', product.id),
    tag('title', product.name),
    tag('description', localizedDescription(product, locale)),
    tag('link', localizedUrl(locale, `/product/${product.id}`)),
    tag('image_link', images[0]),
    ...images.slice(1, 11).map((image) => tag('additional_image_link', image)),
    tag('availability', product.soldOut ? 'out_of_stock' : 'in_stock'),
    tag('price', euros(priceCents)),
    tag('brand', 'EarthyGlow'),
    tag('condition', 'new'),
    // Handmade: no barcodes or manufacturer part numbers.
    tag('identifier_exists', 'no'),
    tag('google_product_category', googleCategory(product)),
    ...(collection ? [tag('product_type', collection.title)] : []),
    tag('min_handling_time', HANDLING_DAYS.min),
    tag('max_handling_time', HANDLING_DAYS.max),
  ].map((line) => `      ${line}`)
  return `    <item>\n${[...lines, ...shipping].join('\n')}\n    </item>`
}

export function productFeedXml(locale: Locale): string {
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n' +
    '  <channel>\n' +
    `    <title>${escapeXml(CHANNEL_TITLE[locale])}</title>\n` +
    `    <link>${localizedUrl(locale, '/')}</link>\n` +
    `    <description>${escapeXml(CHANNEL_TITLE[locale])}</description>\n` +
    products.map((product) => feedItem(product, locale)).join('\n') +
    '\n  </channel>\n</rss>\n'
  )
}

export function loader({ request }: { request: Request }) {
  const match = new URL(request.url, SITE_URL).pathname.match(/google-([a-z]+)\.xml$/)
  const locale = match && isLocale(match[1]) ? match[1] : DEFAULT_LOCALE
  return new Response(productFeedXml(locale), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
