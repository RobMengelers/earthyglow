import { Link } from 'react-router-dom'
import { calcTotals, formatPrice, shippingZoneForCountry } from '../../../cart/CartContext'
import { ShippingProgress } from '../../../cart/components/ShippingProgress'
import { useCart } from '../../../cart/useCart'
import { Reveal } from '../../../components/ui/Reveal'

export function OrderSummary({ country }: { country: string }) {
  const { items, itemCount } = useCart()
  const zone = shippingZoneForCountry(country)
  const zoneTotals = calcTotals(items, zone)
  const hasCountry = country !== ''

  return (
    <Reveal delay={100} className="checkout-summary">
      <h2>Order summary</h2>
      <ul className="checkout-summary-lines">
        {items.map((item) => (
          <li key={item.id} className="checkout-summary-line">
            <span className="checkout-summary-media">
              <img src={item.image} alt="" loading="lazy" />
              <span className="checkout-summary-qty">{item.quantity}</span>
            </span>
                  <span className="checkout-summary-name">{item.name}{item.variantLabel && <small className="checkout-summary-variant">{item.variantLabel}</small>}</span>
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
            <span className="cart-totals-muted">Choose a country</span>
          )}
        </div>
        <div className="cart-totals-row cart-totals-total">
          <span>Total</span>
          {hasCountry ? (
            <span>{formatPrice(zoneTotals.totalCents)}</span>
          ) : (
            <span className="cart-totals-muted">Choose a country</span>
          )}
        </div>
      </div>
      <Link to="/cart" className="cart-view-link">
        Edit cart
      </Link>
    </Reveal>
  )
}
