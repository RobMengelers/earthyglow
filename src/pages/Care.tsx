import { Link } from 'react-router-dom'
import { Reveal } from '../components/Reveal'

const careTips = [
  {
    step: '01',
    title: 'First burn is the most important',
    text: 'Let your candle burn until the entire top layer of wax has melted — usually 2 to 3 hours. This prevents tunnelling and gives every candle a clean, full first memory.',
  },
  {
    step: '02',
    title: 'Trim the wick before each burn',
    text: 'Keep the wick at about 5 mm and always trim it before lighting. It keeps the flame steady, reduces soot, and makes the pool burn evenly.',
  },
  {
    step: '03',
    title: 'Don’t burn longer than 4 hours',
    text: 'Give your candle a break after about 4 hours, and let it cool completely before lighting again. Better burns, longer life.',
  },
  {
    step: '04',
    title: 'Keep the wax pool clean',
    text: 'Remove matches, wick trimmings and debris from the wax pool before lighting. A clean pool means a cleaner, brighter burn.',
  },
  {
    step: '05',
    title: 'Stop burning at the last 1 cm',
    text: 'Leaving about a centimetre of wax at the bottom protects the vessel from the heat and keeps the candle safe and scenting beautifully.',
  },
  {
    step: '06',
    title: 'Store them well',
    text: 'Keep your candles out of direct sunlight and away from heat sources, ideally upright. Lovely scents last far longer in a cool, dry spot.',
  },
]

const safety = [
  'Never leave a burning candle unattended.',
  'Keep candles away from draughts, curtains and other flammable objects.',
  'Place on a stable, heat-resistant surface.',
  'Keep out of reach of children and pets.',
  'Never move a candle while it is burning or while the wax is liquid.',
  'Always extinguish with a snuffer — not with water.',
]

export function Care() {
  return (
    <>
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
              A few small habits make all the difference. Follow these tips and
              your EarthyGlow candle will burn longer, cleaner and more
              beautifully.
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
    </>
  )
}