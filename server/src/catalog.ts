export type CatalogProduct = {
  id: string
  name: string
  priceCents: number
  active: boolean
}

// Server-side price source of truth. The client only ever sends product ids and
// quantities; prices are always resolved here so they cannot be tampered with.
// Keep in sync with src/data/products.ts in the frontend.
export const catalog: CatalogProduct[] = [
  { id: 'floral-box', name: 'The Floral Box', priceCents: 1495, active: true },
  { id: 'floral-basket', name: 'The Floral Basket', priceCents: 1295, active: true },
  { id: 'coconut-beach', name: 'Coconut Beach', priceCents: 1495, active: true },
  { id: 'autumn-ember', name: 'Autumn Ember', priceCents: 1495, active: true },
  { id: 'pumpkin-spice', name: 'Pumpkin Spice', priceCents: 1495, active: false },
  { id: 'pumpkin-spice-latte', name: 'Pumpkin Spice Latte', priceCents: 995, active: true },
  { id: 'column', name: 'Column candle', priceCents: 995, active: true },
  { id: 'pillar', name: 'Pillar candle', priceCents: 695, active: true },
  { id: 'spiral', name: 'Spiral candle', priceCents: 695, active: true },
  { id: 'shell', name: 'Shell candle', priceCents: 495, active: true },
  { id: 'arch', name: 'Arch candle', priceCents: 495, active: true },
  { id: 'bubble', name: 'Bubble candle', priceCents: 495, active: true },
]

export function getCatalogProduct(id: string): CatalogProduct | undefined {
  return catalog.find((product) => product.id === id)
}
