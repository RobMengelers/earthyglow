import { Link } from 'react-router-dom'
import { Hero } from './components/Hero'
import { Divider } from '../../components/ui/Divider'
import { CollectionCard } from '../../components/catalog/CollectionCard'
import { AboutTeaser } from './components/AboutTeaser'
import { CareTeaser } from './components/CareTeaser'
import { Newsletter } from './components/Newsletter'
import { Reveal } from '../../components/ui/Reveal'
import { collections} from '../../data/products'

export function Home() {
  return (
    <>
      <Hero />
      <Divider />

      <section className="collections" id="collections">
        <div className="container">
          <Reveal className="section-head">
            <p className="eyebrow">Shop by collection</p>
            <h2>Three ways to glow</h2>
            <p className="section-lede">
              From gift-ready tealights to sculptural statement candles — each
              one hand-poured, and made to be kept long after it burns.
            </p>
          </Reveal>
          <div className="collection-card-grid">
            {collections.map((collection, i) => (
              <CollectionCard key={collection.id} collection={collection} index={i} />
            ))}
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