import { Link } from 'react-router-dom'
import { Reveal } from './Reveal'

const tips = [
  {
    step: '01',
    title: 'First burn',
    text: 'Let your candle burn until the wax pool reaches the edge — usually 2–3 hours — to prevent tunnelling.',
  },
  {
    step: '02',
    title: 'Trim the wick',
    text: 'Keep the wick at about 5 mm. Trim before each burn for a steady flame and a clean, even pool.',
  },
  {
    step: '03',
    title: 'Keep it safe',
    text: 'Never leave a burning candle unattended, and keep it away from drafts, children and pets.',
  },
] as const

export function CareTeaser() {
  return (
    <section className="care">
      <div className="container">
        <Reveal className="section-head">
          <p className="eyebrow">Candle care</p>
          <h2>Make every glow last</h2>
          <p className="section-lede">
            A few simple habits make every EarthyGlow candle burn longer,
            cleaner and more beautifully.
          </p>
        </Reveal>
        <div className="care-grid">
          {tips.map((tip, i) => (
            <Reveal key={tip.step} delay={i * 90} className="care-card">
              <span className="care-step">{tip.step}</span>
              <h3>{tip.title}</h3>
              <p>{tip.text}</p>
            </Reveal>
          ))}
        </div>
        <Reveal className="care-cta">
          <Link to="/care" className="btn btn-primary">
            More candle care tips
          </Link>
        </Reveal>
      </div>
    </section>
  )
}