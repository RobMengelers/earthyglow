import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  createAdminRecipe,
  fetchAdminCatalog,
  fetchAdminMaterials,
  type AdminCatalogProduct,
  type AdminMaterial,
} from '../../admin/api'
import { LoadingButton } from '../../components/ui/LoadingButton'
import { siteMeta } from '../../lib/seo'
import { useAdmin } from './admin-context'

export function meta() {
  return siteMeta({ title: 'Add recipe · EarthyGlow Admin', robots: 'noindex, nofollow' })
}

type IngredientLine = {
  key: number
  materialId: string
  amount: string
}

type FieldLine = {
  key: number
  label: string
  value: string
}

function emptyIngredient(key: number): IngredientLine {
  return { key, materialId: '', amount: '' }
}

function emptyField(key: number): FieldLine {
  return { key, label: '', value: '' }
}

export default function NewRecipePage() {
  const { token } = useAdmin()
  const navigate = useNavigate()

  const [materials, setMaterials] = useState<AdminMaterial[]>([])
  const [catalog, setCatalog] = useState<AdminCatalogProduct[]>([])
  const [loadError, setLoadError] = useState('')

  const [productId, setProductId] = useState('')
  const [ingredients, setIngredients] = useState<IngredientLine[]>([emptyIngredient(1)])
  const [fields, setFields] = useState<FieldLine[]>([emptyField(1)])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    fetchAdminMaterials(token)
      .then((data) => { if (!cancelled) setMaterials(data.materials) })
      .catch((caught: unknown) => {
        if (!cancelled) setLoadError(caught instanceof Error ? caught.message : 'Could not load materials')
      })
    return () => { cancelled = true }
  }, [token])

  useEffect(() => {
    let cancelled = false
    fetchAdminCatalog()
      .then((products) => { if (!cancelled) setCatalog(products) })
      .catch(() => { if (!cancelled) setLoadError('Could not load products') })
    return () => { cancelled = true }
  }, [])

  function updateIngredient(key: number, patch: Partial<IngredientLine>) {
    setIngredients((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    )
  }

  function updateField(key: number, patch: Partial<FieldLine>) {
    setFields((current) => current.map((line) => (line.key === key ? { ...line, ...patch } : line)))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!token) return
    setError('')
    setSaving(true)
    try {
      const recipe = await createAdminRecipe(token, {
        productId,
        ingredients: ingredients.map((line) => ({
          materialId: line.materialId,
          amount: line.amount.trim(),
        })),
        fields: fields
          .filter((line) => line.label.trim() !== '' && line.value.trim() !== '')
          .map((line) => ({ label: line.label.trim(), value: line.value.trim() })),
      })
      navigate('/admin/materials', {
        state: { notice: `Recipe for "${recipe.product.name}" saved.` },
      })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save the recipe')
      setSaving(false)
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Add a recipe</h1>
          <p className="admin-page-sub">
            What one product is made of and any extra details. The overview then
            shows how many the leftover materials can still make.
          </p>
        </div>
        <div className="admin-page-actions">
          <Link to="/admin/materials" className="btn btn-ghost">
            ← Back to overview
          </Link>
        </div>
      </header>

      {loadError !== '' && <p className="form-note is-error">{loadError}</p>}

      {materials.length === 0 ? (
        <section className="admin-panel">
          <p className="admin-empty-inline">
            A recipe uses materials, and there are none yet.{' '}
            <Link to="/admin/materials/new" className="admin-panel-link">
              Add a material
            </Link>{' '}
            first (wax and scent are a good place to start).
          </p>
        </section>
      ) : (
        <section className="admin-panel">
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-recipe-product">
              <label>
                <span>Product this recipe makes</span>
                <select
                  value={productId}
                  onChange={(event) => setProductId(event.target.value)}
                  required
                >
                  <option value="">Choose a product…</option>
                  {catalog.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="admin-recipe-block">
              <span className="admin-recipe-legend">Materials used for one product</span>
              <div className="admin-recipe-lines">
                {ingredients.map((line) => {
                  const material = materials.find((item) => item.id === line.materialId)
                  return (
                    <div className="admin-recipe-line" key={line.key}>
                      <label>
                        <span>Material</span>
                        <select
                          value={line.materialId}
                          onChange={(event) => updateIngredient(line.key, { materialId: event.target.value })}
                          required
                        >
                          <option value="">Choose…</option>
                          {materials.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name} ({item.unit})
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span>{material ? `Amount (${material.unit})` : 'Amount'}</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={line.amount}
                          onChange={(event) => updateIngredient(line.key, { amount: event.target.value })}
                          placeholder="e.g. 0,05"
                          required
                        />
                      </label>
                      <button
                        type="button"
                        className="admin-manual-remove"
                        onClick={() =>
                          setIngredients((current) =>
                            current.length === 1
                              ? current
                              : current.filter((item) => item.key !== line.key),
                          )
                        }
                        disabled={ingredients.length === 1}
                        aria-label={`Remove material line ${line.key}`}
                      >
                        ×
                      </button>
                    </div>
                  )
                })}
              </div>
              <button
                type="button"
                className="admin-manual-add"
                onClick={() =>
                  setIngredients((current) => [...current, emptyIngredient(current.length + 1)])
                }
              >
                + Add material line
              </button>
            </div>

            <div className="admin-recipe-block">
              <span className="admin-recipe-legend">
                Extra details <small className="admin-optional">optional</small>
              </span>
              <div className="admin-recipe-lines">
                {fields.map((line) => (
                  <div className="admin-recipe-line is-field" key={line.key}>
                    <label>
                      <span>Name</span>
                      <input
                        type="text"
                        value={line.label}
                        onChange={(event) => updateField(line.key, { label: event.target.value })}
                        placeholder="e.g. Cure time"
                        maxLength={60}
                      />
                    </label>
                    <label>
                      <span>Value</span>
                      <input
                        type="text"
                        value={line.value}
                        onChange={(event) => updateField(line.key, { value: event.target.value })}
                        placeholder="e.g. 48 hours"
                        maxLength={300}
                      />
                    </label>
                    <button
                      type="button"
                      className="admin-manual-remove"
                      onClick={() =>
                        setFields((current) =>
                          current.length === 1 ? current : current.filter((item) => item.key !== line.key),
                        )
                      }
                      disabled={fields.length === 1}
                      aria-label={`Remove detail ${line.key}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="admin-manual-add"
                onClick={() => setFields((current) => [...current, emptyField(current.length + 1)])}
              >
                + Add detail
              </button>
            </div>

            <div className="admin-form-actions">
              <Link to="/admin/materials" className="btn btn-ghost">
                Cancel
              </Link>
              <LoadingButton type="submit" className="btn btn-primary" loading={saving}>
                Save recipe
              </LoadingButton>
            </div>

            {error !== '' && <p className="form-note is-error">{error}</p>}
          </form>
        </section>
      )}
    </div>
  )
}
