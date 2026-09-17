import { Link } from 'react-router-dom'
import type { Product } from '../data/products'
import { getCollection } from '../data/products'
import { Reveal } from './Reveal'

type ProductCardProps = {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const collection = getCollection(product.collectionId)

  return (
    <Reveal delay={(index % 3) * 80} className="product-card-wrap">
      <Link to={`/product/${product.id}`} className="product-card">
        <div className="product-media">
          <img src={product.image} alt={product.name} loading="lazy" />
          {product.soldOut && (
            <span className="product-tag sold-out">Sold out</span>
          )}
        </div>
        <div className="product-body">
          {collection && <span className="product-collection">{collection.title}</span>}
          <h4>{product.name}</h4>
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