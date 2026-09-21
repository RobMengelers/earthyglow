import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { formatPrice } from '../../cart/CartContext'
import { API_URL } from '../../cart/catalog'
import { useCart } from '../../cart/useCart'
import { Reveal } from '../../components/ui/Reveal'

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

export function CheckoutConfirmation() {
  const [params] = useSearchParams()
  const orderNumber = params.get('order')
  const isMock = params.get('mock') === '1'
  const { clearCart } = useCart()
  const [order, setOrder] = useState<OrderStatusResponse | null>(null)
  const [failed, setFailed] = useState(false)
  const clearedRef = useRef(false)

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
          clearCart()
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
  }, [orderNumber, clearCart])

  if (!orderNumber) {
    return (
      <ConfirmationShell eyebrow="Order status">
        <h1>We couldn&rsquo;t find that order</h1>
        <p className="checkout-done-lede">
          The link you followed doesn&rsquo;t include an order number.
        </p>
        <div className="hero-actions">
          <Link to="/shop" className="btn btn-primary">
            Back to the shop
          </Link>
        </div>
      </ConfirmationShell>
    )
  }

  if (!order && !failed) {
    return (
      <ConfirmationShell eyebrow="Order status">
        <h1>Checking your payment…</h1>
        <p className="checkout-done-lede">
          This only takes a moment. Please don&rsquo;t close this page.
        </p>
      </ConfirmationShell>
    )
  }

  if (failed || !order) {
    return (
      <ConfirmationShell eyebrow="Order status">
        <h1>We couldn&rsquo;t load your order</h1>
        <p className="checkout-done-lede">
          If a payment appears on your account, please contact me with your
          order number so I can check it for you.
        </p>
        <div className="hero-actions">
          <Link to="/contact" className="btn btn-primary">
            Contact us
          </Link>
        </div>
      </ConfirmationShell>
    )
  }

  if (order.status === 'paid') {
    return (
      <ConfirmationShell eyebrow="Payment received">
        <span className="order-status-badge is-paid">Paid</span>
        <h1>Thank you for your order</h1>
        <p className="checkout-done-lede">
          Your order <strong>{order.orderNumber}</strong> is confirmed for{' '}
          <strong>{formatPrice(order.totalCents)}</strong>. Your invoice will arrive by email. I’ll get your candles ready
          and send your tracking details when they’re on their way.
        </p>
        <div className="hero-actions">
          <Link to="/shop" className="btn btn-primary">
            Keep shopping
          </Link>
          <Link to="/" className="btn btn-ghost">
            Back home
          </Link>
        </div>
      </ConfirmationShell>
    )
  }

  if (order.status === 'pending') {
    return (
      <ConfirmationShell eyebrow="Order status">
        <span className="order-status-badge is-pending">Awaiting payment</span>
        <h1>Almost there</h1>
        <p className="checkout-done-lede">
          We&rsquo;re waiting for your payment for order{' '}
          <strong>{order.orderNumber}</strong>. This page updates automatically
          once it&rsquo;s confirmed.
        </p>
      </ConfirmationShell>
    )
  }

  return (
    <ConfirmationShell eyebrow="Order status">
      <span className="order-status-badge is-failed">
        {order.status === 'refunded' ? 'Refunded' : 'Not completed'}
      </span>
      <h1>{order.status === 'refunded' ? 'Your refund has been arranged' : 'Your payment wasn’t completed'}</h1>
      <p className="checkout-done-lede">
        {order.status === 'refunded' ? (
          <>A refund has been arranged for order <strong>{order.orderNumber}</strong>. The time it takes to appear depends on your bank or payment provider.</>
        ) : (
          <>Payment for order <strong>{order.orderNumber}</strong> hasn’t completed. If you see a charge on your account, please contact me before trying again.</>
        )}
      </p>
      <div className="hero-actions">
        <Link to={order.status === 'refunded' ? '/shop' : '/checkout'} className="btn btn-primary">
          {order.status === 'refunded' ? 'Back to the shop' : 'Try payment again'}
        </Link>
        <Link to="/cart" className="btn btn-ghost">
          Back to cart
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
