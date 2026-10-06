import { Link } from 'react-router'
import {
  formatDateTime,
  formatEuros,
  formatRelativeTime,
  type AdminOverview,
} from '../../admin/api'
import { siteMeta } from '../../lib/seo'
import { useAdmin } from './admin-context'

export function meta() {
  return siteMeta({ title: 'Overview · EarthyGlow Admin', robots: 'noindex, nofollow' })
}

export default function OverviewPage() {
  const { overview, overviewError, overviewLoading, refreshOverview } = useAdmin()

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Overview</h1>
          <p className="admin-page-sub">Where the shop stands right now.</p>
        </div>
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
        <>
          <div className="admin-cards">
            <RevenueCard overview={overview} loading={overviewLoading} />
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
            <StatCard
              label="Customers"
              value={String(overview.customerCount)}
              hint="In the shop and online"
            />
          </div>

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
      )}
    </div>
  )
}

function totalOrders(overview: AdminOverview): number {
  return Object.values(overview.stats).reduce((sum, count) => sum + count, 0)
}

function RevenueCard({ overview, loading }: { overview: AdminOverview; loading: boolean }) {
  const { revenueCents, previousRevenueCents } = overview
  const trend =
    previousRevenueCents === 0
      ? null
      : ((revenueCents - previousRevenueCents) / previousRevenueCents) * 100

  return (
    <article className="admin-card">
      <h2 className="admin-card-label">Revenue · last 30 days</h2>
      <p className={`admin-card-value${loading ? ' is-loading' : ''}`}>
        {formatEuros(revenueCents)}
      </p>
      <p className="admin-card-hint">
        {trend === null ? (
          <>No paid orders in the previous 30 days to compare</>
        ) : (
          <>
            <span className={trend >= 0 ? 'admin-trend is-up' : 'admin-trend is-down'}>
              {trend >= 0 ? '▲' : '▼'} {Math.abs(Math.round(trend))}%
            </span>{' '}
            vs. previous 30 days ({formatEuros(previousRevenueCents)})
          </>
        )}
      </p>
    </article>
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
