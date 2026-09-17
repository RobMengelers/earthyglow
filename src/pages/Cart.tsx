import { Link } from 'react-router-dom'
import { formatPrice } from '../cart/CartContext'
import { ShippingProgress } from '../cart/ShippingProgress'
import { useCart } from '../cart/useCart'
import { Reveal } from '../components/Reveal'

export function Cart() {
  const {
    items,
    itemCount,
    subtotalCents,
    shippingCents,
    totalCents,
    updateQuantity,
    removeItem,
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
                Fill it with something warm and hand-poured — every candle is
                made in small batches.
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
                    <li key={item.id} className="cart-line">
                      <Link to={`/product/${item.id}`} className="cart-line-media">
                        <img src={item.image} alt={item.name} loading="lazy" />
                      </Link>
                      <div className="cart-line-body">
                        <div className="cart-line-top">
                          <Link
                            to={`/product/${item.id}`}
                            className="cart-line-name"
                          >
                            {item.name}
                          </Link>
                          <button
                            type="button"
                            className="cart-line-remove"
                            aria-label={`Remove ${item.name}`}
                            onClick={() => removeItem(item.id)}
                          >
                            Remove
                          </button>
                        </div>
                        <p className="cart-line-collection">
                          {item.collectionTitle}
                        </p>
                        <div className="cart-line-bottom">
                          <div className="qty-stepper">
                            <button
                              type="button"
                              aria-label={`Decrease quantity of ${item.name}`}
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                            >
                              &minus;
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              type="button"
                              aria-label={`Increase quantity of ${item.name}`}
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                            >
                              +
                            </button>
                          </div>
                          <span className="cart-line-price">
                            {formatPrice(item.priceCents * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </li>
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
                <ShippingProgress />
                <div className="cart-totals">
                  <div className="cart-totals-row">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotalCents)}</span>
                  </div>
                  <div className="cart-totals-row">
                    <span>Shipping</span>
                    <span>
                      {shippingCents === 0 ? 'Free' : formatPrice(shippingCents)}
                    </span>
                  </div>
                  <div className="cart-totals-row cart-totals-total">
                    <span>Total</span>
                    <span>{formatPrice(totalCents)}</span>
                  </div>
                </div>
                <Link to="/checkout" className="btn btn-primary cart-checkout-btn">
                  Go to checkout
                </Link>
                <p className="cart-summary-note">
                  Taxes included. Shipping calculated at checkout.
                </p>
              </Reveal>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
