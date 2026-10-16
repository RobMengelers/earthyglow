import { execFileSync } from 'node:child_process'
import { collections, heroImage, products } from '../data/products'
import { absoluteUrl, canonicalUrl } from '../lib/seo'

type Page = {
  path: string
  /** Source files whose last commit date reflects when this page last changed. */
  sources: string[]
  /** Image paths to advertise for this URL via the image sitemap extension. */
  images?: string[]
}

const staticPages: Page[] = [
  { path: '/', sources: ['src/pages/Home/Home.tsx'], images: [heroImage] },
  { path: '/shop', sources: ['src/pages/Shop/Shop.tsx', 'src/data/products.ts'] },
  { path: '/about', sources: ['src/pages/About/About.tsx'] },
  { path: '/care', sources: ['src/pages/Care/Care.tsx'] },
  { path: '/contact', sources: ['src/pages/Contact/Contact.tsx'] },
  {
    path: '/policies',
    sources: ['src/pages/policies/PoliciesIndex.tsx'],
  },
  {
    path: '/policies/privacy-policy',
    sources: ['src/pages/policies/PrivacyPolicy.tsx'],
  },
  {
    path: '/policies/refund-policy',
    sources: ['src/pages/policies/RefundPolicy.tsx'],
  },
  {
    path: '/policies/terms-of-service',
    sources: ['src/pages/policies/TermsOfService.tsx'],
  },
  {
    path: '/policies/contact-information',
    sources: ['src/pages/policies/ContactInformation.tsx'],
  },
]

const lastmodCache = new Map<string, string>()

function sourceLastmod(source: string): number {
  const cached = lastmodCache.get(source)
  if (cached) return Date.parse(cached)

  let date = ''
  try {
    date = execFileSync('git', ['log', '-1', '--format=%cI', '--', source], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    // No git history available (shallow clone, archive download, …).
  }
  const time = date ? Date.parse(date) : NaN
  const iso = Number.isNaN(time) ? '' : date
  lastmodCache.set(source, iso)
  return Number.isNaN(time) ? 0 : time
}

/** Newest commit date across the given sources, date-only. Falls back to the build date. */
function lastmod(sources: string[]): string {
  const newest = Math.max(...sources.map(sourceLastmod))
  return new Date(newest || Date.now()).toISOString().slice(0, 10)
}

export function loader() {
  const pages: Page[] = [
    ...staticPages,
    ...collections.map((collection) => ({
      path: `/shop/${collection.id}`,
      sources: ['src/pages/Shop/Shop.tsx', 'src/data/products.ts'],
    })),
    ...products.map((product) => ({
      path: `/product/${product.id}`,
      sources: ['src/data/products.ts'],
      images: product.images?.length ? product.images : [product.image],
    })),
  ]

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
    pages
      .map((page) => {
        const images = (page.images ?? [])
          .map(
            (image) =>
              `    <image:image><image:loc>${absoluteUrl(image)}</image:loc></image:image>`,
          )
          .join('\n')
        return (
          `  <url>\n` +
          `    <loc>${canonicalUrl(page.path)}</loc>\n` +
          `    <lastmod>${lastmod(page.sources)}</lastmod>` +
          (images ? `\n${images}` : '') +
          `\n  </url>`
        )
      })
      .join('\n') +
    '\n</urlset>\n'

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
