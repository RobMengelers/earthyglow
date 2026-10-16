import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  addAdminMaterialStock,
  createAdminMaterial,
  fetchAdminMaterials,
  formatAmount,
  type AdminMaterial,
} from '../../admin/api'
import { LoadingButton } from '../../components/ui/LoadingButton'
import { siteMeta } from '../../lib/seo'
import { useAdmin } from './admin-context'

export function meta() {
  return siteMeta({ title: 'Add material · EarthyGlow Admin', robots: 'noindex, nofollow' })
}

// Units come from a fixed list rather than free text: "kgs", "KG" and "kg" as
// separate spellings would quietly break the per-product calculations later.
const UNITS = ['g', 'kg', 'ml', 'l', 'pcs'] as const

export default function NewMaterialPage() {
  const { token } = useAdmin()
  const navigate = useNavigate()

  const [materials, setMaterials] = useState<AdminMaterial[]>([])

  const [name, setName] = useState('')
  const [unit, setUnit] = useState('')
  const [quantity, setQuantity] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const [stockMaterialId, setStockMaterialId] = useState('')
  const [stockAmount, setStockAmount] = useState('')
  const [stockError, setStockError] = useState('')
  const [stockSaving, setStockSaving] = useState(false)
  const [stockNotice, setStockNotice] = useState('')

  useEffect(() => {
    if (!token) return
    let cancelled = false
    fetchAdminMaterials(token)
      .then((data) => {
        if (cancelled) return
        setMaterials(data.materials)
        if (data.materials.length > 0) {
          setStockMaterialId((current) => current || data.materials[0].id)
        }
      })
      .catch(() => { /* the create form still works; top-up just has no options */ })
    return () => { cancelled = true }
  }, [token])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!token) return
    setError('')
    setSaving(true)
    try {
      const material = await createAdminMaterial(token, {
        name: name.trim(),
        unit,
        quantity: quantity.trim(),
      })
      navigate('/admin/materials', {
        state: { notice: `Material "${material.name}" added.` },
      })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save the material')
      setSaving(false)
    }
  }

  async function handleStockSubmit(event: FormEvent) {
    event.preventDefault()
    if (!token || !stockMaterialId) return
    setStockError('')
    setStockNotice('')
    setStockSaving(true)
    try {
      const updated = await addAdminMaterialStock(token, stockMaterialId, stockAmount.trim())
      setMaterials((current) =>
        current.map((material) => (material.id === updated.id ? updated : material)),
      )
      setStockAmount('')
      setStockNotice(
        `${updated.name}: ${formatAmount(updated.quantity)} ${updated.unit} on hand now.`,
      )
    } catch (caught) {
      setStockError(caught instanceof Error ? caught.message : 'Could not update the stock')
    } finally {
      setStockSaving(false)
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Add material</h1>
          <p className="admin-page-sub">
            Record a new material with what is on hand, or top up stock that is
            already on the list. A negative amount corrects stock down.
          </p>
        </div>
        <div className="admin-page-actions">
          <Link to="/admin/materials" className="btn btn-ghost">
            ← Back to overview
          </Link>
        </div>
      </header>

      <section className="admin-panel">
        <header className="admin-panel-head">
          <h2>New material</h2>
        </header>
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <label>
              <span>Material</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Soy wax"
                maxLength={80}
                required
              />
            </label>
            <label>
              <span>Unit</span>
              <select value={unit} onChange={(event) => setUnit(event.target.value)} required>
                <option value="">Choose a unit…</option>
                {UNITS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="is-wide">
              <span>Amount on hand</span>
              <input
                type="text"
                inputMode="decimal"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                placeholder="e.g. 5"
                required
              />
            </label>
          </div>

          <div className="admin-form-actions">
            <LoadingButton type="submit" className="btn btn-primary" loading={saving}>
              Add material
            </LoadingButton>
          </div>

          {error !== '' && <p className="form-note is-error">{error}</p>}
        </form>
      </section>

      <section className="admin-panel">
        <header className="admin-panel-head">
          <h2>Top up stock</h2>
        </header>

        {materials.length === 0 ? (
          <p className="admin-empty-inline">
            Nothing to top up yet — add a material above first.
          </p>
        ) : (
          <form className="admin-form" onSubmit={handleStockSubmit}>
            <div className="admin-form-grid">
              <label>
                <span>Material</span>
                <select
                  value={stockMaterialId}
                  onChange={(event) => setStockMaterialId(event.target.value)}
                  required
                >
                  {materials.map((material) => (
                    <option key={material.id} value={material.id}>
                      {material.name} — {formatAmount(material.quantity)} {material.unit} on hand
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Amount to add</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={stockAmount}
                  onChange={(event) => setStockAmount(event.target.value)}
                  placeholder="e.g. 2,5"
                  required
                />
              </label>
            </div>

            <div className="admin-form-actions">
              <LoadingButton type="submit" className="btn btn-primary" loading={stockSaving}>
                Add to stock
              </LoadingButton>
            </div>

            {stockNotice !== '' && <p className="form-note is-success">{stockNotice}</p>}
            {stockError !== '' && <p className="form-note is-error">{stockError}</p>}
          </form>
        )}
      </section>
    </div>
  )
}
