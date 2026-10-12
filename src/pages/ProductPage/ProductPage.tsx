import { Link, useParams } from 'react-router'
import { useState } from 'react'
import { getCollection, getProduct, getRelated } from '../../data/products'
import { ProductCard } from '../../components/catalog/ProductCard'
import { Reveal } from '../../components/ui/Reveal'
import { useCart } from '../../cart/useCart'
import { formatPrice } from '../../cart/CartContext'
import { NotFound } from '../NotFound/NotFound'
import { seasonForProduct } from '../../data/seasons'
import { JsonLd } from '../../components/seo/JsonLd'
import { imageAttrs, SIZES } from '../../lib/images'
import { SITE_URL, absoluteUrl, breadcrumbLd, siteMeta } from '../../lib/seo'
import type { Route } from './+types/ProductPage'

const perks = [
  '100% soy wax',
  'Vegan & cruelty-free',
  'Mica powder for colour',
  'Hand-poured in small batches',
  'Paraben-free & Phthalates-free', 
]

// Unknown products must fail with a real HTTP 404, not an in-page fallback.
export function loader({ params }: Route.LoaderArgs) {
  if (!getProduct(params.productId)) {
    throw new Response('Not Found', { status: 404 })
  }
  return null
}

export function meta({ params }: Route.MetaArgs) {
  const product = getProduct(params.productId)
  if (!product) {
    return siteMeta({ title: 'Product not found · EarthyGlow', robots: 'noindex' })
  }
  return siteMeta({
    title: `${product.name} · EarthyGlow`,
    description: product.description,
    path: `/product/${product.id}`,
    image: product.image,
    type: 'product',
  })
}

export function ProductPage() {
  const { productId } = useParams()
  const { addItem } = useCart()
  const product = getProduct(productId)
  const [variantId, setVariantId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [galleryIndex, setGalleryIndex] = useState(0)

  if (!product) {
    return <NotFound />
  }

  const collection = getCollection(product.collectionId)
  const related = getRelated(product)

  const collectionTitle = collection?.title ?? 'EarthyGlow'
  const season = seasonForProduct(product.id)
  const selectedVariant = product.variants?.find((variant) => variant.id === variantId)

  const baseGallery = product.images?.length ? product.images : [product.image]
  const variantImage = selectedVariant?.image
  const galleryImages = variantImage
    ? [variantImage, ...baseGallery.filter((img) => img !== variantImage)]
    : baseGallery

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.description,
          image: absoluteUrl(product.image),
          sku: product.id,
          brand: { '@type': 'Brand', name: 'EarthyGlow' },
          offers: {
            '@type': 'Offer',
            url: `${SITE_URL}/product/${product.id}`,
            priceCurrency: 'EUR',
            price: (product.priceCents / 100).toFixed(2),
            availability: product.soldOut
              ? 'https://schema.org/OutOfStock'
              : 'https://schema.org/InStock',
            itemCondition: 'https://schema.org/NewCondition',
          },
        }}
      />
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Shop', path: '/shop' },
          { name: product.name },
        ])}
      />
      <section className="product-detail">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link to="/shop">Shop</Link>
            {collection && (
              <>
                <span aria-hidden="true">/</span>
                <Link to={season ? `/shop?season=${season.id}` : '/shop'}>{season?.label ?? collection.eyebrow}</Link>
              </>
            )}
            <span aria-hidden="true">/</span>
            <span aria-current="page">{product.name}</span>
          </nav>

          <div className="product-detail-grid">
            <Reveal className="product-detail-media">
              <div className="product-gallery">
                <div className="product-gallery-main">
                  <div className="product-gallery-track" style={{ transform: `translateX(-${galleryIndex * 100}%)` }}>
                    {galleryImages.map((image) => (
                      <img key={image} {...imageAttrs(image, SIZES.gallery)} alt={product.name} />
                    ))}
                  </div>
                  {galleryImages.length > 1 && (
                    <>
                      <button type="button" className="product-gallery-arrow product-gallery-prev" onClick={() => setGalleryIndex((index) => (index - 1 + galleryImages.length) % galleryImages.length)} aria-label="Previous product image">‹</button>
                      <button type="button" className="product-gallery-arrow product-gallery-next" onClick={() => setGalleryIndex((index) => (index + 1) % galleryImages.length)} aria-label="Next product image">›</button>
                      <span className="product-gallery-count" aria-live="polite">{galleryIndex + 1} / {galleryImages.length}</span>
                    </>
                  )}
                  {product.soldOut && (
                    <span className="product-tag sold-out">Sold out</span>
                  )}
                </div>
                {galleryImages.length > 1 && (
                  <div className="product-gallery-thumbs">
                    {galleryImages.map((img, idx) => (
                      <button
                        key={img}
                        type="button"
                        className={`product-gallery-thumb${galleryIndex === idx ? ' is-active' : ''}`}
                        onClick={() => setGalleryIndex(idx)}
                        aria-label={`Show image ${idx + 1}`}
                      >
                        <img {...imageAttrs(img, '64px')} alt="" loading="lazy" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Reveal>

            <Reveal delay={100} className="product-detail-info">
              {collection && (
                <Link
                  to={season ? `/shop?season=${season.id}` : '/shop'}
                  className="eyebrow product-detail-collection"
                >
                  {season?.label ?? collection.eyebrow}
                </Link>
              )}
              <h1>{product.name}</h1>
              <p className="product-detail-price">{selectedVariant?.priceCents ? formatPrice(selectedVariant.priceCents) : product.price}</p>
              <p className="product-detail-desc">{product.description}</p>

              {product.variants && (
                <fieldset className="product-options">
                  <legend>Choose your {product.variantLabel ?? (product.variants.some((variant) => variant.swatch) ? 'colour' : 'shape')}</legend>
                  <div className="product-option-list">
                    {product.variants.map((variant) => (
                      <label key={variant.id} className={`product-option${variantId === variant.id ? ' is-selected' : ''}`}>
                        <input type="radio" name="product-variant" value={variant.id} checked={variantId === variant.id} onChange={() => { setVariantId(variant.id); setGalleryIndex(0) }} />
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
                    Currently sold out
                  </button>
                  <p className="product-detail-note">
                    This candle is currently unavailable. <Link to="/contact">Send me a note</Link>{' '}
                    if you’d like to ask about it.
                  </p>
                </div>
              ) : (
                <div className="product-detail-actions">
                  <div className="product-quantity-control">
                    <div className="qty-stepper product-quantity" aria-label="Quantity">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                      >
                        &minus;
                      </button>
                      <span aria-live="polite">{quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => setQuantity((current) => current + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => addItem(product, collectionTitle, quantity, selectedVariant)}
                    disabled={Boolean(product.variants && !selectedVariant)}
                  >
                    {product.variants && !selectedVariant ? 'Choose an option' : 'Add to cart'}
                  </button>
                </div>
              )}

              <div className="product-detail-meta">
                <p>Made by hand, small differences in colour and finish are part of each candle.</p>
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

export default ProductPage
