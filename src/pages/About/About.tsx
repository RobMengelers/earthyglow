import { Link } from 'react-router-dom'
import { aboutImage } from '../../data/products'
import { Reveal } from '../../components/ui/Reveal'

const philosophy = [
  {
    title: 'Pure ingredients',
    text: 'I use 100% soy wax for my candles.',
  },
  {
    title: 'Honest craftsmanship',
    text: 'I pour in small batches and finish each candle by hand.',
  },
  {
    title: 'Nature based designs',
    text: 'Flowers, shells and earthy colours inspire my collections.',
  },
  {
    title: 'Soft, warm ambiance',
    text: 'A little candlelight for the moments you take for yourself.',
  },
  {
    title: 'Enjoy it again',
    text: 'If your candle comes in a jar, clean it once finished and give it a new use.',
  },
] as const

export function About() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Reveal>
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Our Story</span>
            </nav>
            <p className="eyebrow">About EarthyGlow</p>
            <h1>Warmth, made by hand</h1>
            <p className="section-lede">
              I’m Naomi, the founder and maker behind EarthyGlow. Thank you for
              stopping by my little candle shop.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="about about-story">
        <div className="container about-grid">
          <Reveal className="about-visual">
            <img src={aboutImage} alt="EarthyGlow candles and natural materials" loading="lazy" />
          </Reveal>
          <Reveal delay={100} className="about-copy">
            <p className="eyebrow">My story</p>
            <h2>A little comfort, made by hand</h2>
            <p>
              Working in social care has taught me to appreciate the small things
              that help us feel at ease. I wanted to make candles that brought
              that same comfort into a home.
            </p>
            <p>
              That’s where EarthyGlow began. I make each candle by hand in the
              Netherlands, taking inspiration from flowers, natural textures
              and the changing seasons.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="philosophy">
        <div className="container">
          <Reveal className="section-head">
            <p className="eyebrow">What matters to me</p>
            <h2>How I make my candles</h2>
          </Reveal>
          <div className="philosophy-grid">
            {philosophy.map((item, i) => (
              <Reveal key={item.title} delay={i * 80} className="philosophy-card">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="quote">
        <div className="container">
          <Reveal className="quote-inner">
            <p className="eyebrow">A note from Naomi</p>
            <blockquote>
              I hope you enjoy having these candles in your home as much as I
              enjoy making them. Whether you choose one for yourself or as a
              gift, it means a lot to have your support.
            </blockquote>
            <p className="quote-thanks">
              With warmth, Naomi
            </p>
            <Link to="/shop" className="btn btn-primary">
              Shop the collection
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}