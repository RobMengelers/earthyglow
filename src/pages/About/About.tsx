import { aboutImage } from '../../data/products'
import { imageAttrs, SIZES } from '../../lib/images'
import { Reveal } from '../../components/ui/Reveal'
import { Divider } from '../../components/ui/Divider'
import { JsonLd } from '../../components/seo/JsonLd'
import { breadcrumbLd, siteMeta } from '../../lib/seo'
import { defineCopy, Link, localeFromParams, useCopy, useLocale } from '../../i18n'
import type { Route } from './+types/About'

const aboutCopy = defineCopy({
  en: {
    metaTitle: 'About · EarthyGlow',
    description: 'Meet Naomi, the maker behind EarthyGlow: hand-poured soy wax candles inspired by flowers, natural textures and the changing seasons.',
    home: 'Home',
    breadcrumb: 'Breadcrumb',
    story: 'Our Story',
    eyebrow: 'About EarthyGlow',
    title: 'Warmth, made by hand',
    lede: 'I’m Naomi, the founder and maker behind EarthyGlow. Thank you for stopping by my little candle shop.',
    imageAlt: 'EarthyGlow candles and natural materials',
    myStory: 'My story',
    storyTitle: 'A little comfort, made by hand',
    p1: 'Working in social care has taught me to appreciate the small things that help us feel at ease. I wanted to make candles that brought that same comfort into a home.',
    p2: 'That’s where EarthyGlow began. I make each candle by hand in the Netherlands, taking inspiration from flowers, natural textures and the changing seasons.',
    noteEyebrow: 'A note from Naomi',
    note: 'I hope you enjoy having these candles in your home as much as I enjoy making them. Whether you choose one for yourself or as a gift, it means a lot to have your support.',
    role: 'Founder & maker, EarthyGlow',
  },
  nl: {
    metaTitle: 'Over ons · EarthyGlow',
    description: 'Maak kennis met Naomi, de maker achter EarthyGlow: handgegoten sojawaskaarsen geïnspireerd op bloemen, natuurlijke texturen en de wisselende seizoenen.',
    home: 'Home',
    breadcrumb: 'Kruimelpad',
    story: 'Ons verhaal',
    eyebrow: 'Over EarthyGlow',
    title: 'Warmte, met de hand gemaakt',
    lede: 'Ik ben Naomi, de oprichter en maker achter EarthyGlow. Fijn dat je even langskomt in mijn kleine kaarsenwinkel.',
    imageAlt: 'EarthyGlow-kaarsen en natuurlijke materialen',
    myStory: 'Mijn verhaal',
    storyTitle: 'Een beetje troost, met de hand gemaakt',
    p1: 'Door mijn werk in de zorg heb ik de kleine dingen leren waarderen die ons op ons gemak laten voelen. Ik wilde kaarsen maken die datzelfde gevoel van troost in huis brengen.',
    p2: 'Zo is EarthyGlow begonnen. Ik maak elke kaars met de hand in Nederland, geïnspireerd door bloemen, natuurlijke texturen en de wisselende seizoenen.',
    noteEyebrow: 'Een berichtje van Naomi',
    note: 'Ik hoop dat je net zoveel plezier hebt van deze kaarsen in huis als ik heb van het maken ervan. Of je er nu een voor jezelf kiest of als cadeau: je steun betekent veel voor me.',
    role: 'Oprichter & maker, EarthyGlow',
  },
  de: {
    metaTitle: 'Über uns · EarthyGlow',
    description: 'Lerne Naomi kennen, die Macherin hinter EarthyGlow: handgegossene Sojawachskerzen, inspiriert von Blumen, natürlichen Texturen und den wechselnden Jahreszeiten.',
    home: 'Start',
    breadcrumb: 'Brotkrümelnavigation',
    story: 'Unsere Geschichte',
    eyebrow: 'Über EarthyGlow',
    title: 'Wärme, von Hand gemacht',
    lede: 'Ich bin Naomi, die Gründerin und Macherin hinter EarthyGlow. Schön, dass du in meinem kleinen Kerzenladen vorbeischaust.',
    imageAlt: 'EarthyGlow Kerzen und natürliche Materialien',
    myStory: 'Meine Geschichte',
    storyTitle: 'Ein wenig Geborgenheit, von Hand gemacht',
    p1: 'Durch meine Arbeit im sozialen Bereich habe ich gelernt, die kleinen Dinge zu schätzen, mit denen wir uns wohlfühlen. Ich wollte Kerzen machen, die genau diese Geborgenheit in ein Zuhause bringen.',
    p2: 'So hat EarthyGlow angefangen. Ich fertige jede Kerze von Hand in den Niederlanden, inspiriert von Blumen, natürlichen Texturen und den wechselnden Jahreszeiten.',
    noteEyebrow: 'Ein paar Worte von Naomi',
    note: 'Ich hoffe, du hast an diesen Kerzen in deinem Zuhause genauso viel Freude wie ich beim Machen. Ob du eine für dich selbst aussuchst oder verschenkst – deine Unterstützung bedeutet mir sehr viel.',
    role: 'Gründerin & Macherin, EarthyGlow',
  },
})

export function meta({ params }: Route.MetaArgs) {
  const locale = localeFromParams(params)
  const copy = aboutCopy[locale]
  return siteMeta({ locale, title: copy.metaTitle, description: copy.description, path: '/about' })
}

export function About() {
  const locale = useLocale()
  const copy = useCopy(aboutCopy)
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: copy.home, path: '/' },
          { name: copy.story },
        ], locale)}
      />
      <section className="page-hero">
        <div className="container">
          <Reveal>
            <nav className="breadcrumb" aria-label={copy.breadcrumb}>
              <Link to="/" prefetch="intent">{copy.home}</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{copy.story}</span>
            </nav>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1>{copy.title}</h1>
            <p className="section-lede">{copy.lede}</p>
          </Reveal>
        </div>
      </section>

      <Divider white />

      <section className="about about-story">
        <div className="container about-grid">
          <Reveal className="about-visual">
            <img
              {...imageAttrs(aboutImage, SIZES.feature)}
              alt={copy.imageAlt}
              loading="lazy"
            />
          </Reveal>
          <Reveal delay={100} className="about-copy">
            <p className="eyebrow">{copy.myStory}</p>
            <h2>{copy.storyTitle}</h2>
            <p>{copy.p1}</p>
            <p>{copy.p2}</p>
          </Reveal>
        </div>
      </section>

      <section className="note">
        <div className="container">
          <Reveal className="note-card">
            <span className="note-mark" aria-hidden="true">&ldquo;</span>
            <p className="eyebrow note-eyebrow">{copy.noteEyebrow}</p>
            <blockquote className="note-message">{copy.note}</blockquote>
            <figure className="note-signoff">
              <span className="note-seal" aria-hidden="true">N</span>
              <figcaption>
                <span className="note-signature">Naomi</span>
                <span className="note-role">{copy.role}</span>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>
    </>
  )
}

export default About