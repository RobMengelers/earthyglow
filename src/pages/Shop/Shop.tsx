import { useEffect, useRef } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { getCollection } from '../../data/products'
import { filterProducts, getSeason, seasons } from '../../data/seasons'
import { ProductCard } from '../../components/catalog/ProductCard'
import { Reveal } from '../../components/ui/Reveal'
import { JsonLd } from '../../components/seo/JsonLd'
import { breadcrumbLd, siteMeta, absoluteUrl } from '../../lib/seo'
import type { Route } from './+types/Shop'

export function meta({ params }: Route.MetaArgs) {
  const collection = getCollection(params.collectionId)
  return siteMeta({
    title: collection
      ? `${collection.title} · Shop · EarthyGlow`
      : 'Shop · Hand-poured Soy Candles · EarthyGlow',
    description:
      collection?.blurb ??
      'Browse hand-poured soy wax candles from EarthyGlow: flower candle gifts, seasonal scents and sculptural shapes, made by hand in the Netherlands.',
    path: collection ? `/shop/${collection.id}` : '/shop',
  })
}

export function Shop() {
  const { collectionId } = useParams()
  const [params] = useSearchParams()
  const activeCollection = getCollection(collectionId)
  const activeSeason = getSeason(params.get('season'))
  const seasonNavRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const nav = seasonNavRef.current
    const selected = nav?.querySelector<HTMLElement>('.is-active')
    if (nav && selected) {
      nav.scrollTo({ left: Math.max(0, selected.offsetLeft - (nav.clientWidth - selected.offsetWidth) / 2) })
    }
  }, [activeSeason?.id])
  const shown = filterProducts(activeSeason?.id, activeCollection?.id)
  const heading = activeSeason
    ? `${activeSeason.label} favourites`
    : activeCollection?.title ?? 'Find your next little glow'
  const lede = activeSeason?.description ?? activeCollection?.blurb ??
    'Browse by season, or take a look at everything I’ve been making.'

  function filterUrl(seasonId?: string, glowId?: string) {
    const path = glowId ? `/shop/${glowId}` : '/shop'
    return seasonId ? `${path}?season=${seasonId}` : path
  }

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    ...(activeSeason || activeCollection
      ? [{ name: (activeSeason?.label ?? activeCollection?.eyebrow) as string }]
      : []),
  ]

  return (
    <>
      <JsonLd data={breadcrumbLd(breadcrumbs)} />
      {shown.length > 0 && (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: shown.map((product, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: product.name,
              url: absoluteUrl(`/product/${product.id}`),
            })),
          }}
        />
      )}
      <section className="page-hero shop-hero">
        <div className="container">
          <Reveal>
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span aria-hidden="true">/</span>
              <Link to="/shop">Shop</Link>
              {(activeSeason || activeCollection) && (
                <>
                  <span aria-hidden="true">/</span>
                  <span aria-current="page">{activeSeason?.label ?? activeCollection?.eyebrow}</span>
                </>
              )}
            </nav>
            <p className="eyebrow">Made by hand, chosen by you</p>
            <h1>{heading}</h1>
            <p className="section-lede">{lede}</p>
          </Reveal>
        </div>
      </section>

      <section className="shop-body">
        <div className="container">
          <div className="shop-filters">
            <p className="shop-filter-caption">A glow for every season</p>
            <nav ref={seasonNavRef} className="season-nav" aria-label="Shop by season">
              {[{ id: '', label: 'All seasons' }, ...seasons].map((season) => {
                const selected = (activeSeason?.id ?? '') === season.id
                const count = filterProducts(season.id || undefined).length
                return (
                  <Link
                    key={season.id}
                    to={filterUrl(season.id || undefined)}
                    className={`season-link${selected ? ' is-active' : ''}`}
                    aria-current={selected ? 'page' : undefined}
                  >
                    <span>{season.label}</span>
                    <span className="season-count" aria-hidden="true">{String(count).padStart(2, '0')}</span>
                  </Link>
                )
              })}
            </nav>

          </div>

          {shown.length > 0 ? (
            <div
              key={`${activeSeason?.id ?? 'all'}:${activeCollection?.id ?? 'all'}`}
              className="product-grid"
            >
              {shown.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          ) : (
            <div className="shop-empty">
              <p className="eyebrow">A different little glow</p>
              <h2>No candles in this combination just yet</h2>
              <p>Explore all the pieces for this season, or browse all seasons.</p>
              <Link className="btn btn-primary" to={filterUrl(activeSeason?.id)}>
                {activeSeason ? `Explore ${activeSeason.label.toLowerCase()}` : 'Explore all products'}
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default Shop
