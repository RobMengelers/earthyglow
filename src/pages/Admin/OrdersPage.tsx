import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  fetchAdminOrders,
  formatEuros,
  refundAdminOrder,
  updateFulfillment,
  type AdminOrder,
  type AdminOrdersResponse,
} from '../../admin/api'
import { useAdmin } from './admin-context'
import { FulfillmentDialog } from './components/FulfillmentDialog'
import { Modal } from './components/Modal'
import { OrdersTable, type OrderRowAction } from './components/OrdersTable'
import { StatusFilter } from './components/StatusFilter'

type Flash = { tone: 'success' | 'error'; text: string } | undefined

export function OrdersPage() {
  const { token } = useAdmin()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // The whole view lives in the URL so a filtered list can be shared and the
  // back button behaves.
  const status = searchParams.get('status') ?? 'all'
  const onlyOpen = searchParams.get('fulfilment') === 'open'
  const query = searchParams.get('q') ?? ''

  const [reloadKey, setReloadKey] = useState(0)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [flash, setFlash] = useState<Flash>(undefined)
  const [dialog, setDialog] = useState<
    { kind: 'fulfil'; order: AdminOrder } | { kind: 'refund'; order: AdminOrder } | null
  >(null)
  const noticeShown = useRef(false)

  // Results are tagged with the request they belong to, so switching views
  // shows a loading state without an extra render to clear the old data.
  const requestKey = `${token ?? ''}|${status}|${reloadKey}`
  const [result, setResult] = useState<{
    key: string
    data: AdminOrdersResponse
  } | null>(null)
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null)

  useEffect(() => {
    if (!token) return
    let cancelled = false

    fetchAdminOrders(token, status === 'all' ? undefined : status)
      .then((data) => {
        if (cancelled) return
        setResult({ key: requestKey, data })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setFailure({
          key: requestKey,
          message: error instanceof Error ? error.message : 'Could not load orders',
        })
      })

    return () => { cancelled = true }
  }, [token, status, requestKey])

  // Coming back from "new order" carries its outcome in the route state, so the
  // message survives the redirect without a global store.
  useEffect(() => {
    const notice = (location.state as { notice?: string } | null)?.notice
    if (!notice || noticeShown.current) return
    noticeShown.current = true
    setFlash({ tone: 'success', text: notice })
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null })
  }, [location.state, location.pathname, location.search, navigate])

  const data = result?.key === requestKey ? result.data : null
  const loadError = failure?.key === requestKey ? failure.message : ''
  const loading = data === null && loadError === ''

  const visibleOrders = useMemo(() => {
    if (!data) return []
    const needle = query.trim().toLowerCase()
    return data.orders.filter((order) => {
      if (onlyOpen && order.fulfillmentStatus !== 'open') return false
      if (needle === '') return true
      const { firstName, lastName, email } = order.customer
      return (
        order.orderNumber.toLowerCase().includes(needle) ||
        `${firstName} ${lastName}`.toLowerCase().includes(needle) ||
        (email ?? '').toLowerCase().includes(needle) ||
        order.city.toLowerCase().includes(needle)
      )
    })
  }, [data, query, onlyOpen])

  const visibleRevenue = visibleOrders.reduce(
    (sum, order) => (order.status === 'paid' ? sum + order.totalCents : sum),
    0,
  )

  function updateParams(
    patch: Record<string, string | null>,
    options?: { replace?: boolean },
  ) {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === '') next.delete(key)
      else next.set(key, value)
    }
    // Changing the view closes the row that no longer makes sense to keep open.
    setExpanded(null)
    setSearchParams(next, { replace: options?.replace ?? false })
  }

  function applyUpdate(order: AdminOrder) {
    setResult((current) =>
      current
        ? {
            ...current,
            data: {
              ...current.data,
              orders: current.data.orders.map((item) =>
                item.id === order.id ? order : item,
              ),
            },
          }
        : current,
    )
  }

  async function sendOrder(order: AdminOrder, carrier: string, trackingCode: string) {
    if (!token) return
    setBusy(true)
    try {
      applyUpdate(
        await updateFulfillment(token, order.id, {
          status: 'processed',
          carrier,
          trackingCode,
        }),
      )
      setDialog(null)
      setFlash({
        tone: 'success',
        text: `${order.orderNumber} marked as sent.`,
      })
    } catch (error) {
      setFlash({
        tone: 'error',
        text: error instanceof Error ? error.message : 'Could not update fulfilment.',
      })
    } finally {
      setBusy(false)
    }
  }

  async function refundOrder(order: AdminOrder) {
    if (!token) return
    setBusy(true)
    try {
      applyUpdate(await refundAdminOrder(token, order.id))
      setDialog(null)
      setFlash({
        tone: 'success',
        text: `${order.orderNumber} refunded and the customer was notified.`,
      })
    } catch (error) {
      setFlash({
        tone: 'error',
        text: error instanceof Error ? error.message : 'Could not refund.',
      })
    } finally {
      setBusy(false)
    }
  }

  const count = visibleOrders.length

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Orders</h1>
          <p className="admin-page-sub">
            {loading
              ? 'Everything bought online and in the shop.'
              : `${count} in view · ${formatEuros(visibleRevenue)} paid`}
          </p>
        </div>
      </header>

      <div className="admin-toolbar">
        <StatusFilter
          value={status}
          counts={data?.stats ?? {}}
          onChange={(next) => updateParams({ status: next === 'all' ? null : next })}
        />
        <div className="admin-toolbar-right">
          <button
            type="button"
            className={`admin-filter${onlyOpen ? ' is-active' : ''}`}
            aria-pressed={onlyOpen}
            onClick={() => updateParams({ fulfilment: onlyOpen ? null : 'open' })}
          >
            To fulfil
          </button>
          <div className="admin-search">
            <input
              type="search"
              value={query}
              placeholder="Search order, customer or city"
              aria-label="Search orders"
              onChange={(event) =>
                updateParams({ q: event.target.value || null }, { replace: true })
              }
            />
            {query !== '' && (
              <button
                type="button"
                className="admin-search-clear"
                onClick={() => updateParams({ q: null })}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {flash && (
        <p className={`admin-flash is-${flash.tone}`} role="status">
          <span>{flash.text}</span>
          <button type="button" onClick={() => setFlash(undefined)} aria-label="Dismiss">
            ×
          </button>
        </p>
      )}

      {loading && <p className="admin-note">Loading orders…</p>}

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

      {data && count === 0 && (
        <div className="admin-empty">
          <h2>{data.orders.length === 0 ? 'No orders here yet' : 'Nothing matches'}</h2>
          <p>
            {data.orders.length === 0
              ? 'Online orders and sales recorded in the shop both land here.'
              : 'Try another status, or clear the search and the “to fulfil” filter.'}
          </p>
          {data.orders.length === 0 && (
            <Link to="/admin/orders/new" className="btn btn-primary">
              Record a sale
            </Link>
          )}
        </div>
      )}

      {data && count > 0 && (
        <>
          <OrdersTable
            orders={visibleOrders}
            token={token ?? ''}
            expanded={expanded}
            onToggleExpand={(id) => setExpanded((current) => (current === id ? null : id))}
            onAction={(action: OrderRowAction, order: AdminOrder) =>
              setDialog(
                action === 'process'
                  ? { kind: 'fulfil', order }
                  : { kind: 'refund', order },
              )
            }
          />

          {dialog?.kind === 'fulfil' && (
            <FulfillmentDialog
              order={dialog.order}
              busy={busy}
              onClose={() => setDialog(null)}
              onConfirm={({ carrier, trackingCode }) =>
                void sendOrder(dialog.order, carrier, trackingCode)
              }
            />
          )}
          {dialog?.kind === 'refund' && (
            <RefundDialog
              order={dialog.order}
              busy={busy}
              onClose={() => setDialog(null)}
              onConfirm={() => void refundOrder(dialog.order)}
            />
          )}
        </>
      )}
    </div>
  )
}

function RefundDialog({
  order,
  busy,
  onClose,
  onConfirm,
}: {
  order: AdminOrder
  busy: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <Modal
      title="Refund"
      description="The payment provider is asked for the money back and the customer is emailed. This cannot be undone here."
      onClose={onClose}
    >
      <div className="admin-confirmation">
        <strong>
          {order.orderNumber} · {formatEuros(order.totalCents)}
        </strong>
        <span>{order.customer.email ?? `${order.customer.firstName} ${order.customer.lastName}`}</span>
      </div>
      <div className="admin-modal-actions">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Keep the order
        </button>
        <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={busy}>
          {busy ? 'Refunding…' : 'Refund anyway'}
        </button>
      </div>
    </Modal>
  )
}
