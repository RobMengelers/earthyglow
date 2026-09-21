import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../CartContext'
import { useCart } from '../useCart'
import { CartLine } from './CartLine'

export function CartDrawer() {
  const {
    items,
    itemCount,
    subtotalCents,
    isDrawerOpen,
    closeDrawer,
  } = useCart()

  useEffect(() => {
    if (!isDrawerOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDrawer()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [isDrawerOpen, closeDrawer])

  return (
    <div
      className={isDrawerOpen ? 'cart-overlay is-open' : 'cart-overlay'}
      aria-hidden={!isDrawerOpen}
    >
      <button
        type="button"
        className="cart-overlay-backdrop"
        aria-label="Close cart"
        tabIndex={isDrawerOpen ? 0 : -1}
        onClick={closeDrawer}
      />
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping cart">
        <header className="cart-drawer-head">
          <h2>
            Your cart
            {itemCount > 0 && <span className="cart-drawer-count">{itemCount}</span>}
          </h2>
          <button
            type="button"
            className="cart-close"
            aria-label="Close cart"
            tabIndex={isDrawerOpen ? 0 : -1}
            onClick={closeDrawer}
          >
            &times;
          </button>
        </header>

        {items.length === 0 ? (
          <div className="cart-empty">
            <p className="cart-empty-title">Your cart is empty</p>
            <p>Fill it with something warm and hand-poured.</p>
            <Link
              to="/shop"
              className="btn btn-primary"
              tabIndex={isDrawerOpen ? 0 : -1}
              onClick={closeDrawer}
            >
              Shop the collection
            </Link>
          </div>
        ) : (
          <>
            <ul className="cart-lines">
              {items.map((item) => (
                <CartLine
                  key={item.id}
                  item={item}
                  compact
                  tabIndex={isDrawerOpen ? 0 : -1}
                  onNavigate={closeDrawer}
                />
              ))}
            </ul>

            <footer className="cart-drawer-foot">
              <div className="cart-totals-row">
                <span>Subtotal</span>
                <span>{formatPrice(subtotalCents)}</span>
              </div>
              <div className="cart-totals-row">
                <span>Shipping</span>
                <span className="cart-totals-muted">At checkout</span>
              </div>
              <div className="cart-totals-row cart-totals-total">
                <span>Total</span>
                <span className="cart-totals-muted">At checkout</span>
              </div>
              <Link
                to="/checkout"
                className="btn btn-primary cart-checkout-btn"
                tabIndex={isDrawerOpen ? 0 : -1}
                onClick={closeDrawer}
              >
                Checkout
              </Link>
              <Link
                to="/cart"
                className="cart-view-link"
                tabIndex={isDrawerOpen ? 0 : -1}
                onClick={closeDrawer}
              >
                View cart
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}
