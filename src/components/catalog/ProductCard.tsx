import type { Product } from '../../data/products'
import { defineCopy, Link, useCopy, useLocale } from '../../i18n'
import { getCollection, productPriceLabel } from '../../data/products'
import { imageAttrs, SIZES } from '../../lib/images'
import { Reveal } from '../ui/Reveal'

type ProductCardProps = {
  product: Product
  index?: number
}

const cardCopy = defineCopy({
  en: { soldOut: 'Sold out', view: 'View product' },
  nl: { soldOut: 'Uitverkocht', view: 'Bekijk product' },
  de: { soldOut: 'Ausverkauft', view: 'Produkt ansehen' },
})

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const collection = getCollection(product.collectionId)
  const locale = useLocale()
  const copy = useCopy(cardCopy)

  return (
    <Reveal delay={(index % 3) * 80} className="product-card-wrap">
      <Link to={`/product/${product.id}`} className="product-card" prefetch="viewport">
        <div className="product-media">
          <img
            {...imageAttrs(product.image, SIZES.card)}
            alt={product.name}
            loading="lazy"
          />
          {product.soldOut && (
            <span className="product-tag sold-out">{copy.soldOut}</span>
          )}
        </div>
        <div className="product-body">
          {collection && <span className="product-collection">{collection.title}</span>}
          <h3>{product.name}</h3>
          <span className="product-price">{productPriceLabel(product, locale)}</span>
        </div>
        <span className="product-cta">
          {copy.view}
          <span aria-hidden="true">→</span>
        </span>
      </Link>
    </Reveal>
  )
}