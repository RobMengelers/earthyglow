import { Link } from 'react-router'
import { Reveal } from '../../components/ui/Reveal'
import { JsonLd } from '../../components/seo/JsonLd'
import { breadcrumbLd, siteMeta } from '../../lib/seo'

export function meta() {
  return siteMeta({
    title: 'Candle Care & Safety · EarthyGlow',
    description:
      'How to care for hand-poured soy wax, flower, wooden wick and jar candles: trimming, burn times, safety tips and how to reuse your jar.',
    path: '/care',
  })
}

const careTips = [
  {
    step: '01',
    title: 'Flower candles',
    text: 'Remove each flower from its stick and packaging. Place it on a heat-resistant dish before lighting. Never burn the arrangement in its box or basket.',
  },
  {
    step: '02',
    title: 'Sculptural candles',
    text: 'Stand shaped candles on a heat-resistant dish or tray to catch the wax as it melts.',
  },
  {
    step: '03',
    title: 'Wooden wicks',
    text: 'Trim wooden wicks to 3 to 5 mm before lighting. If the flame gets too high, put it out and let the candle cool before trimming and relighting.',
  },
  {
    step: '04',
    title: 'Candles in jars',
    text: 'Let the wax melt to the edges to help prevent tunnelling. Keep burns to 2 to 4 hours, and never exceed 4 hours.',
  },
  {
    step: '05',
    title: 'Know when to stop',
    text: 'For candles in jars, stop using the candle when 10 mm of wax remains. Let it cool completely before handling.',
  },
  {
    step: '06',
    title: 'Give your jar another use',
    text: 'Once your candle is finished and cool, clean the jar with warm water and use it around your home.',
  },
]

const safety = [
  'Never leave a burning candle unattended.',
  'Keep candles away from draughts, curtains and other flammable objects.',
  'Place on a stable, heat-resistant surface.',
  'Keep out of reach of children and pets.',
  'Never move a candle while it is burning or while the wax is liquid.',
  'Use a snuffer or blow gently to extinguish. Never use water.',
]

const faqs = [
  {
    question: 'How do I care for a flower candle?',
    answer:
      'Remove each flower from its stick and packaging, and place it on a heat-resistant dish before lighting. Never burn the arrangement in its box or basket.',
  },
  {
    question: 'How often should I trim a wooden wick?',
    answer:
      'Trim wooden wicks to 3 to 5 mm before lighting. If the flame gets too high, put it out and let the candle cool before trimming and relighting.',
  },
  {
    question: 'How long can I burn a jar candle?',
    answer:
      'Let the wax melt to the edges to help prevent tunnelling, keep burns to 2 to 4 hours, and never exceed 4 hours.',
  },
  {
    question: 'When should I stop using a jar candle?',
    answer:
      'Stop using the candle when 10 mm of wax remains, and let it cool completely before handling.',
  },
  {
    question: 'How can I reuse my candle jar?',
    answer:
      'Once your candle is finished and cool, clean the jar with warm water and use it around your home.',
  },
  {
    question: 'What is the safest way to put out a candle?',
    answer:
      'Use a snuffer or blow gently to extinguish the flame. Never use water on a burning candle.',
  },
]

export function Care() {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Candle Care' },
        ])}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: { '@type': 'Answer', text: faq.answer },
          })),
        }}
      />
      <section className="page-hero">
        <div className="container">
          <Reveal>
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Candle Care</span>
            </nav>
            <p className="eyebrow">Candle care</p>
            <h1>Make every glow last</h1>
            <p className="section-lede">
              A little care helps you enjoy your candle safely. Start with the
              guidance for your candle type, and always follow its safety label.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="care care-page">
        <div className="container">
          <div className="care-grid">
            {careTips.map((tip, i) => (
              <Reveal key={tip.step} delay={(i % 3) * 90} className="care-card">
                <span className="care-step">{tip.step}</span>
                <h3>{tip.title}</h3>
                <p>{tip.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="safety">
        <div className="container">
          <Reveal className="section-head">
            <p className="eyebrow">Safety first</p>
            <h2>Burn candles responsibly</h2>
          </Reveal>
          <Reveal>
            <ul className="safety-list">
              {safety.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="faq">
        <div className="container">
          <Reveal className="section-head">
            <p className="eyebrow">Good to know</p>
            <h2>Frequently asked questions</h2>
          </Reveal>
          <Reveal className="faq-list">
            {faqs.map((faq) => (
              <details key={faq.question} className="faq-item">
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  )
}

export default Care