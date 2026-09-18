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
  notes: string
}

export type OrderPayload = {
  details: CheckoutDetails
  items: CartItem[]
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
      items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
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
      },
      notes: details.notes,
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
