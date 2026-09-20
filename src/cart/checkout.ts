import type { CartItem } from './CartContext'
import { API_URL } from './catalog'

export type CheckoutDetails = {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  country: string
  countryCode: string
  notes: string
}

export type OrderPayload = {
  details: CheckoutDetails
  items: CartItem[]
  paymentMethod?: string
}

export type PaymentMethodOption = {
  id: string
  name: string
  icon: string | null
}

export type OrderResult = {
  orderNumber: string
  status: string
  subtotalCents?: number
  shippingCents?: number
  totalCents?: number
  checkoutUrl?: string | null
}

const ORDERS_KEY = 'earthyglow-orders-v1'

async function postToApi(payload: OrderPayload): Promise<OrderResult> {
  const { details, items } = payload
  const response = await fetch(`${API_URL}/api/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // Only ids and quantities are sent; the API recomputes all prices.
      items: items.map((item) => ({
        id: item.productId,
        quantity: item.quantity,
        variantId: item.variantId,
        variantLabel: item.variantLabel,
      })),
      customer: {
        firstName: details.firstName,
        lastName: details.lastName,
        email: details.email,
        phone: details.phone,
      },
      shipping: {
        address: details.address,
        postalCode: details.postalCode,
        city: details.city,
        country: details.country,
        countryCode: details.countryCode,
      },
      notes: details.notes,
      paymentMethod: payload.paymentMethod,
    }),
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string
    } | null
    throw new Error(body?.error ?? 'We could not start your payment.')
  }

  return (await response.json()) as OrderResult
}

// Local-only fallback so the flow can still be demoed when the API is not
// running during development. Real payments are never handled here.
async function localMock(payload: OrderPayload): Promise<OrderResult> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const orderNumber = `EG-${Date.now().toString(36).toUpperCase().slice(-6)}`

  try {
    const raw = localStorage.getItem(ORDERS_KEY)
    const existing: unknown = raw ? JSON.parse(raw) : []
    const orders = Array.isArray(existing) ? existing : []
    localStorage.setItem(
      ORDERS_KEY,
      JSON.stringify([
        ...orders,
        {
          ...payload,
          orderNumber,
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
      ]),
    )
  } catch {
    // Ignore storage errors; the confirmation is still shown.
  }

  return { orderNumber, status: 'pending' }
}

export const FALLBACK_PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'ideal',
    name: 'iDEAL',
    icon: 'https://www.mollie.com/external/icons/payment-methods/ideal.svg',
  },
  {
    id: 'creditcard',
    name: 'Credit card',
    icon: 'https://www.mollie.com/external/icons/payment-methods/creditcard.svg',
  },
]

export async function fetchPaymentMethods(): Promise<PaymentMethodOption[]> {
  try {
    const response = await fetch(`${API_URL}/api/payment-methods`)
    if (!response.ok) return FALLBACK_PAYMENT_METHODS
    const data = (await response.json()) as { methods?: PaymentMethodOption[] }
    return Array.isArray(data.methods) && data.methods.length > 0
      ? data.methods
      : FALLBACK_PAYMENT_METHODS
  } catch {
    return FALLBACK_PAYMENT_METHODS
  }
}

export async function submitOrder(payload: OrderPayload): Promise<OrderResult> {
  try {
    return await postToApi(payload)
  } catch (error) {
    // A network failure in dev means the API is not running; fall back to the
    // local mock. Validation errors from a running API always surface.
    if (import.meta.env.DEV && error instanceof TypeError) {
      return localMock(payload)
    }
    throw error
  }
}
