import { useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import {
  formatEuros,
  splitIncludedVat,
  type AdminOverview,
  type AdminSoldItem,
  type OverviewPeriod,
} from '../../admin/api'
import { siteMeta } from '../../lib/seo'
import { useAdmin } from './admin-context'
import { Modal } from './components/Modal'
import { OverviewChart } from './components/OverviewChart'

export function meta() {
  return siteMeta({ title: 'Overview · EarthyGlow Admin', robots: 'noindex, nofollow' })
}

const PERIODS: { value: OverviewPeriod; label: string }[] = [
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year', label: 'Year' },
]

// The shop's reporting data starts here; older periods have nothing to show.
const EARLIEST_OVERVIEW_ANCHOR = '2026-05-01'

function isoDate(year: number, month: number, day: number): string {
  return new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10)
}

function anchorParts(anchor: string): { year: number; month: number } {
  const date = new Date(`${anchor}T00:00:00.000Z`)
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() }
}

function startOfPeriod(period: OverviewPeriod, anchor: string): string {
  const { year, month } = anchorParts(anchor)
  if (period === 'year') return isoDate(year, 0, 1)
  if (period === 'quarter') return isoDate(year, Math.floor(month / 3) * 3, 1)
  return isoDate(year, month, 1)
}

function currentPeriodAnchor(period: OverviewPeriod): string {
  const shopDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Amsterdam',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
  return startOfPeriod(period, shopDate)
}

function addPeriods(period: OverviewPeriod, anchor: string, amount: number): string {
  const { year, month } = anchorParts(anchor)
  if (period === 'year') return isoDate(year + amount, 0, 1)
  if (period === 'quarter') return isoDate(year, month + amount * 3, 1)
  return isoDate(year, month + amount, 1)
}

function periodLabel(period: OverviewPeriod, anchor: string): string {
  const date = new Date(`${anchor}T00:00:00.000Z`)
  if (period === 'year') return String(date.getUTCFullYear())
  if (period === 'quarter') {
    return `Q${Math.floor(date.getUTCMonth() / 3) + 1} ${date.getUTCFullYear()}`
  }
  return new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

function periodOptions(period: OverviewPeriod, selected: string): string[] {
  const options = new Set<string>([selected])
  const earliest = startOfPeriod(period, EARLIEST_OVERVIEW_ANCHOR)
  let cursor = currentPeriodAnchor(period)
  while (cursor >= earliest) {
    options.add(cursor)
    cursor = addPeriods(period, cursor, -1)
  }
  return [...options].sort((left, right) => right.localeCompare(left))
}

export default function OverviewPage() {
  const {
    overview,
    overviewError,
    overviewLoading,
    refreshOverview,
    overviewPeriod,
    overviewAnchor,
    setOverviewRange,
  } = useAdmin()
  const [vatMode, setVatMode] = useState<'incl' | 'excl'>('incl')
  const excl = vatMode === 'excl'
  const vatLabel = excl ? 'excl. VAT' : 'incl. VAT'
  const selectedAnchor = overviewAnchor
    ? startOfPeriod(overviewPeriod, overviewAnchor)
    : currentPeriodAnchor(overviewPeriod)
  const title = periodLabel(overviewPeriod, selectedAnchor)
  const previousLabel = periodLabel(
    overviewPeriod,
    addPeriods(overviewPeriod, selectedAnchor, -1),
  )
  const earliestAnchor = startOfPeriod(overviewPeriod, EARLIEST_OVERVIEW_ANCHOR)
  const canGoBackward = selectedAnchor > earliestAnchor
  const canGoForward = selectedAnchor < currentPeriodAnchor(overviewPeriod)

  function changePeriod(period: OverviewPeriod) {
    setOverviewRange(period, startOfPeriod(period, selectedAnchor))
  }

  function stepPeriod(amount: number) {
    const next = addPeriods(overviewPeriod, selectedAnchor, amount)
    if (next < earliestAnchor) return
    setOverviewRange(overviewPeriod, next)
  }

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Overview</h1>
          <p className="admin-page-sub">Where the shop stands right now.</p>
        </div>
        {overview && (
          <div className="admin-page-actions">
            <div className="admin-period-controls">
              <div className="admin-segmented" role="group" aria-label="Overview window">
                {PERIODS.map((period) => (
                  <button
                    key={period.value}
                    type="button"
                    className={overviewPeriod === period.value ? 'is-active' : ''}
                    onClick={() => changePeriod(period.value)}
                    aria-pressed={overviewPeriod === period.value}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
              <div className="admin-period-picker">
                <button
                  type="button"
                  className="admin-period-step"
                  onClick={() => stepPeriod(-1)}
                  disabled={!canGoBackward}
                  aria-label={`Previous ${overviewPeriod}`}
                >
                  ‹
                </button>
                <select
                  value={selectedAnchor}
                  onChange={(event) => setOverviewRange(overviewPeriod, event.target.value)}
                  aria-label={`Choose ${overviewPeriod}`}
                >
                  {periodOptions(overviewPeriod, selectedAnchor).map((anchor) => (
                    <option key={anchor} value={anchor}>
                      {periodLabel(overviewPeriod, anchor)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="admin-period-step"
                  onClick={() => stepPeriod(1)}
                  disabled={!canGoForward}
                  aria-label={`Next ${overviewPeriod}`}
                >
                  ›
                </button>
              </div>
            </div>
            <div className="admin-segmented" role="group" aria-label="Show amounts with or without VAT">
              <button
                type="button"
                className={vatMode === 'incl' ? 'is-active' : ''}
                onClick={() => setVatMode('incl')}
                aria-pressed={vatMode === 'incl'}
              >
                Incl. VAT
              </button>
              <button
                type="button"
                className={vatMode === 'excl' ? 'is-active' : ''}
                onClick={() => setVatMode('excl')}
                aria-pressed={vatMode === 'excl'}
              >
                Excl. VAT
              </button>
            </div>
          </div>
        )}
      </header>

      {overviewError !== '' && (
        <p className="form-note is-error">
          {overviewError}{' '}
          <button type="button" className="admin-link-button" onClick={() => void refreshOverview()}>
            Try again
          </button>
        </p>
      )}

      {!overview && overviewError === '' && <p className="admin-note">Loading the overview…</p>}

      {overview && (
        <OverviewBody
          overview={overview}
          loading={overviewLoading}
          excl={excl}
          vatLabel={vatLabel}
          title={title}
          previousLabel={previousLabel}
        />
      )}
    </div>
  )
}

function OverviewBody({
  overview,
  loading,
  excl,
  vatLabel,
  title,
  previousLabel,
}: {
  overview: AdminOverview
  loading: boolean
  excl: boolean
  vatLabel: string
  title: string
  previousLabel: string
}) {
  const [showSoldItems, setShowSoldItems] = useState(false)
  const netRevenue = overview.netRevenueCents
  const netExpenses = splitIncludedVat(overview.expensesCents).netCents
  const prevNetRevenue = overview.previousNetRevenueCents

  const revenue = excl ? netRevenue : overview.revenueCents
  const spent = excl ? netExpenses : overview.expensesCents
  const productionCost = excl ? splitIncludedVat(overview.productionCostCents).netCents : overview.productionCostCents
  const profit = revenue - productionCost
  const prevRevenue = excl ? prevNetRevenue : overview.previousRevenueCents
  const vatRevenue = overview.revenueCents - netRevenue
  const vatExpenses = overview.expensesCents - netExpenses
  const vatBalance = vatRevenue - vatExpenses

  const chartPoints = overview.chart.points.map((point) => ({
    start: point.start,
    revenue: excl ? point.netRevenueCents : point.revenueCents,
    spent: excl ? splitIncludedVat(point.expensesCents).netCents : point.expensesCents,
    production: excl ? splitIncludedVat(point.productionCostCents).netCents : point.productionCostCents,
  }))
  type Point = (typeof chartPoints)[number]
  const charts = [
    { name: 'Profit', value: (point: Point) => point.revenue - point.production },
    { name: 'Revenue', value: (point: Point) => point.revenue },
    { name: 'Purchases', value: (point: Point) => point.spent },
    { name: 'Revenue against purchases', value: (point: Point) => point.revenue - point.spent },
  ]

  return (
    <>
      <div className="admin-cards">
        <MoneyCard
          label={`Profit · ${title} · ${vatLabel}`}
          value={profit}
          hint={
            <>
              {formatEuros(revenue)} earned − {formatEuros(productionCost)} recipe costs
            </>
          }
          tone="profit"
          loading={loading}
          action={
            <button
              type="button"
              className="admin-link-button admin-card-action"
              disabled={loading}
              aria-haspopup="dialog"
              onClick={() => setShowSoldItems(true)}
            >
              View sold products →
            </button>
          }
        />
        <MoneyCard
          label={`Revenue · ${title} · ${vatLabel}`}
          value={revenue}
          hint={<>{formatEuros(prevRevenue)} in {previousLabel}</>}
          loading={loading}
        />
        <MoneyCard
          label={`Purchases · ${title} · ${vatLabel}`}
          value={spent}
          hint="Recorded material costs"
          loading={loading}
        />
        <MoneyCard
          label={`Revenue against purchases · ${title} · ${vatLabel}`}
          value={revenue - spent}
          hint={
            <>
              {formatEuros(revenue)} revenue − {formatEuros(spent)} purchases.
            </>
          }
          tone="profit"
          loading={loading}
        />
      </div>

      {showSoldItems && (
        <Modal
          title={`Sold products · ${title}`}
          description="Paid orders in the selected period. Recipe status reflects your current recipes."
          onClose={() => setShowSoldItems(false)}
          wide
        >
          <SoldItems items={overview.soldItems} />
        </Modal>
      )}

      <section className="admin-vat-note">
        <h2>{`VAT · ${title}`}</h2>
        <div className="admin-vat-note-grid">
          <span>
            Collected on sales
            <strong>{formatEuros(vatRevenue)}</strong>
          </span>
          <span>
            Reclaimable on purchases
            <strong>{formatEuros(vatExpenses)}</strong>
          </span>
          <span className="is-total">
            Balance to hand over
            <strong>{formatEuros(vatBalance)}</strong>
            <small>positive = to pay · negative = owed back</small>
          </span>
        </div>
      </section>

      <section className="admin-charts" aria-label="Graphs">
        {charts.map((chart) => (
          <OverviewChart
            key={chart.name}
            label={`${chart.name} · ${title} · ${vatLabel}`}
            hint={`Per ${overview.chart.unit}`}
            bucket={overview.chart.unit}
            loading={loading}
            points={chartPoints.map((point) => ({ start: point.start, value: chart.value(point) }))}
          />
        ))}
      </section>
    </>
  )
}

function MoneyCard({
  label,
  value,
  hint,
  loading = false,
  tone,
  action,
}: {
  label: string
  value: number
  hint: ReactNode
  loading?: boolean
  tone?: 'profit'
  action?: ReactNode
}) {
  return (
    <article className="admin-card">
      <h2 className="admin-card-label">{label}</h2>
      <p
        className={`admin-card-value${tone === 'profit' ? ' is-profit' : ''}${loading ? ' is-loading' : ''}`}
      >
        {formatEuros(value)}
      </p>
      <p className="admin-card-hint">{hint}</p>
      {action}
    </article>
  )
}

function SoldItems({ items }: { items: AdminSoldItem[] }) {
  if (items.length === 0) {
    return <p className="admin-empty-inline">No products sold in this period.</p>
  }

  const products = items.filter((item) => item.recipeStatus !== 'custom')
  const customItems = items.filter((item) => item.recipeStatus === 'custom')
  const missing = products.filter((item) => item.recipeStatus === 'missing').length
  const noCost = products.filter((item) => item.recipeStatus === 'no-cost').length
  const labels = { ready: 'Recipe added', missing: 'Missing recipe', 'no-cost': 'Recipe needs a cost', custom: 'No recipe needed' }

  return (
    <div className="admin-sold-items">
      {(missing > 0 || noCost > 0) && (
        <p className="admin-note">
          {missing} product{missing === 1 ? '' : 's'} missing a recipe · {noCost} recipe{noCost === 1 ? '' : 's'} missing a cost.
          {' '}Their costs are not included in profit yet.
        </p>
      )}
      {[{ title: 'Products', rows: products }, { title: 'Custom items', rows: customItems }].map((group) => group.rows.length > 0 && (
        <section key={group.title}>
          <h3>{group.title}</h3>
          {group.title === 'Custom items' && (
            <p className="admin-note">Custom-order items do not need recipes. Their revenue is included in profit, but no recipe costs are deducted.</p>
          )}
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th scope="col">Item</th><th scope="col">Quantity sold</th><th scope="col">Recipe status</th></tr></thead>
              <tbody>
                {group.rows.map((item) => (
                  <tr key={JSON.stringify([item.productId, item.name])}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td><span className={`admin-badge${item.recipeStatus === 'ready' ? ' is-paid' : item.recipeStatus === 'custom' ? '' : ' is-pending'}`}>{labels[item.recipeStatus]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      {products.length > 0 && <Link to="/admin/materials">Manage recipes →</Link>}
    </div>
  )
}
