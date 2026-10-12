import { type FormEvent, useCallback, useEffect, useState } from 'react'
import {
  createAdminPurchase,
  deleteAdminPurchase,
  downloadAdminPurchaseDocument,
  eurosToCents,
  fetchAdminPurchases,
  formatDate,
  formatEuros,
  splitIncludedVat,
  type AdminPurchase,
} from '../../admin/api'
import { LoadingButton } from '../../components/ui/LoadingButton'
import { siteMeta } from '../../lib/seo'
import { useAdmin } from './admin-context'

const MAX_DOCUMENT_BYTES = 15 * 1024 * 1024

export function meta() {
  return siteMeta({ title: 'Purchases · EarthyGlow Admin', robots: 'noindex, nofollow' })
}

function todayInput(): string {
  // The date input wants local calendar days; toISOString alone would shift it
  // in timezones behind UTC.
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10)
}

export default function PurchasesPage() {
  const { token, refreshOverview } = useAdmin()
  const [purchases, setPurchases] = useState<AdminPurchase[] | null>(null)
  const [loadError, setLoadError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const [date, setDate] = useState(todayInput)
  const [description, setDescription] = useState('')
  const [cost, setCost] = useState('')
  const [document, setDocument] = useState<File | null>(null)
  const [formError, setFormError] = useState('')
  const [saved, setSaved] = useState(false)
  const [submitting, setSubmitting] = useState(false)

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

  const totals = purchases?.reduce(
    (sum, purchase) => ({
      costCents: sum.costCents + purchase.costCents,
      netCents: sum.netCents + purchase.netCents,
      vatCents: sum.vatCents + purchase.vatCents,
    }),
    { costCents: 0, netCents: 0, vatCents: 0 },
  )

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!token) return
    setFormError('')
    setSaved(false)

    const costCents = eurosToCents(cost)
    if (costCents === null) {
      setFormError('Enter the total cost in euros, e.g. 24,50')
      return
    }
    if (document && document.size > MAX_DOCUMENT_BYTES) {
      setFormError('The document is too large (max 15 MB)')
      return
    }

    setSubmitting(true)
    try {
      const purchase = await createAdminPurchase(token, {
        date,
        description,
        cost,
        document: document ?? undefined,
      })
      setPurchases((current) => [purchase, ...(current ?? [])])
      setDate(todayInput())
      setDescription('')
      setCost('')
      setDocument(null)
      setSaved(true)
      refreshOverview()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not save the purchase')
    } finally {
      setSubmitting(false)
    }
  }

  async function removePurchase(purchase: AdminPurchase) {
    if (!token) return
    if (!window.confirm(`Delete the purchase "${purchase.description}"?`)) return
    try {
      await deleteAdminPurchase(token, purchase.id)
      setPurchases((current) => (current ?? []).filter((item) => item.id !== purchase.id))
      refreshOverview()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not delete the purchase')
    }
  }

  const downloadDocument = useCallback(
    async (purchase: AdminPurchase) => {
      if (!token) return
      try {
        await downloadAdminPurchaseDocument(token, purchase)
      } catch (error) {
        setFormError(error instanceof Error ? error.message : 'Could not download the document')
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
      </header>

      {loadError !== '' && (
        <p className="form-note is-error">
          {loadError}{' '}
          <button type="button" className="admin-link-button" onClick={() => setReloadKey((key) => key + 1)}>
            Try again
          </button>
        </p>
      )}

      {saved && <p className="form-note is-success">Purchase saved.</p>}

      <section className="admin-panel">
        <header className="admin-panel-head">
          <h2>Add a purchase</h2>
        </header>
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-purchase-form">
            <label>
              <span>Date bought</span>
              <input
                type="date"
                value={date}
                max={todayInput()}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </label>
            <label>
              <span>Total cost <small className="admin-optional">incl. 21% VAT</small></span>
              <input
                type="text"
                inputMode="decimal"
                value={cost}
                onChange={(event) => setCost(event.target.value)}
                placeholder="e.g. 24,50"
                required
              />
            </label>
            <label className="is-wide">
              <span>What we bought</span>
              <input
                type="text"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="e.g. Soy wax, 5 kg · wick spools · packaging"
                maxLength={300}
                required
              />
            </label>
            <label className="is-wide">
              <span>Document <small className="admin-optional">optional</small></span>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.heic"
                onChange={(event) => setDocument(event.target.files?.[0] ?? null)}
              />
              <small className="admin-form-hint">
                {document ? document.name : 'A receipt or delivery note to keep with the purchase.'}
              </small>
            </label>
          </div>

          <div className="admin-form-summary">
            <VatBreakdown cost={cost} />
            <div className="admin-form-actions">
              <LoadingButton type="submit" className="btn btn-primary" loading={submitting}>
                Save purchase
              </LoadingButton>
            </div>
          </div>

          {formError !== '' && <p className="form-note is-error">{formError}</p>}
        </form>
      </section>

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
                      Nothing recorded yet. Add the first purchase above.
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

// Live preview of how the 21% VAT split of the typed cost will be recorded.
function VatBreakdown({ cost }: { cost: string }) {
  const costCents = eurosToCents(cost)
  const split = costCents === null ? null : splitIncludedVat(costCents)

  return (
    <div className="admin-vat-breakdown" aria-live="polite">
      <span>
        Total
        <strong>{costCents === null ? '—' : formatEuros(costCents)}</strong>
      </span>
      <span>
        Excl. VAT
        <strong>{split === null ? '—' : formatEuros(split.netCents)}</strong>
      </span>
      <span>
        VAT (21%)
        <strong>{split === null ? '—' : formatEuros(split.vatCents)}</strong>
      </span>
    </div>
  )
}