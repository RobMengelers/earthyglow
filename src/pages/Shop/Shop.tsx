import { Link, useParams } from 'react-router-dom'
import { collections, products, getCollection } from '../../data/products'
import { ProductCard } from '../../components/catalog/ProductCard'
import { Reveal } from '../../components/ui/Reveal'

export function Shop() {
  const { collectionId } = useParams()
  const activeCollection = getCollection(collectionId)

  const shown = activeCollection ? activeCollection.products : products
  const heading = activeCollection ? activeCollection.title : 'All products'
  const lede = activeCollection
    ? activeCollection.blurb
    : 'Every candle is hand-poured in small batches using 100% soy wax — pick a collection, or browse them all.'

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Reveal>
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span aria-hidden="true">/</span>
              <Link to="/shop">Shop</Link>
              {activeCollection && (
                <>
                  <span aria-hidden="true">/</span>
                  <span aria-current="page">{activeCollection.eyebrow}</span>
                </>
              )}
            </nav>
            <p className="eyebrow">{activeCollection?.eyebrow ?? 'The collection'}</p>
            <h1>{heading}</h1>
            <p className="section-lede">{lede}</p>
          </Reveal>
        </div>
      </section>

      <section className="shop-body">
        <div className="container">
          <Reveal className="filter-bar" aria-label="Collections">
            <Link
              to="/shop"
              className={!activeCollection ? 'filter-chip active' : 'filter-chip'}
            >
              All
            </Link>
            {collections.map((collection) => (
              <Link
                key={collection.id}
                to={`/shop/${collection.id}`}
                className={
                  activeCollection?.id === collection.id
                    ? 'filter-chip active'
                    : 'filter-chip'
                }
              >
                {collection.eyebrow}
              </Link>
            ))}
          </Reveal>

          <div className="shop-count">
            {shown.length} {shown.length === 1 ? 'product' : 'products'}
          </div>

          <div className="product-grid">
            {shown.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}