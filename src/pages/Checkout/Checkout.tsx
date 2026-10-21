import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import {
  submitOrder,
  fetchPaymentMethods,
  CheckoutError,
  FALLBACK_PAYMENT_METHODS,
  KLARNA_COUNTRIES,
  type OrderResult,
  type PaymentMethodOption,
} from '../../cart/checkout'
import { useCart } from '../../cart/useCart'
import { Reveal } from '../../components/ui/Reveal'
import { Divider } from '../../components/ui/Divider'
import { LoadingButton } from '../../components/ui/LoadingButton'
import { countries } from './countries'
import { ContactFields } from './components/ContactFields'
import { ShippingFields } from './components/ShippingFields'
import { PaymentMethods } from './components/PaymentMethods'
import { OrderSummary } from './components/OrderSummary'
import { siteMeta } from '../../lib/seo'

export function meta() {
  return siteMeta({ title: 'Checkout · EarthyGlow', robots: 'noindex, nofollow' })
}

function isMethodAvailable(method: PaymentMethodOption, country: string) {
  if (method.id !== 'klarna') return true
  return country === '' || KLARNA_COUNTRIES.has(country)
}

export function Checkout() {
  const { items, clearCart, coupon, removeCoupon } = useCart()
  const [order, setOrder] = useState<OrderResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [country, setCountry] = useState('')
  const [methods, setMethods] = useState<PaymentMethodOption[]>(
    FALLBACK_PAYMENT_METHODS,
  )
  const [paymentMethod, setPaymentMethod] = useState('')
  const availableMethods = methods.filter((method) =>
    isMethodAvailable(method, country),
  )

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

  function handleCountryChange(nextCountry: string) {
    setCountry(nextCountry)
    setPaymentMethod((current) => {
      const selected = methods.find((method) => method.id === current)
      if (!selected || isMethodAvailable(selected, nextCountry)) return current
      return methods.find((method) => isMethodAvailable(method, nextCountry))?.id ?? ''
    })
  }

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
        ...(coupon ? { couponCode: coupon.code } : {}),
      })

      if (result.checkoutUrl) {
        // Hand off to Mollie (or the mock confirmation page in dev).
        window.location.assign(result.checkoutUrl)
        return
      }

      setOrder(result)
      clearCart()
      removeCoupon()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (submitError) {
      if (submitError instanceof CheckoutError && submitError.couponInvalid) {
        // The code ran out or expired between applying and paying; drop it so
        // the customer can pay without it.
        removeCoupon()
      }
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
            <p className="eyebrow">Demo order</p>
            <h1>Your demo order is saved</h1>
            <p className="checkout-done-lede">
              Demo order <strong>{order.orderNumber}</strong> is saved in this
              browser. No payment was taken and no email will be sent.
            </p>
            <div className="hero-actions">
              <Link to="/shop" className="btn btn-primary" prefetch="intent">
                Keep shopping
              </Link>
              <Link to="/" className="btn btn-ghost" prefetch="intent">
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
            <Link to="/shop" className="btn btn-primary" prefetch="intent">
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
              <Link to="/" prefetch="intent">Home</Link>
              <span aria-hidden="true">/</span>
              <Link to="/cart" prefetch="intent">Cart</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Checkout</span>
            </nav>
            <p className="eyebrow">Checkout</p>
            <h1>Let&rsquo;s get your glow on its way</h1>
          </Reveal>
        </div>
      </section>

      <Divider white />

      <section className="checkout-body">
        <div className="container checkout-grid">
          <Reveal className="checkout-form-wrap">
            <form className="checkout-form" onSubmit={handleSubmit}>
              <ContactFields />

              <ShippingFields country={country} onCountryChange={handleCountryChange} />

              <PaymentMethods
                methods={availableMethods}
                paymentMethod={paymentMethod}
                onChange={setPaymentMethod}
              />

              <fieldset className="checkout-fieldset">
                <legend>Notes</legend>
                <label className="field">
                  <span>Anything I should know? (optional)</span>
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
                <Link to="/policies/terms-of-service" prefetch="intent">Terms of Service</Link> and{' '}
                <Link to="/policies/refund-policy" prefetch="intent">Refund Policy</Link>.
              </p>
            </form>
          </Reveal>

          <OrderSummary country={country} />
        </div>
      </section>
    </>
  )
}

export default Checkout
