import { API_URL } from '../cart/catalog'

const ADMIN_TOKEN_KEY = 'earthyglow-admin-token'

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

type AdminCustomer = {
  firstName: string
  lastName: string
  // Null for in-person sales recorded without contact details.
  email: string | null
  phone: string | null
}

type AdminOrderItem = {
  name: string
  variantId?: string | null
  variantLabel?: string | null
  colorId?: string | null
  colorLabel?: string | null
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
  /** Opaque id to pass back as `cursor` for the next page, or null at the end. */
  nextCursor: string | null
  /** How many orders match the current filters (not just this page). */
  total: number
  /** Paid value of everything matching the current filters. */
  paidTotalCents: number
}

export type AdminOrdersQuery = {
  status?: string
  /** Free text over order number, customer name/email and city. */
  q?: string
  /** Restrict to paid orders still awaiting fulfilment. */
  fulfilmentOpen?: boolean
  /** Cursor from a previous response's `nextCursor`. */
  cursor?: string | null
  limit?: number
}

export type AdminOverview = {
  stats: Record<string, number>
  /** Paid order value in the last 30 days. */
  revenueCents: number
  /** The 30 days before that, for the trend arrow. */
  previousRevenueCents: number
  /** Purchase (materials) cost in the last 30 days, VAT-inclusive. */
  expensesCents: number
  /** The 30 days before that, for the trend arrow. */
  previousExpensesCents: number
  /** revenueCents − expensesCents over the last 30 days. */
  profitCents: number
  /** previousRevenueCents − previousExpensesCents. */
  previousProfitCents: number
  /** Paid orders that were never marked processed: the shop's to-do list. */
  unfulfilledCount: number
  customerCount: number
  recentOrders: AdminOrder[]
}

type AdminCatalogVariant = {
  id: string
  label: string
  priceCents?: number
}

type AdminCatalogColor = {
  id: string
  label: string
}

export type AdminCatalogProduct = {
  id: string
  name: string
  priceCents: number
  variants: AdminCatalogVariant[]
  // Absent on an older API that does not know about colours yet.
  colors?: AdminCatalogColor[]
}

// Prices shown in the manual order form come from the public catalog endpoint;
// the server re-prices every line again on save, so this is display only.
export async function fetchAdminCatalog(): Promise<AdminCatalogProduct[]> {
  const response = await fetch(`${API_URL}/api/catalog`)
  if (!response.ok) throw new Error('Could not load products')
  const body = (await response.json()) as { products: AdminCatalogProduct[] }
  return body.products
}

type ManualOrderItemInput = {
  productId: string
  variantId?: string
  // The colour that was poured, for products that come in colours.
  colorId?: string
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
  options: AdminOrdersQuery = {},
): Promise<AdminOrdersResponse> {
  const params = new URLSearchParams()
  if (options.status && (ORDER_STATUSES as readonly string[]).includes(options.status)) {
    params.set('status', options.status)
  }
  if (options.q) params.set('q', options.q)
  if (options.fulfilmentOpen) params.set('fulfilment', 'open')
  if (options.cursor) params.set('cursor', options.cursor)
  if (options.limit) params.set('limit', String(options.limit))
  const query = params.toString()

  const response = await fetch(`${API_URL}/api/admin/orders${query ? `?${query}` : ''}`, {
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
export type OverviewPeriod = '30d' | 'quarter' | 'year'

export async function fetchAdminOverview(
  token: string,
  period: OverviewPeriod = '30d',
): Promise<AdminOverview> {
  const response = await fetch(`${API_URL}/api/admin/overview?period=${period}`, {
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

export type AdminPurchase = {
  id: string
  dateBought: string
  description: string
  /** VAT-inclusive receipt total, the number the admin typed. */
  costCents: number
  /** Derived: what the purchase cost excl. 21% VAT. */
  netCents: number
  /** Derived: the 21% VAT taken out of costCents. */
  vatCents: number
  hasDocument: boolean
  documentName: string | null
  createdAt: string
}

export type AdminPurchasesResponse = {
  purchases: AdminPurchase[]
}

export async function fetchAdminPurchases(
  token: string,
): Promise<AdminPurchasesResponse> {
  const response = await fetch(`${API_URL}/api/admin/purchases`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    if (response.status === 401) throw new Error('Session expired')
    throw new Error(`Failed to load purchases (${response.status})`)
  }
  return (await response.json()) as AdminPurchasesResponse
}

export type AdminPurchaseInput = {
  /** Day it was bought, YYYY-MM-DD. */
  date: string
  description: string
  /** The total the receipt shows, exactly as typed (e.g. "24,50"). */
  cost: string
  /** Optional receipt/delivery note. */
  document?: File
  /** Drop the currently attached document. Ignored when a new file is sent. */
  removeDocument?: boolean
}

async function purchasePayload(input: AdminPurchaseInput): Promise<Record<string, unknown>> {
  const payload: Record<string, unknown> = {
    date: input.date,
    description: input.description,
    cost: input.cost,
  }
  if (input.document) {
    payload.document = {
      name: input.document.name,
      type: input.document.type || 'application/octet-stream',
      data: await fileToBase64(input.document),
    }
  } else if (input.removeDocument) {
    payload.removeDocument = true
  }
  return payload
}

export async function createAdminPurchase(
  token: string,
  input: AdminPurchaseInput,
): Promise<AdminPurchase> {
  const response = await fetch(`${API_URL}/api/admin/purchases`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(await purchasePayload(input)),
  })
  const body = (await response.json().catch(() => null)) as
    | { purchase?: AdminPurchase; error?: string }
    | null
  if (!response.ok) {
    throw new Error(body?.error ?? 'Could not save the purchase')
  }
  return body?.purchase as AdminPurchase
}

export async function updateAdminPurchase(
  token: string,
  id: string,
  input: AdminPurchaseInput,
): Promise<AdminPurchase> {
  const response = await fetch(`${API_URL}/api/admin/purchases/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(await purchasePayload(input)),
  })
  const body = (await response.json().catch(() => null)) as
    | { purchase?: AdminPurchase; error?: string }
    | null
  if (!response.ok) {
    throw new Error(body?.error ?? 'Could not save the purchase')
  }
  return body?.purchase as AdminPurchase
}

export async function deleteAdminPurchase(
  token: string,
  id: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/api/admin/purchases/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    throw new Error(
      (await response.json().catch(() => null) as { error?: string } | null)
        ?.error ?? 'Could not delete the purchase',
    )
  }
}

// Fetches the attached receipt/document and hands it to the browser as a file.
export async function downloadAdminPurchaseDocument(
  token: string,
  purchase: AdminPurchase,
): Promise<void> {
  const response = await fetch(
    `${API_URL}/api/admin/purchases/${purchase.id}/document`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  if (!response.ok) {
    throw new Error(
      (await response.json().catch(() => null) as { error?: string } | null)
        ?.error ?? 'Could not download the document',
    )
  }

  const url = URL.createObjectURL(await response.blob())
  const link = document.createElement('a')
  link.href = url
  link.download = purchase.documentName ?? 'document'
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export type AdminMaterial = {
  id: string
  name: string
  /** The unit quantities are entered in: "kg" for wax, "g" for scent. */
  unit: string
  /** What is still on hand, in `unit`. */
  quantity: number
  createdAt: string
}

export type AdminRecipeIngredient = {
  materialId: string
  /** How much one product uses, in the material's unit. */
  amount: number
  material: { id: string; name: string; unit: string; quantity: number }
  /** Derived server-side: floor(material.quantity / amount). */
  possibleUnits: number
}

export type AdminRecipeField = {
  label: string
  value: string
}

export type AdminRecipe = {
  id: string
  product: { id: string; name: string }
  ingredients: AdminRecipeIngredient[]
  fields: AdminRecipeField[]
  /** How many of the product the leftover stock can still make (tightest ingredient). */
  possibleUnits: number
}

export type AdminMaterialsResponse = {
  materials: AdminMaterial[]
  recipes: AdminRecipe[]
}

export async function fetchAdminMaterials(
  token: string,
): Promise<AdminMaterialsResponse> {
  const response = await fetch(`${API_URL}/api/admin/materials`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    if (response.status === 401) throw new Error('Session expired')
    throw new Error(`Failed to load materials (${response.status})`)
  }
  return (await response.json()) as AdminMaterialsResponse
}

export type AdminMaterialInput = {
  name: string
  unit: string
  /** The amount on hand right now, exactly as typed (e.g. "2,5"). */
  quantity: string
}

export async function createAdminMaterial(
  token: string,
  input: AdminMaterialInput,
): Promise<AdminMaterial> {
  const response = await fetch(`${API_URL}/api/admin/materials`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const body = (await response.json().catch(() => null)) as
    | { material?: AdminMaterial; error?: string }
    | null
  if (!response.ok) throw new Error(body?.error ?? 'Could not save the material')
  return body?.material as AdminMaterial
}

/** Edits a material's name, unit and amount on hand. */
export async function updateAdminMaterial(
  token: string,
  id: string,
  input: AdminMaterialInput,
): Promise<AdminMaterial> {
  const response = await fetch(`${API_URL}/api/admin/materials/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const body = (await response.json().catch(() => null)) as
    | { material?: AdminMaterial; error?: string }
    | null
  if (!response.ok) throw new Error(body?.error ?? 'Could not save the material')
  return body?.material as AdminMaterial
}

/** Adds to the stock of a material; a negative amount corrects it down. */
export async function addAdminMaterialStock(
  token: string,
  id: string,
  amount: string,
): Promise<AdminMaterial> {
  const response = await fetch(`${API_URL}/api/admin/materials/${id}/stock`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
  })
  const body = (await response.json().catch(() => null)) as
    | { material?: AdminMaterial; error?: string }
    | null
  if (!response.ok) throw new Error(body?.error ?? 'Could not update the stock')
  return body?.material as AdminMaterial
}

export async function deleteAdminMaterial(token: string, id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/admin/materials/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    throw new Error(
      (await response.json().catch(() => null) as { error?: string } | null)
        ?.error ?? 'Could not delete the material',
    )
  }
}

export type AdminRecipeInput = {
  productId: string
  ingredients: { materialId: string; amount: string }[]
  fields: { label: string; value: string }[]
}

export async function createAdminRecipe(
  token: string,
  input: AdminRecipeInput,
): Promise<AdminRecipe> {
  const response = await fetch(`${API_URL}/api/admin/recipes`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const body = (await response.json().catch(() => null)) as
    | { recipe?: AdminRecipe; error?: string }
    | null
  if (!response.ok) throw new Error(body?.error ?? 'Could not save the recipe')
  return body?.recipe as AdminRecipe
}

/** Replaces a recipe's product, ingredients and fields in one save. */
export async function updateAdminRecipe(
  token: string,
  id: string,
  input: AdminRecipeInput,
): Promise<AdminRecipe> {
  const response = await fetch(`${API_URL}/api/admin/recipes/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const body = (await response.json().catch(() => null)) as
    | { recipe?: AdminRecipe; error?: string }
    | null
  if (!response.ok) throw new Error(body?.error ?? 'Could not save the recipe')
  return body?.recipe as AdminRecipe
}

export async function deleteAdminRecipe(token: string, id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/admin/recipes/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    throw new Error(
      (await response.json().catch(() => null) as { error?: string } | null)
        ?.error ?? 'Could not delete the recipe',
    )
  }
}

/** "2,5" — the nl-NL way the shop writes amounts, used across the admin. */
export function formatAmount(value: number): string {
  return new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 3 }).format(value)
}

// The 21% VAT split the server derives for every purchase, mirrored here so
// the form can preview it live before anything is saved.
export function splitIncludedVat(costCents: number): {
  netCents: number
  vatCents: number
} {
  const netCents = Math.round((costCents * 100) / 121)
  return { netCents, vatCents: costCents - netCents }
}

export function eurosToCents(value: string): number | null {
  const normalized = value.trim().replace(',', '.')
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(normalized)) return null
  const cents = Math.round(Number.parseFloat(normalized) * 100)
  return Number.isFinite(cents) && cents > 0 ? cents : null
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result ?? '')
      resolve(result.slice(result.indexOf(',') + 1))
    }
    reader.onerror = () => reject(reader.error ?? new Error('Could not read the file'))
    reader.readAsDataURL(file)
  })
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

// Calendar date only, for purchases and other day-accurate records.
export function formatDate(value: string | null): string {
  if (!value) return '—'
  return new Intl.DateTimeFormat('nl-NL', { dateStyle: 'medium' }).format(
    new Date(value),
  )
}

function formatDateOrDash(value: string | null): string {
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

// ---- Coupon codes ----

export type AdminCouponType = 'free_shipping' | 'percent' | 'fixed_amount'

export type AdminCoupon = {
  id: string
  code: string
  description: string | null
  type: AdminCouponType
  percentOff: number | null
  amountOffCents: number | null
  /** How often the code may be used. Null means as often as the customer likes. */
  maxUses: number | null
  /** How many orders used the code. */
  redemptions: number
  startsAt: string | null
  expiresAt: string | null
  active: boolean
  createdAt: string
}

export type AdminCouponsResponse = {
  coupons: AdminCoupon[]
}

export async function fetchAdminCoupons(token: string): Promise<AdminCouponsResponse> {
  const response = await fetch(`${API_URL}/api/admin/coupons`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    if (response.status === 401) throw new Error('Session expired')
    throw new Error(`Failed to load coupons (${response.status})`)
  }
  return (await response.json()) as AdminCouponsResponse
}

export type AdminCouponInput = {
  code: string
  description?: string
  type: AdminCouponType
  /** For a percentage code: how many percent to take off. */
  percentOff?: number
  /** For a fixed amount code: the amount in cents. */
  amountOffCents?: number
  /** How often the code may be used. Leave empty for a permanent code. */
  maxUses?: number
  /** The day the code stops working (YYYY-MM-DD). */
  expiresAt?: string
}

export async function createAdminCoupon(
  token: string,
  input: AdminCouponInput,
): Promise<AdminCoupon> {
  const response = await fetch(`${API_URL}/api/admin/coupons`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const body = (await response.json().catch(() => null)) as
    | { coupon?: AdminCoupon; error?: string }
    | null
  if (!response.ok || !body?.coupon) {
    throw new Error(body?.error ?? 'Could not save the coupon')
  }
  return body.coupon
}

// Switches a code on or off, which retires a code without touching the orders
// that used it.
export async function setAdminCouponActive(
  token: string,
  id: string,
  active: boolean,
): Promise<AdminCoupon> {
  const response = await fetch(`${API_URL}/api/admin/coupons/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ active }),
  })
  const body = (await response.json().catch(() => null)) as
    | { coupon?: AdminCoupon; error?: string }
    | null
  if (!response.ok || !body?.coupon) {
    throw new Error(body?.error ?? 'Could not update the coupon')
  }
  return body.coupon
}
