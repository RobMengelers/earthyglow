import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../cart/CartContext'
import { ShippingProgress } from '../cart/ShippingProgress'
import { submitOrder, type OrderResult } from '../cart/checkout'
import { useCart } from '../cart/useCart'
import { Reveal } from '../components/Reveal'

const countries = [
  'Netherlands',
  'Belgium',
  'Germany',
  'France',
  'Rest of Europe',
]

export function Checkout() {
  const {
    items,
    itemCount,
    subtotalCents,
    shippingCents,
    totalCents,
    clearCart,
  } = useCart()
  const [order, setOrder] = useState<OrderResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    const data = new FormData(event.currentTarget)
    setError(null)
    setSubmitting(true)

    try {
      const result = await submitOrder({
        details: {
          firstName: String(data.get('firstName') ?? ''),
          lastName: String(data.get('lastName') ?? ''),
          email: String(data.get('email') ?? ''),
          phone: String(data.get('phone') ?? ''),
          address: String(data.get('address') ?? ''),
          city: String(data.get('city') ?? ''),
          postalCode: String(data.get('postalCode') ?? ''),
          country: String(data.get('country') ?? ''),
          notes: String(data.get('notes') ?? ''),
        },
        items,
      })

      if (result.checkoutUrl) {
        // Hand off to Mollie (or the mock confirmation page in dev).
        window.location.assign(result.checkoutUrl)
        return
      }

      setOrder(result)
      clearCart()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Something went wrong. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (order) {
    return (
      <section className="checkout-done">
        <div className="container">
          <Reveal>
            <p className="eyebrow">Order received</p>
            <h1>Thank you, your order is in</h1>
            <p className="checkout-done-lede">
              Your order <strong>{order.orderNumber}</strong> has been placed.
              We&rsquo;ll send a secure payment link to your email shortly, and
              your candles will be hand-poured and shipped as soon as it&rsquo;s
              paid.
            </p>
            <div className="hero-actions">
              <Link to="/shop" className="btn btn-primary">
                Keep shopping
              </Link>
              <Link to="/" className="btn btn-ghost">
                Back home
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    )
  }

  if (items.length === 0) {
    return (
      <section className="checkout-done">
        <div className="container">
          <Reveal>
            <p className="eyebrow">Checkout</p>
            <h1>Your cart is empty</h1>
            <p className="checkout-done-lede">
              Add a candle or two before heading to checkout.
            </p>
            <Link to="/shop" className="btn btn-primary">
              Shop the collection
            </Link>
          </Reveal>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Reveal>
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span aria-hidden="true">/</span>
              <Link to="/cart">Cart</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Checkout</span>
            </nav>
            <p className="eyebrow">Checkout</p>
            <h1>Let&rsquo;s get your glow on its way</h1>
          </Reveal>
        </div>
      </section>

      <section className="checkout-body">
        <div className="container checkout-grid">
          <Reveal className="checkout-form-wrap">
            <form className="checkout-form" onSubmit={handleSubmit}>
              <fieldset className="checkout-fieldset">
                <legend>Contact</legend>
                <div className="field-row">
                  <label className="field">
                    <span>First name</span>
                    <input type="text" name="firstName" autoComplete="given-name" required />
                  </label>
                  <label className="field">
                    <span>Last name</span>
                    <input type="text" name="lastName" autoComplete="family-name" required />
                  </label>
                </div>
                <div className="field-row">
                  <label className="field">
                    <span>Email</span>
                    <input type="email" name="email" autoComplete="email" required />
                  </label>
                  <label className="field">
                    <span>Phone (optional)</span>
                    <input type="tel" name="phone" autoComplete="tel" />
                  </label>
                </div>
              </fieldset>

              <fieldset className="checkout-fieldset">
                <legend>Shipping address</legend>
                <label className="field">
                  <span>Street and number</span>
                  <input
                    type="text"
                    name="address"
                    autoComplete="street-address"
                    required
                  />
                </label>
                <div className="field-row">
                  <label className="field">
                    <span>Postal code</span>
                    <input
                      type="text"
                      name="postalCode"
                      autoComplete="postal-code"
                      required
                    />
                  </label>
                  <label className="field">
                    <span>City</span>
                    <input type="text" name="city" autoComplete="address-level2" required />
                  </label>
                </div>
                <label className="field">
                  <span>Country</span>
                  <select name="country" autoComplete="country-name" required>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </label>
              </fieldset>

              <fieldset className="checkout-fieldset">
                <legend>Payment</legend>
                <div className="payment-placeholder">
                  <span className="payment-badge">Mollie</span>
                  <p>
                    You&rsquo;ll be redirected to Mollie to pay securely by
                    iDEAL, card, Bancontact, PayPal and more. Your order is only
                    confirmed once payment succeeds.
                  </p>
                </div>
              </fieldset>

              <fieldset className="checkout-fieldset">
                <legend>Notes</legend>
                <label className="field">
                  <span>Anything we should know? (optional)</span>
                  <textarea name="notes" rows={4} />
                </label>
              </fieldset>

              {error && (
                <p className="checkout-error" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="btn btn-primary checkout-submit"
                disabled={submitting}
              >
                {submitting ? 'Starting payment…' : 'Continue to payment'}
              </button>
              <p className="checkout-legal">
                By placing your order you agree to our{' '}
                <Link to="/policies/terms-of-service">Terms of Service</Link> and{' '}
                <Link to="/policies/refund-policy">Refund Policy</Link>.
              </p>
            </form>
          </Reveal>

          <Reveal delay={100} className="checkout-summary">
            <h2>Order summary</h2>
            <ul className="checkout-summary-lines">
              {items.map((item) => (
                <li key={item.id} className="checkout-summary-line">
                  <span className="checkout-summary-media">
                    <img src={item.image} alt="" loading="lazy" />
                    <span className="checkout-summary-qty">{item.quantity}</span>
                  </span>
                  <span className="checkout-summary-name">{item.name}</span>
                  <span className="checkout-summary-price">
                    {formatPrice(item.priceCents * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <ShippingProgress className="checkout-shipping" />
            <div className="cart-totals">
              <div className="cart-totals-row">
                <span>Subtotal ({itemCount})</span>
                <span>{formatPrice(subtotalCents)}</span>
              </div>
              <div className="cart-totals-row">
                <span>Shipping</span>
                <span>{shippingCents === 0 ? 'Free' : formatPrice(shippingCents)}</span>
              </div>
              <div className="cart-totals-row cart-totals-total">
                <span>Total</span>
                <span>{formatPrice(totalCents)}</span>
              </div>
            </div>
            <Link to="/cart" className="cart-view-link">
              Edit cart
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
