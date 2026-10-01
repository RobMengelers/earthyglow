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
  // Null for in-person sales recorded without contact details.
  email: string | null
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
  // True when the exact PDF that was emailed is archived on the order. Orders
  // invoiced before archiving existed are false and cannot be downloaded.
  hasInvoicePdf: boolean
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

export type AdminOverview = {
  stats: Record<string, number>
  /** Paid order value in the last 30 days. */
  revenueCents: number
  /** The 30 days before that, for the trend arrow. */
  previousRevenueCents: number
  /** Paid orders that were never marked processed: the shop's to-do list. */
  unfulfilledCount: number
  customerCount: number
  recentOrders: AdminOrder[]
}

export type AdminCatalogVariant = {
  id: string
  label: string
  priceCents?: number
}

export type AdminCatalogProduct = {
  id: string
  name: string
  priceCents: number
  variants: AdminCatalogVariant[]
}

// Prices shown in the manual order form come from the public catalog endpoint;
// the server re-prices every line again on save, so this is display only.
export async function fetchAdminCatalog(): Promise<AdminCatalogProduct[]> {
  const response = await fetch(`${API_URL}/api/catalog`)
  if (!response.ok) throw new Error('Could not load products')
  const body = (await response.json()) as { products: AdminCatalogProduct[] }
  return body.products
}

export type ManualOrderItemInput = {
  productId: string
  variantId?: string
  // The admin may override the catalog price for a market or trade sale.
  unitPriceCents: number
  quantity: number
}

export type ManualOrderInput = {
  customer: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
  }
  shipping: {
    address?: string
    postalCode?: string
    city?: string
    country?: string
  }
  items: ManualOrderItemInput[]
  notes?: string
  sendInvoiceEmail?: boolean
}

export type CreatedOrderResult = { order: AdminOrder; hasInvoicePdf: boolean }

export async function createManualOrder(
  token: string,
  input: ManualOrderInput,
): Promise<CreatedOrderResult> {
  const response = await fetch(`${API_URL}/api/admin/orders`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const body = (await response.json().catch(() => null)) as
    | (CreatedOrderResult & { error?: string })
    | null
  if (!response.ok) {
    const error = new Error(body?.error ?? 'Could not save the order')
    // A 502 means the order itself was saved and only the email bounced, so the
    // caller still needs the order back to add it to the table.
    throw Object.assign(error, { order: body?.order, hasInvoicePdf: body?.hasInvoicePdf })
  }
  return body as CreatedOrderResult
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

// Everything the dashboard needs in one round trip. The layout keeps the result
// in context so the nav badge and the overview page never fetch it twice.
export async function fetchAdminOverview(token: string): Promise<AdminOverview> {
  const response = await fetch(`${API_URL}/api/admin/overview`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    if (response.status === 401) throw new Error('Session expired')
    throw new Error(`Failed to load the overview (${response.status})`)
  }
  return (await response.json()) as AdminOverview
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

// Fetches the archived invoice PDF and hands it to the browser as a file, so the
// admin can keep a verbatim copy without going through the customer inbox.
export async function downloadAdminInvoice(
  token: string,
  orderId: string,
  orderNumber: string,
): Promise<void> {
  const response = await fetch(
    `${API_URL}/api/admin/orders/${orderId}/invoice`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  if (!response.ok) {
    throw new Error((await response.json().catch(() => null) as { error?: string } | null)?.error ?? 'Could not download invoice')
  }

  const url = URL.createObjectURL(await response.blob())
  const link = document.createElement('a')
  link.href = url
  link.download = `invoice-${orderNumber}.pdf`
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
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

// For fields where "never" is normal news rather than a problem, a dash reads
// calmer than "Not available".
export function formatDateTimeOrDash(value: string | null): string {
  return value ? formatDateTime(value) : '—'
}

export function formatDateOrDash(value: string | null): string {
  if (!value) return '—'
  return new Intl.DateTimeFormat('nl-NL', { dateStyle: 'medium' }).format(
    new Date(value),
  )
}

// "4 min ago" is what matters when scanning recent activity; the exact moment
// is one hover (the title) away.
export function formatRelativeTime(value: string): string {
  const elapsed = Date.now() - new Date(value).getTime()
  const minutes = Math.round(elapsed / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days} d ago`
  return formatDateOrDash(value)
}

// Optional in the data but never actually blank once set.
export function displayText(value: string | null | undefined): string {
  const trimmed = value?.trim()
  return trimmed && trimmed !== '-' ? trimmed : '—'
}
