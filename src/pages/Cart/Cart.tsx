import { Link } from 'react-router-dom'
import { formatPrice } from '../../cart/CartContext'
import { useCart } from '../../cart/useCart'
import { CartLine } from '../../cart/components/CartLine'
import { Reveal } from '../../components/ui/Reveal'

export function Cart() {
  const {
    items,
    itemCount,
    subtotalCents,
    clearCart,
  } = useCart()

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Reveal>
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Cart</span>
            </nav>
            <p className="eyebrow">Your cart</p>
            <h1>{itemCount > 0 ? 'Almost yours' : 'Your cart is empty'}</h1>
          </Reveal>
        </div>
      </section>

      <section className="cart-page">
        <div className="container">
          {items.length === 0 ? (
            <Reveal className="cart-page-empty">
              <p>
                Looking for a little gift or a candle for your own home?
                Have a look at what I’ve been making.
              </p>
              <Link to="/shop" className="btn btn-primary">
                Shop the collection
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
                  <Link to="/shop" className="cart-view-link">
                    Continue shopping
                  </Link>
                  <button
                    type="button"
                    className="cart-clear"
                    onClick={clearCart}
                  >
                    Clear cart
                  </button>
                </div>
              </Reveal>

              <Reveal delay={100} className="cart-summary">
                <h2>Order summary</h2>
                <div className="cart-totals">
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
                </div>
                <Link to="/checkout" className="btn btn-primary cart-checkout-btn">
                  Go to checkout
                </Link>
                <p className="cart-summary-note">
                  Shipping is calculated at checkout once you choose your
                  country. NL orders of €25,00 or more and international orders of
                  €50,00 or more ship free.
                </p>
              </Reveal>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
