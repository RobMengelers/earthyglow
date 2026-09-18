import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  calcTotals,
  formatPrice,
  shippingZoneForCountry,
} from '../cart/CartContext'
import { ShippingProgress } from '../cart/ShippingProgress'
import {
  submitOrder,
  fetchPaymentMethods,
  FALLBACK_PAYMENT_METHODS,
  type OrderResult,
  type PaymentMethodOption,
} from '../cart/checkout'
import { useCart } from '../cart/useCart'
import { Reveal } from '../components/Reveal'
import { LoadingButton } from '../components/LoadingButton'

const countries: { name: string; code: string }[] = [
  { name: 'Netherlands', code: 'NL' },
  { name: 'Albania', code: 'AL' },
  { name: 'Andorra', code: 'AD' },
  { name: 'Austria', code: 'AT' },
  { name: 'Belarus', code: 'BY' },
  { name: 'Belgium', code: 'BE' },
  { name: 'Bosnia and Herzegovina', code: 'BA' },
  { name: 'Bulgaria', code: 'BG' },
  { name: 'Croatia', code: 'HR' },
  { name: 'Cyprus', code: 'CY' },
  { name: 'Czech Republic', code: 'CZ' },
  { name: 'Denmark', code: 'DK' },
  { name: 'Estonia', code: 'EE' },
  { name: 'Finland', code: 'FI' },
  { name: 'France', code: 'FR' },
  { name: 'Germany', code: 'DE' },
  { name: 'Greece', code: 'GR' },
  { name: 'Hungary', code: 'HU' },
  { name: 'Iceland', code: 'IS' },
  { name: 'Ireland', code: 'IE' },
  { name: 'Italy', code: 'IT' },
  { name: 'Kosovo', code: 'XK' },
  { name: 'Latvia', code: 'LV' },
  { name: 'Liechtenstein', code: 'LI' },
  { name: 'Lithuania', code: 'LT' },
  { name: 'Luxembourg', code: 'LU' },
  { name: 'Malta', code: 'MT' },
  { name: 'Moldova', code: 'MD' },
  { name: 'Monaco', code: 'MC' },
  { name: 'Montenegro', code: 'ME' },
  { name: 'North Macedonia', code: 'MK' },
  { name: 'Norway', code: 'NO' },
  { name: 'Poland', code: 'PL' },
  { name: 'Portugal', code: 'PT' },
  { name: 'Romania', code: 'RO' },
  { name: 'San Marino', code: 'SM' },
  { name: 'Serbia', code: 'RS' },
  { name: 'Slovakia', code: 'SK' },
  { name: 'Slovenia', code: 'SI' },
  { name: 'Spain', code: 'ES' },
  { name: 'Sweden', code: 'SE' },
  { name: 'Switzerland', code: 'CH' },
  { name: 'Ukraine', code: 'UA' },
  { name: 'United Kingdom', code: 'GB' },
  { name: 'Vatican City', code: 'VA' },
]

export function Checkout() {
  const { items, itemCount, clearCart } = useCart()
  const [order, setOrder] = useState<OrderResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [country, setCountry] = useState('')
  const [methods, setMethods] = useState<PaymentMethodOption[]>(
    FALLBACK_PAYMENT_METHODS,
  )
  const [paymentMethod, setPaymentMethod] = useState('')

  const zone = shippingZoneForCountry(country)
  const zoneTotals = calcTotals(items, zone)
  const hasCountry = country !== ''

  useEffect(() => {
    let cancelled = false
    fetchPaymentMethods().then((fetched) => {
      if (cancelled) return
      setMethods(fetched)
      setPaymentMethod((current) => current || fetched[0]?.id || '')
    })
    return () => {
      cancelled = true
    }
  }, [])

  const selectedMethod =
    methods.find((method) => method.id === paymentMethod) ?? null

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    const data = new FormData(event.currentTarget)
    setError(null)
    setSubmitting(true)

    try {
      const countryCode = String(data.get('country') ?? '').toUpperCase()
      const country =
        countries.find((option) => option.code === countryCode)?.name ??
        countryCode
      const result = await submitOrder({
        paymentMethod,
        details: {
          firstName: String(data.get('firstName') ?? ''),
          lastName: String(data.get('lastName') ?? ''),
          email: String(data.get('email') ?? ''),
          phone: String(data.get('phone') ?? ''),
          address: String(data.get('address') ?? ''),
          city: String(data.get('city') ?? ''),
          postalCode: String(data.get('postalCode') ?? ''),
          country,
          countryCode,
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
                  <select
                    name="country"
                    autoComplete="country-name"
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Pick your country
                    </option>
                    {countries.map((option) => (
                      <option key={option.code} value={option.code}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </label>
              </fieldset>

              <fieldset className="checkout-fieldset">
                <legend>Payment method</legend>
                <div className="payment-methods" role="radiogroup">
                  {methods.map((method) => {
                    const selected = paymentMethod === method.id
                    return (
                      <label
                        key={method.id}
                        className={`payment-method${selected ? ' is-selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={selected}
                          onChange={() => setPaymentMethod(method.id)}
                          required
                        />
                        {method.icon && (
                          <img
                            className="payment-method-icon"
                            src={method.icon}
                            alt=""
                            loading="lazy"
                          />
                        )}
                        <span className="payment-method-name">{method.name}</span>
                      </label>
                    )
                  })}
                </div>
                <p className="payment-note">
                  You&rsquo;ll be redirected to a secure Mollie page to complete
                  your {selectedMethod ? selectedMethod.name : 'payment'} — your
                  order is only confirmed once it succeeds.
                </p>
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

              <LoadingButton
                type="submit"
                className="btn btn-primary checkout-submit"
                loading={submitting}
              >
                Continue to payment
              </LoadingButton>
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
            {hasCountry ? (
              <ShippingProgress className="checkout-shipping" zone={zone} />
            ) : (
              <p className="checkout-shipping-placeholder">
                Pick a country to calculate shipping.
              </p>
            )}
            <div className="cart-totals">
              <div className="cart-totals-row">
                <span>Subtotal ({itemCount})</span>
                <span>{formatPrice(zoneTotals.subtotalCents)}</span>
              </div>
              <div className="cart-totals-row">
                <span>Shipping</span>
                {hasCountry ? (
                  <span>
                    {zoneTotals.shippingCents === 0
                      ? 'Free'
                      : formatPrice(zoneTotals.shippingCents)}
                  </span>
                ) : (
                  <span className="cart-totals-muted">—</span>
                )}
              </div>
              <div className="cart-totals-row cart-totals-total">
                <span>Total</span>
                {hasCountry ? (
                  <span>{formatPrice(zoneTotals.totalCents)}</span>
                ) : (
                  <span className="cart-totals-muted">—</span>
                )}
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
