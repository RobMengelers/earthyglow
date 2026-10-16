import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import {
  deleteAdminMaterial,
  deleteAdminRecipe,
  fetchAdminMaterials,
  formatAmount,
  type AdminMaterial,
  type AdminMaterialsResponse,
  type AdminRecipe,
} from '../../admin/api'
import { getProduct } from '../../data/products'
import { siteMeta } from '../../lib/seo'
import { useAdmin } from './admin-context'
import { Modal } from './components/Modal'

export function meta() {
  return siteMeta({ title: 'Materials & recipes · EarthyGlow Admin', robots: 'noindex, nofollow' })
}

type Flash = { tone: 'success' | 'error'; text: string }

export default function MaterialsPage() {
  const { token } = useAdmin()
  const location = useLocation()
  const navigate = useNavigate()
  const [data, setData] = useState<AdminMaterialsResponse | null>(null)
  const [loadError, setLoadError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [flash, setFlash] = useState<Flash | undefined>(undefined)
  const [openRecipe, setOpenRecipe] = useState<AdminRecipe | null>(null)
  const noticeShown = useRef(false)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    fetchAdminMaterials(token)
      .then((next) => {
        if (cancelled) return
        setLoadError('')
        setData(next)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setLoadError(error instanceof Error ? error.message : 'Could not load materials')
      })
    return () => { cancelled = true }
  }, [token, reloadKey])

  // The input pages send you back here with the outcome in the route state, so
  // the confirmation survives the redirect without a global store.
  useEffect(() => {
    const notice = (location.state as { notice?: string } | null)?.notice
    if (!notice || noticeShown.current) return
    noticeShown.current = true
    setFlash({ tone: 'success', text: notice })
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null })
  }, [location.state, location.pathname, location.search, navigate])

  const materials = data?.materials ?? []
  const recipes = data?.recipes ?? []

  async function removeMaterial(material: AdminMaterial) {
    if (!token) return
    if (!window.confirm(`Delete the material "${material.name}"?`)) return
    try {
      await deleteAdminMaterial(token, material.id)
      setData((current) =>
        current
          ? { ...current, materials: current.materials.filter((item) => item.id !== material.id) }
          : current,
      )
    } catch (error) {
      setFlash({
        tone: 'error',
        text: error instanceof Error ? error.message : 'Could not delete the material',
      })
    }
  }

  async function removeRecipe(recipe: AdminRecipe) {
    if (!token) return
    if (!window.confirm(`Delete the recipe for "${recipe.product.name}"?`)) return
    try {
      await deleteAdminRecipe(token, recipe.id)
      setData((current) =>
        current ? { ...current, recipes: current.recipes.filter((item) => item.id !== recipe.id) } : current,
      )
      setOpenRecipe(null)
    } catch (error) {
      setFlash({
        tone: 'error',
        text: error instanceof Error ? error.message : 'Could not delete the recipe',
      })
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Materials &amp; recipes</h1>
          <p className="admin-page-sub">
            What is still on hand and how much of each product the leftover
            materials can still make. Add a material or a recipe to get started.
          </p>
        </div>
        <div className="admin-page-actions">
          <Link to="/admin/materials/new" className="btn btn-primary">
            + Add material
          </Link>
          <Link to="/admin/recipes/new" className="btn btn-ghost">
            + Add a recipe
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
          <h2>Materials on hand</h2>
          {data !== null && (
            <span className="admin-muted">
              {materials.length} material{materials.length === 1 ? '' : 's'}
            </span>
          )}
        </header>

        <div className="admin-table-wrap">
          <table className="admin-table admin-material-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Unit</th>
                <th className="is-right">On hand</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {data === null ? (
                <tr>
                  <td colSpan={4}>
                    <p className="admin-note">
                      {loadError === '' ? 'Loading materials…' : 'Could not load materials.'}
                    </p>
                  </td>
                </tr>
              ) : materials.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <p className="admin-empty-inline">
                      No materials yet. Add wax and scent to get started.
                    </p>
                  </td>
                </tr>
              ) : (
                materials.map((material) => (
                  <tr key={material.id}>
                    <td>{material.name}</td>
                    <td className="admin-muted">{material.unit}</td>
                    <td className="is-right admin-price">
                      {formatAmount(material.quantity)} {material.unit}
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="admin-row-action is-quiet"
                          onClick={() => void removeMaterial(material)}
                        >
                          Delete
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

      <section className="admin-panel">
        <header className="admin-panel-head">
          <h2>What you can still make</h2>
          {data !== null && (
            <span className="admin-muted">{recipes.length} recipe{recipes.length === 1 ? '' : 's'}</span>
          )}
        </header>

        {data === null ? (
          <p className="admin-note">
            {loadError === '' ? 'Loading recipes…' : 'Could not load recipes.'}
          </p>
        ) : recipes.length === 0 ? (
          <p className="admin-empty-inline">
            No recipes yet.{' '}
            <Link to="/admin/recipes/new" className="admin-panel-link">
              Add a recipe
            </Link>{' '}
            to see how much you can still make.
          </p>
        ) : (
          <div className="admin-yield-cards">
            {recipes.map((recipe) => (
              <YieldCard key={recipe.id} recipe={recipe} onOpen={() => setOpenRecipe(recipe)} />
            ))}
          </div>
        )}
      </section>

      {openRecipe && (
        <Modal
          title={openRecipe.product.name}
          onClose={() => setOpenRecipe(null)}
          wide
        >
          <RecipeDetail recipe={openRecipe} onDelete={() => void removeRecipe(openRecipe)} />
        </Modal>
      )}
    </div>
  )
}

// The overview card: photo, name, the single number that matters ("can still
// make") and what the product is made of. The whole card opens the full recipe.
function YieldCard({ recipe, onOpen }: { recipe: AdminRecipe; onOpen: () => void }) {
  const product = getProduct(recipe.product.id)
  const image = product?.images?.[0] ?? product?.image
  const options = product?.variants ?? []

  return (
    <button type="button" className="admin-yield-card" onClick={onOpen}>
      {image && (
        <img className="admin-yield-card-img" src={image} alt="" width={64} height={64} loading="lazy" />
      )}
      <span className="admin-yield-card-body">
        <span className="admin-yield-card-head">
          <strong>{recipe.product.name}</strong>
          <span className="admin-yield-figure">
            <span className={`admin-yield${recipe.possibleUnits === 0 ? ' is-out' : ''}`}>
              {recipe.possibleUnits}
            </span>
            <span className="admin-yield-label">can still make</span>
          </span>
        </span>
        <span className="admin-recipe-madeof">
          {recipe.ingredients.map((ingredient) => (
            <span key={ingredient.materialId}>
              {formatAmount(ingredient.amount)} {ingredient.material.unit}{' '}
              {ingredient.material.name.toLowerCase()}
            </span>
          ))}
        </span>
        {options.length > 0 && (
          <span className="admin-recipe-options" aria-label="Available options">
            {options.map((variant) => (
              <span className="admin-recipe-option" key={variant.id}>
                {variant.swatch && (
                  <span
                    className="admin-recipe-swatch"
                    style={{ backgroundColor: variant.swatch }}
                    aria-hidden="true"
                  />
                )}
                {variant.label}
              </span>
            ))}
          </span>
        )}
      </span>
    </button>
  )
}

// The full recipe, opened from a card: every ingredient with what one product
// uses, what is on hand, and how many each ingredient alone would allow.
function RecipeDetail({ recipe, onDelete }: { recipe: AdminRecipe; onDelete: () => void }) {
  const product = getProduct(recipe.product.id)
  const image = product?.images?.[0] ?? product?.image
  const options = product?.variants ?? []

  return (
    <div className="admin-recipe-detail">
      <div className="admin-recipe-detail-side">
        {image && <img className="admin-recipe-detail-img" src={image} alt="" />}
        {options.length > 0 && (
          <ul className="admin-recipe-options" aria-label="Available options">
            {options.map((variant) => (
              <li key={variant.id}>
                {variant.swatch && (
                  <span
                    className="admin-recipe-swatch"
                    style={{ backgroundColor: variant.swatch }}
                    aria-hidden="true"
                  />
                )}
                {variant.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="admin-recipe-detail-main">
        <table className="admin-table admin-recipe-detail-table">
          <thead>
            <tr>
              <th>Material</th>
              <th className="is-right">Per product</th>
              <th className="is-right">On hand</th>
              <th className="is-right">Enough for</th>
            </tr>
          </thead>
          <tbody>
            {recipe.ingredients.map((ingredient) => (
              <tr key={ingredient.materialId}>
                <td>{ingredient.material.name}</td>
                <td className="is-right">
                  {formatAmount(ingredient.amount)} {ingredient.material.unit}
                </td>
                <td className="is-right admin-muted">
                  {formatAmount(ingredient.material.quantity)} {ingredient.material.unit}
                </td>
                <td className="is-right">{ingredient.possibleUnits}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {recipe.fields.length > 0 && (
          <dl className="admin-recipe-detail-fields">
            {recipe.fields.map((field, index) => (
              <div key={`${field.label}-${index}`}>
                <dt>{field.label}</dt>
                <dd>{field.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <p className="admin-recipe-detail-yield">
          You can still make{' '}
          <strong className={recipe.possibleUnits === 0 ? 'is-out' : undefined}>
            {recipe.possibleUnits}
          </strong>{' '}
          {recipe.possibleUnits === 1 ? 'piece' : 'pieces'} with the materials left.
        </p>

        <div className="admin-form-actions">
          <button type="button" className="admin-row-action is-quiet" onClick={onDelete}>
            Delete recipe
          </button>
        </div>
      </div>
    </div>
  )
}
