import { products } from './products'

// Membership matches earthyglow.nl's seasonal collections (21 September 2026).
// Sculptural candles remain available through All seasons and The Natural Glow.
export const seasons = [
  {
    id: 'summer',
    label: 'Summer',
    description: 'Seaside shapes and flowers for a little summer at home.',
    productIds: ['floral-box', 'coconut-beach', 'floral-basket'],
  },
  {
    id: 'spring',
    label: 'Spring',
    description: 'Hand-poured flower candles for fresh starts and thoughtful gifts.',
    productIds: ['floral-box', 'floral-basket'],
  },
  {
    id: 'autumn',
    label: 'Autumn',
    description: 'Pumpkin spice, smoky vanilla and a few little ghosts for the season.',
    productIds: ['pumpkin-spice-wax-melts', 'scary-boo', 'boo-boo', 'pumpkin-boo', 'autumn-ember', 'pumpkin-spice-latte', 'pumpkin-spice'],
  },
  {
    id: 'halloween',
    label: 'Halloween',
    description: 'Meet the little ghosts I’ve made for your Halloween table and home.',
    productIds: ['scary-boo', 'boo-boo', 'pumpkin-boo', 'ghostlight-dinner-candle'],
  },
]

export function getSeason(id: string | null) {
  return seasons.find((season) => season.id === id)
}

export function seasonForProduct(productId: string) {
  return seasons.find((season) => season.productIds.includes(productId))
}

export function filterProducts(seasonId?: string, collectionId?: string) {
  const season = getSeason(seasonId ?? null)
  return products.filter((product) =>
    (!season || season.productIds.includes(product.id)) &&
    (!collectionId || product.collectionId === collectionId),
  )
}
