import { useState } from 'react'
import { formatEuros, type OverviewChartBucket } from '../../../admin/api'

export type ChartPoint = { start: string; value: number }

const axisEuros = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

function formatUtc(date: string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('en-GB', { ...options, timeZone: 'UTC' }).format(new Date(`${date}T00:00:00.000Z`))
}

function shopToday(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Amsterdam', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

function tickLabel(bucket: OverviewChartBucket, start: string): string {
  if (bucket === 'month') return formatUtc(start, { month: 'short' })
  if (bucket === 'week') return formatUtc(start, { day: 'numeric', month: 'short' })
  return formatUtc(start, { day: 'numeric' })
}

function pointLabel(bucket: OverviewChartBucket, start: string): string {
  if (bucket === 'month') return formatUtc(start, { month: 'long', year: 'numeric' })
  const day = formatUtc(start, { day: 'numeric', month: 'short', year: 'numeric' })
  return bucket === 'week' ? `Week of ${day}` : day
}

// Rounds up to a clean axis limit: 1, 2 or 5 times a power of ten, in whole euros.
function niceLimit(cents: number): number {
  if (cents <= 0) return 0
  const euros = Math.max(1, cents / 100)
  const power = 10 ** Math.floor(Math.log10(euros))
  const step = [1, 2, 5, 10].find((candidate) => candidate * power >= euros) ?? 10
  return step * power * 100
}

export function OverviewChart({
  label,
  hint,
  points,
  bucket,
  loading,
}: {
  label: string
  hint: string
  points: ChartPoint[]
  bucket: OverviewChartBucket
  loading: boolean
}) {
  const [active, setActive] = useState<number | null>(null)
  const values = points.map((point) => point.value)
  const top = niceLimit(Math.max(0, ...values))
  const bottom = -niceLimit(-Math.min(0, ...values))
  const range = top - bottom
  const percentFromTop = (value: number) => ((top - value) / range) * 100
  // A limit very close to zero would print on top of the zero label.
  const axisTicks = [0, ...[top, bottom].filter((tick) => tick !== 0 && Math.abs(tick) / range >= 0.14)]
  const tickEvery = bucket === 'day' ? 7 : bucket === 'week' ? 3 : 1
  const activePoint = active === null ? undefined : points[active]
  // The line stops at today: days still to come have no value yet, not zero.
  const today = shopToday()
  const drawn = points.filter((point) => point.start <= today)
  const xPercent = (index: number) => ((index + 0.5) / points.length) * 100
  const linePoints = drawn.map((point, index) => `${xPercent(index)},${percentFromTop(point.value)}`).join(' ')
  const zeroY = percentFromTop(0)
  const areaPoints = drawn.length > 0
    ? `${xPercent(0)},${zeroY} ${linePoints} ${xPercent(drawn.length - 1)},${zeroY}`
    : ''
  const markerIndex = active ?? drawn.length - 1
  const alignment = active === null || (active >= points.length / 4 && active < (points.length * 3) / 4)
    ? 'is-center'
    : active < points.length / 4 ? 'is-start' : 'is-end'

  return (
    <figure className={`admin-card admin-chart${loading ? ' is-loading' : ''}`}>
      <figcaption>
        <h2 className="admin-card-label">{label}</h2>
        <p className="admin-card-hint">{hint}</p>
      </figcaption>

      {range === 0 ? (
        <p className="admin-chart-empty">Nothing recorded in this period.</p>
      ) : (
        <div className="admin-chart-frame" aria-hidden="true">
          <div className="admin-chart-axis">
            {axisTicks.map((tick) => (
              <span key={tick} style={{ top: `${percentFromTop(tick)}%` }}>{axisEuros.format(tick / 100)}</span>
            ))}
          </div>
          <div className="admin-chart-plot" onPointerLeave={() => setActive(null)}>
            {[top, ...(bottom < 0 ? [bottom] : [])].map((tick) => (
              <span key={tick} className="admin-chart-grid" style={{ top: `${percentFromTop(tick)}%` }} />
            ))}
            <span className="admin-chart-grid is-zero" style={{ top: `${percentFromTop(0)}%` }} />
            <svg className="admin-chart-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon className="admin-chart-area" points={areaPoints} />
              <polyline className="admin-chart-line" points={linePoints} />
            </svg>
            <div className="admin-chart-columns">
              {points.map((point, index) => (
                <div
                  key={point.start}
                  className="admin-chart-column"
                  onPointerEnter={() => setActive(index < drawn.length ? index : null)}
                />
              ))}
            </div>
            {markerIndex >= 0 && (
              <>
                {activePoint && <span className="admin-chart-crosshair" style={{ left: `${xPercent(markerIndex)}%` }} />}
                <span
                  className="admin-chart-dot"
                  style={{ left: `${xPercent(markerIndex)}%`, top: `${percentFromTop(drawn[markerIndex].value)}%` }}
                />
              </>
            )}
            {activePoint && active !== null && (
              <div
                className={`admin-chart-tooltip ${alignment}`}
                style={{ left: `${xPercent(active)}%` }}
              >
                <strong>{formatEuros(activePoint.value)}</strong>
                <span>{pointLabel(bucket, activePoint.start)}</span>
              </div>
            )}
          </div>
          <div className="admin-chart-ticks">
            {points.map((point, index) => (
              <span key={point.start}>{index % tickEvery === 0 ? tickLabel(bucket, point.start) : ''}</span>
            ))}
          </div>
        </div>
      )}

      <div className="admin-chart-table">
      <table>
        <caption>{label}</caption>
        <thead><tr><th scope="col">Period</th><th scope="col">Amount</th></tr></thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.start}><td>{pointLabel(bucket, point.start)}</td><td>{formatEuros(point.value)}</td></tr>
          ))}
        </tbody>
      </table>
      </div>
    </figure>
  )
}
