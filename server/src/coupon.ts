// Coupon logic lives in one place so the checkout, the validation endpoint and
// the tests all agree on what a code does and when it stops working.
//
// A coupon is a row, not a branch in the code: `free_shipping` takes the
// shipping to zero, `percent` takes a percentage off the subtotal and
// `fixed_amount` takes a fixed amount off. Adding the Christmas percentage
// code or a one-time offer is a matter of inserting a row.

export type CouponType = 'free_shipping' | 'percent' | 'fixed_amount'

// The shape of a coupon row. Kept structural so a Prisma result can be passed
// straight in.
export type Coupon = {
  id: string
  code: string
  description: string | null
  type: CouponType
  percentOff: number | null
  amountOffCents: number | null
  maxUses: number | null
  usedCount: number
  startsAt: Date | null
  expiresAt: Date | null
  active: boolean
}

export type ShippingZone = {
  rateCents: number
  freeThresholdCents: number
}

export type CouponPrices = {
  discountCents: number
  shippingCents: number
  totalCents: number
}

export const COUPON_CODE_MAX_LENGTH = 40

// Codes are stored uppercase, so "glowfam" and "GLOWFAM" are the same code.
export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase()
}

// Why a code cannot be used right now, in words the customer can read.
// `null` means the code is good to go.
export function couponProblem(
  coupon: Coupon,
  now: Date = new Date(),
): string | null {
  if (!coupon.active) return 'This coupon code is not active.'
  if (coupon.startsAt && coupon.startsAt > now) {
    return 'This coupon code is not active yet.'
  }
  if (coupon.expiresAt && coupon.expiresAt <= now) {
    return 'This coupon code has expired.'
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return 'This coupon code has already been used.'
  }
  return null
}

// What a code does to the totals. The total is always
// subtotal - discount + shipping.
export function priceWithCoupon(
  coupon: Coupon | null,
  input: { subtotalCents: number; zone: ShippingZone },
): CouponPrices {
  const { subtotalCents, zone } = input
  const discountCents = coupon ? discountFor(coupon, subtotalCents) : 0

  if (coupon?.type === 'free_shipping') {
    return { discountCents: 0, shippingCents: 0, totalCents: subtotalCents }
  }

  // The free-shipping threshold is judged on what the customer pays for the
  // products, so a percentage code that drops the order below the threshold
  // still costs shipping.
  const shippingBaseCents = Math.max(0, subtotalCents - discountCents)
  const shippingCents =
    shippingBaseCents >= zone.freeThresholdCents ? 0 : zone.rateCents

  return {
    discountCents,
    shippingCents,
    totalCents: subtotalCents - discountCents + shippingCents,
  }
}

function discountFor(coupon: Coupon, subtotalCents: number): number {
  if (coupon.type === 'percent') {
    const percent = Math.min(Math.max(coupon.percentOff ?? 0, 0), 100)
    return Math.min(subtotalCents, Math.round((subtotalCents * percent) / 100))
  }
  if (coupon.type === 'fixed_amount') {
    return Math.min(subtotalCents, Math.max(coupon.amountOffCents ?? 0, 0))
  }
  return 0
}

// A short description of what the code does, shown to the customer.
export function couponSummary(coupon: Coupon): string {
  if (coupon.type === 'free_shipping') return 'Free shipping'
  if (coupon.type === 'percent') return `${coupon.percentOff ?? 0}% off`
  const cents = Math.max(coupon.amountOffCents ?? 0, 0)
  return `€${(cents / 100).toFixed(2)} off`
}
