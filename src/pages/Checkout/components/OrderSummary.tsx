import { useState, type FormEvent } from 'react'
import { calcTotals, shippingZoneForCountry } from '../../../cart/CartContext'
import { couponSummary } from '../../../cart/coupons'
import { defineCopy, Link, useCopy, useFormatPrice, useLocale } from '../../../i18n'
import { optionLabel } from '../../../i18n/options'
import { ShippingProgress } from '../../../cart/components/ShippingProgress'
import { useCart } from '../../../cart/useCart'
import { Reveal } from '../../../components/ui/Reveal'
import { LoadingButton } from '../../../components/ui/LoadingButton'
import { imageAttrs, SIZES } from '../../../lib/images'

const summaryCopy = defineCopy({
  en: {
    title: 'Order summary',
    pickCountry: 'Pick a country to calculate shipping.',
    remove: 'Remove',
    coupon: 'Coupon',
    apply: 'Apply',
    subtotal: 'Subtotal',
    discount: 'Discount',
    shipping: 'Shipping',
    free: 'Free',
    chooseCountry: 'Choose a country',
    total: 'Total',
    editCart: 'Edit cart',
  },
  nl: {
    title: 'Overzicht',
    pickCountry: 'Kies een land om de verzendkosten te berekenen.',
    remove: 'Verwijderen',
    coupon: 'Kortingscode',
    apply: 'Toepassen',
    subtotal: 'Subtotaal',
    discount: 'Korting',
    shipping: 'Verzending',
    free: 'Gratis',
    chooseCountry: 'Kies een land',
    total: 'Totaal',
    editCart: 'Winkelmand aanpassen',
  },
  de: {
    title: 'Bestellübersicht',
    pickCountry: 'Wähle ein Land, um die Versandkosten zu berechnen.',
    remove: 'Entfernen',
    coupon: 'Gutschein',
    apply: 'Einlösen',
    subtotal: 'Zwischensumme',
    discount: 'Rabatt',
    shipping: 'Versand',
    free: 'Kostenlos',
    chooseCountry: 'Wähle ein Land',
    total: 'Gesamt',
    editCart: 'Warenkorb bearbeiten',
  },
})

export function OrderSummary({ country }: { country: string }) {
  const copy = useCopy(summaryCopy)
  const locale = useLocale()
  const formatPrice = useFormatPrice()
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
      <h2>{copy.title}</h2>
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
                    {item.variantLabel && <small className="checkout-summary-variant">{optionLabel(item.variantLabel, locale)}</small>}
                    {item.colorLabel && <small className="checkout-summary-variant">{optionLabel(item.colorLabel, locale)}</small>}
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
          {copy.pickCountry}
        </p>
      )}
      {coupon ? (
        <p className="checkout-coupon-applied">
          <span>
            <strong>{coupon.code}</strong> — {couponSummary(coupon, locale)}
          </span>
          <button
            type="button"
            className="checkout-coupon-remove"
            onClick={removeCoupon}
          >
            {copy.remove}
          </button>
        </p>
      ) : (
        <form className="checkout-coupon" onSubmit={handleApply}>
          <label className="checkout-coupon-label" htmlFor="coupon-code">
            {copy.coupon}
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
            <LoadingButton
              type="submit"
              className="checkout-coupon-apply"
              disabled={code.trim() === ''}
              loading={couponPending}
            >
              {copy.apply}
            </LoadingButton>
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
          <span>{copy.subtotal} ({itemCount})</span>
          <span>{formatPrice(zoneTotals.subtotalCents)}</span>
        </div>
        {zoneTotals.discountCents > 0 && (
          <div className="cart-totals-row">
            <span>{copy.discount} ({coupon?.code})</span>
            <span>-{formatPrice(zoneTotals.discountCents)}</span>
          </div>
        )}
        <div className="cart-totals-row">
          <span>{copy.shipping}</span>
          {hasCountry ? (
            <span>
              {zoneTotals.shippingCents === 0
                ? copy.free
                : formatPrice(zoneTotals.shippingCents)}
            </span>
          ) : (
            <span className="cart-totals-muted">{copy.chooseCountry}</span>
          )}
        </div>
        <div className="cart-totals-row cart-totals-total">
          <span>{copy.total}</span>
          {hasCountry ? (
            <span>{formatPrice(zoneTotals.totalCents)}</span>
          ) : (
            <span className="cart-totals-muted">{copy.chooseCountry}</span>
          )}
        </div>
      </div>
      <Link to="/cart" className="cart-view-link">
        {copy.editCart}
      </Link>
    </Reveal>
  )
}
