import { type FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ADMIN_STATUSES,
  adminLogin,
  checkAdminSession,
  clearAdminToken,
  fetchAdminOrders,
  formatDateTime,
  formatEuros,
  getAdminToken,
  setAdminToken,
  type AdminOrdersResponse,
} from '../../admin/api'
import { LoadingButton } from '../../components/ui/LoadingButton'

type LoadState = 'loading' | 'ready' | 'error'

export function Admin() {
  const [token, setToken] = useState<string | null>(() => getAdminToken())

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginState, setLoginState] = useState<'idle' | 'sending'>('idle')
  const [loginError, setLoginError] = useState('')

  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [loadError, setLoadError] = useState('')
  const [filter, setFilter] = useState('all')
  const [data, setData] = useState<AdminOrdersResponse | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setExpanded(null)
      if (!token) {
        setLoadState('ready')
        return
      }
      setLoadState('loading')
      setLoadError('')

      const valid = await checkAdminSession(token)
      if (cancelled) return
      if (!valid) {
        clearAdminToken()
        setToken(null)
        setLoadState('ready')
        return
      }

      try {
        const response = await fetchAdminOrders(
          token,
          filter === 'all' ? undefined : filter,
        )
        if (cancelled) return
        setData(response)
        setLoadState('ready')
      } catch (error) {
        if (cancelled) return
        setLoadError(error instanceof Error ? error.message : 'Failed to load')
        setLoadState('error')
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [token, filter])

  async function handleLogin(event: FormEvent) {
    event.preventDefault()
    setLoginState('sending')
    setLoginError('')
    try {
      const result = await adminLogin(username, password)
      setAdminToken(result.token)
      setToken(result.token)
      setLoginState('idle')
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login failed')
      setLoginState('idle')
    }
  }

  function handleLogout() {
    clearAdminToken()
    setToken(null)
    setData(null)
    setUsername('')
    setPassword('')
  }

  if (!token) {
    return (
      <div className="admin-page">
        <header className="admin-header">
          <div className="admin-header-inner">
            <Link to="/" className="admin-brand">
              EarthyGlow <span>Admin</span>
            </Link>
            <Link to="/" className="btn btn-ghost">
              Back to shop
            </Link>
          </div>
        </header>
        <main className="admin-login-wrap">
          <form className="admin-login" onSubmit={handleLogin}>
            <h1>Admin sign in</h1>
            <p className="admin-login-lede">
              Sign in to view the store’s orders.
            </p>
            <label className="field">
              <span>Username</span>
              <input
                type="text"
                name="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                autoFocus
                required
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            <LoadingButton
              type="submit"
              className="btn btn-primary admin-login-submit"
              loading={loginState === 'sending'}
            >
              Sign in
            </LoadingButton>
            {loginError !== '' && (
              <p className="form-note is-error">{loginError}</p>
            )}
          </form>
        </main>
      </div>
    )
  }

  const stats = data?.stats ?? null

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-header-inner">
          <span className="admin-brand">
            EarthyGlow <span>Admin</span>
          </span>
          <div className="admin-header-actions">
            <Link to="/" className="btn btn-ghost">
              Back to shop
            </Link>
            <button type="button" className="btn btn-ghost" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-main-head">
          <h1>Orders</h1>
          {stats && (
            <div className="admin-stats" role="tablist" aria-label="Filter by status">
              <button
                type="button"
                className={`admin-stat${filter === 'all' ? ' is-active' : ''}`}
                onClick={() => setFilter('all')}
              >
                <span className="admin-stat-name">All</span>
                <span className="admin-stat-count">
                  {Object.values(stats).reduce((sum, count) => sum + count, 0)}
                </span>
              </button>
              {ADMIN_STATUSES.map((status) => (
                <button
                  type="button"
                  key={status}
                  className={`admin-stat${filter === status ? ' is-active' : ''}`}
                  onClick={() => setFilter(status)}
                >
                  <span className="admin-stat-name">{status}</span>
                  <span className="admin-stat-count">{stats[status] ?? 0}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {loadState === 'loading' && <p className="admin-note">Loading orders…</p>}
        {loadState === 'error' && <p className="form-note is-error">{loadError}</p>}

        {loadState === 'ready' && data && data.orders.length === 0 && (
          <p className="admin-note">No orders in this view.</p>
        )}

        {loadState === 'ready' && data && data.orders.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Invoice</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((order) => {
                  const isOpen = expanded === order.id
                  return (
                    <OrderRow
                      key={order.id}
                      order={order}
                      open={isOpen}
                      onToggle={() => setExpanded(isOpen ? null : order.id)}
                    />
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}

function OrderRow({
  order,
  open,
  onToggle,
}: {
  order: AdminOrdersResponse['orders'][number]
  open: boolean
  onToggle: () => void
}) {
  const customer = order.customer
  return (
    <>
      <tr
        className={`admin-order${open ? ' is-open' : ''}`}
        onClick={onToggle}
        aria-expanded={open}
      >
        <td>
          <button type="button" className="admin-order-number">
            <span className="admin-caret" aria-hidden="true">
              {open ? '▾' : '▸'}
            </span>
            {order.orderNumber}
          </button>
        </td>
        <td>{formatDateTime(order.createdAt)}</td>
        <td>
          <span className="admin-customer">
            <strong>
              {customer.firstName} {customer.lastName}
            </strong>
            <span>{customer.email}</span>
          </span>
        </td>
        <td>
          <span className={`admin-badge is-${order.status}`}>{order.status}</span>
        </td>
        <td>{order.paymentMethod ?? '—'}</td>
        <td className="admin-price">{formatEuros(order.totalCents)}</td>
        <td>
          <span className="admin-muted">
            {order.invoiceSentAt
              ? formatDateTime(order.invoiceSentAt)
              : order.status === 'paid'
                ? 'not sent'
                : '—'}
          </span>
        </td>
      </tr>
      {open && (
        <tr className="admin-order-detail-row">
          <td colSpan={7}>
            <div className="admin-order-detail">
              <div className="admin-detail-col">
                <h3>Items</h3>
                <table className="admin-detail-items">
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}{item.variantLabel && <small className="admin-order-variant">{item.variantLabel}</small>}</td>
                        <td>× {item.quantity}</td>
                        <td>{formatEuros(item.lineTotalCents)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    {order.shippingCents > 0 && (
                      <tr>
                        <td colSpan={2}>Shipping</td>
                        <td>{formatEuros(order.shippingCents)}</td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={2}>Total</td>
                      <td>{formatEuros(order.totalCents)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className="admin-detail-col">
                <h3>Ship to</h3>
                <p>
                  {customer.firstName} {customer.lastName}
                  <br />
                  {order.address}
                  <br />
                  {order.postalCode} {order.city}
                  <br />
                  {order.country}
                  {customer.phone && (
                    <>
                      <br />
                      {customer.phone}
                    </>
                  )}
                </p>
                {order.notes && (
                  <>
                    <h3>Notes</h3>
                    <p>{order.notes}</p>
                  </>
                )}
              </div>
              <div className="admin-detail-col">
                <h3>Payment</h3>
                <p>
                  Method: {order.paymentMethod ?? '—'}
                  <br />
                  Subtotal: {formatEuros(order.subtotalCents)}
                  <br />
                  Status: {order.status}
                  <br />
                  Paid: {formatDateTime(order.paidAt)}
                  <br />
                  Invoice sent: {formatDateTime(order.invoiceSentAt)}
                </p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
