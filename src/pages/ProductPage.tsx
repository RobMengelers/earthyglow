import { Link, useParams } from 'react-router-dom'
import { getCollection, getProduct, getRelated } from '../data/products'
import { ProductCard } from '../components/ProductCard'
import { Reveal } from '../components/Reveal'
import { useCart } from '../cart/useCart'
import { NotFound } from './NotFound'

const perks = [
  '100% soy wax',
  'Vegan & cruelty-free',
  'Hand-poured in small batches',
  'Paraben- & phthalate-free fragrance',
]

export function ProductPage() {
  const { productId } = useParams()
  const { addItem } = useCart()
  const product = getProduct(productId)

  if (!product) {
    return <NotFound />
  }

  const collection = getCollection(product.collectionId)
  const related = getRelated(product)

  const collectionTitle = collection?.title ?? 'EarthyGlow'

  return (
    <>
      <section className="product-detail">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link to="/shop">Shop</Link>
            {collection && (
              <>
                <span aria-hidden="true">/</span>
                <Link to={`/shop/${collection.id}`}>{collection.eyebrow}</Link>
              </>
            )}
            <span aria-hidden="true">/</span>
            <span aria-current="page">{product.name}</span>
          </nav>

          <div className="product-detail-grid">
            <Reveal className="product-detail-media">
              <div className="product-detail-frame">
                <img src={product.image} alt={product.name} />
                {product.soldOut && (
                  <span className="product-tag sold-out">Sold out</span>
                )}
              </div>
            </Reveal>

            <Reveal delay={100} className="product-detail-info">
              {collection && (
                <Link
                  to={`/shop/${collection.id}`}
                  className="eyebrow product-detail-collection"
                >
                  {collection.eyebrow}
                </Link>
              )}
              <h1>{product.name}</h1>
              <p className="product-detail-price">{product.price}</p>
              <p className="product-detail-desc">{product.description}</p>

              <ul className="product-detail-perks">
                {perks.map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>

              {product.soldOut ? (
                <div className="product-detail-actions">
                  <button type="button" className="btn btn-primary" disabled>
                    Temporarily sold out
                  </button>
                  <p className="product-detail-note">
                    This collection will return once everything is hand-poured
                    again — sign up via the shop to be the first to know.
                  </p>
                </div>
              ) : (
                <div className="product-detail-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => addItem(product, collectionTitle)}
                  >
                    Add to cart
                  </button>
                  <Link to="/contact" className="btn btn-ghost">
                    Ask a question
                  </Link>
                </div>
              )}

              <div className="product-detail-meta">
                <p>
                  <strong>Shipping:</strong> shipped from the Netherlands
                </p>
                <p>
                  <strong>Made:</strong> hand-poured in small batches
                </p>
                <p>
                  <strong>Sustainable:</strong> wooden wick, reusable glass
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="related">
          <div className="container">
            <Reveal className="section-head">
              <p className="eyebrow">Explore more</p>
              <h2>{collection ? 'More from this collection' : 'You may also like'}</h2>
            </Reveal>
            <div className="product-grid">
              {related.map((item, i) => (
                <ProductCard key={item.id} product={item} index={i} />
              ))}
            </div>
            <Reveal className="featured-cta">
              <Link to="/shop" className="btn btn-ghost">
                Shop everything
              </Link>
            </Reveal>
          </div>
        </section>
      )}
    </>
  )
}