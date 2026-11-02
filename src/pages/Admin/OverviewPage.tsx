import { useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import {
  formatEuros,
  splitIncludedVat,
  type AdminOverview,
  type OverviewPeriod,
} from '../../admin/api'
import { siteMeta } from '../../lib/seo'
import { useAdmin } from './admin-context'

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
        />
        <MoneyCard
          label={`Revenue · ${title} · ${vatLabel}`}
          value={revenue}
          hint={<>{formatEuros(prevRevenue)} in {previousLabel}</>}
          loading={loading}
        />
        <SpendingCard
          label={`Purchases · ${title} · ${vatLabel}`}
          value={spent}
          hint="Add a purchase"
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

      <section className="admin-panel">
        <header className="admin-panel-head">
          <h2>Needs attention</h2>
        </header>
        <AttentionList overview={overview} />
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
}: {
  label: string
  value: number
  hint: ReactNode
  loading?: boolean
  tone?: 'profit'
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
    </article>
  )
}

// The cost side of the profit card. Links to the purchases page, because
// recording materials there is what feeds this number.
function SpendingCard({
  label,
  value,
  hint,
}: {
  label: string
  value: number
  hint: ReactNode
}) {
  return (
    <Link className="admin-card is-link" to="/admin/purchases">
      <h2 className="admin-card-label">{label}</h2>
      <p className="admin-card-value">{formatEuros(value)}</p>
      <p className="admin-card-hint">{hint}</p>
    </Link>
  )
}

// The two things that quietly cost the shop money if forgotten.
function AttentionList({ overview }: { overview: AdminOverview }) {
  const waiting = overview.recentOrders.filter(
    (order) => order.status === 'paid' && order.fulfillmentStatus === 'open',
  )
  const awaitingPayment = overview.stats.pending ?? 0

  if (overview.unfulfilledCount === 0 && awaitingPayment === 0) {
    return <p className="admin-empty-inline">Nothing is waiting on you.</p>
  }

  return (
    <ul className="admin-attention">
      {overview.unfulfilledCount > 0 && (
        <li>
          <Link to="/admin/orders?status=paid&fulfilment=open">
            {overview.unfulfilledCount} paid order
            {overview.unfulfilledCount === 1 ? '' : 's'} still to send →
          </Link>
          {waiting.length > 0 && (
            <p className="admin-muted">
              Newest: {waiting.map((order) => order.orderNumber).join(', ')}
            </p>
          )}
        </li>
      )}
      {awaitingPayment > 0 && (
        <li>
          <Link to="/admin/orders?status=pending">
            {awaitingPayment} order{awaitingPayment === 1 ? '' : 's'} awaiting payment →
          </Link>
        </li>
      )}
    </ul>
  )
}