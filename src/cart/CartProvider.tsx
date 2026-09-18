import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Product } from '../data/products'
import { fetchCatalog } from './catalog'
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
    typeof item.name === 'string' &&
    typeof item.priceCents === 'number' &&
    typeof item.image === 'string' &&
    typeof item.collectionTitle === 'string' &&
    typeof item.quantity === 'number' &&
    item.quantity > 0
  )
}

function loadItems(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isCartItem)
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadItems)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Storage can be unavailable (private mode); the cart still works in memory.
    }
  }, [items])

  // Reconcile line-item prices against the server catalog. Prices may have
  // changed since the item was added (or the client was tampered with); the
  // server is authoritative and its values always win here.
  useEffect(() => {
    let cancelled = false

    void fetchCatalog().then((catalog) => {
      if (cancelled) return
      const byId = new Map(catalog.map((product) => [product.id, product]))
      setItems((current) => {
        let changed = false
        const next = current.map((item) => {
          const product = byId.get(item.id)
          if (
            product &&
            (product.priceCents !== item.priceCents ||
              product.name !== item.name)
          ) {
            changed = true
            return {
              ...item,
              name: product.name,
              priceCents: product.priceCents,
            }
          }
          return item
        })
        return changed ? next : current
      })
    })

    return () => {
      cancelled = true
    }
  }, [])

  const openDrawer = useCallback(() => setIsDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), [])

  const addItem = useCallback(
    (product: Product, collectionTitle: string, quantity = 1) => {
      setItems((current) => {
        const existing = current.find((item) => item.id === product.id)
        if (existing) {
          return current.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          )
        }
        return [
          ...current,
          {
            id: product.id,
            name: product.name,
            priceCents: product.priceCents,
            image: product.image,
            href: product.href,
            collectionTitle,
            quantity,
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
