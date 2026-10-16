import { Link } from 'react-router'
import { useState } from 'react'
import { Reveal } from '../../components/ui/Reveal'
import { Divider } from '../../components/ui/Divider'
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
    title: 'Before the first burn',
    image: '/images/about-candles.webp',
    alt: 'EarthyGlow candles ready to be lit',
    items: [
      { title: 'Candle safety', text: 'Remove flowers from their sticks before lighting. Place each candle on a heat-resistant dish and never burn the bouquet as a whole. Place sculptural candles on a heat-resistant dish or tray, as wax may spill while they burn.' },
      { title: 'Trim the wick', text: 'Trim the wooden wick to 3–5 mm to keep the flame steady and prevent soot.' },
      { title: 'Full melt pool', text: 'Let the wax melt all the way to the edges on the first burn. This helps prevent tunnelling and gives your candle a clean, even burn.' },
    ],
  },
  {
    step: '02',
    title: 'While burning',
    image: '/images/hero-candles-800.webp',
    alt: 'A warm arrangement of EarthyGlow candles',
    items: [
      { title: 'Burn time', text: 'Keep each burn between 2–4 hours and never leave a burning candle unattended.' },
      { title: 'Wick care', text: 'If the flame becomes too high, extinguish the candle, let it cool, trim the wick, and relight.' },
      { title: 'Stay nearby', text: 'Keep burning candles away from children, pets, draughts, curtains, and other flammable materials.' },
    ],
  },
  {
    step: '03',
    title: 'Safety & aftercare',
    image: '/images/floral-basket-800.webp',
    alt: 'EarthyGlow floral candle arrangement',
    items: [
      { title: 'Extinguish safely', text: 'Use a snuffer or blow gently to extinguish. Never use water, as hot wax may splatter.' },
      { title: 'Stop burning', text: 'Stop burning when 10 mm of wax remains to protect the glass, then let the candle cool completely.' },
      { title: 'Reuse your jar', text: 'Clean an empty jar with warm water and give it another life as décor — sustainability matters.' },
    ],
  },
]

const faqs = [
  {
    question: 'How do I care for a flower candle?',
    answer: 'Remove each flower from its stick and packaging, and place it on a heat-resistant dish before lighting. Never burn the arrangement in its box or basket.',
  },
  {
    question: 'How often should I trim a wooden wick?',
    answer: 'Trim wooden wicks to 3 to 5 mm before lighting. If the flame gets too high, put it out and let the candle cool before trimming and relighting.',
  },
  {
    question: 'How long can I burn a jar candle?',
    answer: 'Let the wax melt to the edges to help prevent tunnelling, keep burns to 2 to 4 hours, and never exceed 4 hours.',
  },
  {
    question: 'When should I stop using a jar candle?',
    answer: 'Stop using the candle when 10 mm of wax remains, and let it cool completely before handling.',
  },
  {
    question: 'How can I reuse my candle jar?',
    answer: 'Once your candle is finished and cool, clean the jar with warm water and use it around your home.',
  },
  {
    question: 'What is the safest way to put out a candle?',
    answer: 'Use a snuffer or blow gently to extinguish the flame. Never use water on a burning candle.',
  },
]

function FaqItem({ question, answer }: (typeof faqs)[number]) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`faq-item${open ? ' is-open' : ''}`}>
      <button
        className="faq-question"
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {question}
        <span aria-hidden="true">+</span>
      </button>
      <div className="faq-answer" aria-hidden={!open}>
        <p>{answer}</p>
      </div>
    </div>
  )
}

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
              <Link to="/" prefetch="intent">Home</Link>
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

      <Divider white />

      <section className="care care-page">
        <div className="container">
          <div className="care-grid">
            {careTips.map((tip, i) => (
              <Reveal key={tip.step} delay={(i % 3) * 90} className="care-card">
                <img className="care-card-image" src={tip.image} alt={tip.alt} />
                <div className="care-card-content">
                <span className="care-step">{tip.step}</span>
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
            <p className="eyebrow">Good to know</p>
            <h2>Frequently asked questions</h2>
          </Reveal>
          <Reveal className="faq-list">
            {faqs.map((faq) => (
              <FaqItem key={faq.question} {...faq} />
            ))}
          </Reveal>
        </div>
      </section>

    </>
  )
}

export default Care
