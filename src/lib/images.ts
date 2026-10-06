import { imageMeta } from '../data/imageMeta'

/**
 * Responsive `sizes` values matched to the CSS grids that display the image.
 * Keep in sync with: styles/layout.css (.product-grid), pages/Home/Home.css
 * (.collection-card-grid), pages/Home/components/Hero.css (.hero-frame),
 * pages/ProductPage/ProductPage.css (.product-detail-grid) and cart thumbs.
 */
export const SIZES = {
  /** Product grid cards: auto-fill minmax(248px, 1fr) desktop, minmax(160px) mobile. */
  card: '(min-width: 780px) 300px, 45vw',
  /** Home season covers: 3-up on desktop (370px), single 520px card on mobile. */
  cover: '(min-width: 961px) 370px, (min-width: 560px) 50vw, 92vw',
  /** Product page media column: ~47% of the 1160px container, full width stacked. */
  gallery: '(min-width: 961px) 47vw, 100vw',
  /** Hero frame: width min(430px, 100%). */
  hero: '(min-width: 961px) 430px, 100vw',
  /** Split-layout feature images (about sections). */
  feature: '(min-width: 760px) 45vw, 92vw',
  /** Cart line and checkout summary thumbnails. */
  thumb: '72px',
} as const

export type ResponsiveImageProps = {
  src: string
  srcSet?: string
  sizes?: string
  width?: number
  height?: number
}

/**
 * Spreads intrinsic width/height plus a `srcset` of generated width variants
 * for an image in `public/images`. Unknown images (e.g. cart items stored
 * before a rename) fall back to a plain `src` so they still render.
 */
export function imageAttrs(path: string, sizes: string): ResponsiveImageProps {
  const meta = imageMeta[path]
  if (!meta) {
    return { src: path }
  }

  const stem = path.replace(/\.webp$/, '')
  const entries = [
    ...meta.variants.map((width) => `${stem}-${width}.webp ${width}w`),
    `${path} ${meta.width}w`,
  ]

  return {
    src: path,
    srcSet: entries.join(', '),
    sizes,
    width: meta.width,
    height: meta.height,
  }
}
