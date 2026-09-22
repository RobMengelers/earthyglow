import { Link } from 'react-router-dom'
import { Hero } from './components/Hero'
import { Divider } from '../../components/ui/Divider'
import { AboutTeaser } from './components/AboutTeaser'
import { CareTeaser } from './components/CareTeaser'
import { Newsletter } from './components/Newsletter'
import { Reveal } from '../../components/ui/Reveal'
import { products } from '../../data/products'
import { seasons } from '../../data/seasons'

const featuredSeasons = seasons.filter((season) => season.id !== 'halloween')

export function Home() {
  return (
    <>
      <Hero />
      <Divider />

      <section className="collections" id="collections">
        <div className="container">
          <Reveal className="section-head">
            <p className="eyebrow">Shop by season</p>
            <h2>Find your season</h2>
            <p className="section-lede">
              Flower candles and seasonal scents, all poured by hand.
            </p>
          </Reveal>
          <div className="collection-card-grid">
            {featuredSeasons.map((season, i) => {
              const cover = products.find((product) => season.productIds.includes(product.id))
              return (
                <Reveal key={season.id} delay={i * 90} className="collection-card-wrap">
                  <Link to={`/shop?season=${season.id}`} className="collection-card">
                    <div className="collection-card-media">
                      {cover && <img src={cover.image} alt={season.label} loading="lazy" />}
                      <span className="collection-card-count">{season.productIds.length} products</span>
                    </div>
                    <div className="collection-card-body">
                      <p className="eyebrow">{season.label}</p>
                      <h3>{season.label} candles</h3>
                      <p>{season.description}</p>
                      <span className="product-cta">Explore {season.label}<span aria-hidden="true">→</span></span>
                    </div>
                  </Link>
                </Reveal>
              )
            })}
          </div>
          <Reveal className="featured-cta">
            <Link to="/shop" className="btn btn-ghost">
              Shop everything
            </Link>
          </Reveal>
        </div>
      </section>

      <AboutTeaser />
      <CareTeaser />
      <Newsletter />
    </>
  )
}
