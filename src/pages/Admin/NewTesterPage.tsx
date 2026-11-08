import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  fetchAdminCatalog,
  fetchAdminTester,
  saveAdminTester,
  type AdminCatalogProduct,
} from '../../admin/api'
import { LoadingButton } from '../../components/ui/LoadingButton'
import { siteMeta } from '../../lib/seo'
import { useAdmin } from './admin-context'

type TesterLine = {
  key: number
  productId: string
  name: string
  variantId: string
  colorId: string
  quantity: number
}

function emptyLine(key: number): TesterLine {
  return { key, productId: '', name: '', variantId: '', colorId: '', quantity: 1 }
}

export function meta() {
  return siteMeta({ title: 'Tester order · EarthyGlow Admin', robots: 'noindex, nofollow' })
}

export default function NewTesterPage() {
  const { token } = useAdmin()
  const navigate = useNavigate()
  const { id } = useParams()
  const [loaded, setLoaded] = useState(!id)
  const [catalog, setCatalog] = useState<AdminCatalogProduct[]>([])
  const [catalogError, setCatalogError] = useState('')
  const [date, setDate] = useState(() => new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Amsterdam', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date()))
  const [description, setDescription] = useState('')
  const [lines, setLines] = useState<TesterLine[]>([emptyLine(1)])
  const [state, setState] = useState<'idle' | 'saving'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    fetchAdminCatalog()
      .then((products) => { if (!cancelled) setCatalog(products) })
      .catch(() => { if (!cancelled) setCatalogError('Could not load products') })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!id || !token) return
    let cancelled = false
    fetchAdminTester(token, id)
      .then((tester) => {
        if (cancelled) return
        setDate(tester.usedAt.slice(0, 10))
        setDescription(tester.description)
        setLines(tester.items.map((item, index) => ({
          key: index + 1,
          productId: item.productId,
          name: item.productId === 'custom' ? item.name : '',
          variantId: item.variantId ?? '',
          colorId: item.colorId ?? '',
          quantity: item.quantity,
        })))
        setLoaded(true)
      })
      .catch((caught: Error) => { if (!cancelled) setError(caught.message) })
    return () => { cancelled = true }
  }, [id, token])

  function updateLine(key: number, patch: Partial<TesterLine>) {
    setLines((current) => current.map((line) => (line.key === key ? { ...line, ...patch } : line)))
  }

  function addLine() {
    setLines((current) => [...current, emptyLine(Math.max(0, ...current.map((line) => line.key)) + 1)])
  }

  function removeLine(key: number) {
    setLines((current) => (current.length === 1 ? current : current.filter((line) => line.key !== key)))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (state === 'saving') return
    setState('saving')
    setError('')
    try {
      await saveAdminTester(token ?? '', {
        date,
        description: description.trim(),
        items: lines.map((line) => ({
          productId: line.productId === 'custom' ? undefined : line.productId,
          name: line.productId === 'custom' ? line.name.trim() : undefined,
          variantId: line.variantId || undefined,
          colorId: line.colorId || undefined,
          quantity: line.quantity,
        })),
      }, id)
      navigate('/admin/testers', { state: { notice: 'Tester order saved and materials updated.' } })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save the tester order')
      setState('idle')
    }
  }

  if (!loaded) {
    return (
      <div className="admin-page">
        <p>{error || 'Loading tester order…'}</p>
        <Link to="/admin/testers">Back to testers</Link>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>{id ? 'Edit tester order' : 'New tester order'}</h1>
          <p className="admin-page-sub">
            Products used for testing or filming. Materials are subtracted when the product has a recipe.
          </p>
        </div>
        <Link to="/admin/testers" className="btn btn-ghost">Back to testers</Link>
      </header>

      <form className="admin-form-card" onSubmit={handleSubmit}>
        <section className="admin-form-section">
          <h2>What was it for?</h2>
          <div className="admin-form-grid">
            <label>
              Date used
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
            </label>
            <label className="is-wide">
              Description
              <textarea
                rows={3}
                maxLength={1000}
                placeholder="For example: burn test of the new wick, or filming the Christmas reel"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
              />
            </label>
          </div>
        </section>

        <section className="admin-form-section">
          <h2>Items</h2>
          <p className="admin-form-hint">Custom items are listed for the record but do not subtract materials.</p>
          {catalogError !== '' && <p className="form-note is-error">{catalogError}</p>}

          <div className="admin-manual-lines">
            {lines.map((line, index) => {
              const product = catalog.find((item) => item.id === line.productId)
              return (
                <div className="admin-manual-line admin-tester-line" key={line.key}>
                  <label>
                    <span>Product</span>
                    <select
                      value={line.productId}
                      onChange={(event) => updateLine(line.key, { productId: event.target.value, variantId: '', colorId: '' })}
                      required
                    >
                      <option value="">Choose a product…</option>
                      <option value="custom">Custom item</option>
                      {line.productId && line.productId !== 'custom' && !product && (
                        <option value={line.productId}>Unavailable product</option>
                      )}
                      {catalog.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                  </label>

                  {line.productId === 'custom' ? (
                    <label>
                      <span>Item name</span>
                      <input value={line.name} maxLength={200} required onChange={(event) => updateLine(line.key, { name: event.target.value })} />
                    </label>
                  ) : product && product.variants.length > 0 ? (
                    <label>
                      <span>Option</span>
                      <select value={line.variantId} onChange={(event) => updateLine(line.key, { variantId: event.target.value })} required>
                        <option value="">Choose…</option>
                        {product.variants.map((variant) => <option key={variant.id} value={variant.id}>{variant.label}</option>)}
                      </select>
                    </label>
                  ) : <span />}

                  {product && product.colors && product.colors.length > 0 ? (
                    <label>
                      <span>Colour</span>
                      <select value={line.colorId} onChange={(event) => updateLine(line.key, { colorId: event.target.value })} required>
                        <option value="">Choose…</option>
                        {product.colors.map((color) => <option key={color.id} value={color.id}>{color.label}</option>)}
                      </select>
                    </label>
                  ) : <span />}

                  <label>
                    <span>Qty</span>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={line.quantity}
                      onChange={(event) => updateLine(line.key, { quantity: Math.max(1, Number(event.target.value) || 1) })}
                      required
                    />
                  </label>

                  <button
                    type="button"
                    className="admin-manual-remove"
                    onClick={() => removeLine(line.key)}
                    disabled={lines.length === 1}
                    aria-label={`Remove line ${index + 1}`}
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>

          <button type="button" className="admin-manual-add" onClick={addLine}>+ Add line</button>
        </section>

        <footer className="admin-form-foot">
          {error !== '' && <p className="form-note is-error">{error}</p>}
          <div className="admin-form-actions">
            <Link to="/admin/testers" className="btn btn-ghost">Cancel</Link>
            <LoadingButton type="submit" className="btn btn-primary" loading={state === 'saving'}>
              Save tester order
            </LoadingButton>
          </div>
        </footer>
      </form>
    </div>
  )
}
