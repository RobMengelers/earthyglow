import type { CouponType } from './CartContext'
import { API_URL } from './catalog'

export type CouponValidation = {
  code: string
  type: CouponType
  percentOff?: number | null
  description?: string | null
  summary: string
}

// Asks the API whether a code is worth anything. The API is the only one
// that knows about expired, used-up and inactive codes, so the storefront
// never decides on its own.
export async function validateCoupon(code: string): Promise<CouponValidation> {
  const response = await fetch(`${API_URL}/api/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })

  const body = (await response.json().catch(() => null)) as
    | ({ error?: string } & Partial<CouponValidation>)
    | null

  if (!response.ok || !body?.code) {
    throw new Error(body?.error ?? 'That coupon code is not valid.')
  }

  return {
    code: body.code,
    type: body.type as CouponType,
    percentOff: body.percentOff ?? null,
    description: body.description ?? null,
    summary: body.summary ?? '',
  }
}
