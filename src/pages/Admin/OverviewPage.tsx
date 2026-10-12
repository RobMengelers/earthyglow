import { useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import {
  formatDateTime,
  formatEuros,
  formatRelativeTime,
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
  { value: '30d', label: '30 days' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year', label: 'Year' },
]

function periodTitle(period: OverviewPeriod): string {
  return period === 'quarter' ? 'last quarter' : period === 'year' ? 'last year' : 'last 30 days'
}

function previousPeriodTitle(period: OverviewPeriod): string {
  return period === 'quarter' ? 'previous quarter' : period === 'year' ? 'previous year' : 'previous 30 days'
}

export default function OverviewPage() {
  const { overview, overviewError, overviewLoading, refreshOverview, overviewPeriod, setOverviewPeriod } =
    useAdmin()
  const [vatMode, setVatMode] = useState<'incl' | 'excl'>('incl')
  const excl = vatMode === 'excl'
  const vatLabel = excl ? 'excl. VAT' : 'incl. VAT'
  const title = periodTitle(overviewPeriod)

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Overview</h1>
          <p className="admin-page-sub">Where the shop stands right now.</p>
        </div>
        {overview && (
          <div className="admin-page-actions">
            <div className="admin-segmented" role="group" aria-label="Overview window">
              {PERIODS.map((period) => (
                <button
                  key={period.value}
                  type="button"
                  className={overviewPeriod === period.value ? 'is-active' : ''}
                  onClick={() => setOverviewPeriod(period.value)}
                  aria-pressed={overviewPeriod === period.value}
                >
                  {period.label}
                </button>
              ))}
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
          previousTitle={previousPeriodTitle(overviewPeriod)}
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
  previousTitle,
}: {
  overview: AdminOverview
  loading: boolean
  excl: boolean
  vatLabel: string
  title: string
  previousTitle: string
}) {
  // VAT is included in every shop price (21%). Splitting the aggregates the
  // same way the invoice does gives the "what you really keep / really pay"
  // numbers; the VAT figures themselves are what the admin pays or reclaims.
  const netRevenue = splitIncludedVat(overview.revenueCents).netCents
  const netExpenses = splitIncludedVat(overview.expensesCents).netCents
  const prevNetRevenue = splitIncludedVat(overview.previousRevenueCents).netCents
  const prevNetExpenses = splitIncludedVat(overview.previousExpensesCents).netCents

  const revenue = excl ? netRevenue : overview.revenueCents
  const spent = excl ? netExpenses : overview.expensesCents
  const profit = excl ? netRevenue - netExpenses : overview.revenueCents - overview.expensesCents
  const prevRevenue = excl ? prevNetRevenue : overview.previousRevenueCents
  const prevSpent = excl ? prevNetExpenses : overview.previousExpensesCents
  const prevProfit = excl
    ? prevNetRevenue - prevNetExpenses
    : overview.previousProfitCents

  const revenueTrend = prevRevenue === 0 ? null : ((revenue - prevRevenue) / prevRevenue) * 100
  const profitTrend = prevProfit === 0 ? null : ((profit - prevProfit) / Math.abs(prevProfit)) * 100
  const spentTrend = prevSpent === 0 ? null : ((spent - prevSpent) / prevSpent) * 100

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
              {formatEuros(revenue)} earned − {formatEuros(spent)} spent
              {profitTrend !== null && (
                <>
                  {' · '}
                  <Trend value={profitTrend} />
                  {` vs. ${previousTitle}`}
                </>
              )}
            </>
          }
          tone="profit"
          loading={loading}
        />
        <MoneyCard
          label={`Revenue · ${title} · ${vatLabel}`}
          value={revenue}
          hint={
            revenueTrend === null ? (
              <>No paid orders to compare against the previous period</>
            ) : (
              <>
                <Trend value={revenueTrend} />
                {` vs. ${previousTitle} (`}
                {formatEuros(prevRevenue)}
                {')'}
              </>
            )
          }
          loading={loading}
        />
        <SpendingCard
          label={`Spent · ${title} · ${vatLabel}`}
          value={spent}
          hint={
            <>
              {spentTrend === null ? (
                <>Nothing recorded to compare against the previous period</>
              ) : (
                <>
                  <Trend value={spentTrend} positiveIsUp={false} />
                  {` vs. ${previousTitle}`}
                </>
              )}
              {' · Add a purchase'}
            </>
          }
        />
        <StatCard
          label="To fulfil"
          value={String(overview.unfulfilledCount)}
          hint="Paid orders that were not sent yet"
          to="/admin/orders?fulfilment=open"
          highlight={overview.unfulfilledCount > 0}
        />
        <StatCard
          label="Orders"
          value={String(totalOrders(overview))}
          hint={`${overview.stats.paid ?? 0} paid · ${overview.stats.pending ?? 0} awaiting payment`}
          to="/admin/orders"
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
          <h2>Latest orders</h2>
          <Link to="/admin/orders" className="admin-panel-link">
            View all orders →
          </Link>
        </header>

        {overview.recentOrders.length === 0 ? (
          <p className="admin-empty-inline">
            Nothing yet. Record a sale in the shop or wait for the first online order.
          </p>
        ) : (
          <ul className="admin-recent">
            {overview.recentOrders.map((order) => (
              <li key={order.id} className="admin-recent-item">
                <div>
                  <Link to="/admin/orders" className="admin-recent-number">
                    {order.orderNumber}
                  </Link>
                  <p className="admin-recent-meta">
                    {order.customer.email ?? `${order.customer.firstName} ${order.customer.lastName}`}
                  </p>
                </div>
                <div className="admin-recent-side">
                  <span className={`admin-badge is-${order.status}`}>{order.status}</span>
                  <span className="admin-recent-total">{formatEuros(order.totalCents)}</span>
                  <time
                    dateTime={order.createdAt}
                    title={formatDateTime(order.createdAt)}
                  >
                    {formatRelativeTime(order.createdAt)}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        )}
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

function totalOrders(overview: AdminOverview): number {
  return Object.values(overview.stats).reduce((sum, count) => sum + count, 0)
}

// Up/down arrow with the percentage, coloured for good or bad news. "Positive
// is up" defaults to true; spending flips it because rising costs are bad.
function Trend({ value, positiveIsUp = true }: { value: number; positiveIsUp?: boolean }) {
  const up = positiveIsUp ? value >= 0 : value < 0
  return (
    <span className={up ? 'admin-trend is-up' : 'admin-trend is-down'}>
      {up ? '▲' : '▼'} {Math.abs(Math.round(value))}%
    </span>
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

function StatCard({
  label,
  value,
  hint,
  to,
  highlight = false,
}: {
  label: string
  value: string
  hint: string
  to?: string
  highlight?: boolean
}) {
  const body = (
    <>
      <h2 className="admin-card-label">{label}</h2>
      <p className={`admin-card-value${highlight ? ' is-highlight' : ''}`}>{value}</p>
      <p className="admin-card-hint">{hint}</p>
    </>
  )

  return to ? (
    <Link className="admin-card is-link" to={to}>
      {body}
    </Link>
  ) : (
    <article className="admin-card">{body}</article>
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