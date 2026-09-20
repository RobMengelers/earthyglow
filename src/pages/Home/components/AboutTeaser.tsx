import { Link } from 'react-router-dom'
import { aboutImage } from '../../../data/products'
import { Reveal } from '../../../components/ui/Reveal'

export function AboutTeaser() {
  return (
    <section className="about" id="about">
      <div className="container about-grid">
        <Reveal className="about-visual">
          <img src={aboutImage} alt="EarthyGlow candles and natural materials" loading="lazy" />
        </Reveal>
        <Reveal delay={100} className="about-copy">
          <p className="eyebrow">Our story</p>
          <h2>Made by hand, made for home</h2>
          <p>
            EarthyGlow was born from a love of slow moments and warm spaces.
            Founder Naomi crafts each candle by hand in the Netherlands — using
            eco-friendly materials, wooden wicks and reusable jars, and an
            aesthetic designed to blend effortlessly into any home.
          </p>
          <p>
            Nature is the greatest source of inspiration: soft florals, delicate
            botanicals, earthy colours and natural textures. Every candle is more
            than something to burn — it is a decorative piece that brings a little
            piece of nature indoors.
          </p>
          <ul className="about-list">
            <li>Wooden wicks &amp; reusable jars</li>
            <li>Eco-friendly, mindful production</li>
            <li>Designed to add peace, not noise</li>
          </ul>
          <Link to="/about" className="btn btn-primary">
            Read the full story
          </Link>
        </Reveal>
      </div>
    </section>
  )
}