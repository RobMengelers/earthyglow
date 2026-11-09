import type { MetaDescriptor } from 'react-router'
import { socials } from '../data/socials'
import { shippingZoneForCountry } from '../cart/CartContext'
import { countries } from '../pages/Checkout/countries'
import { DEFAULT_LOCALE, LOCALE_INFO, LOCALES, localizePath, type Locale } from '../i18n/locales'

export const SITE_URL = 'https://www.earthyglow.nl'
const SITE_NAME = 'EarthyGlow'
const DEFAULT_TITLE: Record<Locale, string> = {
  en: 'EarthyGlow · Hand-poured Soy Candles',
  nl: 'EarthyGlow · Handgegoten sojawaskaarsen',
  de: 'EarthyGlow · Handgegossene Sojawachskerzen',
}
const DEFAULT_DESCRIPTION: Record<Locale, string> = {
  en: 'Meet EarthyGlow: 100% soy wax candles, poured by hand by Naomi in the Netherlands. Flower candles, seasonal scents and sculptural shapes.',
  nl: 'Maak kennis met EarthyGlow: kaarsen van 100% sojawas, met de hand gegoten door Naomi in Nederland. Bloemkaarsjes, seizoensgeuren en sculpturale vormen.',
  de: 'Entdecke EarthyGlow: Kerzen aus 100 % Sojawachs, von Naomi in den Niederlanden von Hand gegossen. Blumenkerzen, saisonale Düfte und skulpturale Formen.',
}
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

/** Absolute canonical URL of a site path in one language: ('nl', '/shop') → …/nl/shop/. */
export function localizedUrl(locale: Locale, path: string): string {
  return canonicalUrl(localizePath(locale, path))
}

type SiteMetaOptions = {
  /** Language of the page; with `path` it adds hreflang links to the other languages. */
  locale?: Locale
  title?: string
  description?: string
  /** Path without language (e.g. '/shop') used for canonical + og:url. Omit for pages that should not claim a canonical URL. */
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
  locale = DEFAULT_LOCALE,
  title,
  description,
  path,
  image,
  imageAlt,
  type,
  robots,
  product,
}: SiteMetaOptions): MetaDescriptor[] {
  const resolvedTitle = title ?? DEFAULT_TITLE[locale]
  const resolvedDescription = shortDescription(description ?? DEFAULT_DESCRIPTION[locale])
  const resolvedImage = absoluteUrl(image ?? DEFAULT_OG_IMAGE)
  const resolvedImageAlt = imageAlt ?? resolvedTitle
  const canonical = path ? localizedUrl(locale, path) : undefined

  return [
    { title: resolvedTitle },
    { name: 'description', content: resolvedDescription },
    { name: 'theme-color', content: '#fbf7f0' },
    ...(canonical
      ? [
          { tagName: 'link', rel: 'canonical', href: canonical },
          { property: 'og:url', content: canonical },
          // Every language version names all the others (and itself), with
          // English as the pick for languages we do not have.
          ...LOCALES.map((alternate) => ({
            tagName: 'link',
            rel: 'alternate',
            hrefLang: alternate,
            href: localizedUrl(alternate, path!),
          })),
          { tagName: 'link', rel: 'alternate', hrefLang: 'x-default', href: localizedUrl(DEFAULT_LOCALE, path!) },
        ]
      : []),
    { property: 'og:locale', content: LOCALE_INFO[locale].og },
    ...LOCALES.filter((other) => other !== locale).map((other) => ({
      property: 'og:locale:alternate',
      content: LOCALE_INFO[other].og,
    })),
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
export function organizationLd(locale: Locale = DEFAULT_LOCALE): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BUSINESS.name,
    url: localizedUrl(locale, '/'),
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
      availableLanguage: ['nl', 'en', 'de'],
    },
  }
}

/** Shipping for one item at this price, from the same rates and countries the checkout uses. */
export function offerShippingDetails(priceCents: number): Record<string, unknown>[] {
  const abroad = countries.map((country) => country.code).filter((code) => code !== 'NL')
  const details = (destination: string | string[], zoneCountry: string) => {
    const zone = shippingZoneForCountry(zoneCountry)
    return {
      '@type': 'OfferShippingDetails',
      shippingRate: {
        '@type': 'MonetaryAmount',
        value: priceCents >= zone.freeThresholdCents ? '0.00' : (zone.rateCents / 100).toFixed(2),
        currency: 'EUR',
      },
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: destination },
      // Handling plus transit adds up to the 3 to 7 business days in the terms.
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' },
        transitTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 4, unitCode: 'DAY' },
      },
    }
  }
  return [details('NL', 'NL'), details(abroad, abroad[0])]
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

/**
 * Search snippets are cut at about 155 characters, so long text (a full product
 * description) is trimmed to whole sentences, or whole words, that fit.
 */
export function shortDescription(text: string, max = 155): string {
  const flat = text.replace(/\s+/g, ' ').replace(/\s*♡\s*/g, ' ').trim()
  if (flat.length <= max) return flat
  let cut = ''
  for (const sentence of flat.match(/[^.!?]+[.!?]+/g) ?? []) {
    if ((cut + sentence).trim().length > max) break
    cut += sentence
  }
  if (cut.trim().length >= 70) return cut.trim()
  return `${flat.slice(0, max - 1).replace(/\s+\S*$/, '')}…`
}

/** schema.org BreadcrumbList for the visible breadcrumb navigation on a page. */
export function breadcrumbLd(
  items: { name: string; path?: string }[],
  locale: Locale = DEFAULT_LOCALE,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.path ? { item: localizedUrl(locale, item.path) } : {}),
    })),
  }
}
