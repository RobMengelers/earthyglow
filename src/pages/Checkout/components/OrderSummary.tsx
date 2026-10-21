import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { calcTotals, formatPrice, shippingZoneForCountry } from '../../../cart/CartContext'
import { ShippingProgress } from '../../../cart/components/ShippingProgress'
import { useCart } from '../../../cart/useCart'
import { Reveal } from '../../../components/ui/Reveal'
import { imageAttrs, SIZES } from '../../../lib/images'

export function OrderSummary({ country }: { country: string }) {
  const {
    items,
    itemCount,
    coupon,
    couponError,
    couponPending,
    applyCoupon,
    removeCoupon,
  } = useCart()
  const zone = shippingZoneForCountry(country)
  const zoneTotals = calcTotals(items, zone, coupon)
  const hasCountry = country !== ''
  const [code, setCode] = useState('')

  async function handleApply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const applied = await applyCoupon(code)
    if (applied) setCode('')
  }

  return (
    <Reveal delay={100} className="checkout-summary">
      <h2>Order summary</h2>
      <ul className="checkout-summary-lines">
        {items.map((item) => (
          <li key={item.id} className="checkout-summary-line">
            <span className="checkout-summary-media">
              {item.image && (
                <img {...imageAttrs(item.image, SIZES.thumb)} alt="" loading="lazy" />
              )}
              <span className="checkout-summary-qty">{item.quantity}</span>
            </span>
                  <span className="checkout-summary-name">
                    {item.name}
                    {item.variantLabel && <small className="checkout-summary-variant">{item.variantLabel}</small>}
                    {item.colorLabel && <small className="checkout-summary-variant">{item.colorLabel}</small>}
                  </span>
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
      {coupon ? (
        <p className="checkout-coupon-applied">
          <span>
            <strong>{coupon.code}</strong> — {coupon.summary}
          </span>
          <button
            type="button"
            className="checkout-coupon-remove"
            onClick={removeCoupon}
          >
            Remove
          </button>
        </p>
      ) : (
        <form className="checkout-coupon" onSubmit={handleApply}>
          <label className="checkout-coupon-label" htmlFor="coupon-code">
            Coupon
          </label>
          <div className="checkout-coupon-row">
            <input
              id="coupon-code"
              name="couponCode"
              className="checkout-coupon-input"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="ABC123"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="submit"
              className="checkout-coupon-apply"
              disabled={couponPending || code.trim() === ''}
            >
              {couponPending ? 'Checking…' : 'Apply'}
            </button>
          </div>
          {couponError && (
            <p className="checkout-coupon-error" role="alert">
              {couponError}
            </p>
          )}
        </form>
      )}
      <div className="cart-totals">
        <div className="cart-totals-row">
          <span>Subtotal ({itemCount})</span>
          <span>{formatPrice(zoneTotals.subtotalCents)}</span>
        </div>
        {zoneTotals.discountCents > 0 && (
          <div className="cart-totals-row">
            <span>Discount ({coupon?.code})</span>
            <span>-{formatPrice(zoneTotals.discountCents)}</span>
          </div>
        )}
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
