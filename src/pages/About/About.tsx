import { Link } from 'react-router'
import { aboutImage } from '../../data/products'
import { imageAttrs, SIZES } from '../../lib/images'
import { Reveal } from '../../components/ui/Reveal'
import { Divider } from '../../components/ui/Divider'
import { JsonLd } from '../../components/seo/JsonLd'
import { breadcrumbLd, siteMeta } from '../../lib/seo'

export function meta() {
  return siteMeta({
    title: 'About · EarthyGlow',
    description:
      'Meet Naomi, the maker behind EarthyGlow: hand-poured soy wax candles inspired by flowers, natural textures and the changing seasons.',
    path: '/about',
  })
}

export function About() {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Our Story' },
        ])}
      />
      <section className="page-hero">
        <div className="container">
          <Reveal>
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link to="/" prefetch="intent">Home</Link>
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

      <Divider white />

      <section className="about about-story">
        <div className="container about-grid">
          <Reveal className="about-visual">
            <img
              {...imageAttrs(aboutImage, SIZES.feature)}
              alt="EarthyGlow candles and natural materials"
              loading="lazy"
            />
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

      <section className="note">
        <div className="container">
          <Reveal className="note-card">
            <span className="note-mark" aria-hidden="true">&ldquo;</span>
            <p className="eyebrow note-eyebrow">A note from Naomi</p>
            <blockquote className="note-message">
              I hope you enjoy having these candles in your home as much as I
              enjoy making them. Whether you choose one for yourself or as a
              gift, it means a lot to have your support.
            </blockquote>
            <figure className="note-signoff">
              <span className="note-seal" aria-hidden="true">N</span>
              <figcaption>
                <span className="note-signature">Naomi</span>
                <span className="note-role">Founder &amp; maker, EarthyGlow</span>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>
    </>
  )
}

export default About