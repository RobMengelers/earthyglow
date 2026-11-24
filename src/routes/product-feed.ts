import { collections, products, type Product } from '../data/products'
import { localizedCollection, localizedDescription } from '../data/catalog-i18n'
import { offerLabels, productOffers, type ProductOffer } from '../data/product-offers'
import { productSeo } from '../data/seo-copy'
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
// (/feeds/google-nl.xml, -en, -de). Every version of a product (size, colour,
// or both) is its own item, grouped by product, with its own price, photos and
// a link that opens the product page with that choice made. Each item carries
// its own shipping for every country the checkout ships to, so Merchant
// Center never has to guess where the shop delivers.

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

const MATERIAL: Record<Locale, string> = { en: 'Soy wax', nl: 'Sojawas', de: 'Sojawachs' }

const HANDMADE: Record<Locale, string> = {
  en: 'Poured by hand in the Netherlands',
  nl: 'Met de hand gegoten in Nederland',
  de: 'In den Niederlanden von Hand gegossen',
}

// The Natural Glow collection is unscented, 100% soy wax throughout; its
// descriptions have no closing line of facts to take this from.
const NATURAL_GLOW_FACTS: Record<Locale, string[]> = {
  en: ['Unscented', '100% soy wax'],
  nl: ['Geurloos', '100% sojawas'],
  de: ['Duftfrei', '100 % Sojawachs'],
}

/**
 * Short facts for Shopping's product highlights: the description's closing
 * line of facts ("Ca. 150 g was | Ca. 9 cm hoog | Geur: Mulled Wine") where it
 * has one, and that it is poured by hand.
 */
function highlights(product: Product, locale: Locale): string[] {
  const closing = localizedDescription(product, locale).trim().split(/\n\s*\n/).pop() ?? ''
  const facts = closing.includes('|')
    ? closing.split('|').map((fact) => fact.trim()).filter(Boolean)
    : product.collectionId === 'natural-glow'
      ? NATURAL_GLOW_FACTS[locale]
      : []
  return [...facts, HANDMADE[locale]].slice(0, 10)
}

const tag = (name: string, value: string | number) => `<g:${name}>${escapeXml(String(value))}</g:${name}>`

const euros = (cents: number) => `${(cents / 100).toFixed(2)} EUR`

/**
 * The price group of a version, sent as custom_label_0 so Google Ads can bid on
 * (or leave out) cheap items without listing them one by one. The same values
 * in every language's feed, so one campaign rule means the same everywhere.
 */
export function priceBand(priceCents: number): 'onder-8' | '8-tot-15' | '15-en-meer' {
  if (priceCents < 800) return 'onder-8'
  if (priceCents < 1500) return '8-tot-15'
  return '15-en-meer'
}

function googleCategory(product: Product): string {
  return product.id.includes('wax-melts')
    ? 'Home & Garden > Decor > Home Fragrances > Wax Tarts'
    : 'Home & Garden > Decor > Home Fragrances > Candles'
}

function feedItem(offer: ProductOffer, locale: Locale, grouped: boolean): string {
  const { product, priceCents } = offer
  const images = offer.images.map(absoluteUrl)
  const baseCollection = collections.find((c) => c.products.includes(product))
  const collection = baseCollection && localizedCollection(baseCollection, locale)
  const labels = offerLabels(offer, locale)
  // The search title says what the product is ("… bloemkaarsjes"), which
  // Shopping matches queries against; a version adds its choice ("…, Roze").
  const title = productSeo[locale][product.id]?.title ?? product.name
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
    tag('id', offer.id),
    ...(grouped ? [tag('item_group_id', product.id)] : []),
    tag('title', labels.parts.length ? `${title} – ${labels.parts.join(', ')}` : title),
    tag('description', localizedDescription(product, locale)),
    tag('link', `${localizedUrl(locale, `/product/${product.id}`)}${offer.search}`),
    tag('image_link', images[0]),
    ...images.slice(1, 11).map((image) => tag('additional_image_link', image)),
    tag('availability', product.soldOut ? 'out_of_stock' : 'in_stock'),
    tag('price', euros(priceCents)),
    tag('brand', 'EarthyGlow'),
    tag('condition', 'new'),
    // Handmade: no barcodes or manufacturer part numbers.
    tag('identifier_exists', 'no'),
    tag('google_product_category', googleCategory(product)),
    ...(collection ? [tag('product_type', collection.eyebrow)] : []),
    tag('material', MATERIAL[locale]),
    ...(labels.color ? [tag('color', labels.color)] : []),
    ...(labels.size ? [tag('size', labels.size)] : []),
    ...highlights(product, locale).map((fact) => tag('product_highlight', fact)),
    tag('custom_label_0', priceBand(priceCents)),
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
    products
      .flatMap((product) => {
        const offers = productOffers(product)
        return offers.map((offer) => feedItem(offer, locale, offers.length > 1))
      })
      .join('\n') +
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
