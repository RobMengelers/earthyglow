import {
  DEFAULT_ZONE,
  formatPrice,
  type ShippingZone,
} from '../CartContext'
import { useCart } from '../useCart'

type ShippingProgressProps = {
  className?: string
  zone?: ShippingZone
}

export function ShippingProgress({ className, zone }: ShippingProgressProps) {
  const { subtotalCents, discountCents, coupon } = useCart()
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
          <strong>Free shipping</strong> with {coupon.code}
        </p>
        <p className="shipping-progress-note">
          No shipping cost on this order
        </p>
      </div>
    )
  }

  return (
    <div className={className ? `shipping-progress ${className}` : 'shipping-progress'}>
      <p className="shipping-progress-text">
        {hasFreeShipping ? (
          <>
            You&rsquo;ve unlocked <strong>free shipping</strong>
          </>
        ) : (
          <>
            <strong>{formatPrice(shippingRemainingCents)}</strong> away from free
            shipping
          </>
        )}
      </p>
      <div
        className="shipping-progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        aria-label="Progress towards free shipping"
      >
        <span
          className="shipping-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="shipping-progress-note">
        {zone
          ? `Free ${activeZone.label === 'Netherlands' ? '' : 'international'} shipping on orders of ${formatPrice(activeZone.freeThresholdCents)} or more`
          : `Free shipping on orders of ${formatPrice(activeZone.freeThresholdCents)} or more`}
      </p>
    </div>
  )
}