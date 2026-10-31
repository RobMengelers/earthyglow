import { Reveal } from '../../../components/ui/Reveal'
import { SocialLinks } from '../../../components/ui/SocialLinks'

export function Newsletter() {
  return (
    <section className="newsletter" id="contact">
      <div className="container">
        <Reveal className="newsletter-inner">
          <p className="eyebrow">Stay cosy, stay in the loop</p>
          <h2>A little winter inspiration</h2>
          <p>
            Follow me on Instagram and TikTok for winter candles, cosy gift ideas and
            little glimpses of what I'm making. I'd love to see how you style
            your EarthyGlow candles on these longer evenings, too.
          </p>
          <SocialLinks className="newsletter-socials" />
        </Reveal>
      </div>
    </section>
  )
}