import { useEffect } from 'react'
import { lockBodyScroll } from '../../lib/scrollLock'
import { useCart } from '../useCart'
import { couponSummary } from '../coupons'
import { Link, useCopy, useFormatPrice, useLocale } from '../../i18n'
import { cartCopy } from '../cart-copy'
import { CartLine } from './CartLine'

export function CartDrawer() {
  const copy = useCopy(cartCopy)
  const locale = useLocale()
  const formatPrice = useFormatPrice()
  const {
    items,
    itemCount,
    subtotalCents,
    discountCents,
    coupon,
    isDrawerOpen,
    closeDrawer,
  } = useCart()

  useEffect(() => {
    if (!isDrawerOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDrawer()
    }
    document.addEventListener('keydown', onKeyDown)
    const unlockBodyScroll = lockBodyScroll()
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      unlockBodyScroll()
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
        aria-label={copy.close}
        tabIndex={isDrawerOpen ? 0 : -1}
        onClick={closeDrawer}
      />
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label={copy.dialog}>
        <header className="cart-drawer-head">
          <h2>
            {copy.title}
            {itemCount > 0 && <span className="cart-drawer-count">{itemCount}</span>}
          </h2>
          <button
            type="button"
            className="cart-close"
            aria-label={copy.close}
            tabIndex={isDrawerOpen ? 0 : -1}
            onClick={closeDrawer}
          >
            &times;
          </button>
        </header>

        {items.length === 0 ? (
          <div className="cart-empty">
            <p className="cart-empty-title">{copy.emptyTitle}</p>
            <p>{copy.emptyBody}</p>
            <Link
              to="/shop"
              className="btn btn-primary"
              prefetch="intent"
              tabIndex={isDrawerOpen ? 0 : -1}
              onClick={closeDrawer}
            >
              {copy.shop}
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
                <span>{copy.subtotal}</span>
                <span>{formatPrice(subtotalCents)}</span>
              </div>
              <div className="cart-totals-row">
                <span>{copy.shipping}</span>
                <span className="cart-totals-muted">{copy.atCheckout}</span>
              </div>
              {coupon && (
                <div className="cart-totals-row">
                  <span>{copy.coupon}</span>
                  <span>
                    {coupon.code} —{' '}
                    {discountCents > 0
                      ? `-${formatPrice(discountCents)}`
                      : couponSummary(coupon, locale)}
                  </span>
                </div>
              )}
              <div className="cart-totals-row cart-totals-total">
                <span>{copy.total}</span>
                <span className="cart-totals-muted">{copy.atCheckout}</span>
              </div>
              <Link
                to="/checkout"
                className="btn btn-primary cart-checkout-btn"
                prefetch="intent"
                tabIndex={isDrawerOpen ? 0 : -1}
                onClick={closeDrawer}
              >
                {copy.checkout}
              </Link>
              <Link
                to="/cart"
                className="cart-view-link"
                prefetch="intent"
                tabIndex={isDrawerOpen ? 0 : -1}
                onClick={closeDrawer}
              >
                {copy.viewCart}
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}
