import { Reveal } from '../../../components/ui/Reveal'

export function Newsletter() {
  return (
    <section className="newsletter" id="contact">
      <div className="container">
        <Reveal className="newsletter-inner">
          <p className="eyebrow">Stay in the loop</p>
          <h2>New collections, first</h2>
          <p>
            Join the EarthyGlow list for early access to limited collections —
            like the Halloween drop on September 20th — plus care tips and cozy
            updates. No spam, ever.
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