import { Reveal } from '../../../components/ui/Reveal'

export function Newsletter() {
  return (
    <section className="newsletter" id="contact">
      <div className="container">
        <Reveal className="newsletter-inner">
          <p className="eyebrow">Stay in the loop</p>
          <h2>Come behind the scenes</h2>
          <p>
            Follow me on Instagram for new candles, seasonal collections and
            little glimpses of what I’m making. I’d love to see how you style
            your EarthyGlow candles, too.
          </p>
          <a
            href="https://www.instagram.com/earthyglowcandles"
            target="_blank"
            rel="noreferrer"
            className="btn btn-light"
          >
            Follow along on Instagram
          </a>
        </Reveal>
      </div>
    </section>
  )
}