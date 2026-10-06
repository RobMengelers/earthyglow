import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getProduct, type Product, type ProductVariant } from '../data/products'
import { fetchCatalog, reconcileCatalogItems } from './catalog'
import {
  CartContext,
  calcTotals,
  type CartContextValue,
  type CartItem,
} from './CartContext'

const STORAGE_KEY = 'earthyglow-cart-v1'

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
    item.quantity > 0
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

export function CartProvider({ children }: { children: ReactNode }) {
  // Cart contents live in localStorage, which does not exist on the server.
  // Start empty on both server and client, then hydrate after mount so the
  // server-rendered markup matches the first client render.
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    // Storage can only be read after mount: the server render and the first
    // client render both start empty so hydration matches.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- post-mount hydration from localStorage
    setItems(loadItems())
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
    (product: Product, collectionTitle: string, quantity = 1, variant?: ProductVariant) => {
      const lineId = `${product.id}:${variant?.id ?? 'default'}`
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
          },
        ]
      })
      if (items.length === 0) setIsDrawerOpen(true)
    },
    [items.length],
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

  const value = useMemo<CartContextValue>(() => {
    return {
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      ...calcTotals(items),
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }
  }, [
    items,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  ])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
