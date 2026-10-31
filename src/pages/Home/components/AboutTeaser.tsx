import { Link } from 'react-router'
import { aboutImage } from '../../../data/products'
import { imageAttrs, SIZES } from '../../../lib/images'
import { Reveal } from '../../../components/ui/Reveal'

export function AboutTeaser() {
  return (
    <section className="about" id="about">
      <div className="container about-grid">
        <Reveal className="about-visual">
          <img
            {...imageAttrs(aboutImage, SIZES.feature)}
            alt="EarthyGlow candles and natural materials"
            loading="lazy"
          />
        </Reveal>
        <Reveal delay={100} className="about-copy">
          <p className="eyebrow">Our story</p>
          <h2>A little warmth, made by hand</h2>
          <p>
            I’m Naomi, and I make EarthyGlow candles here in the Netherlands.
            My work in social care reminds me how much small moments of comfort
            matter, especially on cold, dark days. Making candles is my way of
            bringing a little warmth and light to winter evenings at home.
          </p>
          <p>
            This season, I’m drawn to frosty woodland walks, warm winter scents
            and the quiet glow of candlelight. I hope you find something for your
            cosiest corner, or a thoughtful gift for someone close to you.
          </p>
          <ul className="about-list">
            <li>100% soy wax</li>
            <li>Poured by hand in small batches</li>
            <li>Shapes and colours inspired by nature</li>
          </ul>
          <Link to="/about" className="btn btn-primary" prefetch="intent">
            Read the full story
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
