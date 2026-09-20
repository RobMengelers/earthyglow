import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'
import { getCollection, getProduct, getRelated } from '../../data/products'
import { ProductCard } from '../../components/catalog/ProductCard'
import { Reveal } from '../../components/ui/Reveal'
import { useCart } from '../../cart/useCart'
import { NotFound } from '../NotFound/NotFound'

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
  const [variantId, setVariantId] = useState('')

  if (!product) {
    return <NotFound />
  }

  const collection = getCollection(product.collectionId)
  const related = getRelated(product)

  const collectionTitle = collection?.title ?? 'EarthyGlow'
  const selectedVariant = product.variants?.find((variant) => variant.id === variantId)

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
              <p className="product-detail-price">{selectedVariant?.priceCents ? `€${(selectedVariant.priceCents / 100).toFixed(2).replace('.', ',')}` : product.price}</p>
              <p className="product-detail-desc">{product.description}</p>

              {product.variants && (
                <fieldset className="product-options">
                  <legend>Choose your {product.id === 'floral-box' ? 'colour' : 'shape'}</legend>
                  <div className="product-option-list">
                    {product.variants.map((variant) => (
                      <label key={variant.id} className={`product-option${variantId === variant.id ? ' is-selected' : ''}`}>
                        <input type="radio" name="product-variant" value={variant.id} checked={variantId === variant.id} onChange={() => setVariantId(variant.id)} />
                        <span
                          className={variant.swatch ? 'product-option-swatch' : undefined}
                          style={variant.swatch ? { backgroundColor: variant.swatch } : undefined}
                          title={variant.swatch ? variant.label : undefined}
                        >
                          {variant.swatch && <span className="visually-hidden">{variant.label}</span>}
                          {!variant.swatch && variant.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

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
                    onClick={() => addItem(product, collectionTitle, 1, selectedVariant)}
                    disabled={Boolean(product.variants && !selectedVariant)}
                  >
                    {product.variants && !selectedVariant ? 'Choose an option' : 'Add to cart'}
                  </button>
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
