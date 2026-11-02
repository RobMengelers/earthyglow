import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  createAdminRecipe,
  fetchAdminCatalog,
  fetchAdminMaterials,
  formatAmount,
  updateAdminRecipe,
  type AdminCatalogProduct,
  type AdminMaterial,
  type AdminRecipe,
} from '../../admin/api'
import { LoadingButton } from '../../components/ui/LoadingButton'
import { siteMeta } from '../../lib/seo'
import { useAdmin } from './admin-context'

export function meta() {
  return siteMeta({ title: 'Recipe · EarthyGlow Admin', robots: 'noindex, nofollow' })
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
  const { id } = useParams()
  const editing = id !== undefined

  const [materials, setMaterials] = useState<AdminMaterial[]>([])
  const [catalog, setCatalog] = useState<AdminCatalogProduct[]>([])
  const [loadError, setLoadError] = useState('')
  const [recipeLoaded, setRecipeLoaded] = useState(!editing)

  const [productId, setProductId] = useState('')
  const [variantId, setVariantId] = useState('')
  const [colorId, setColorId] = useState('')
  const [recipes, setRecipes] = useState<AdminRecipe[]>([])
  const selectedProduct = catalog.find(product => product.id === productId)
  const duplicate = recipes.find(recipe => recipe.id !== id && recipe.product.id === productId && (recipe.variantId ?? '') === variantId && (recipe.colorId ?? '') === colorId)
  const [cost, setCost] = useState('')
  const [ingredients, setIngredients] = useState<IngredientLine[]>([emptyIngredient(1)])
  const [fields, setFields] = useState<FieldLine[]>([emptyField(1)])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    fetchAdminMaterials(token)
      .then((data) => {
        if (cancelled) return
        setMaterials(data.materials)
        setRecipes(data.recipes)

        if (!id) return
        const recipe = data.recipes.find((item) => item.id === id)
        if (!recipe) {
          setLoadError('This recipe no longer exists')
          return
        }

        setProductId(recipe.product.id)
        setVariantId(recipe.variantId ?? '')
        setColorId(recipe.colorId ?? '')
        setCost(recipe.costCents == null ? '' : (recipe.costCents / 100).toFixed(2))
        setIngredients(
          recipe.ingredients.length > 0
            ? recipe.ingredients.map((ingredient, index) => ({
                key: index + 1,
                materialId: ingredient.materialId,
                amount: formatAmount(ingredient.amount),
              }))
            : [emptyIngredient(1)],
        )
        setFields(
          recipe.fields.length > 0
            ? recipe.fields.map((field, index) => ({
                key: index + 1,
                label: field.label,
                value: field.value,
              }))
            : [emptyField(1)],
        )
        setRecipeLoaded(true)
      })
      .catch((caught: unknown) => {
        if (!cancelled) setLoadError(caught instanceof Error ? caught.message : 'Could not load materials')
      })
    return () => { cancelled = true }
  }, [token, id])

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
      const input = {
        productId,
        variantId: variantId || null,
        colorId: colorId || null,
        cost: cost.trim(),
        ingredients: ingredients.map((line) => ({
          materialId: line.materialId,
          amount: line.amount.trim(),
        })),
        fields: fields
          .filter((line) => line.label.trim() !== '' && line.value.trim() !== '')
          .map((line) => ({ label: line.label.trim(), value: line.value.trim() })),
      }
      const recipe =
        editing && id
          ? await updateAdminRecipe(token, id, input)
          : await createAdminRecipe(token, input)
      navigate('/admin/materials', {
        state: {
          notice: editing
            ? `Recipe for "${recipe.product.name}" updated.`
            : `Recipe for "${recipe.product.name}" saved.`,
        },
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
          <h1>{editing ? 'Edit recipe' : 'Add a recipe'}</h1>
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

      {editing && !recipeLoaded ? (
        <section className="admin-panel">
          <p className="admin-note">
            {loadError === '' ? 'Loading recipe…' : 'Could not load this recipe.'}
          </p>
        </section>
      ) : materials.length === 0 ? (
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
                  onChange={(event) => { setProductId(event.target.value); setVariantId(''); setColorId('') }}
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

            {selectedProduct && <div className="admin-recipe-block">
              <span className="admin-recipe-legend">Which version does this recipe make?</span>
              <p className="admin-note">Choose a variant and/or color for a distinct recipe. Leave both on “All” for a product default. A specific recipe takes priority over the default.</p>
              {selectedProduct.variants.length > 0 && <label>
                <span>Variant / size</span>
                <select value={variantId} onChange={event => setVariantId(event.target.value)}>
                  <option value="">All variants (default)</option>
                  {variantId && !selectedProduct.variants.some(v => v.id === variantId) && <option value={variantId}>{variantId} (unavailable)</option>}
                  {selectedProduct.variants.map(variant => <option key={variant.id} value={variant.id}>{variant.label}</option>)}
                </select>
              </label>}
              {!!selectedProduct.colors?.length && <label>
                <span>Color</span>
                <select value={colorId} onChange={event => setColorId(event.target.value)}>
                  <option value="">All colors (default)</option>
                  {colorId && !selectedProduct.colors.some(c => c.id === colorId) && <option value={colorId}>{colorId} (unavailable)</option>}
                  {selectedProduct.colors.map(color => <option key={color.id} value={color.id}>{color.label}</option>)}
                </select>
              </label>}
              {duplicate && <p className="form-note is-error">This version already has a recipe. <Link to={`/admin/recipes/${duplicate.id}/edit`}>Edit the existing recipe</Link> or choose another version.</p>}
              {recipes.some(recipe => recipe.product.id === productId && recipe.id !== id) && <label>
                <span>Start with an existing recipe (optional)</span>
                <select value="" onChange={event => {
                  const source = recipes.find(recipe => recipe.id === event.target.value)
                  if (!source) return
                  if ((cost || ingredients.some(line => line.materialId)) && !window.confirm('Replace the current ingredients, cost and extra details with this recipe?')) return
                  setCost(source.costCents == null ? '' : (source.costCents / 100).toFixed(2))
                  setIngredients(source.ingredients.map((line, index) => ({ key: index + 1, materialId: line.materialId, amount: formatAmount(line.amount) })))
                  setFields(source.fields.map((line, index) => ({ key: index + 1, ...line })))
                }}>
                  <option value="">Copy ingredients, cost and details from…</option>
                  {recipes.filter(recipe => recipe.product.id === productId && recipe.id !== id).map(recipe => <option key={recipe.id} value={recipe.id}>
                    {selectedProduct.variants.find(v => v.id === recipe.variantId)?.label ?? recipe.variantId ?? 'All variants'} / {selectedProduct.colors?.find(c => c.id === recipe.colorId)?.label ?? recipe.colorId ?? 'All colors'}
                  </option>)}
                </select>
                <small>The selected variant and color stay the same. Adjust the copied amounts and cost before saving.</small>
              </label>}
            </div>}

            <label>
              <span>Cost to make one product (€ incl. 21% VAT)</span>
              <input type="text" inputMode="decimal" value={cost}
                onChange={(event) => setCost(event.target.value)}
                placeholder="e.g. 4,50" required pattern="[0-9]{1,7}([,.][0-9]{1,2})?" />
              <small>Production cost for this recipe’s variant/color, not the customer selling price. Updating it recalculates historical profit estimates. Exact variant + color recipes take priority, followed by variant, color, then the product default.</small>
            </label>

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
                  setIngredients((current) => [...current, emptyIngredient(Math.max(0, ...current.map(line => line.key)) + 1)])
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
                onClick={() => setFields((current) => [...current, emptyField(Math.max(0, ...current.map(line => line.key)) + 1)])}
              >
                + Add detail
              </button>
            </div>

            <div className="admin-form-actions">
              <Link to="/admin/materials" className="btn btn-ghost">
                Cancel
              </Link>
              <LoadingButton type="submit" className="btn btn-primary" loading={saving} disabled={!!duplicate || !!loadError}>
                {editing ? 'Save changes' : 'Save recipe'}
              </LoadingButton>
            </div>

            {error !== '' && <p className="form-note is-error">{error}</p>}
          </form>
        </section>
      )}
    </div>
  )
}
