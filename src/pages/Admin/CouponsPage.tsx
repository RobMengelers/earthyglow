import { useEffect, useState, type FormEvent } from 'react'
import {
  createAdminCoupon,
  fetchAdminCoupons,
  formatDate,
  setAdminCouponActive,
  type AdminCoupon,
  type AdminCouponType,
} from '../../admin/api'
import { siteMeta } from '../../lib/seo'
import { useAdmin } from './admin-context'

export function meta() {
  return siteMeta({ title: 'Coupons · EarthyGlow Admin', robots: 'noindex, nofollow' })
}

const TYPE_LABELS: Record<AdminCouponType, string> = {
  free_shipping: 'Free shipping',
  percent: 'Percentage off',
  fixed_amount: 'Amount off',
}

function describeCoupon(coupon: AdminCoupon): string {
  if (coupon.type === 'free_shipping') return 'No shipping cost'
  if (coupon.type === 'percent') return `${coupon.percentOff ?? 0}% off the subtotal`
  return `€${((coupon.amountOffCents ?? 0) / 100).toFixed(2)} off the subtotal`
}

export default function CouponsPage() {
  const { token } = useAdmin()
  const [coupons, setCoupons] = useState<AdminCoupon[] | null>(null)
  const [loadError, setLoadError] = useState('')
  const [flash, setFlash] = useState<{ tone: 'success' | 'error'; text: string } | undefined>(undefined)
  const [reloadKey, setReloadKey] = useState(0)
  const [saving, setSaving] = useState(false)

  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<AdminCouponType>('free_shipping')
  const [percentOff, setPercentOff] = useState('')
  const [amountOff, setAmountOff] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [expiresAt, setExpiresAt] = useState('')

  useEffect(() => {
    if (!token) return
    let cancelled = false
    fetchAdminCoupons(token)
      .then((data) => {
        if (cancelled) return
        setLoadError('')
        setCoupons(data.coupons)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setLoadError(error instanceof Error ? error.message : 'Could not load coupons')
      })
    return () => { cancelled = true }
  }, [token, reloadKey])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token || saving) return
    setSaving(true)
    setFlash(undefined)
    try {
      const created = await createAdminCoupon(token, {
        code,
        description: description.trim() || undefined,
        type,
        ...(type === 'percent' && percentOff ? { percentOff: Number(percentOff) } : {}),
        ...(type === 'fixed_amount' && amountOff
          ? { amountOffCents: Math.round(Number(amountOff.replace(',', '.')) * 100) }
          : {}),
        ...(maxUses ? { maxUses: Number(maxUses) } : {}),
        ...(expiresAt ? { expiresAt } : {}),
      })
      setCoupons((current) => [created, ...(current ?? [])])
      setCode('')
      setDescription('')
      setPercentOff('')
      setAmountOff('')
      setMaxUses('')
      setExpiresAt('')
      setFlash({ tone: 'success', text: `Coupon ${created.code} created.` })
    } catch (error) {
      setFlash({
        tone: 'error',
        text: error instanceof Error ? error.message : 'Could not create the coupon',
      })
    } finally {
      setSaving(false)
    }
  }

  async function toggleCoupon(coupon: AdminCoupon) {
    if (!token) return
    try {
      const updated = await setAdminCouponActive(token, coupon.id, !coupon.active)
      setCoupons((current) =>
        (current ?? []).map((item) => (item.id === coupon.id ? { ...item, active: updated.active } : item)),
      )
    } catch (error) {
      setFlash({
        tone: 'error',
        text: error instanceof Error ? error.message : 'Could not update the coupon',
      })
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Coupons</h1>
          <p className="admin-page-sub">
            Codes customers can enter at checkout. A code can take the shipping
            off, take a percentage off the subtotal or take a fixed amount off.
            Limit how often a code works to make it a one-time offer, and give
            it an end date when the season is over.
          </p>
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
          <h2>New coupon</h2>
        </header>
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <label className="field">
              <span>Code</span>
              <input
                type="text"
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                placeholder="XMAS20"
                maxLength={40}
                required
              />
            </label>
            <label className="field">
              <span>What it does</span>
              <select value={type} onChange={(event) => setType(event.target.value as AdminCouponType)}>
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            {type === 'percent' && (
              <label className="field">
                <span>Percentage off</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={percentOff}
                  onChange={(event) => setPercentOff(event.target.value)}
                  placeholder="20"
                  required
                />
              </label>
            )}
            {type === 'fixed_amount' && (
              <label className="field">
                <span>Amount off (€)</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={amountOff}
                  onChange={(event) => setAmountOff(event.target.value)}
                  placeholder="5,00"
                  required
                />
              </label>
            )}
            <label className="field">
              <span>Times it may be used (blank = always)</span>
              <input
                type="number"
                min={1}
                value={maxUses}
                onChange={(event) => setMaxUses(event.target.value)}
                placeholder="1"
              />
            </label>
            <label className="field">
              <span>Valid until (blank = forever)</span>
              <input
                type="date"
                value={expiresAt}
                onChange={(event) => setExpiresAt(event.target.value)}
              />
            </label>
            <label className="field is-wide">
              <span>Description (optional)</span>
              <input
                type="text"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Free shipping for friends and family"
                maxLength={200}
              />
            </label>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Creating…' : 'Create coupon'}
            </button>
          </div>
        </form>
      </section>

      <section className="admin-panel">
        <header className="admin-panel-head">
          <h2>Your codes</h2>
        </header>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>What it does</th>
                <th>Used</th>
                <th>Ends</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {coupons === null ? (
                <tr>
                  <td colSpan={6}>
                    <p className="admin-note">
                      {loadError === '' ? 'Loading coupons…' : 'Could not load coupons.'}
                    </p>
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <p className="admin-empty-inline">No coupons yet.</p>
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td>
                      <strong>{coupon.code}</strong>
                      {coupon.description && (
                        <small className="admin-muted"> {coupon.description}</small>
                      )}
                    </td>
                    <td>{describeCoupon(coupon)}</td>
                    <td>
                      {coupon.redemptions}
                      {coupon.maxUses !== null ? ` / ${coupon.maxUses}` : ''}
                    </td>
                    <td>
                      {coupon.expiresAt ? (
                        <time dateTime={coupon.expiresAt}>{formatDate(coupon.expiresAt)}</time>
                      ) : (
                        <span className="admin-muted">Never</span>
                      )}
                    </td>
                    <td>
                      <span className={`admin-badge ${coupon.active ? 'is-paid' : 'is-canceled'}`}>
                        {coupon.active ? 'Active' : 'Off'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="admin-row-action is-quiet"
                          onClick={() => void toggleCoupon(coupon)}
                        >
                          {coupon.active ? 'Turn off' : 'Turn on'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
