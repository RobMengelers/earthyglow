import type { CartItem } from './CartContext'

export const API_URL = import.meta.env?.VITE_API_URL ?? ''

export type CatalogProductPrice = {
  id: string
  name: string
  priceCents: number
  variants?: { id: string; label: string; priceCents: number }[]
}

export function reconcileCatalogItems(items: CartItem[], catalog: CatalogProductPrice[]): CartItem[] {
  const byId = new Map(catalog.map((product) => [product.id, product]))
  let changed = false
  const next = items.map((item) => {
    const product = byId.get(item.productId)
    if (!product) return item
    const variant = product.variants?.find((option) => option.id === item.variantId)
    // Never replace a variant price with the base price. Unavailable options
    // are rejected by checkout; an older API may not expose variants yet.
    const priceCents = item.variantId ? variant?.priceCents ?? item.priceCents : product.priceCents
    const variantLabel = variant?.label ?? item.variantLabel
    if (priceCents === item.priceCents && product.name === item.name && variantLabel === item.variantLabel) return item
    changed = true
    return { ...item, name: product.name, priceCents, variantLabel }
  })
  return changed ? next : items
}

// Authoritative prices from the API (backed by the Product table in Postgres).
// The cart reconciles its line-item prices against this so displayed totals
// always match what the server will actually charge.
export async function fetchCatalog(): Promise<CatalogProductPrice[]> {
  try {
    const response = await fetch(`${API_URL}/api/catalog`)
    if (!response.ok) return []
    const data = (await response.json()) as { products?: CatalogProductPrice[] }
    return Array.isArray(data.products) ? data.products : []
  } catch {
    return []
  }
}
