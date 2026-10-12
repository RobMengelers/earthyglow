import { Reveal } from '../../../components/ui/Reveal'
import { SocialLinks } from '../../../components/ui/SocialLinks'

export function Newsletter() {
  return (
    <section className="newsletter" id="contact">
      <div className="container">
        <Reveal className="newsletter-inner">
          <p className="eyebrow">Stay in the loop</p>
          <h2>Come behind the scenes</h2>
          <p>
            Follow me on Instagram and TikTok for new candles, seasonal collections and
            little glimpses of what I'm making. I'd love to see how you style
            your EarthyGlow candles, too.
          </p>
          <SocialLinks className="newsletter-socials" />
        </Reveal>
      </div>
    </section>
  )
}