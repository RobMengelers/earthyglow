import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import { API_URL } from '../../cart/catalog'
import { useCart } from '../../cart/useCart'
import { Reveal } from '../../components/ui/Reveal'
import { siteMeta } from '../../lib/seo'
import { defineCopy, Link, localeFromParams, useCopy, useFormatPrice } from '../../i18n'
import type { Route } from './+types/CheckoutConfirmation'
import { cartItemToAnalytics, centsToEuros, trackPurchaseOnce } from '../../lib/analytics'

type OrderStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'expired'
  | 'canceled'
  | 'refunded'

type OrderStatusResponse = {
  orderNumber: string
  status: OrderStatus
  totalCents: number
  currency: string
}

type Node = ReactNode

const confirmationCopy = defineCopy({
  en: {
    metaTitle: 'Order confirmation · EarthyGlow',
    status: 'Order status',
    missingTitle: 'We couldn’t find that order',
    missingLede: 'The link you followed doesn’t include an order number.',
    backToShop: 'Back to the shop',
    checkingTitle: 'Checking your payment…',
    checkingLede: 'This only takes a moment. Please don’t close this page.',
    loadFailedTitle: 'We couldn’t load your order',
    loadFailedLede: 'If a payment appears on your account, please contact me with your order number so I can check it for you.',
    contact: 'Contact us',
    paidEyebrow: 'Payment received',
    paidBadge: 'Paid',
    paidTitle: 'Thank you for your order',
    paidLede: (number: Node, total: Node) => (
      <>Your order {number} is confirmed for {total}. Your invoice will arrive by email. I’ll get your candles ready and send your tracking details when they’re on their way.</>
    ),
    keepShopping: 'Keep shopping',
    backHome: 'Back home',
    pendingBadge: 'Awaiting payment',
    pendingTitle: 'Almost there',
    pendingLede: (number: Node) => (
      <>We’re waiting for your payment for order {number}. This page updates automatically once it’s confirmed.</>
    ),
    refundedBadge: 'Refunded',
    failedBadge: 'Not completed',
    refundedTitle: 'Your refund has been arranged',
    failedTitle: 'Your payment wasn’t completed',
    refundedLede: (number: Node) => (
      <>A refund has been arranged for order {number}. The time it takes to appear depends on your bank or payment provider.</>
    ),
    failedLede: (number: Node) => (
      <>Payment for order {number} hasn’t completed. If you see a charge on your account, please contact me before trying again.</>
    ),
    tryAgain: 'Try payment again',
    backToCart: 'Back to cart',
  },
  nl: {
    metaTitle: 'Orderbevestiging · EarthyGlow',
    status: 'Bestelstatus',
    missingTitle: 'We konden die bestelling niet vinden',
    missingLede: 'De link die je hebt gevolgd bevat geen bestelnummer.',
    backToShop: 'Terug naar de shop',
    checkingTitle: 'Je betaling wordt gecontroleerd…',
    checkingLede: 'Dit duurt maar even. Sluit deze pagina niet.',
    loadFailedTitle: 'We konden je bestelling niet laden',
    loadFailedLede: 'Zie je een betaling op je rekening? Neem dan contact met me op met je bestelnummer, dan zoek ik het voor je uit.',
    contact: 'Neem contact op',
    paidEyebrow: 'Betaling ontvangen',
    paidBadge: 'Betaald',
    paidTitle: 'Dankjewel voor je bestelling',
    paidLede: (number: Node, total: Node) => (
      <>Je bestelling {number} is bevestigd voor {total}. Je factuur komt per e-mail. Ik maak je kaarsen klaar en stuur je de track-and-tracegegevens zodra ze onderweg zijn.</>
    ),
    keepShopping: 'Verder winkelen',
    backHome: 'Terug naar home',
    pendingBadge: 'Wacht op betaling',
    pendingTitle: 'Bijna klaar',
    pendingLede: (number: Node) => (
      <>We wachten op je betaling voor bestelling {number}. Deze pagina werkt zichzelf bij zodra de betaling is bevestigd.</>
    ),
    refundedBadge: 'Terugbetaald',
    failedBadge: 'Niet afgerond',
    refundedTitle: 'Je terugbetaling is geregeld',
    failedTitle: 'Je betaling is niet afgerond',
    refundedLede: (number: Node) => (
      <>Er is een terugbetaling geregeld voor bestelling {number}. Hoe snel die zichtbaar is, hangt af van je bank of betaalprovider.</>
    ),
    failedLede: (number: Node) => (
      <>De betaling voor bestelling {number} is niet afgerond. Zie je toch een afschrijving op je rekening? Neem dan contact met me op voordat je het opnieuw probeert.</>
    ),
    tryAgain: 'Opnieuw betalen',
    backToCart: 'Terug naar winkelmand',
  },
  de: {
    metaTitle: 'Bestellbestätigung · EarthyGlow',
    status: 'Bestellstatus',
    missingTitle: 'Wir konnten diese Bestellung nicht finden',
    missingLede: 'Der Link, dem du gefolgt bist, enthält keine Bestellnummer.',
    backToShop: 'Zurück zum Shop',
    checkingTitle: 'Deine Zahlung wird geprüft…',
    checkingLede: 'Das dauert nur einen Moment. Bitte schließe diese Seite nicht.',
    loadFailedTitle: 'Wir konnten deine Bestellung nicht laden',
    loadFailedLede: 'Wenn eine Zahlung auf deinem Konto erscheint, kontaktiere mich bitte mit deiner Bestellnummer, damit ich das für dich prüfen kann.',
    contact: 'Kontakt aufnehmen',
    paidEyebrow: 'Zahlung erhalten',
    paidBadge: 'Bezahlt',
    paidTitle: 'Danke für deine Bestellung',
    paidLede: (number: Node, total: Node) => (
      <>Deine Bestellung {number} über {total} ist bestätigt. Deine Rechnung kommt per E-Mail. Ich mache deine Kerzen fertig und schicke dir die Sendungsverfolgung, sobald sie unterwegs sind.</>
    ),
    keepShopping: 'Weiter einkaufen',
    backHome: 'Zur Startseite',
    pendingBadge: 'Zahlung ausstehend',
    pendingTitle: 'Fast geschafft',
    pendingLede: (number: Node) => (
      <>Wir warten auf deine Zahlung für Bestellung {number}. Diese Seite aktualisiert sich automatisch, sobald sie bestätigt ist.</>
    ),
    refundedBadge: 'Erstattet',
    failedBadge: 'Nicht abgeschlossen',
    refundedTitle: 'Deine Erstattung ist veranlasst',
    failedTitle: 'Deine Zahlung wurde nicht abgeschlossen',
    refundedLede: (number: Node) => (
      <>Für Bestellung {number} wurde eine Erstattung veranlasst. Wie lange es dauert, bis sie erscheint, hängt von deiner Bank oder deinem Zahlungsanbieter ab.</>
    ),
    failedLede: (number: Node) => (
      <>Die Zahlung für Bestellung {number} wurde nicht abgeschlossen. Wenn du trotzdem eine Abbuchung auf deinem Konto siehst, kontaktiere mich bitte, bevor du es noch einmal versuchst.</>
    ),
    tryAgain: 'Zahlung erneut versuchen',
    backToCart: 'Zurück zum Warenkorb',
  },
})

export function meta({ params }: Route.MetaArgs) {
  const locale = localeFromParams(params)
  return siteMeta({
    locale,
    title: confirmationCopy[locale].metaTitle,
    robots: 'noindex, nofollow',
  })
}

export function CheckoutConfirmation() {
  const [params] = useSearchParams()
  const orderNumber = params.get('order')
  const isMock = params.get('mock') === '1'
  const { clearCart, removeCoupon, items, coupon } = useCart()
  const copy = useCopy(confirmationCopy)
  const formatPrice = useFormatPrice()
  const [order, setOrder] = useState<OrderStatusResponse | null>(null)
  const [failed, setFailed] = useState(false)
  const clearedRef = useRef(false)
  // Read inside the polling effect without restarting it when the cart loads.
  const itemsRef = useRef(items)
  const couponRef = useRef(coupon?.code)
  useEffect(() => {
    itemsRef.current = items
    couponRef.current = coupon?.code
  }, [items, coupon])

  // In mock mode (no Mollie key) settle the order once so pending -> paid works.
  useEffect(() => {
    if (!isMock || !orderNumber) return
    void fetch(`${API_URL}/api/orders/${orderNumber}/mock-pay`, {
      method: 'POST',
    }).catch(() => undefined)
  }, [isMock, orderNumber])

  useEffect(() => {
    if (!orderNumber) return

    let cancelled = false
    let timer: number | undefined

    async function poll() {
      try {
        const response = await fetch(`${API_URL}/api/orders/${orderNumber}`)
        if (!response.ok) throw new Error('Order not found')
        const data = (await response.json()) as OrderStatusResponse
        if (cancelled) return
        setOrder(data)
        if (data.status === 'pending') {
          timer = window.setTimeout(poll, 2500)
        } else if (data.status === 'paid' && !clearedRef.current) {
          clearedRef.current = true
          // The cart still holds what was bought until it is cleared below.
          trackPurchaseOnce(data.orderNumber, {
            value: centsToEuros(data.totalCents),
            ...(couponRef.current ? { coupon: couponRef.current } : {}),
            items: itemsRef.current.map(cartItemToAnalytics),
          })
          clearCart()
          removeCoupon()
        }
      } catch {
        if (!cancelled) setFailed(true)
      }
    }

    void poll()
    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
    }
  }, [orderNumber, clearCart, removeCoupon])

  if (!orderNumber) {
    return (
      <ConfirmationShell eyebrow={copy.status}>
        <h1>{copy.missingTitle}</h1>
        <p className="checkout-done-lede">{copy.missingLede}</p>
        <div className="hero-actions">
          <Link to="/shop" className="btn btn-primary" prefetch="intent">
            {copy.backToShop}
          </Link>
        </div>
      </ConfirmationShell>
    )
  }

  if (!order && !failed) {
    return (
      <ConfirmationShell eyebrow={copy.status}>
        <h1>{copy.checkingTitle}</h1>
        <p className="checkout-done-lede">{copy.checkingLede}</p>
      </ConfirmationShell>
    )
  }

  if (failed || !order) {
    return (
      <ConfirmationShell eyebrow={copy.status}>
        <h1>{copy.loadFailedTitle}</h1>
        <p className="checkout-done-lede">{copy.loadFailedLede}</p>
        <div className="hero-actions">
          <Link to="/contact" className="btn btn-primary" prefetch="intent">
            {copy.contact}
          </Link>
        </div>
      </ConfirmationShell>
    )
  }

  const number = <strong>{order.orderNumber}</strong>

  if (order.status === 'paid') {
    return (
      <ConfirmationShell eyebrow={copy.paidEyebrow}>
        <span className="order-status-badge is-paid">{copy.paidBadge}</span>
        <h1>{copy.paidTitle}</h1>
        <p className="checkout-done-lede">
          {copy.paidLede(number, <strong>{formatPrice(order.totalCents)}</strong>)}
        </p>
        <div className="hero-actions">
          <Link to="/shop" className="btn btn-primary" prefetch="intent">
            {copy.keepShopping}
          </Link>
          <Link to="/" className="btn btn-ghost" prefetch="intent">
            {copy.backHome}
          </Link>
        </div>
      </ConfirmationShell>
    )
  }

  if (order.status === 'pending') {
    return (
      <ConfirmationShell eyebrow={copy.status}>
        <span className="order-status-badge is-pending">{copy.pendingBadge}</span>
        <h1>{copy.pendingTitle}</h1>
        <p className="checkout-done-lede">{copy.pendingLede(number)}</p>
      </ConfirmationShell>
    )
  }

  const refunded = order.status === 'refunded'
  return (
    <ConfirmationShell eyebrow={copy.status}>
      <span className="order-status-badge is-failed">
        {refunded ? copy.refundedBadge : copy.failedBadge}
      </span>
      <h1>{refunded ? copy.refundedTitle : copy.failedTitle}</h1>
      <p className="checkout-done-lede">
        {refunded ? copy.refundedLede(number) : copy.failedLede(number)}
      </p>
      <div className="hero-actions">
        <Link to={refunded ? '/shop' : '/checkout'} className="btn btn-primary" prefetch="intent">
          {refunded ? copy.backToShop : copy.tryAgain}
        </Link>
        <Link to="/cart" className="btn btn-ghost" prefetch="intent">
          {copy.backToCart}
        </Link>
      </div>
    </ConfirmationShell>
  )
}

function ConfirmationShell({
  eyebrow,
  children,
}: {
  eyebrow: string
  children: ReactNode
}) {
  return (
    <section className="checkout-done">
      <div className="container">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
          {children}
        </Reveal>
      </div>
    </section>
  )
}

export default CheckoutConfirmation
