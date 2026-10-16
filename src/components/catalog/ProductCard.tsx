import { Link } from 'react-router'
import type { Product } from '../../data/products'
import { getCollection } from '../../data/products'
import { imageAttrs, SIZES } from '../../lib/images'
import { Reveal } from '../ui/Reveal'

type ProductCardProps = {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const collection = getCollection(product.collectionId)

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
            <span className="product-tag sold-out">Sold out</span>
          )}
        </div>
        <div className="product-body">
          {collection && <span className="product-collection">{collection.title}</span>}
          <h3>{product.name}</h3>
          <span className="product-price">{product.price}</span>
        </div>
        <span className="product-cta">
          View product
          <span aria-hidden="true">→</span>
        </span>
      </Link>
    </Reveal>
  )
}