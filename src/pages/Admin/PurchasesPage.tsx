import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import {
  deleteAdminPurchase,
  downloadAdminPurchaseDocument,
  fetchAdminPurchases,
  formatDate,
  formatEuros,
  type AdminPurchase,
} from '../../admin/api'
import { siteMeta } from '../../lib/seo'
import { useAdmin } from './admin-context'

export function meta() {
  return siteMeta({ title: 'Purchases · EarthyGlow Admin', robots: 'noindex, nofollow' })
}

export default function PurchasesPage() {
  const { token, refreshOverview } = useAdmin()
  const location = useLocation()
  const navigate = useNavigate()
  const [purchases, setPurchases] = useState<AdminPurchase[] | null>(null)
  const [loadError, setLoadError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [flash, setFlash] = useState<{ tone: 'success' | 'error'; text: string } | undefined>(undefined)
  const noticeShown = useRef(false)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    fetchAdminPurchases(token)
      .then((data) => {
        if (cancelled) return
        setLoadError('')
        setPurchases(data.purchases)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setLoadError(error instanceof Error ? error.message : 'Could not load purchases')
      })
    return () => { cancelled = true }
  }, [token, reloadKey])

  // The add page sends you back here with the outcome in the route state, so
  // the confirmation survives the redirect without a global store.
  useEffect(() => {
    const notice = (location.state as { notice?: string } | null)?.notice
    if (!notice || noticeShown.current) return
    noticeShown.current = true
    setFlash({ tone: 'success', text: notice })
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null })
  }, [location.state, location.pathname, location.search, navigate])

  const totals = purchases?.reduce(
    (sum, purchase) => ({
      costCents: sum.costCents + purchase.costCents,
      netCents: sum.netCents + purchase.netCents,
      vatCents: sum.vatCents + purchase.vatCents,
    }),
    { costCents: 0, netCents: 0, vatCents: 0 },
  )

  async function removePurchase(purchase: AdminPurchase) {
    if (!token) return
    if (!window.confirm(`Delete the purchase "${purchase.description}"?`)) return
    try {
      await deleteAdminPurchase(token, purchase.id)
      setPurchases((current) => (current ?? []).filter((item) => item.id !== purchase.id))
      refreshOverview()
    } catch (error) {
      setFlash({
        tone: 'error',
        text: error instanceof Error ? error.message : 'Could not delete the purchase',
      })
    }
  }

  const downloadDocument = useCallback(
    async (purchase: AdminPurchase) => {
      if (!token) return
      try {
        await downloadAdminPurchaseDocument(token, purchase)
      } catch (error) {
        setFlash({
          tone: 'error',
          text: error instanceof Error ? error.message : 'Could not download the document',
        })
      }
    },
    [token],
  )

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Purchases</h1>
          <p className="admin-page-sub">
            Everything bought to make the candles — wax, wicks, moulds, packaging.
            What you record here shows up as spent on the overview.
          </p>
        </div>
        <div className="admin-page-actions">
          <Link to="/admin/purchases/new" className="btn btn-primary">
            + Add purchase
          </Link>
        </div>
      </header>

      {loadError !== '' && (
        <p className="form-note is-error">
          {loadError}{' '}
          <button
            type="button"
            className="admin-link-button"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Try again
          </button>
        </p>
      )}

      {flash && (
        <p className={`admin-flash is-${flash.tone}`} role="status">
          <span>{flash.text}</span>
          <button type="button" onClick={() => setFlash(undefined)} aria-label="Dismiss">
            ×
          </button>
        </p>
      )}

      <section className="admin-panel">
        <header className="admin-panel-head">
          <h2>Recorded purchases</h2>
          {purchases !== null && (
            <span className="admin-muted">{formatEuros(totals?.costCents ?? 0)} total spent</span>
          )}
        </header>

        <div className="admin-table-wrap">
          <table className="admin-table admin-purchase-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>What we bought</th>
                <th className="is-right">Cost incl. VAT</th>
                <th className="is-right">Excl. VAT</th>
                <th className="is-right">VAT (21%)</th>
                <th>Document</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {purchases === null ? (
                <tr>
                  <td colSpan={7}>
                    <p className="admin-note">
                      {loadError === '' ? 'Loading purchases…' : 'Could not load purchases.'}
                    </p>
                  </td>
                </tr>
              ) : purchases.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <p className="admin-empty-inline">
                      Nothing recorded yet.{' '}
                      <Link to="/admin/purchases/new" className="admin-panel-link">
                        Add the first purchase
                      </Link>
                      .
                    </p>
                  </td>
                </tr>
              ) : (
                purchases.map((purchase) => (
                  <tr key={purchase.id}>
                    <td>
                      <time dateTime={purchase.dateBought} title={purchase.dateBought}>
                        {formatDate(purchase.dateBought)}
                      </time>
                    </td>
                    <td>{purchase.description}</td>
                    <td className="is-right admin-price">{formatEuros(purchase.costCents)}</td>
                    <td className="is-right">{formatEuros(purchase.netCents)}</td>
                    <td className="is-right">{formatEuros(purchase.vatCents)}</td>
                    <td>
                      {purchase.hasDocument ? (
                        <button
                          type="button"
                          className="admin-doc-link"
                          onClick={() => void downloadDocument(purchase)}
                          title={purchase.documentName ?? undefined}
                        >
                          {purchase.documentName ?? 'Open document'}
                        </button>
                      ) : (
                        <span className="admin-muted">—</span>
                      )}
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="admin-row-action is-quiet"
                          onClick={() => void removePurchase(purchase)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {purchases !== null && purchases.length > 0 && (
              <tfoot>
                <tr className="is-total">
                  <td colSpan={2}>Total recorded</td>
                  <td className="is-right">{formatEuros(totals?.costCents ?? 0)}</td>
                  <td className="is-right">{formatEuros(totals?.netCents ?? 0)}</td>
                  <td className="is-right">{formatEuros(totals?.vatCents ?? 0)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </section>
    </div>
  )
}
