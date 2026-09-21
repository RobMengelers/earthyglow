import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  submitOrder,
  fetchPaymentMethods,
  FALLBACK_PAYMENT_METHODS,
  type OrderResult,
  type PaymentMethodOption,
} from '../../cart/checkout'
import { useCart } from '../../cart/useCart'
import { Reveal } from '../../components/ui/Reveal'
import { LoadingButton } from '../../components/ui/LoadingButton'
import { countries } from './countries'
import { ContactFields } from './components/ContactFields'
import { ShippingFields } from './components/ShippingFields'
import { PaymentMethods } from './components/PaymentMethods'
import { OrderSummary } from './components/OrderSummary'

export function Checkout() {
  const { items, clearCart } = useCart()
  const [order, setOrder] = useState<OrderResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [country, setCountry] = useState('')
  const [methods, setMethods] = useState<PaymentMethodOption[]>(
    FALLBACK_PAYMENT_METHODS,
  )
  const [paymentMethod, setPaymentMethod] = useState('')

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
            <p className="eyebrow">Demo order</p>
            <h1>Your demo order is saved</h1>
            <p className="checkout-done-lede">
              Demo order <strong>{order.orderNumber}</strong> is saved in this
              browser. No payment was taken and no email will be sent.
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
              <ContactFields />

              <ShippingFields country={country} onCountryChange={setCountry} />

              <PaymentMethods
                methods={methods}
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
                <Link to="/policies/terms-of-service">Terms of Service</Link> and{' '}
                <Link to="/policies/refund-policy">Refund Policy</Link>.
              </p>
            </form>
          </Reveal>

          <OrderSummary country={country} />
        </div>
      </section>
    </>
  )
}
