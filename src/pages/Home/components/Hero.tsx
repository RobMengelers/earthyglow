import { Link } from 'react-router-dom'
import { heroImage } from '../../../data/products'
import { LiquidGlow } from './LiquidGlow'

export function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden="true" />
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Hand-poured in the Netherlands</p>
          <h1>
            <span className="hero-line hero-line-1">Little moments of</span>
            <em className="hero-line hero-line-2">warmth,</em>
            <span className="hero-line hero-line-3">poured by hand</span>
          </h1>
          <p className="lede">
            EarthyGlow blends 100% soy wax, natural botanicals and carefully
            chosen fragrance into candles that feel as beautiful as they burn —
            made to bring peace, not noise, into your home.
          </p>
          <div className="hero-actions">
            <Link to="/shop" className="btn btn-primary">
              Shop the collection
            </Link>
            <Link to="/about" className="btn btn-ghost">
              Our story
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-frame">
            <img src={heroImage} alt="EarthyGlow candles in a warm, cozy setting" />
            <LiquidGlow />
          </div>
        </div>
      </div>
    </section>
  )
}