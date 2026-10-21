import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getProduct, type Product, type ProductColor, type ProductVariant } from '../data/products'
import { fetchCatalog, reconcileCatalogItems } from './catalog'
import { validateCoupon } from './coupons'
import {
  CartContext,
  calcTotals,
  type AppliedCoupon,
  type CartContextValue,
  type CartItem,
} from './CartContext'

const STORAGE_KEY = 'earthyglow-cart-v1'
const COUPON_STORAGE_KEY = 'earthyglow-coupon-v1'

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Partial<CartItem>
  return (
    typeof item.id === 'string' &&
    typeof item.productId === 'string' &&
    typeof item.name === 'string' &&
    typeof item.priceCents === 'number' &&
    // Older carts predate the image field (or stored a since-renamed path);
    // missing images are healed from the catalog in loadItems below.
    (item.image === undefined || typeof item.image === 'string') &&
    typeof item.collectionTitle === 'string' &&
    typeof item.quantity === 'number' &&
    item.quantity > 0 &&
    (item.colorId === undefined || typeof item.colorId === 'string') &&
    (item.colorLabel === undefined || typeof item.colorLabel === 'string')
  )
}

// The image is a snapshot taken when the line was added. Re-resolve it from
// the catalog on every load so renamed or replaced photography never leaves
// a stale path behind (a 404 renders as an empty thumbnail).
function withCatalogImage(item: CartItem): CartItem {
  const stored = typeof item.image === 'string' ? item.image : ''
  const image = getProduct(item.productId)?.image ?? stored
  return image === item.image ? item : { ...item, image }
}

function loadItems(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isCartItem).map(withCatalogImage)
  } catch {
    return []
  }
}

// The coupon is remembered so a customer who typed a code does not have to
// type it again after a reload. It is only a convenience: the checkout sends
// the code along and the server checks it again.
function loadCoupon(): AppliedCoupon | null {
  try {
    const raw = localStorage.getItem(COUPON_STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return null
    const coupon = parsed as Partial<AppliedCoupon>
    if (typeof coupon.code !== 'string' || typeof coupon.type !== 'string') {
      return null
    }
    return {
      code: coupon.code,
      type: coupon.type as AppliedCoupon['type'],
      percentOff: coupon.percentOff ?? null,
      amountOffCents: coupon.amountOffCents ?? null,
      summary: coupon.summary ?? '',
      description: coupon.description ?? null,
    }
  } catch {
    return null
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  // Cart contents live in localStorage, which does not exist on the server.
  // Start empty on both server and client, then hydrate after mount so the
  // server-rendered markup matches the first client render.
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [couponPending, setCouponPending] = useState(false)

  useEffect(() => {
    // Storage can only be read after mount: the server render and the first
    // client render both start empty so hydration matches.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- post-mount hydration from localStorage
    setItems(loadItems())
    setCoupon(loadCoupon())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Storage can be unavailable (private mode); the cart still works in memory.
    }
  }, [items, hydrated])

  useEffect(() => {
    if (!hydrated) return
    try {
      if (coupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon))
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY)
      }
    } catch {
      // Storage can be unavailable (private mode); the coupon still works.
    }
  }, [coupon, hydrated])

  // Reconcile line-item prices against the server catalog. Prices may have
  // changed since the item was added (or the client was tampered with); the
  // server is authoritative and its values always win here.
  useEffect(() => {
    let cancelled = false

    void fetchCatalog().then((catalog) => {
      if (cancelled) return
      setItems((current) => reconcileCatalogItems(current, catalog))
    })

    return () => {
      cancelled = true
    }
  }, [])

  const openDrawer = useCallback(() => setIsDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), [])

  const addItem = useCallback(
    (
      product: Product,
      collectionTitle: string,
      quantity = 1,
      variant?: ProductVariant,
      color?: ProductColor,
    ) => {
      // Every combination of options is its own line: a small blush column is
      // not the same candle as a small natural column.
      const lineId = `${product.id}:${variant?.id ?? 'default'}:${color?.id ?? 'default'}`
      setItems((current) => {
        const existing = current.find((item) => item.id === lineId)
        if (existing) {
          return current.map((item) =>
              item.id === lineId
              ? { ...item, quantity: item.quantity + quantity, image: product.image }
              : item,
          )
        }
        return [
          ...current,
          {
            id: lineId,
            productId: product.id,
            name: product.name,
            priceCents: variant?.priceCents ?? product.priceCents,
            image: product.image,
            collectionTitle,
            quantity,
            variantId: variant?.id,
            variantLabel: variant?.label,
            colorId: color?.id,
            colorLabel: color?.label,
          },
        ]
      })
      setIsDrawerOpen(true)
    },
    [],
  )

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, Math.floor(quantity)) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  // Applying a code asks the API first: only the API knows whether a code is
  // expired, used up or not active at all.
  const applyCoupon = useCallback(async (code: string) => {
    setCouponPending(true)
    setCouponError(null)
    try {
      const validated = await validateCoupon(code)
      setCoupon(validated)
      return true
    } catch (error) {
      setCoupon(null)
      setCouponError(
        error instanceof Error
          ? error.message
          : 'That coupon code is not valid.',
      )
      return false
    } finally {
      setCouponPending(false)
    }
  }, [])

  const removeCoupon = useCallback(() => {
    setCoupon(null)
    setCouponError(null)
  }, [])

  const value = useMemo<CartContextValue>(() => {
    return {
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      ...calcTotals(items, undefined, coupon),
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      coupon,
      couponError,
      couponPending,
      applyCoupon,
      removeCoupon,
    }
  }, [
    items,
    coupon,
    couponError,
    couponPending,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
  ])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
