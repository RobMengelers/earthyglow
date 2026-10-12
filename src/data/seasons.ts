import { products } from './products'

// Membership matches earthyglow.nl's seasonal collections (21 September 2026).
// Sculptural candles remain available through All seasons and The Natural Glow.
// `coverProductId` is the product whose image fronts the season card on the
// homepage; it is picked explicitly so reordering `productIds` cannot silently
// change that artwork.
export const seasons = [
  {
    id: 'summer',
    label: 'Summer',
    description: 'Seaside shapes and flowers for a little summer at home.',
    productIds: ['floral-box', 'coconut-beach', 'floral-basket'],
    coverProductId: 'coconut-beach',
  },
  {
    id: 'spring',
    label: 'Spring',
    description: 'Hand-poured flower candles for fresh starts and thoughtful gifts.',
    productIds: ['floral-box', 'floral-basket'],
    coverProductId: 'floral-box',
  },
  {
    id: 'autumn',
    label: 'Autumn',
    description: 'Pumpkin spice, smoky vanilla and a few little ghosts for the season.',
    productIds: ['pumpkin-spice-wax-melts', 'scary-boo', 'boo-boo', 'pumpkin-boo', 'autumn-ember', 'pumpkin-spice-latte', 'pumpkin-spice'],
    coverProductId: 'pumpkin-spice-wax-melts',
  },
  {
    id: 'winter',
    label: 'Winter',
    description: 'Cosy candles to brighten the darkest days of the year.',
    productIds: [],
    coverProductId: 'autumn-ember',
  },
]

export const holidays = [
  {
    id: 'halloween',
    label: 'Halloween',
    description: 'Meet the little ghosts I’ve made for your Halloween table and home.',
    productIds: ['scary-boo', 'boo-boo', 'pumpkin-boo', 'ghostlight-dinner-candle'],
  },
  {
    id: 'christmas',
    label: 'Christmas',
    description: 'Cosy festive candles - coming soon.',
    productIds: [],
  },
]

export function getSeason(id: string | null) {
  if (!id) return undefined
  return seasons.find((season) => season.id === id) || holidays.find((holiday) => holiday.id === id)
}

export function seasonForProduct(productId: string) {
  return seasons.find((season) => season.productIds.includes(productId)) || holidays.find((holiday) => holiday.productIds.includes(productId))
}

export function filterProducts(seasonId?: string, collectionId?: string) {
  const season = getSeason(seasonId ?? null)
  return products.filter((product) =>
    (!season || season.productIds.includes(product.id)) &&
    (!collectionId || product.collectionId === collectionId),
  )
}
