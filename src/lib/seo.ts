import type { MetaDescriptor } from 'react-router'

export const SITE_URL = 'https://earthyglow.nl'
export const SITE_NAME = 'EarthyGlow'
export const DEFAULT_TITLE = 'EarthyGlow · Hand-poured Soy Candles'
export const DEFAULT_DESCRIPTION =
  'Meet EarthyGlow: 100% soy wax candles, poured by hand by Naomi in the Netherlands. Flower candles, seasonal scents and sculptural shapes.'
export const DEFAULT_OG_IMAGE = '/og-cover.png'
export const OG_IMAGE_WIDTH = 1200
export const OG_IMAGE_HEIGHT = 630

export function absoluteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl
  }
  return `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`
}

type SiteMetaOptions = {
  title?: string
  description?: string
  /** Pathname (no query string) used for canonical + og:url. Omit for pages that should not claim a canonical URL. */
  path?: string
  image?: string
  type?: string
  robots?: string
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
  type,
  robots,
}: SiteMetaOptions): MetaDescriptor[] {
  const resolvedTitle = title ?? DEFAULT_TITLE
  const resolvedDescription = description ?? DEFAULT_DESCRIPTION
  const resolvedImage = absoluteUrl(image ?? DEFAULT_OG_IMAGE)

  return [
    { title: resolvedTitle },
    { name: 'description', content: resolvedDescription },
    { name: 'theme-color', content: '#fbf7f0' },
    ...(path
      ? [
          { tagName: 'link', rel: 'canonical', href: `${SITE_URL}${path}` },
          { property: 'og:url', content: `${SITE_URL}${path}` },
        ]
      : []),
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:title', content: resolvedTitle },
    { property: 'og:description', content: resolvedDescription },
    { property: 'og:type', content: type ?? 'website' },
    { property: 'og:image', content: resolvedImage },
    // Dimensions only describe the default 1200×630 cover; per-page images vary.
    ...(image
      ? []
      : [
          { property: 'og:image:width', content: String(OG_IMAGE_WIDTH) },
          { property: 'og:image:height', content: String(OG_IMAGE_HEIGHT) },
        ]),
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: resolvedTitle },
    { name: 'twitter:description', content: resolvedDescription },
    { name: 'twitter:image', content: resolvedImage },
    ...(robots ? [{ name: 'robots', content: robots }] : []),
  ]
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
      ...(item.path ? { item: absoluteUrl(item.path) } : {}),
    })),
  }
}
