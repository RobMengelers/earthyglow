import { getCollection, getProduct } from '../data/products'
import { getSeason } from '../data/seasons'

// Addresses from the shop that ran on earthyglow.nl before this site
// (/collections/spring-candles, /products/…, /pages/about-us). Search engines,
// old social posts and backlinks still point at them, so instead of a 404 they
// move to the closest page here; the language redirect then adds the prefix.

const PAGE_ALIASES: Record<string, string> = {
  about: '/about',
  'about-us': '/about',
  'our-story': '/about',
  contact: '/contact',
  'contact-us': '/contact',
  care: '/care',
  'candle-care': '/care',
  faq: '/care',
}

/** The page an old shop path now lives at; other paths come back unchanged. */
export function legacyPath(pathname: string): string {
  const segments = pathname.toLowerCase().split('/').filter(Boolean)
  const [first, second, third, fourth] = segments

  if (first === 'products') return productPath(second)

  if (first === 'collections') {
    // /collections/<collection>/products/<product>
    if (third === 'products') return productPath(fourth)
    return collectionPath(second)
  }

  if (first === 'pages') return PAGE_ALIASES[second ?? ''] ?? '/'

  return pathname
}

function productPath(handle: string | undefined): string {
  return getProduct(handle) ? `/product/${handle}` : '/shop'
}

function collectionPath(handle: string | undefined): string {
  if (!handle || handle === 'all' || handle === 'frontpage') return '/shop'
  if (getCollection(handle)) return `/shop/${handle}`
  // Seasonal collections were named like spring-candles or christmas-collection.
  const season = handle.replace(/-(candles?|collection|kaarsen)$/, '')
  if (getSeason(season)) return `/shop?season=${season}`
  return '/shop'
}
