import { useCart } from '../../cart/useCart'
import { couponSummary } from '../../cart/coupons'
import { cartCopy } from '../../cart/cart-copy'
import { defineCopy, Link, localeFromParams, useCopy, useFormatPrice, useLocale } from '../../i18n'
import type { Route } from './+types/Cart'
import { CartLine } from '../../cart/components/CartLine'
import { Reveal } from '../../components/ui/Reveal'
import { Divider } from '../../components/ui/Divider'
import { siteMeta } from '../../lib/seo'

const pageCopy = defineCopy({
  en: {
    metaTitle: 'Cart · EarthyGlow',
    breadcrumb: 'Breadcrumb',
    home: 'Home',
    cart: 'Cart',
    almost: 'Almost yours',
    emptyLede: 'Looking for a little gift or a candle for your own home? Have a look at what I’ve been making.',
    continue: 'Continue shopping',
    clear: 'Clear cart',
    summary: 'Order summary',
    toCheckout: 'Go to checkout',
    note: 'Shipping is calculated at checkout once you choose your country. NL orders of €25.00 or more and international orders of €50.00 or more ship free.',
  },
  nl: {
    metaTitle: 'Winkelmand · EarthyGlow',
    breadcrumb: 'Kruimelpad',
    home: 'Home',
    cart: 'Winkelmand',
    almost: 'Bijna van jou',
    emptyLede: 'Op zoek naar een klein cadeautje of een kaars voor je eigen huis? Kijk eens wat ik heb gemaakt.',
    continue: 'Verder winkelen',
    clear: 'Winkelmand legen',
    summary: 'Overzicht',
    toCheckout: 'Naar afrekenen',
    note: 'De verzendkosten worden berekend bij het afrekenen, zodra je je land kiest. Bestellingen binnen Nederland vanaf €25,00 en internationale bestellingen vanaf €50,00 worden gratis verzonden.',
  },
  de: {
    metaTitle: 'Warenkorb · EarthyGlow',
    breadcrumb: 'Brotkrümelnavigation',
    home: 'Start',
    cart: 'Warenkorb',
    almost: 'Fast schon deins',
    emptyLede: 'Suchst du ein kleines Geschenk oder eine Kerze für dein eigenes Zuhause? Schau dir an, was ich gemacht habe.',
    continue: 'Weiter einkaufen',
    clear: 'Warenkorb leeren',
    summary: 'Bestellübersicht',
    toCheckout: 'Zur Kasse',
    note: 'Die Versandkosten werden an der Kasse berechnet, sobald du dein Land auswählst. Bestellungen in die Niederlande ab €25,00 und internationale Bestellungen ab €50,00 werden kostenlos versandt.',
  },
})

export function meta({ params }: Route.MetaArgs) {
  const locale = localeFromParams(params)
  return siteMeta({ locale, title: pageCopy[locale].metaTitle, robots: 'noindex, follow' })
}

export function Cart() {
  const {
    items,
    itemCount,
    subtotalCents,
    discountCents,
    coupon,
    clearCart,
  } = useCart()
  const locale = useLocale()
  const copy = useCopy(pageCopy)
  const cart = useCopy(cartCopy)
  const formatPrice = useFormatPrice()

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Reveal>
            <nav className="breadcrumb" aria-label={copy.breadcrumb}>
              <Link to="/" prefetch="intent">{copy.home}</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{copy.cart}</span>
            </nav>
            <p className="eyebrow">{cart.title}</p>
            <h1>{itemCount > 0 ? copy.almost : cart.emptyTitle}</h1>
          </Reveal>
        </div>
      </section>

      <Divider white />

      <section className="cart-page">
        <div className="container">
          {items.length === 0 ? (
            <Reveal className="cart-page-empty">
              <p>{copy.emptyLede}</p>
              <Link to="/shop" className="btn btn-primary" prefetch="intent">
                {cart.shop}
              </Link>
            </Reveal>
          ) : (
            <div className="cart-page-grid">
              <Reveal className="cart-page-items">
                <ul className="cart-lines cart-lines-page">
                  {items.map((item) => (
                    <CartLine key={item.id} item={item} />
                  ))}
                </ul>
                <div className="cart-page-actions">
                  <Link to="/shop" className="cart-view-link" prefetch="intent">
                    {copy.continue}
                  </Link>
                  <button
                    type="button"
                    className="cart-clear"
                    onClick={clearCart}
                  >
                    {copy.clear}
                  </button>
                </div>
              </Reveal>

              <Reveal delay={100} className="cart-summary">
                <h2>{copy.summary}</h2>
                <div className="cart-totals">
                  <div className="cart-totals-row">
                    <span>{cart.subtotal}</span>
                    <span>{formatPrice(subtotalCents)}</span>
                  </div>
                  {coupon && (
                    <div className="cart-totals-row">
                      <span>{cart.coupon}</span>
                      <span>
                        {coupon.code} —{' '}
                        {discountCents > 0
                          ? `-${formatPrice(discountCents)}`
                          : couponSummary(coupon, locale)}
                      </span>
                    </div>
                  )}
                  <div className="cart-totals-row">
                    <span>{cart.shipping}</span>
                    <span className="cart-totals-muted">{cart.atCheckout}</span>
                  </div>
                  <div className="cart-totals-row cart-totals-total">
                    <span>{cart.total}</span>
                    <span className="cart-totals-muted">{cart.atCheckout}</span>
                  </div>
                </div>
                <Link to="/checkout" className="btn btn-primary cart-checkout-btn" prefetch="intent">
                  {copy.toCheckout}
                </Link>
                <p className="cart-summary-note">{copy.note}</p>
              </Reveal>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default Cart
