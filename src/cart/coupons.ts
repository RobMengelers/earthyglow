import type { CouponType } from './CartContext'
import { API_URL } from './catalog'
import { formatPriceFor, type Locale } from '../i18n/locales'

export type CouponValidation = {
  code: string
  type: CouponType
  percentOff?: number | null
  amountOffCents?: number | null
  description?: string | null
  summary: string
}

/** What a coupon does, in the visitor's language: "Free shipping", "10% off", "€5.00 off". */
export function couponSummary(
  coupon: { type: CouponType; percentOff?: number | null; amountOffCents?: number | null },
  locale: Locale,
): string {
  if (coupon.type === 'free_shipping') {
    return { en: 'Free shipping', nl: 'Gratis verzending', de: 'Kostenloser Versand' }[locale]
  }
  if (coupon.type === 'percent') {
    const pct = coupon.percentOff ?? 0
    return { en: `${pct}% off`, nl: `${pct}% korting`, de: `${pct} % Rabatt` }[locale]
  }
  const amount = formatPriceFor(locale, Math.max(coupon.amountOffCents ?? 0, 0))
  return { en: `${amount} off`, nl: `${amount} korting`, de: `${amount} Rabatt` }[locale]
}

// Asks the API whether a code is worth anything. The API is the only one
// that knows about expired, used-up and inactive codes, so the storefront
// never decides on its own.
export async function validateCoupon(code: string, locale: Locale): Promise<CouponValidation> {
  const response = await fetch(`${API_URL}/api/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, locale }),
  })

  const body = (await response.json().catch(() => null)) as
    | ({ error?: string } & Partial<CouponValidation>)
    | null

  if (!response.ok || !body?.code) {
    throw new Error(body?.error ?? INVALID_COUPON[locale])
  }

  return {
    code: body.code,
    type: body.type as CouponType,
    percentOff: body.percentOff ?? null,
    amountOffCents: body.amountOffCents ?? null,
    description: body.description ?? null,
    summary: body.summary ?? '',
  }
}

export const INVALID_COUPON: Record<Locale, string> = {
  en: 'That coupon code is not valid.',
  nl: 'Die kortingscode is niet geldig.',
  de: 'Dieser Gutscheincode ist nicht gültig.',
}
