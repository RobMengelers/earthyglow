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
  const { subtotalCents } = useCart()
  const activeZone = zone ?? DEFAULT_ZONE
  const hasFreeShipping = subtotalCents >= activeZone.freeThresholdCents
  const shippingRemainingCents = Math.max(
    activeZone.freeThresholdCents - subtotalCents,
    0,
  )
  const progress = Math.min(
    (subtotalCents / activeZone.freeThresholdCents) * 100,
    100,
  )

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