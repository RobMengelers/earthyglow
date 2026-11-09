import { DEFAULT_ZONE, type ShippingZone } from '../CartContext'
import { useCart } from '../useCart'
import { defineCopy, useCopy, useFormatPrice } from '../../i18n'

const progressCopy = defineCopy({
  en: {
    free: 'Free shipping',
    withCode: 'with',
    noCost: 'No shipping cost on this order',
    unlocked: 'You’ve unlocked',
    freeShipping: 'free shipping',
    awayFrom: 'away from free shipping',
    progress: 'Progress towards free shipping',
    freeOver: (amount: string) => `Free shipping on orders of ${amount} or more`,
    freeInternationalOver: (amount: string) => `Free international shipping on orders of ${amount} or more`,
  },
  nl: {
    free: 'Gratis verzending',
    withCode: 'met',
    noCost: 'Geen verzendkosten voor deze bestelling',
    unlocked: 'Je hebt',
    freeShipping: 'gratis verzending',
    awayFrom: 'verwijderd van gratis verzending',
    progress: 'Voortgang naar gratis verzending',
    freeOver: (amount: string) => `Gratis verzending bij bestellingen vanaf ${amount}`,
    freeInternationalOver: (amount: string) => `Gratis internationale verzending bij bestellingen vanaf ${amount}`,
  },
  de: {
    free: 'Kostenloser Versand',
    withCode: 'mit',
    noCost: 'Keine Versandkosten für diese Bestellung',
    unlocked: 'Du erhältst',
    freeShipping: 'kostenlosen Versand',
    awayFrom: 'bis zum kostenlosen Versand',
    progress: 'Fortschritt bis zum kostenlosen Versand',
    freeOver: (amount: string) => `Kostenloser Versand ab einem Bestellwert von ${amount}`,
    freeInternationalOver: (amount: string) => `Kostenloser internationaler Versand ab einem Bestellwert von ${amount}`,
  },
})

type ShippingProgressProps = {
  className?: string
  zone?: ShippingZone
}

export function ShippingProgress({ className, zone }: ShippingProgressProps) {
  const { subtotalCents, discountCents, coupon } = useCart()
  const copy = useCopy(progressCopy)
  const formatPrice = useFormatPrice()
  const activeZone = zone ?? DEFAULT_ZONE
  const freeShippingByCoupon = coupon?.type === 'free_shipping'
  // The threshold is judged on what the customer pays for the products, so a
  // percentage code that drops the order below the threshold still costs
  // shipping.
  const shippingBaseCents = Math.max(0, subtotalCents - discountCents)
  const hasFreeShipping = shippingBaseCents >= activeZone.freeThresholdCents
  const shippingRemainingCents = Math.max(
    activeZone.freeThresholdCents - shippingBaseCents,
    0,
  )
  const progress = Math.min(
    (shippingBaseCents / activeZone.freeThresholdCents) * 100,
    100,
  )

  if (freeShippingByCoupon) {
    // The coupon already covers the shipping, so the progress towards the
    // free-shipping threshold would only confuse.
    return (
      <div className={className ? `shipping-progress ${className}` : 'shipping-progress'}>
        <p className="shipping-progress-text">
          <strong>{copy.free}</strong> {copy.withCode} {coupon.code}
        </p>
        <p className="shipping-progress-note">{copy.noCost}</p>
      </div>
    )
  }

  return (
    <div className={className ? `shipping-progress ${className}` : 'shipping-progress'}>
      <p className="shipping-progress-text">
        {hasFreeShipping ? (
          <>
            {copy.unlocked} <strong>{copy.freeShipping}</strong>
          </>
        ) : (
          <>
            <strong>{formatPrice(shippingRemainingCents)}</strong> {copy.awayFrom}
          </>
        )}
      </p>
      <div
        className="shipping-progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        aria-label={copy.progress}
      >
        <span
          className="shipping-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="shipping-progress-note">
        {zone && activeZone.label !== 'Netherlands'
          ? copy.freeInternationalOver(formatPrice(activeZone.freeThresholdCents))
          : copy.freeOver(formatPrice(activeZone.freeThresholdCents))}
      </p>
    </div>
  )
}