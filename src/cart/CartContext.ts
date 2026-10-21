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
  // The second option dimension (a colour). It sits next to the variant and
  // never changes the price, but it is part of what gets made and shipped.
  colorId?: string
  colorLabel?: string
}

export type CartTotals = {
  subtotalCents: number
  shippingCents: number
  // Money the coupon takes off the subtotal. A free-shipping coupon leaves
  // this at 0 and takes the shipping to 0 instead.
  discountCents: number
  totalCents: number
  shippingRemainingCents: number
  hasFreeShipping: boolean
}

// What a coupon code does. The storefront mirrors the API here; the server
// always recomputes the totals itself.
export type CouponType = 'free_shipping' | 'percent' | 'fixed_amount'

// A coupon the customer entered and the API confirmed.
export type AppliedCoupon = {
  code: string
  type: CouponType
  percentOff?: number | null
  amountOffCents?: number | null
  summary: string
  description?: string | null
}

export type CartContextValue = CartTotals & {
  items: CartItem[]
  itemCount: number
  isDrawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  addItem: (product: Product, collectionTitle: string, quantity?: number, variant?: { id: string; label: string; priceCents?: number }, color?: { id: string; label: string }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  coupon: AppliedCoupon | null
  couponError: string | null
  couponPending: boolean
  applyCoupon: (code: string) => Promise<boolean>
  removeCoupon: () => void
}

export type ShippingZone = {
  id: string
  label: string
  rateCents: number
  freeThresholdCents: number
}

const SHIPPING_ZONES: Record<'netherlands' | 'international', ShippingZone> =
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

// The money a coupon takes off the subtotal. Mirrors the server, which is the
// one that decides what the customer actually pays.
export function couponDiscount(
  coupon: AppliedCoupon | null | undefined,
  subtotalCents: number,
): number {
  if (!coupon) return 0
  if (coupon.type === 'percent') {
    const percent = Math.min(Math.max(coupon.percentOff ?? 0, 0), 100)
    return Math.min(subtotalCents, Math.round((subtotalCents * percent) / 100))
  }
  if (coupon.type === 'fixed_amount') {
    return Math.min(subtotalCents, Math.max(coupon.amountOffCents ?? 0, 0))
  }
  return 0
}

export function calcTotals(
  items: CartItem[],
  zone: ShippingZone = DEFAULT_ZONE,
  coupon?: AppliedCoupon | null,
): CartTotals {
  const subtotalCents = items.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0,
  )
  const discountCents = couponDiscount(coupon, subtotalCents)
  // The free-shipping threshold is judged on what the customer pays for the
  // products, so a percentage code that drops the order below the threshold
  // still costs shipping.
  const shippingBaseCents = Math.max(0, subtotalCents - discountCents)
  const hasFreeShipping = shippingBaseCents >= zone.freeThresholdCents
  const freeShippingByCoupon = coupon?.type === 'free_shipping'
  const shippingCents =
    subtotalCents === 0 || hasFreeShipping || freeShippingByCoupon
      ? 0
      : zone.rateCents

  return {
    subtotalCents,
    shippingCents,
    discountCents,
    totalCents: subtotalCents - discountCents + shippingCents,
    shippingRemainingCents: Math.max(
      zone.freeThresholdCents - shippingBaseCents,
      0,
    ),
    hasFreeShipping,
  }
}

export const CartContext = createContext<CartContextValue | null>(null)
