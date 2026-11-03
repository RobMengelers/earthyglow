import { heroImage } from '../../../data/products'
import { defineCopy, Link, useCopy } from '../../../i18n'
import { imageAttrs, SIZES } from '../../../lib/images'
import { LiquidGlow } from './LiquidGlow'

const heroCopy = defineCopy({
  en: {
    eyebrow: 'A little glow for winter days',
    line1: 'Cold days, cosy',
    line2: 'evenings,',
    line3: 'a little candlelight',
    lede: 'I’m Naomi, the maker behind EarthyGlow. This winter, I’m bringing a little warmth to frosty days with hand-poured soy wax candles. Made for blanket-wrapped evenings, festive tables and gifts from the heart.',
    winter: 'Shop the winter collection',
    story: 'Our story',
    imageAlt: 'EarthyGlow Christmas candles, festive floral gift box and wax melts in a warm, candlelit setting',
  },
  nl: {
    eyebrow: 'Een beetje gloed voor winterse dagen',
    line1: 'Koude dagen, knusse',
    line2: 'avonden,',
    line3: 'een beetje kaarslicht',
    lede: 'Ik ben Naomi, de maker achter EarthyGlow. Deze winter breng ik een beetje warmte in vriesdagen met handgegoten sojawaskaarsen. Gemaakt voor avonden onder een dekentje, feestelijke tafels en cadeaus uit het hart.',
    winter: 'Shop de wintercollectie',
    story: 'Ons verhaal',
    imageAlt: 'EarthyGlow-kerstkaarsen, een feestelijke bloemencadeaudoos en wax melts in een warme sfeer met kaarslicht',
  },
  de: {
    eyebrow: 'Ein kleiner Glanz für Wintertage',
    line1: 'Kalte Tage, gemütliche',
    line2: 'Abende,',
    line3: 'ein wenig Kerzenlicht',
    lede: 'Ich bin Naomi, die Macherin hinter EarthyGlow. Diesen Winter bringe ich mit handgegossenen Sojawachskerzen ein bisschen Wärme in frostige Tage. Gemacht für Abende unter der Decke, festliche Tafeln und Geschenke von Herzen.',
    winter: 'Zur Winterkollektion',
    story: 'Unsere Geschichte',
    imageAlt: 'EarthyGlow Weihnachtskerzen, eine festliche Blumen-Geschenkbox und Wax Melts in warmem Kerzenlicht',
  },
})

export function Hero() {
  const copy = useCopy(heroCopy)
  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden="true" />
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>
            <span className="hero-line hero-line-1">{copy.line1}</span>
            <em className="hero-line hero-line-2">{copy.line2}</em>
            <span className="hero-line hero-line-3">{copy.line3}</span>
          </h1>
          <p className="lede">{copy.lede}</p>
          <div className="hero-actions">
            <Link to="/shop?season=winter" className="btn btn-winter" prefetch="intent">
              <span className="winter-snowflakes" aria-hidden="true">
                {[0, 1, 2, 3, 4, 5].map((flake) => (
                  <svg key={flake} className="winter-snowflake" viewBox="0 0 24 24" fill="none" focusable="false">
                    <path d="M12 2v20M3.34 7l17.32 10M3.34 17L20.66 7M9 4l3 3 3-3M9 20l3-3 3 3M3.57 10.6l4.1-1.1-1.1-4.1M17.43 18.6l-1.1-4.1 4.1-1.1M6.57 18.6l1.1-4.1-4.1-1.1M20.43 10.6l-4.1-1.1 1.1-4.1" />
                  </svg>
                ))}
              </span>
              {copy.winter}
            </Link>
            <Link to="/about" className="btn btn-ghost" prefetch="intent">
              {copy.story}
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-frame">
            <img
              {...imageAttrs(heroImage, SIZES.hero)}
              alt={copy.imageAlt}
              fetchPriority="high"
            />
            <LiquidGlow />
          </div>
        </div>
      </div>
    </section>
  )
}
