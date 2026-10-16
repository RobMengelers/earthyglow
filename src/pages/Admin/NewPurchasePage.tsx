import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  createAdminPurchase,
  eurosToCents,
  formatEuros,
  splitIncludedVat,
} from '../../admin/api'
import { LoadingButton } from '../../components/ui/LoadingButton'
import { siteMeta } from '../../lib/seo'
import { useAdmin } from './admin-context'

const MAX_DOCUMENT_BYTES = 15 * 1024 * 1024

export function meta() {
  return siteMeta({ title: 'Add purchase · EarthyGlow Admin', robots: 'noindex, nofollow' })
}

function todayInput(): string {
  // The date input wants local calendar days; toISOString alone would shift it
  // in timezones behind UTC.
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10)
}

export default function NewPurchasePage() {
  const { token, refreshOverview } = useAdmin()
  const navigate = useNavigate()

  const [date, setDate] = useState(todayInput)
  const [description, setDescription] = useState('')
  const [cost, setCost] = useState('')
  const [document, setDocument] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!token) return
    setError('')

    const costCents = eurosToCents(cost)
    if (costCents === null) {
      setError('Enter the total cost in euros, e.g. 24,50')
      return
    }
    if (document && document.size > MAX_DOCUMENT_BYTES) {
      setError('The document is too large (max 15 MB)')
      return
    }

    setSaving(true)
    try {
      await createAdminPurchase(token, {
        date,
        description,
        cost,
        document: document ?? undefined,
      })
      refreshOverview()
      navigate('/admin/purchases', {
        state: { notice: `Purchase "${description.trim()}" saved.` },
      })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save the purchase')
      setSaving(false)
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Add purchase</h1>
          <p className="admin-page-sub">
            Record something bought to make the candles. The cost is the total on
            the receipt, including 21% VAT — the split is worked out for you.
          </p>
        </div>
        <div className="admin-page-actions">
          <Link to="/admin/purchases" className="btn btn-ghost">
            ← Back to overview
          </Link>
        </div>
      </header>

      <section className="admin-panel">
        <header className="admin-panel-head">
          <h2>New purchase</h2>
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
              <span>
                Total cost <small className="admin-optional">incl. 21% VAT</small>
              </span>
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
              <span>
                Document <small className="admin-optional">optional</small>
              </span>
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
              <Link to="/admin/purchases" className="btn btn-ghost">
                Cancel
              </Link>
              <LoadingButton type="submit" className="btn btn-primary" loading={saving}>
                Save purchase
              </LoadingButton>
            </div>
          </div>

          {error !== '' && <p className="form-note is-error">{error}</p>}
        </form>
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
