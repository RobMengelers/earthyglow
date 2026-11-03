import { Reveal } from '../../../components/ui/Reveal'
import { SocialLinks } from '../../../components/ui/SocialLinks'
import { defineCopy, useCopy } from '../../../i18n'

const newsletterCopy = defineCopy({
  en: {
    eyebrow: 'Stay cosy, stay in the loop',
    title: 'A little winter inspiration',
    body: 'Follow me on Instagram and TikTok for winter candles, cosy gift ideas and little glimpses of what I\'m making. I\'d love to see how you style your EarthyGlow candles on these longer evenings, too.',
  },
  nl: {
    eyebrow: 'Blijf knus, blijf op de hoogte',
    title: 'Een beetje winterinspiratie',
    body: 'Volg me op Instagram en TikTok voor winterkaarsen, knusse cadeau-ideeën en een kijkje in wat ik aan het maken ben. Ik vind het ook leuk om te zien hoe jij je EarthyGlow-kaarsen neerzet op deze lange avonden.',
  },
  de: {
    eyebrow: 'Bleib gemütlich, bleib auf dem Laufenden',
    title: 'Ein bisschen Winterinspiration',
    body: 'Folge mir auf Instagram und TikTok für Winterkerzen, gemütliche Geschenkideen und kleine Einblicke in das, was ich gerade mache. Ich freue mich auch zu sehen, wie du deine EarthyGlow Kerzen an diesen langen Abenden in Szene setzt.',
  },
})

export function Newsletter() {
  const copy = useCopy(newsletterCopy)
  return (
    <section className="newsletter" id="contact">
      <div className="container">
        <Reveal className="newsletter-inner">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2>{copy.title}</h2>
          <p>{copy.body}</p>
          <SocialLinks className="newsletter-socials" />
        </Reveal>
      </div>
    </section>
  )
}