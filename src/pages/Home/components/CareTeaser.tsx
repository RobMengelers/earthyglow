import { Link } from 'react-router-dom'
import { Reveal } from '../../../components/ui/Reveal'

const tips = [
  {
    step: '01',
    title: 'Before you light it',
    text: 'Flower candles need to come out of their packaging first. Use a heat-resistant dish for flowers and sculptural candles.',
  },
  {
    step: '02',
    title: 'Trim the wick',
    text: 'For wooden wicks, trim to 3 to 5 mm before lighting. Check the care guide for your candle type.',
  },
  {
    step: '03',
    title: 'Keep it safe',
    text: 'Never leave a burning candle unattended, and keep it away from draughts, children and pets.',
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
            From flower candles to jars, each candle needs a little care.
            Here are a few things to check before you light yours.
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