import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  createManualOrder,
  fetchAdminCatalog,
  formatEuros,
  type AdminCatalogProduct,
  type AdminOrder,
} from '../../admin/api'
import { useAdmin } from './admin-context'
import { LoadingButton } from '../../components/ui/LoadingButton'

type ManualLine = {
  key: number
  productId: string
  variantId: string
  // Editable on purpose: a market or trade price is a legitimate thing to
  // record. Seeded from the catalog whenever the product or variant changes.
  price: string
  quantity: number
}

function emptyLine(key: number): ManualLine {
  return { key, productId: '', variantId: '', price: '', quantity: 1 }
}

// Prices are entered in euros because that is how the shop thinks about them;
// the API works in cents.
function eurosToCents(value: string): number {
  const parsed = Number.parseFloat(value.replace(',', '.'))
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed * 100)) : 0
}

function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2)
}

// The catalog price for a line, used to seed the editable price field.
function catalogPriceCents(
  productId: string,
  variantId: string,
  catalog: AdminCatalogProduct[],
): number {
  const product = catalog.find((item) => item.id === productId)
  if (!product) return 0
  if (!variantId) return product.priceCents
  return (
    product.variants.find((variant) => variant.id === variantId)?.priceCents ??
    product.priceCents
  )
}

export function NewOrderPage() {
  const { token } = useAdmin()
  const navigate = useNavigate()

  const [catalog, setCatalog] = useState<AdminCatalogProduct[]>([])
  const [catalogError, setCatalogError] = useState('')

  // Every customer detail is optional; blanks are stored as a dash.
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [notes, setNotes] = useState('')
  const [sendInvoiceEmail, setSendInvoiceEmail] = useState(false)
  const [lines, setLines] = useState<ManualLine[]>([emptyLine(1)])

  const [state, setState] = useState<'idle' | 'saving'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    fetchAdminCatalog()
      .then((products) => { if (!cancelled) setCatalog(products) })
      .catch(() => { if (!cancelled) setCatalogError('Could not load products') })
    return () => { cancelled = true }
  }, [])

  const totalCents = useMemo(
    () => lines.reduce((sum, line) => sum + eurosToCents(line.price) * line.quantity, 0),
    [lines],
  )

  // Without an address to send to, the option is unavailable rather than a
  // silent no-op on save.
  const canEmail = email.trim() !== ''

  function updateLine(key: number, patch: Partial<ManualLine>) {
    setLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    )
  }

  function chooseProduct(key: number, productId: string) {
    updateLine(key, {
      productId,
      variantId: '',
      price: centsToInput(catalogPriceCents(productId, '', catalog)),
    })
  }

  function chooseVariant(key: number, productId: string, variantId: string) {
    updateLine(key, {
      variantId,
      price: centsToInput(catalogPriceCents(productId, variantId, catalog)),
    })
  }

  function addLine() {
    setLines((current) => [...current, emptyLine(current.length + 1)])
  }

  function removeLine(key: number) {
    setLines((current) =>
      current.length === 1 ? current : current.filter((line) => line.key !== key),
    )
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (state === 'saving') return
    setState('saving')
    setError('')

    const payload = {
      customer: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      },
      shipping: {
        address: address.trim(),
        postalCode: postalCode.trim(),
        city: city.trim(),
        country: country.trim(),
      },
      items: lines.map((line) => ({
        productId: line.productId,
        variantId: line.variantId || undefined,
        unitPriceCents: eurosToCents(line.price),
        quantity: line.quantity,
      })),
      notes: notes.trim() || undefined,
      sendInvoiceEmail: sendInvoiceEmail && canEmail,
    }

    try {
      const result = await createManualOrder(token ?? '', payload)
      navigate('/admin/orders', {
        state: {
          notice: sendInvoiceEmail
            ? `Order ${result.order.orderNumber} saved and the invoice was emailed.`
            : `Order ${result.order.orderNumber} saved.`,
        },
      })
    } catch (caught) {
      const failure = caught as Error & {
        order?: AdminOrder
        hasInvoicePdf?: boolean
      }
      // A 5xx can still mean the order exists and only the email bounced, so
      // surface it instead of losing the sale.
      if (failure.order) {
        navigate('/admin/orders', {
          state: {
            notice: `Order ${failure.order.orderNumber} was saved, but the invoice email failed: ${failure.message}`,
          },
        })
        return
      }
      setError(failure.message)
      setState('idle')
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>New order</h1>
          <p className="admin-page-sub">
            A sale made in the shop or at a market. The order is marked as paid and its
            invoice is archived straight away.
          </p>
        </div>
        <Link to="/admin/orders" className="btn btn-ghost">
          Back to orders
        </Link>
      </header>

      <form className="admin-form-card" onSubmit={handleSubmit}>
        <section className="admin-form-section">
          <h2>Items</h2>
          <p className="admin-form-hint">
            Pick a product and adjust the price if this was a trade or market price.
          </p>

          {catalogError !== '' && <p className="form-note is-error">{catalogError}</p>}

          <div className="admin-manual-lines">
            {lines.map((line, index) => {
              const product = catalog.find((item) => item.id === line.productId)
              const listPrice = catalogPriceCents(line.productId, line.variantId, catalog)
              const edited = line.productId !== '' && eurosToCents(line.price) !== listPrice
              return (
                <div className="admin-manual-line" key={line.key}>
                  <label className="admin-manual-product">
                    <span>Product</span>
                    <select
                      value={line.productId}
                      onChange={(event) => chooseProduct(line.key, event.target.value)}
                      required
                    >
                      <option value="">Choose a product…</option>
                      {catalog.map((item) => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                    </select>
                  </label>

                  {product && product.variants.length > 0 ? (
                    <label className="admin-manual-variant">
                      <span>Option</span>
                      <select
                        value={line.variantId}
                        onChange={(event) =>
                          chooseVariant(line.key, line.productId, event.target.value)
                        }
                        required
                      >
                        <option value="">Choose…</option>
                        {product.variants.map((variant) => (
                          <option key={variant.id} value={variant.id}>{variant.label}</option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <span className="admin-manual-listprice">
                      {product ? `List ${formatEuros(listPrice)}` : 'Line ' + (index + 1)}
                    </span>
                  )}

                  <label className="admin-manual-price">
                    <span>Price €</span>
                    <input
                      inputMode="decimal"
                      placeholder="0.00"
                      value={line.price}
                      title={edited ? `Changed from ${formatEuros(listPrice)}` : 'Price per unit'}
                      onChange={(event) => updateLine(line.key, { price: event.target.value })}
                      required
                    />
                  </label>

                  <label className="admin-manual-qty">
                    <span>Qty</span>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={line.quantity}
                      onChange={(event) =>
                        updateLine(line.key, {
                          quantity: Math.max(1, Number(event.target.value) || 1),
                        })
                      }
                      required
                    />
                  </label>

                  <span className="admin-manual-line-total">
                    {formatEuros(eurosToCents(line.price) * line.quantity)}
                  </span>

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

          <button type="button" className="admin-manual-add" onClick={addLine}>
            + Add line
          </button>
        </section>

        <div className="admin-form-columns">
          <section className="admin-form-section">
            <h2>
              Customer <span className="admin-manual-optional">all optional</span>
            </h2>
            <div className="admin-form-grid">
              <label>
                First name
                <input value={firstName} onChange={(event) => setFirstName(event.target.value)} />
              </label>
              <label>
                Last name
                <input value={lastName} onChange={(event) => setLastName(event.target.value)} />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <label>
                Phone
                <input value={phone} onChange={(event) => setPhone(event.target.value)} />
              </label>
            </div>
          </section>

          <section className="admin-form-section">
            <h2>
              Invoice address <span className="admin-manual-optional">all optional</span>
            </h2>
            <div className="admin-form-grid">
              <label className="is-wide">
                Street and number
                <input value={address} onChange={(event) => setAddress(event.target.value)} />
              </label>
              <label>
                Postal code
                <input value={postalCode} onChange={(event) => setPostalCode(event.target.value)} />
              </label>
              <label>
                City
                <input value={city} onChange={(event) => setCity(event.target.value)} />
              </label>
              <label className="is-wide">
                Country
                <input value={country} onChange={(event) => setCountry(event.target.value)} />
              </label>
            </div>
          </section>
        </div>

        <section className="admin-form-section">
          <h2>
            Notes <span className="admin-manual-optional">optional</span>
          </h2>
          <label className="is-wide">
            Internal note, for example “paid at the market stall”
            <input value={notes} onChange={(event) => setNotes(event.target.value)} />
          </label>
        </section>

        <footer className="admin-form-foot">
          <div className="admin-form-summary">
            <p className="admin-form-total">
              Total <strong>{formatEuros(totalCents)}</strong>
            </p>
            <label className={`admin-manual-checkbox${canEmail ? '' : ' is-disabled'}`}>
              <input
                type="checkbox"
                checked={sendInvoiceEmail && canEmail}
                disabled={!canEmail}
                onChange={(event) => setSendInvoiceEmail(event.target.checked)}
              />
              <span>
                Email the invoice to the customer
                <small>
                  {canEmail
                    ? 'The PDF is archived either way.'
                    : 'Add an email address to enable this.'}
                </small>
              </span>
            </label>
          </div>

          {error !== '' && <p className="form-note is-error">{error}</p>}

          <div className="admin-form-actions">
            <Link to="/admin/orders" className="btn btn-ghost">
              Cancel
            </Link>
            <LoadingButton
              type="submit"
              className="btn btn-primary"
              loading={state === 'saving'}
            >
              Save order
            </LoadingButton>
          </div>
        </footer>
      </form>
    </div>
  )
}
