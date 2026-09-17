import { Link } from 'react-router-dom'
import type { Collection } from '../data/products'
import { Reveal } from './Reveal'

type CollectionCardProps = {
  collection: Collection
  index?: number
}

export function CollectionCard({ collection, index = 0 }: CollectionCardProps) {
  const cover = collection.products[0]
  const count = collection.products.length

  return (
    <Reveal delay={index * 90} className="collection-card-wrap">
      <Link to={`/shop/${collection.id}`} className="collection-card">
        <div className="collection-card-media">
          <img src={cover.image} alt={collection.title} loading="lazy" />
          <span className="collection-card-count">
            {count} {count === 1 ? 'product' : 'products'}
          </span>
        </div>
        <div className="collection-card-body">
          <p className="eyebrow">{collection.eyebrow}</p>
          <h3>{collection.title}</h3>
          <p>{collection.blurb}</p>
          <span className="product-cta">
            Shop the collection
            <span aria-hidden="true">→</span>
          </span>
        </div>
      </Link>
    </Reveal>
  )
}