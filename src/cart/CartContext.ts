import { createContext } from 'react'
import type { Product } from '../data/products'

export type CartItem = {
  id: string
  name: string
  priceCents: number
  image: string
  href: string
  collectionTitle: string
  quantity: number
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
  addItem: (product: Product, collectionTitle: string, quantity?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

export const FREE_SHIPPING_THRESHOLD_CENTS = 2500
export const SHIPPING_CENTS = 495

export function formatPrice(cents: number): string {
  return `€${(cents / 100).toFixed(2).replace('.', ',')}`
}

export function calcTotals(items: CartItem[]): CartTotals {
  const subtotalCents = items.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0,
  )
  const hasFreeShipping =
    subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS
  const shippingCents =
    subtotalCents === 0 || hasFreeShipping ? 0 : SHIPPING_CENTS

  return {
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
    shippingRemainingCents: Math.max(
      FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents,
      0,
    ),
    hasFreeShipping,
  }
}

export const CartContext = createContext<CartContextValue | null>(null)
