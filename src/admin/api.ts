import { API_URL } from '../cart/catalog'

export const ADMIN_TOKEN_KEY = 'earthyglow-admin-token'

export type AdminLoginResult = {
  token: string
  expiresIn: number
}

export async function adminLogin(
  username: string,
  password: string,
): Promise<AdminLoginResult> {
  const response = await fetch(`${API_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  if (!response.ok) {
    if (response.status === 401) throw new Error('Invalid credentials')
    if (response.status === 404) {
      throw new Error('Admin access is not configured on the server')
    }
    throw new Error(`Login failed (${response.status})`)
  }

  return (await response.json()) as AdminLoginResult
}

export async function checkAdminSession(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/admin/session`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.ok
  } catch {
    return false
  }
}

export type AdminCustomer = {
  firstName: string
  lastName: string
  email: string
  phone: string | null
}

export type AdminOrderItem = {
  name: string
  variantId?: string | null
  variantLabel?: string | null
  quantity: number
  unitPriceCents: number
  lineTotalCents: number
}

export type AdminOrder = {
  id: string
  orderNumber: string
  status: string
  subtotalCents: number
  shippingCents: number
  totalCents: number
  currency: string
  paymentMethod: string | null
  address: string
  postalCode: string
  city: string
  country: string
  notes: string | null
  paidAt: string | null
  invoiceSentAt: string | null
  fulfillmentStatus: 'open' | 'processed'
  carrier: string | null
  trackingCode: string | null
  fulfilledAt: string | null
  createdAt: string
  customer: AdminCustomer
  items: AdminOrderItem[]
}

export type AdminOrdersResponse = {
  stats: Record<string, number>
  orders: AdminOrder[]
}

const ORDER_STATUSES = [
  'pending',
  'paid',
  'failed',
  'expired',
  'canceled',
  'refunded',
] as const

export const ADMIN_STATUSES = ORDER_STATUSES as readonly string[]

export async function fetchAdminOrders(
  token: string,
  status?: string,
): Promise<AdminOrdersResponse> {
  const query =
    status && (ORDER_STATUSES as readonly string[]).includes(status)
      ? `?status=${encodeURIComponent(status)}`
      : ''
  const response = await fetch(`${API_URL}/api/admin/orders${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    if (response.status === 401) throw new Error('Session expired')
    throw new Error(`Failed to load orders (${response.status})`)
  }
  return (await response.json()) as AdminOrdersResponse
}

export async function updateFulfillment(token: string, orderId: string, input: { status: 'open' | 'processed'; carrier?: string; trackingCode?: string }): Promise<AdminOrder> {
  const response = await fetch(`${API_URL}/api/admin/orders/${orderId}/fulfillment`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(input) })
  if (!response.ok) throw new Error((await response.json().catch(() => null) as { error?: string } | null)?.error ?? 'Could not update fulfillment')
  return (await response.json()) as AdminOrder
}

export async function refundAdminOrder(token: string, orderId: string): Promise<AdminOrder> {
  const response = await fetch(`${API_URL}/api/admin/orders/${orderId}/refund`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
  if (!response.ok) throw new Error((await response.json().catch(() => null) as { error?: string } | null)?.error ?? 'Could not refund order')
  return (await response.json()) as AdminOrder
}

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY)
}

export function setAdminToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token)
}

export function clearAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY)
}

export function formatEuros(cents: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)
}

export function formatDateTime(value: string | null): string {
  if (!value) return 'Not available'
  return new Intl.DateTimeFormat('nl-NL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
