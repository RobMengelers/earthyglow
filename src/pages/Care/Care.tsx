import { imageAttrs, SIZES } from '../../lib/images'
import { useState } from 'react'
import { Reveal } from '../../components/ui/Reveal'
import { Divider } from '../../components/ui/Divider'
import { JsonLd } from '../../components/seo/JsonLd'
import { breadcrumbLd, siteMeta } from '../../lib/seo'
import { defineCopy, Link, localeFromParams, useCopy, useLocale } from '../../i18n'
import type { Route } from './+types/Care'

const IMAGES = [
  '/images/about-candles.webp',
  '/images/hero-candles-800.webp',
  '/images/floral-basket-800.webp',
]

type Tip = { title: string; alt: string; items: { title: string; text: string }[] }
type Faq = { question: string; answer: string }

const careCopy = defineCopy({
  en: {
    metaTitle: 'Candle Care & Safety · EarthyGlow',
    description: 'How to care for hand-poured soy wax, flower, wooden wick and jar candles: trimming, burn times, safety tips and how to reuse your jar.',
    home: 'Home',
    breadcrumb: 'Breadcrumb',
    crumb: 'Candle Care',
    eyebrow: 'Candle care',
    title: 'Make every glow last',
    lede: 'A little care helps you enjoy your candle safely. Start with the guidance for your candle type, and always follow its safety label.',
    tipsHeading: 'Candle care tips',
    faqEyebrow: 'Good to know',
    faqTitle: 'Frequently asked questions',
    tips: [
      {
        title: 'Before the first burn',
        alt: 'EarthyGlow candles ready to be lit',
        items: [
          { title: 'Candle safety', text: 'Remove flowers from their sticks before lighting. Place each candle on a heat-resistant dish and never burn the bouquet as a whole. Place sculptural candles on a heat-resistant dish or tray, as wax may spill while they burn.' },
          { title: 'Trim the wick', text: 'Trim the wooden wick to 3–5 mm to keep the flame steady and prevent soot.' },
          { title: 'Full melt pool', text: 'Let the wax melt all the way to the edges on the first burn. This helps prevent tunnelling and gives your candle a clean, even burn.' },
        ],
      },
      {
        title: 'While burning',
        alt: 'A warm arrangement of EarthyGlow candles',
        items: [
          { title: 'Burn time', text: 'Keep each burn between 2–4 hours and never leave a burning candle unattended.' },
          { title: 'Wick care', text: 'If the flame becomes too high, extinguish the candle, let it cool, trim the wick, and relight.' },
          { title: 'Stay nearby', text: 'Keep burning candles away from children, pets, draughts, curtains, and other flammable materials.' },
        ],
      },
      {
        title: 'Safety & aftercare',
        alt: 'EarthyGlow floral candle arrangement',
        items: [
          { title: 'Extinguish safely', text: 'Use a snuffer or blow gently to extinguish. Never use water, as hot wax may splatter.' },
          { title: 'Stop burning', text: 'Stop burning when 10 mm of wax remains to protect the glass, then let the candle cool completely.' },
          { title: 'Reuse your jar', text: 'Clean an empty jar with warm water and give it another life as décor — sustainability matters.' },
        ],
      },
    ] as Tip[],
    faqs: [
      { question: 'How do I care for a flower candle?', answer: 'Remove each flower from its stick and packaging, and place it on a heat-resistant dish before lighting. Never burn the arrangement in its box or basket.' },
      { question: 'How often should I trim a wooden wick?', answer: 'Trim wooden wicks to 3 to 5 mm before lighting. If the flame gets too high, put it out and let the candle cool before trimming and relighting.' },
      { question: 'How long can I burn a jar candle?', answer: 'Let the wax melt to the edges to help prevent tunnelling, keep burns to 2 to 4 hours, and never exceed 4 hours.' },
      { question: 'When should I stop using a jar candle?', answer: 'Stop using the candle when 10 mm of wax remains, and let it cool completely before handling.' },
      { question: 'How can I reuse my candle jar?', answer: 'Once your candle is finished and cool, clean the jar with warm water and use it around your home.' },
      { question: 'What is the safest way to put out a candle?', answer: 'Use a snuffer or blow gently to extinguish the flame. Never use water on a burning candle.' },
    ] as Faq[],
  },
  nl: {
    metaTitle: 'Kaarsverzorging & veiligheid · EarthyGlow',
    description: 'Zo verzorg je handgegoten sojawaskaarsen, bloemkaarsjes, kaarsen met houten lont en kaarsen in een pot: lont knippen, brandtijden, veiligheidstips en je pot hergebruiken.',
    home: 'Home',
    breadcrumb: 'Kruimelpad',
    crumb: 'Kaarsverzorging',
    eyebrow: 'Kaarsverzorging',
    title: 'Laat elke gloed lang duren',
    lede: 'Met een beetje zorg geniet je veilig van je kaars. Begin met de tips voor jouw soort kaars en volg altijd het veiligheidslabel.',
    tipsHeading: 'Tips voor kaarsverzorging',
    faqEyebrow: 'Goed om te weten',
    faqTitle: 'Veelgestelde vragen',
    tips: [
      {
        title: 'Voor de eerste keer branden',
        alt: 'EarthyGlow-kaarsen klaar om aan te steken',
        items: [
          { title: 'Veilig branden', text: 'Haal de bloemen van hun stokjes voordat je ze aansteekt. Zet elke kaars op een hittebestendig schaaltje en brand het boeket nooit in zijn geheel. Zet sculpturale kaarsen op een hittebestendig schaaltje of dienblad, want er kan was afdruipen tijdens het branden.' },
          { title: 'Knip de lont', text: 'Knip de houten lont op 3–5 mm, zodat de vlam rustig brandt en er geen roet ontstaat.' },
          { title: 'Volledige smeltlaag', text: 'Laat de was de eerste keer helemaal tot aan de rand smelten. Zo voorkom je tunnelen en brandt je kaars mooi en gelijkmatig.' },
        ],
      },
      {
        title: 'Tijdens het branden',
        alt: 'Een warme opstelling van EarthyGlow-kaarsen',
        items: [
          { title: 'Brandtijd', text: 'Laat je kaars steeds 2–4 uur branden en laat een brandende kaars nooit zonder toezicht.' },
          { title: 'Lontverzorging', text: 'Wordt de vlam te hoog? Doof de kaars, laat hem afkoelen, knip de lont bij en steek hem opnieuw aan.' },
          { title: 'Blijf in de buurt', text: 'Houd brandende kaarsen uit de buurt van kinderen, huisdieren, tocht, gordijnen en andere brandbare materialen.' },
        ],
      },
      {
        title: 'Veiligheid & nazorg',
        alt: 'Bloemenkaarsjes van EarthyGlow',
        items: [
          { title: 'Veilig doven', text: 'Gebruik een kaarsendover of blaas zachtjes. Gebruik nooit water, want hete was kan gaan spatten.' },
          { title: 'Stop op tijd', text: 'Stop met branden als er nog 10 mm was over is, om het glas te beschermen, en laat de kaars daarna helemaal afkoelen.' },
          { title: 'Hergebruik je pot', text: 'Maak een lege pot schoon met warm water en geef hem een tweede leven als decoratie — duurzaamheid telt.' },
        ],
      },
    ],
    faqs: [
      { question: 'Hoe verzorg ik een bloemkaarsje?', answer: 'Haal elke bloem van het stokje en uit de verpakking, en zet hem op een hittebestendig schaaltje voordat je hem aansteekt. Brand het boeket nooit in de doos of het mandje.' },
      { question: 'Hoe vaak moet ik een houten lont knippen?', answer: 'Knip houten lonten op 3 tot 5 mm voordat je de kaars aansteekt. Wordt de vlam te hoog, doof hem dan en laat de kaars afkoelen voordat je de lont knipt en hem opnieuw aansteekt.' },
      { question: 'Hoe lang kan ik een kaars in een pot laten branden?', answer: 'Laat de was tot aan de rand smelten om tunnelen te voorkomen, laat de kaars 2 tot 4 uur branden en nooit langer dan 4 uur.' },
      { question: 'Wanneer moet ik stoppen met een kaars in een pot?', answer: 'Stop met de kaars als er nog 10 mm was over is, en laat hem helemaal afkoelen voordat je hem verplaatst.' },
      { question: 'Hoe kan ik mijn kaarsenpot hergebruiken?', answer: 'Is je kaars op en afgekoeld, maak de pot dan schoon met warm water en gebruik hem ergens anders in huis.' },
      { question: 'Wat is de veiligste manier om een kaars te doven?', answer: 'Gebruik een kaarsendover of blaas de vlam zachtjes uit. Gebruik nooit water op een brandende kaars.' },
    ],
  },
  de: {
    metaTitle: 'Kerzenpflege & Sicherheit · EarthyGlow',
    description: 'So pflegst du handgegossene Sojawachskerzen, Blumenkerzen, Kerzen mit Holzdocht und Kerzen im Glas: Docht kürzen, Brenndauer, Sicherheitstipps und das Glas wiederverwenden.',
    home: 'Start',
    breadcrumb: 'Brotkrümelnavigation',
    crumb: 'Kerzenpflege',
    eyebrow: 'Kerzenpflege',
    title: 'Damit jeder Glanz lange hält',
    lede: 'Mit ein wenig Pflege genießt du deine Kerze sicher. Fang mit den Tipps für deine Kerzenart an und beachte immer das Sicherheitsetikett.',
    tipsHeading: 'Tipps zur Kerzenpflege',
    faqEyebrow: 'Gut zu wissen',
    faqTitle: 'Häufig gestellte Fragen',
    tips: [
      {
        title: 'Vor dem ersten Anzünden',
        alt: 'EarthyGlow Kerzen, bereit zum Anzünden',
        items: [
          { title: 'Sicher brennen', text: 'Nimm die Blumen vor dem Anzünden von ihren Stäbchen. Stelle jede Kerze auf eine hitzebeständige Schale und brenne den Strauß nie als Ganzes ab. Stelle skulpturale Kerzen auf eine hitzebeständige Schale oder ein Tablett, da beim Brennen Wachs herunterlaufen kann.' },
          { title: 'Docht kürzen', text: 'Kürze den Holzdocht auf 3–5 mm, damit die Flamme ruhig brennt und kein Ruß entsteht.' },
          { title: 'Vollständiger Schmelzteller', text: 'Lass das Wachs beim ersten Brennen bis zum Rand schmelzen. So vermeidest du Tunnelbildung und deine Kerze brennt sauber und gleichmäßig.' },
        ],
      },
      {
        title: 'Während des Brennens',
        alt: 'Ein warmes Arrangement aus EarthyGlow Kerzen',
        items: [
          { title: 'Brenndauer', text: 'Lass die Kerze jeweils 2–4 Stunden brennen und lass eine brennende Kerze nie unbeaufsichtigt.' },
          { title: 'Dochtpflege', text: 'Wird die Flamme zu hoch, lösche die Kerze, lass sie abkühlen, kürze den Docht und zünde sie wieder an.' },
          { title: 'In der Nähe bleiben', text: 'Halte brennende Kerzen fern von Kindern, Haustieren, Zugluft, Vorhängen und anderen brennbaren Materialien.' },
        ],
      },
      {
        title: 'Sicherheit & Nachsorge',
        alt: 'Blumenkerzen-Arrangement von EarthyGlow',
        items: [
          { title: 'Sicher löschen', text: 'Verwende einen Kerzenlöscher oder puste sanft. Nimm niemals Wasser, da heißes Wachs spritzen kann.' },
          { title: 'Rechtzeitig aufhören', text: 'Hör auf, wenn noch 10 mm Wachs übrig sind, um das Glas zu schützen, und lass die Kerze dann vollständig abkühlen.' },
          { title: 'Glas wiederverwenden', text: 'Reinige ein leeres Glas mit warmem Wasser und gib ihm ein zweites Leben als Deko — Nachhaltigkeit zählt.' },
        ],
      },
    ],
    faqs: [
      { question: 'Wie pflege ich eine Blumenkerze?', answer: 'Nimm jede Blume von ihrem Stäbchen und aus der Verpackung und stelle sie vor dem Anzünden auf eine hitzebeständige Schale. Brenne das Arrangement nie in seiner Box oder seinem Korb ab.' },
      { question: 'Wie oft sollte ich einen Holzdocht kürzen?', answer: 'Kürze Holzdochte vor dem Anzünden auf 3 bis 5 mm. Wird die Flamme zu hoch, lösche sie und lass die Kerze abkühlen, bevor du den Docht kürzt und sie wieder anzündest.' },
      { question: 'Wie lange darf eine Kerze im Glas brennen?', answer: 'Lass das Wachs bis zum Rand schmelzen, um Tunnelbildung zu vermeiden, brenne die Kerze jeweils 2 bis 4 Stunden und nie länger als 4 Stunden.' },
      { question: 'Wann sollte ich eine Kerze im Glas nicht mehr verwenden?', answer: 'Hör auf, wenn noch 10 mm Wachs übrig sind, und lass die Kerze vollständig abkühlen, bevor du sie anfasst.' },
      { question: 'Wie kann ich mein Kerzenglas wiederverwenden?', answer: 'Wenn deine Kerze heruntergebrannt und abgekühlt ist, reinige das Glas mit warmem Wasser und verwende es irgendwo in deinem Zuhause.' },
      { question: 'Wie lösche ich eine Kerze am sichersten?', answer: 'Verwende einen Kerzenlöscher oder puste die Flamme sanft aus. Gieße niemals Wasser auf eine brennende Kerze.' },
    ],
  },
})

export function meta({ params }: Route.MetaArgs) {
  const locale = localeFromParams(params)
  const copy = careCopy[locale]
  return siteMeta({ locale, title: copy.metaTitle, description: copy.description, path: '/care' })
}

function FaqItem({ question, answer, index }: Faq & { index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`faq-item${open ? ' is-open' : ''}`}>
      <button
        className="faq-question"
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="faq-index" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="faq-question-text">{question}</span>
        <span className="faq-toggle" aria-hidden="true">+</span>
      </button>
      <div className="faq-answer" aria-hidden={!open}>
        <p>{answer}</p>
      </div>
    </div>
  )
}

export function Care() {
  const locale = useLocale()
  const copy = useCopy(careCopy)
  const faqs = copy.faqs
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: copy.home, path: '/' },
          { name: copy.crumb },
        ], locale)}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          inLanguage: locale,
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: { '@type': 'Answer', text: faq.answer },
          })),
        }}
      />
      <section className="page-hero">
        <div className="container">
          <Reveal immediate>
            <nav className="breadcrumb" aria-label={copy.breadcrumb}>
              <Link to="/" prefetch="intent">{copy.home}</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{copy.crumb}</span>
            </nav>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1>{copy.title}</h1>
            <p className="section-lede">{copy.lede}</p>
          </Reveal>
        </div>
      </section>

      <Divider white />

      <section className="care care-page">
        <div className="container">
          <h2 className="visually-hidden">{copy.tipsHeading}</h2>
          <div className="care-grid">
            {copy.tips.map((tip, i) => (
              <Reveal key={IMAGES[i]} immediate={i === 0} delay={(i % 3) * 90} className="care-card">
                <img className="care-card-image" {...imageAttrs(IMAGES[i], SIZES.feature)} loading={i === 0 ? undefined : 'lazy'} alt={tip.alt} />
                <div className="care-card-content">
                <span className="care-step">{String(i + 1).padStart(2, '0')}</span>
                <h3>{tip.title}</h3>
                <ul>
                  {tip.items.map((item) => (
                    <li key={item.title}>
                      <strong>{item.title}</strong>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="faq">
        <div className="container">
          <Reveal className="section-head">
            <p className="eyebrow">{copy.faqEyebrow}</p>
            <h2>{copy.faqTitle}</h2>
          </Reveal>
          <Reveal className="faq-list">
            {faqs.map((faq, index) => (
              <FaqItem key={faq.question} index={index} {...faq} />
            ))}
          </Reveal>
        </div>
      </section>

    </>
  )
}

export default Care
