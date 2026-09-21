import { Link } from 'react-router-dom'
import { formatPrice, type CartItem } from '../CartContext'
import { useCart } from '../useCart'

type CartLineProps = {
  item: CartItem
  compact?: boolean
  tabIndex?: number
  onNavigate?: () => void
}

export function CartLine({ item, compact = false, tabIndex, onNavigate }: CartLineProps) {
  const { updateQuantity, removeItem } = useCart()

  return (
    <li className="cart-line">
      <Link
        to={`/product/${item.productId}`}
        className="cart-line-media"
        tabIndex={tabIndex}
        onClick={onNavigate}
      >
        <img src={item.image} alt={item.name} loading="lazy" />
      </Link>
      <div className="cart-line-body">
        <div className="cart-line-top">
          <Link
            to={`/product/${item.productId}`}
            className="cart-line-name"
            tabIndex={tabIndex}
            onClick={onNavigate}
          >
            {item.name}
            {item.variantLabel && <small className="cart-line-variant">{item.variantLabel}</small>}
          </Link>
          <button
            type="button"
            className="cart-line-remove"
            aria-label={`Remove ${item.name}`}
            tabIndex={tabIndex}
            onClick={() => removeItem(item.id)}
          >
            {compact ? '\u00d7' : 'Remove'}
          </button>
        </div>
        <p className="cart-line-collection">{item.collectionTitle}</p>
        <div className="cart-line-bottom">
          <div className="qty-stepper">
            <button
              type="button"
              aria-label={`Decrease quantity of ${item.name}`}
              tabIndex={tabIndex}
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
            >
              &minus;
            </button>
            <span aria-live="polite">{item.quantity}</span>
            <button
              type="button"
              aria-label={`Increase quantity of ${item.name}`}
              tabIndex={tabIndex}
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
            >
              +
            </button>
          </div>
          <span className="cart-line-price">
            {formatPrice(item.priceCents * item.quantity)}
          </span>
        </div>
      </div>
    </li>
  )
}
