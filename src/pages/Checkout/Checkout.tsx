import { useEffect, useState, type FormEvent } from 'react'
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
import { defineCopy, Link, localeFromParams, useCopy, useLocale } from '../../i18n'
import type { Route } from './+types/Checkout'

const checkoutCopy = defineCopy({
  en: {
    metaTitle: 'Checkout · EarthyGlow',
    failed: 'Something went wrong. Please try again.',
    demoEyebrow: 'Demo order',
    demoTitle: 'Your demo order is saved',
    demoBefore: 'Demo order',
    demoAfter: 'is saved in this browser. No payment was taken and no email will be sent.',
    keepShopping: 'Keep shopping',
    backHome: 'Back home',
    checkout: 'Checkout',
    emptyTitle: 'Your cart is empty',
    emptyLede: 'Add a candle or two before heading to checkout.',
    shop: 'Shop the collection',
    breadcrumb: 'Breadcrumb',
    home: 'Home',
    cart: 'Cart',
    title: 'Let’s get your glow on its way',
    notes: 'Notes',
    notesLabel: 'Anything I should know? (optional)',
    submit: 'Continue to payment',
    legalBefore: 'By placing your order you agree to our',
    terms: 'Terms of Service',
    and: 'and',
    refund: 'Refund Policy',
  },
  nl: {
    metaTitle: 'Afrekenen · EarthyGlow',
    failed: 'Er ging iets mis. Probeer het nog eens.',
    demoEyebrow: 'Testbestelling',
    demoTitle: 'Je testbestelling is opgeslagen',
    demoBefore: 'Testbestelling',
    demoAfter: 'is opgeslagen in deze browser. Er is niet betaald en er wordt geen e-mail verstuurd.',
    keepShopping: 'Verder winkelen',
    backHome: 'Terug naar home',
    checkout: 'Afrekenen',
    emptyTitle: 'Je winkelmand is leeg',
    emptyLede: 'Voeg eerst een kaars of twee toe voordat je gaat afrekenen.',
    shop: 'Bekijk de collectie',
    breadcrumb: 'Kruimelpad',
    home: 'Home',
    cart: 'Winkelmand',
    title: 'Laten we je gloed op weg helpen',
    notes: 'Opmerkingen',
    notesLabel: 'Is er iets wat ik moet weten? (optioneel)',
    submit: 'Verder naar betalen',
    legalBefore: 'Door je bestelling te plaatsen ga je akkoord met onze',
    terms: 'algemene voorwaarden',
    and: 'en ons',
    refund: 'retourbeleid',
  },
  de: {
    metaTitle: 'Kasse · EarthyGlow',
    failed: 'Etwas ist schiefgelaufen. Bitte versuche es noch einmal.',
    demoEyebrow: 'Testbestellung',
    demoTitle: 'Deine Testbestellung ist gespeichert',
    demoBefore: 'Testbestellung',
    demoAfter: 'ist in diesem Browser gespeichert. Es wurde nichts bezahlt und es wird keine E-Mail verschickt.',
    keepShopping: 'Weiter einkaufen',
    backHome: 'Zur Startseite',
    checkout: 'Kasse',
    emptyTitle: 'Dein Warenkorb ist leer',
    emptyLede: 'Leg erst eine oder zwei Kerzen in den Warenkorb, bevor du zur Kasse gehst.',
    shop: 'Zur Kollektion',
    breadcrumb: 'Brotkrümelnavigation',
    home: 'Start',
    cart: 'Warenkorb',
    title: 'Bringen wir deinen Glanz auf den Weg',
    notes: 'Anmerkungen',
    notesLabel: 'Gibt es etwas, das ich wissen sollte? (optional)',
    submit: 'Weiter zur Zahlung',
    legalBefore: 'Mit deiner Bestellung akzeptierst du unsere',
    terms: 'AGB',
    and: 'und unsere',
    refund: 'Rückgaberichtlinie',
  },
})

export function meta({ params }: Route.MetaArgs) {
  const locale = localeFromParams(params)
  return siteMeta({ locale, title: checkoutCopy[locale].metaTitle, robots: 'noindex, nofollow' })
}

function isMethodAvailable(method: PaymentMethodOption, country: string) {
  if (method.id !== 'klarna') return true
  return country === '' || KLARNA_COUNTRIES.has(country)
}

export function Checkout() {
  const { items, clearCart, coupon, removeCoupon } = useCart()
  const locale = useLocale()
  const copy = useCopy(checkoutCopy)
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
    fetchPaymentMethods(locale).then((fetched) => {
      if (cancelled) return
      setMethods(fetched)
      setPaymentMethod((current) => current || fetched[0]?.id || '')
    })
    return () => {
      cancelled = true
    }
  }, [locale])

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
        locale,
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
          : copy.failed,
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
            <p className="eyebrow">{copy.demoEyebrow}</p>
            <h1>{copy.demoTitle}</h1>
            <p className="checkout-done-lede">
              {copy.demoBefore} <strong>{order.orderNumber}</strong> {copy.demoAfter}
            </p>
            <div className="hero-actions">
              <Link to="/shop" className="btn btn-primary" prefetch="intent">
                {copy.keepShopping}
              </Link>
              <Link to="/" className="btn btn-ghost" prefetch="intent">
                {copy.backHome}
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
            <p className="eyebrow">{copy.checkout}</p>
            <h1>{copy.emptyTitle}</h1>
            <p className="checkout-done-lede">{copy.emptyLede}</p>
            <Link to="/shop" className="btn btn-primary" prefetch="intent">
              {copy.shop}
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
            <nav className="breadcrumb" aria-label={copy.breadcrumb}>
              <Link to="/" prefetch="intent">{copy.home}</Link>
              <span aria-hidden="true">/</span>
              <Link to="/cart" prefetch="intent">{copy.cart}</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{copy.checkout}</span>
            </nav>
            <p className="eyebrow">{copy.checkout}</p>
            <h1>{copy.title}</h1>
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
                <legend>{copy.notes}</legend>
                <label className="field">
                  <span>{copy.notesLabel}</span>
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
                {copy.submit}
              </LoadingButton>
              <p className="checkout-legal">
                {copy.legalBefore}{' '}
                <Link to="/policies/terms-of-service" prefetch="intent">{copy.terms}</Link> {copy.and}{' '}
                <Link to="/policies/refund-policy" prefetch="intent">{copy.refund}</Link>.
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
