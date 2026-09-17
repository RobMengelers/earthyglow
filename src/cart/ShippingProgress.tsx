import {
  FREE_SHIPPING_THRESHOLD_CENTS,
  formatPrice,
} from './CartContext'
import { useCart } from './useCart'

export function ShippingProgress({ className }: { className?: string }) {
  const { subtotalCents, shippingRemainingCents, hasFreeShipping } = useCart()
  const progress = Math.min(
    (subtotalCents / FREE_SHIPPING_THRESHOLD_CENTS) * 100,
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
        Free shipping on orders over {formatPrice(FREE_SHIPPING_THRESHOLD_CENTS)}
      </p>
    </div>
  )
}
