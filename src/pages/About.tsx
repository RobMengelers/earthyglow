import { Link } from 'react-router-dom'
import { aboutImage } from '../data/products'
import { Reveal } from '../components/Reveal'

const philosophy = [
  {
    title: 'Pure ingredients',
    text: '100% soy wax, no paraffin, no phthalates, no toxins.',
  },
  {
    title: 'Honest craftsmanship',
    text: 'Each candle is hand-poured in small batches, where quality always comes before quantity.',
  },
  {
    title: 'Nature based designs',
    text: 'An aesthetic designed to blend effortlessly into any home.',
  },
  {
    title: 'Soft, warm ambiance',
    text: 'Candles that add peace, not noise.',
  },
  {
    title: 'Sustainable choices',
    text: 'Eco-friendly materials, wooden wicks, reusable jars, and mindful production.',
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
              A candle brand born from a love of slow moments, honest materials
              and the calm that a soft flame brings to a home.
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
            <p className="eyebrow">The philosophy</p>
            <h2>Nature in, noise out</h2>
            <p>
              For years, founder Naomi searched for candles that truly aligned
              with how she wanted her home to feel. Many looked beautiful, but
              often lacked the natural, calming atmosphere she was looking for.
              Working in social care taught her how important it is to slow down,
              create moments of peace, and surround yourself with things that
              bring comfort and joy.
            </p>
            <p>
              EarthyGlow grew from that same mindset — a love for creating
              warmth, beauty, and meaningful moments at home. Nature is her
              greatest source of inspiration: soft floral bouquets, delicate
              botanicals, earthy colours and natural textures.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="philosophy">
        <div className="container">
          <Reveal className="section-head">
            <p className="eyebrow">What we stand for</p>
            <h2>Our philosophy</h2>
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
              My goal is to create candles that are more than just something to
              burn. They are designed to be beautiful decorative pieces that
              elevate your space, while filling your home with carefully chosen
              fragrances that create a cosy and welcoming atmosphere.
            </blockquote>
            <p className="quote-thanks">
              Thank you for supporting a small business and letting EarthyGlow
              become part of your home.
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