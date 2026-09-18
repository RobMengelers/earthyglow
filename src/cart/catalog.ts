export const API_URL = import.meta.env.VITE_API_URL ?? ''

export type CatalogProductPrice = {
  id: string
  name: string
  priceCents: number
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