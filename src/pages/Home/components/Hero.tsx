import { Link } from 'react-router'
import { heroImage } from '../../../data/products'
import { imageAttrs, SIZES } from '../../../lib/images'
import { LiquidGlow } from './LiquidGlow'

export function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden="true" />
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">A little glow for winter days</p>
          <h1>
            <span className="hero-line hero-line-1">Cold days, cosy</span>
            <em className="hero-line hero-line-2">evenings,</em>
            <span className="hero-line hero-line-3">a little candlelight</span>
          </h1>
          <p className="lede">
            I’m Naomi, the maker behind EarthyGlow. This winter, I’m bringing
            a little warmth to frosty days with hand-poured soy wax candles.
            Made for blanket-wrapped evenings, festive tables and gifts from the heart.
          </p>
          <div className="hero-actions">
            <Link to="/shop?season=winter" className="btn btn-winter" prefetch="intent">
              <span className="winter-snowflakes" aria-hidden="true">
                {[0, 1, 2, 3, 4, 5].map((flake) => (
                  <svg key={flake} className="winter-snowflake" viewBox="0 0 24 24" fill="none" focusable="false">
                    <path d="M12 2v20M3.34 7l17.32 10M3.34 17L20.66 7M9 4l3 3 3-3M9 20l3-3 3 3M3.57 10.6l4.1-1.1-1.1-4.1M17.43 18.6l-1.1-4.1 4.1-1.1M6.57 18.6l1.1-4.1-4.1-1.1M20.43 10.6l-4.1-1.1 1.1-4.1" />
                  </svg>
                ))}
              </span>
              Shop the winter collection
            </Link>
            <Link to="/about" className="btn btn-ghost" prefetch="intent">
              Our story
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-frame">
            <img
              {...imageAttrs(heroImage, SIZES.hero)}
              alt="EarthyGlow Christmas candles, festive floral gift box and wax melts in a warm, candlelit setting"
              fetchPriority="high"
            />
            <LiquidGlow />
          </div>
        </div>
      </div>
    </section>
  )
}
