import type { CartItem } from '../CartContext'
import { defineCopy, Link, useCopy, useFormatPrice, useLocale } from '../../i18n'
import { optionLabel } from '../../i18n/options'
import { useCart } from '../useCart'
import { imageAttrs, SIZES } from '../../lib/images'

type CartLineProps = {
  item: CartItem
  compact?: boolean
  tabIndex?: number
  onNavigate?: () => void
}

const lineCopy = defineCopy({
  en: {
    remove: 'Remove',
    removeItem: (name: string) => `Remove ${name}`,
    decrease: (name: string) => `Decrease quantity of ${name}`,
    increase: (name: string) => `Increase quantity of ${name}`,
  },
  nl: {
    remove: 'Verwijderen',
    removeItem: (name: string) => `${name} verwijderen`,
    decrease: (name: string) => `Aantal van ${name} verlagen`,
    increase: (name: string) => `Aantal van ${name} verhogen`,
  },
  de: {
    remove: 'Entfernen',
    removeItem: (name: string) => `${name} entfernen`,
    decrease: (name: string) => `Menge von ${name} verringern`,
    increase: (name: string) => `Menge von ${name} erhöhen`,
  },
})

export function CartLine({ item, compact = false, tabIndex, onNavigate }: CartLineProps) {
  const { updateQuantity, removeItem } = useCart()
  const copy = useCopy(lineCopy)
  const locale = useLocale()
  const formatPrice = useFormatPrice()

  return (
    <li className="cart-line">
      <Link
        to={`/product/${item.productId}`}
        className="cart-line-media"
        prefetch="intent"
        tabIndex={tabIndex}
        onClick={onNavigate}
      >
        {item.image && (
          <img {...imageAttrs(item.image, SIZES.thumb)} alt={item.name} loading="lazy" />
        )}
      </Link>
      <div className="cart-line-body">
        <div className="cart-line-top">
          <Link
            to={`/product/${item.productId}`}
            className="cart-line-name"
            prefetch="intent"
            tabIndex={tabIndex}
            onClick={onNavigate}
          >
            {item.name}
            {item.variantLabel && <small className="cart-line-variant">{optionLabel(item.variantLabel, locale)}</small>}
            {item.colorLabel && <small className="cart-line-variant">{optionLabel(item.colorLabel, locale)}</small>}
          </Link>
          <button
            type="button"
            className="cart-line-remove"
            aria-label={copy.removeItem(item.name)}
            tabIndex={tabIndex}
            onClick={() => removeItem(item.id)}
          >
            {compact ? '\u00d7' : copy.remove}
          </button>
        </div>
        <p className="cart-line-collection">{item.collectionTitle}</p>
        <div className="cart-line-bottom">
          <div className="qty-stepper">
            <button
              type="button"
              aria-label={copy.decrease(item.name)}
              tabIndex={tabIndex}
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
            >
              &minus;
            </button>
            <span aria-live="polite">{item.quantity}</span>
            <button
              type="button"
              aria-label={copy.increase(item.name)}
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
