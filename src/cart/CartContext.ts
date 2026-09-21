import { createContext } from 'react'
import type { Product } from '../data/products'

export type CartItem = {
  id: string
  productId: string
  name: string
  priceCents: number
  image: string
  collectionTitle: string
  quantity: number
  variantId?: string
  variantLabel?: string
}

export type CartTotals = {
  subtotalCents: number
  shippingCents: number
  totalCents: number
  shippingRemainingCents: number
  hasFreeShipping: boolean
}

export type CartContextValue = CartTotals & {
  items: CartItem[]
  itemCount: number
  isDrawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  addItem: (product: Product, collectionTitle: string, quantity?: number, variant?: { id: string; label: string; priceCents?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

export type ShippingZone = {
  id: string
  label: string
  rateCents: number
  freeThresholdCents: number
}

export const SHIPPING_ZONES: Record<'netherlands' | 'international', ShippingZone> =
  {
    netherlands: {
      id: 'netherlands',
      label: 'Netherlands',
      rateCents: 699,
      freeThresholdCents: 2500,
    },
    international: {
      id: 'international',
      label: 'International',
      rateCents: 1295,
      freeThresholdCents: 5000,
    },
  }

export const DEFAULT_ZONE: ShippingZone = SHIPPING_ZONES.netherlands

export function formatPrice(cents: number): string {
  return `€${(cents / 100).toFixed(2).replace('.', ',')}`
}

export function shippingZoneForCountry(countryCode: string): ShippingZone {
  return countryCode.toUpperCase() === 'NL'
    ? SHIPPING_ZONES.netherlands
    : SHIPPING_ZONES.international
}

export function calcTotals(
  items: CartItem[],
  zone: ShippingZone = DEFAULT_ZONE,
): CartTotals {
  const subtotalCents = items.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0,
  )
  const hasFreeShipping = subtotalCents >= zone.freeThresholdCents
  const shippingCents =
    subtotalCents === 0 || hasFreeShipping ? 0 : zone.rateCents

  return {
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
    shippingRemainingCents: Math.max(
      zone.freeThresholdCents - subtotalCents,
      0,
    ),
    hasFreeShipping,
  }
}

export const CartContext = createContext<CartContextValue | null>(null)
