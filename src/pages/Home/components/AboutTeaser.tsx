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
            I’m Naomi, and I make EarthyGlow candles here in the Netherlands.
            My work in social care reminds me how much small moments of comfort
            matter. Making candles is another way I bring that feeling home.
          </p>
          <p>
            Flowers, shells and earthy colours inspire what I make. I hope you
            find something here that feels at home with you, or makes a thoughtful
            gift for someone close to you.
          </p>
          <ul className="about-list">
            <li>100% soy wax</li>
            <li>Poured by hand in small batches</li>
            <li>Shapes and colours inspired by nature</li>
          </ul>
          <Link to="/about" className="btn btn-primary">
            Read the full story
          </Link>
        </Reveal>
      </div>
    </section>
  )
}