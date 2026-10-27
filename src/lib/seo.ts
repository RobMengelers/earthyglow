import type { MetaDescriptor } from 'react-router'
import { socials } from '../data/socials'

export const SITE_URL = 'https://www.earthyglow.nl'
const SITE_NAME = 'EarthyGlow'
const DEFAULT_TITLE = 'EarthyGlow · Hand-poured Soy Candles'
const DEFAULT_DESCRIPTION =
  'Meet EarthyGlow: 100% soy wax candles, poured by hand by Naomi in the Netherlands. Flower candles, seasonal scents and sculptural shapes.'
const DEFAULT_OG_IMAGE = '/og-cover.png'
const OG_IMAGE_WIDTH = 1200
const OG_IMAGE_HEIGHT = 630

/** Business details shared by the Organization markup on every page that emits it. */
export const BUSINESS = {
  name: SITE_NAME,
  email: 'earthyglowcandles@gmail.com',
  country: 'NL',
  coc: '42049155',
  vatId: 'NL005456394B38',
  founder: 'Naomi',
} as const

export function absoluteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl
  }
  return `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`
}

/**
 * Absolute canonical URL for a site path. Netlify serves prerendered pages from
 * a directory index, so the slashless form 301-redirects to the trailing-slash
 * URL. Pointing canonicals (and breadcrumbs/sitemap) at the trailing-slash form
 * keeps them on the URL that returns 200 without redirecting. The root stays a
 * bare slash. Query strings are dropped, since they never name a canonical page.
 */
export function canonicalUrl(path: string): string {
  const pathname = path.split(/[?#]/)[0]
  if (pathname === '' || pathname === '/') return `${SITE_URL}/`
  return absoluteUrl(pathname.endsWith('/') ? pathname : `${pathname}/`)
}

type SiteMetaOptions = {
  title?: string
  description?: string
  /** Pathname (no query string) used for canonical + og:url. Omit for pages that should not claim a canonical URL. */
  path?: string
  image?: string
  /** Alt text for the social share image. Defaults to the page title. */
  imageAlt?: string
  type?: string
  robots?: string
  /** Adds Open Graph product tags (used alongside type: 'product' on product pages). */
  product?: { price: string; currency?: string; availability?: string }
}

/**
 * Builds a complete meta descriptor array for a route. React Router replaces
 * (does not merge) meta per route, so every call returns the full set of
 * title/description/canonical/Open Graph/Twitter tags.
 */
export function siteMeta({
  title,
  description,
  path,
  image,
  imageAlt,
  type,
  robots,
  product,
}: SiteMetaOptions): MetaDescriptor[] {
  const resolvedTitle = title ?? DEFAULT_TITLE
  const resolvedDescription = description ?? DEFAULT_DESCRIPTION
  const resolvedImage = absoluteUrl(image ?? DEFAULT_OG_IMAGE)
  const resolvedImageAlt = imageAlt ?? resolvedTitle
  const canonical = path ? canonicalUrl(path) : undefined

  return [
    { title: resolvedTitle },
    { name: 'description', content: resolvedDescription },
    { name: 'theme-color', content: '#fbf7f0' },
    ...(canonical
      ? [
          { tagName: 'link', rel: 'canonical', href: canonical },
          { property: 'og:url', content: canonical },
        ]
      : []),
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:title', content: resolvedTitle },
    { property: 'og:description', content: resolvedDescription },
    { property: 'og:type', content: type ?? 'website' },
    { property: 'og:image', content: resolvedImage },
    { property: 'og:image:alt', content: resolvedImageAlt },
    // Dimensions only describe the default 1200×630 cover; per-page images vary.
    ...(image
      ? []
      : [
          { property: 'og:image:width', content: String(OG_IMAGE_WIDTH) },
          { property: 'og:image:height', content: String(OG_IMAGE_HEIGHT) },
        ]),
    ...(product
      ? [
          { property: 'product:price:amount', content: product.price },
          { property: 'product:price:currency', content: product.currency ?? 'EUR' },
          { property: 'product:availability', content: product.availability ?? 'in stock' },
        ]
      : []),
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: resolvedTitle },
    { name: 'twitter:description', content: resolvedDescription },
    { name: 'twitter:image', content: resolvedImage },
    { name: 'twitter:image:alt', content: resolvedImageAlt },
    ...(robots ? [{ name: 'robots', content: robots }] : []),
  ]
}

/** schema.org Organization describing the business, for knowledge-panel and entity data. */
export function organizationLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BUSINESS.name,
    url: canonicalUrl('/'),
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl('/logo.png'),
      width: 256,
      height: 256,
    },
    email: BUSINESS.email,
    founder: { '@type': 'Person', name: BUSINESS.founder },
    sameAs: socials.map((social) => social.href),
    address: { '@type': 'PostalAddress', addressCountry: BUSINESS.country },
    vatID: BUSINESS.vatId,
    taxID: BUSINESS.coc,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: BUSINESS.email,
      availableLanguage: ['en', 'nl'],
    },
  }
}

/** Shipping terms for product offers (flat Netherlands rate; free over €25 in practice). */
export function offerShippingDetails(): Record<string, unknown>[] {
  return [
    {
      '@type': 'OfferShippingDetails',
      shippingRate: {
        '@type': 'MonetaryAmount',
        value: '6.99',
        currency: 'EUR',
      },
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'NL' },
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: {
          '@type': 'QuantitativeValue',
          minValue: 1,
          maxValue: 3,
          unitCode: 'DAY',
        },
        transitTime: {
          '@type': 'QuantitativeValue',
          minValue: 1,
          maxValue: 3,
          unitCode: 'DAY',
        },
      },
    },
  ]
}

/** Return policy matching the refund page: report a problem within 7 days, buyer pays return postage. */
export function merchantReturnPolicy(): Record<string, unknown> {
  return {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: BUSINESS.country,
    returnPolicyCategory:
      'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: 7,
    returnMethod: 'https://schema.org/ReturnByMail',
    returnFees: 'https://schema.org/ReturnShippingFees',
  }
}

/** schema.org BreadcrumbList for the visible breadcrumb navigation on a page. */
export function breadcrumbLd(
  items: { name: string; path?: string }[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.path ? { item: canonicalUrl(item.path) } : {}),
    })),
  }
}
