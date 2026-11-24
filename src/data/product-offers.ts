import type { Product, ProductColor, ProductVariant } from './products'
import { optionLabel } from '../i18n/options'
import type { Locale } from '../i18n/locales'

// Every buyable version of a product (a size, a colour, or a size in a
// colour), for the Merchant Center feeds and the product page's variant
// markup. Each version has its own link: the product page reads ?variant= and
// ?color= and opens with that choice made, so a shopper coming from Google
// Shopping lands on the photo and price they clicked.

export type ProductOffer = {
  /** Feed id: the product id for a product without options, else product id plus the choice. */
  id: string
  product: Product
  variant?: ProductVariant
  color?: ProductColor
  priceCents: number
  images: string[]
  /** Query string that preselects this version on the product page ('' when there is nothing to choose). */
  search: string
}

/**
 * The gallery for a choice of size/shape and colour, as the product page shows
 * it. A colour with its own photography replaces the product's pictures
 * entirely; the basic colour (white) keeps them, with the picture of the
 * chosen size leading.
 */
export function productGallery(product: Product, variant?: ProductVariant, color?: ProductColor): string[] {
  const baseGallery = product.images?.length ? product.images : [product.image]
  const lead = color?.images?.length
    ? color.base
      ? variant?.image ?? color.images[0]
      : color.images[0]
    : variant?.images?.[0] ?? variant?.image
  const hero = lead ?? baseGallery[0]
  const colorGallery = color?.images ?? []
  return colorGallery.length
    ? color?.base
      ? [hero, ...colorGallery.filter((image) => image !== hero)]
      : colorGallery
    : variant?.images?.length
      ? variant.images
      : [hero, ...baseGallery.filter((image) => image !== hero)]
}

/** Variant ids often repeat the product id ('pillar-small'); the feed id keeps just the choice. */
function suffix(product: Product, variant: ProductVariant): string {
  return variant.id.startsWith(`${product.id}-`) ? variant.id.slice(product.id.length + 1) : variant.id
}

export function productOffers(product: Product): ProductOffer[] {
  const variants: (ProductVariant | undefined)[] = product.variants?.length ? product.variants : [undefined]
  const colors: (ProductColor | undefined)[] = product.colors?.length ? product.colors : [undefined]
  return variants.flatMap((variant) =>
    colors.map((color) => {
      const params = new URLSearchParams()
      if (variant) params.set('variant', variant.id)
      if (color) params.set('color', color.id)
      const parts = [variant && suffix(product, variant), color?.id].filter(Boolean)
      return {
        id: parts.length ? `${product.id}-${parts.join('-')}` : product.id,
        product,
        variant,
        color,
        priceCents: variant?.priceCents ?? product.priceCents,
        images: productGallery(product, variant, color),
        search: params.size ? `?${params}` : '',
      }
    }),
  )
}

/** The choice a product page link asks for (?variant=…&color=…); unknown ids are ignored. */
export function presetFromSearch(
  product: Product,
  params: URLSearchParams,
): { variantId?: string; groupId?: string; colorId?: string } | null {
  const variant = product.variants?.find((item) => item.id === params.get('variant'))
  const color = product.colors?.find((item) => item.id === params.get('color'))
  if (!variant && !color) return null
  return {
    variantId: variant?.id,
    groupId: variant && product.variantGroups?.find((group) => group.variantIds.includes(variant.id))?.id,
    colorId: color?.id,
  }
}

/**
 * What a version is, in the visitor's language: its colour and size where the
 * choice is one (Google filters on both), and every chosen option for titles.
 */
export function offerLabels(offer: ProductOffer, locale: Locale): { color?: string; size?: string; parts: string[] } {
  const { product, variant, color } = offer
  const variantName = variant && optionLabel(variant.label, locale)
  const colorName = color && optionLabel(color.label, locale)
  return {
    color: colorName ?? (variant?.swatch ? variantName : undefined),
    size: product.variantLabel === 'size or bundle' || product.variantLabel === 'size' ? variantName : undefined,
    parts: [variantName, colorName].filter((part): part is string => Boolean(part)),
  }
}
