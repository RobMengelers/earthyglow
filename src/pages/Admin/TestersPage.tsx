import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { deleteAdminTester, fetchAdminTesters, formatDate, type AdminTester } from '../../admin/api'
import { siteMeta } from '../../lib/seo'
import { useAdmin } from './admin-context'

export function meta() {
  return siteMeta({ title: 'Testers · EarthyGlow Admin', robots: 'noindex, nofollow' })
}

function lineLabel(item: AdminTester['items'][number]): string {
  const options = [item.variantLabel, item.colorLabel].filter(Boolean).join(', ')
  return `${item.quantity} × ${item.name}${options ? ` (${options})` : ''}`
}

export default function TestersPage() {
  const { token } = useAdmin()
  const location = useLocation()
  const navigate = useNavigate()
  const [testers, setTesters] = useState<AdminTester[] | null>(null)
  const [loadError, setLoadError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [flash, setFlash] = useState<{ tone: 'success' | 'error'; text: string } | undefined>(undefined)
  const noticeShown = useRef(false)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    fetchAdminTesters(token)
      .then((data) => {
        if (cancelled) return
        setLoadError('')
        setTesters(data)
      })
      .catch((error: unknown) => {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : 'Could not load tester orders')
      })
    return () => { cancelled = true }
  }, [token, reloadKey])

  useEffect(() => {
    const notice = (location.state as { notice?: string } | null)?.notice
    if (!notice || noticeShown.current) return
    noticeShown.current = true
    setFlash({ tone: 'success', text: notice })
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null })
  }, [location.state, location.pathname, location.search, navigate])

  async function removeTester(tester: AdminTester) {
    if (!token) return
    if (!window.confirm(`Delete "${tester.description}"? Its materials go back into stock.`)) return
    try {
      await deleteAdminTester(token, tester.id)
      setTesters((current) => (current ?? []).filter((item) => item.id !== tester.id))
      setFlash({ tone: 'success', text: 'Tester order deleted and materials returned to stock.' })
    } catch (error) {
      setFlash({ tone: 'error', text: error instanceof Error ? error.message : 'Could not delete the tester order' })
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Testers</h1>
          <p className="admin-page-sub">
            Products used for testing or filming content. They subtract materials but do not count as sales.
          </p>
        </div>
        <div className="admin-page-actions">
          <Link to="/admin/testers/new" className="btn btn-primary">+ Add tester order</Link>
        </div>
      </header>

      {loadError !== '' && (
        <p className="form-note is-error">
          {loadError}{' '}
          <button type="button" className="admin-link-button" onClick={() => setReloadKey((key) => key + 1)}>
            Try again
          </button>
        </p>
      )}

      {flash && (
        <p className={`admin-flash is-${flash.tone}`} role="status">
          <span>{flash.text}</span>
          <button type="button" onClick={() => setFlash(undefined)} aria-label="Dismiss">×</button>
        </p>
      )}

      <section className="admin-panel">
        <header className="admin-panel-head">
          <h2>Recorded tester orders</h2>
        </header>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Used for</th>
                <th>Products</th>
                <th>Materials used</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {testers === null ? (
                <tr><td colSpan={5}><p className="admin-note">{loadError === '' ? 'Loading tester orders…' : 'Could not load tester orders.'}</p></td></tr>
              ) : testers.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <p className="admin-empty-inline">
                      Nothing recorded yet.{' '}
                      <Link to="/admin/testers/new" className="admin-panel-link">Add the first tester order</Link>.
                    </p>
                  </td>
                </tr>
              ) : testers.map((tester) => (
                <tr key={tester.id}>
                  <td><time dateTime={tester.usedAt}>{formatDate(tester.usedAt)}</time></td>
                  <td className="admin-tester-description">{tester.description}</td>
                  <td>{tester.items.map((item) => <div key={item.id}>{lineLabel(item)}</div>)}</td>
                  <td>
                    {tester.materials.length > 0
                      ? tester.materials.map((material) => (
                          <div key={material.id}>{Number(material.amount.toFixed(3))} {material.unit} {material.name}</div>
                        ))
                      : <span className="admin-muted">No recipe</span>}
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <Link to={`/admin/testers/${tester.id}/edit`} className="admin-row-action is-quiet">Edit</Link>
                      <button type="button" className="admin-row-action is-quiet" onClick={() => void removeTester(tester)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
