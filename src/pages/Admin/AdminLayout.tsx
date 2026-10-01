import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import {
  adminLogin,
  checkAdminSession,
  clearAdminToken,
  fetchAdminOverview,
  getAdminToken,
  setAdminToken,
  type AdminOverview,
} from '../../admin/api'
import { LoadingButton } from '../../components/ui/LoadingButton'
import { AdminContext, useAdmin, type AdminStatus } from './admin-context'

export function AdminLayout() {
  return (
    <AdminProvider>
      <AdminShell />
    </AdminProvider>
  )
}

function AdminProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getAdminToken())
  // The token that passed the session check. While it differs from `token` the
  // session is still being verified, which is what `status` reports.
  const [verifiedToken, setVerifiedToken] = useState<string | null>(null)
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [overviewError, setOverviewError] = useState('')
  const [overviewKey, setOverviewKey] = useState(0)

  const status: AdminStatus =
    token === null ? 'signed-out' : verifiedToken === token ? 'signed-in' : 'checking'

  const expireSession = useCallback(() => {
    clearAdminToken()
    setToken(null)
    setVerifiedToken(null)
  }, [])

  // A stored token proves nothing: it may have expired while the tab was
  // closed, so it is checked before any page trusts it.
  useEffect(() => {
    if (!token) return
    let cancelled = false
    void checkAdminSession(token).then((valid) => {
      if (cancelled) return
      if (!valid) {
        expireSession()
        return
      }
      setVerifiedToken(token)
    })
    return () => { cancelled = true }
  }, [token, expireSession])

  // Fetched once here rather than per page: the nav badge and the overview
  // cards read the same numbers and must never disagree.
  useEffect(() => {
    if (status !== 'signed-in' || !token) return
    let cancelled = false

    fetchAdminOverview(token)
      .then((next) => {
        if (cancelled) return
        setOverview(next)
        setOverviewError('')
      })
      .catch((error: unknown) => {
        if (cancelled) return
        const message = error instanceof Error ? error.message : 'Could not load the overview'
        // An expired session must not leave a half-working portal behind.
        if (message === 'Session expired') {
          expireSession()
          return
        }
        setOverviewError(message)
      })

    return () => { cancelled = true }
  }, [status, token, overviewKey, expireSession])

  async function signIn(username: string, password: string) {
    const result = await adminLogin(username, password)
    setAdminToken(result.token)
    setToken(result.token)
  }

  function signOut() {
    clearAdminToken()
    setToken(null)
    setVerifiedToken(null)
    setOverview(null)
    setOverviewError('')
  }

  return (
    <AdminContext.Provider
      value={{
        token,
        status,
        overview,
        overviewError,
        // Nothing to show yet and nothing wrong: the dashboard is loading.
        overviewLoading:
          status === 'signed-in' && overview === null && overviewError === '',
        signIn,
        signOut,
        refreshOverview: () => setOverviewKey((key) => key + 1),
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

function AdminShell() {
  const { token, status, overview, signOut } = useAdmin()

  if (status === 'checking') {
    return (
      <div className="admin-boot">
        <p>Checking your session…</p>
      </div>
    )
  }

  if (status === 'signed-out' || !token) return <AdminLogin />

  const toFulfil = overview?.unfulfilledCount ?? 0

  return (
    <div className="admin-shell">
      <a className="admin-skip" href="#admin-content">
        Skip to content
      </a>

      <aside className="admin-sidebar">
        <Link to="/admin/overview" className="admin-brand">
          EarthyGlow <span>Admin</span>
        </Link>

        <nav className="admin-nav" aria-label="Admin sections">
          <NavLink to="/admin/orders/new" className="admin-nav-new">
            <span aria-hidden="true">+</span> New order
          </NavLink>
          <NavLink to="/admin/overview" end className="admin-nav-link">
            Overview
          </NavLink>
          <NavLink to="/admin/orders" end className="admin-nav-link">
            Orders
            {toFulfil > 0 && (
              <span
                className="admin-nav-badge"
                title={`${toFulfil} paid order${toFulfil === 1 ? '' : 's'} still to fulfil`}
              >
                {toFulfil}
              </span>
            )}
          </NavLink>
        </nav>

        <div className="admin-sidebar-foot">
          <Link to="/" className="admin-nav-link">
            Back to shop
          </Link>
          <button type="button" className="admin-nav-link is-button" onClick={signOut}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="admin-content" id="admin-content">
        <Outlet />
      </main>
    </div>
  )
}

function AdminLogin() {
  const { signIn } = useAdmin()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [state, setState] = useState<'idle' | 'sending'>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setState('sending')
    setError('')
    try {
      await signIn(username, password)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Login failed')
      setState('idle')
    }
  }

  return (
    <div className="admin-login-wrap">
      <form className="admin-login" onSubmit={handleSubmit}>
        <span className="admin-brand">
          EarthyGlow <span>Admin</span>
        </span>
        <h1>Sign in</h1>
        <p className="admin-login-lede">
          Orders, in-person sales and invoices for the shop.
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
          loading={state === 'sending'}
        >
          Sign in
        </LoadingButton>
        {error !== '' && <p className="form-note is-error">{error}</p>}
        <p className="admin-login-foot">
          <Link to="/">← Back to the shop</Link>
        </p>
      </form>
    </div>
  )
}
