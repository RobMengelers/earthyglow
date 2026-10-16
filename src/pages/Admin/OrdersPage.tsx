import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import {
  fetchAdminOrders,
  formatEuros,
  refundAdminOrder,
  updateFulfillment,
  type AdminOrder,
} from '../../admin/api'
import { useAdmin } from './admin-context'
import { siteMeta } from '../../lib/seo'
import { FulfillmentDialog } from './components/FulfillmentDialog'
import { Modal } from './components/Modal'
import { OrdersTable, type OrderRowAction } from './components/OrdersTable'
import { StatusFilter } from './components/StatusFilter'

type Flash = { tone: 'success' | 'error'; text: string } | undefined

// The pages loaded so far for one set of filters. Tagged with the filters it
// belongs to so a change shows the loading state without a flash of old rows.
type OrdersView = {
  key: string
  orders: AdminOrder[]
  stats: Record<string, number>
  total: number
  paidTotalCents: number
  nextCursor: string | null
}

export function meta() {
  return siteMeta({ title: 'Orders · EarthyGlow Admin', robots: 'noindex, nofollow' })
}

export default function OrdersPage() {
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

  const filtersKey = `${token ?? ''}|${status}|${onlyOpen}|${query}|${reloadKey}`
  const [view, setView] = useState<OrdersView | null>(null)
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    // Filters live on the server now, so the search box debounces slightly to
    // avoid firing a request for every keystroke.
    const handle = setTimeout(() => {
      fetchAdminOrders(token, {
        status: status === 'all' ? undefined : status,
        q: query || undefined,
        fulfilmentOpen: onlyOpen,
      })
        .then((result) => {
          if (cancelled) return
          setFailure(null)
          setView({
            key: filtersKey,
            orders: result.orders,
            stats: result.stats,
            total: result.total,
            paidTotalCents: result.paidTotalCents,
            nextCursor: result.nextCursor,
          })
        })
        .catch((error: unknown) => {
          if (cancelled) return
          setFailure({
            key: filtersKey,
            message: error instanceof Error ? error.message : 'Could not load orders',
          })
        })
    }, query ? 250 : 0)

    return () => { cancelled = true; clearTimeout(handle) }
  }, [token, status, onlyOpen, query, filtersKey])

  // Coming back from "new order" carries its outcome in the route state, so the
  // message survives the redirect without a global store.
  useEffect(() => {
    const notice = (location.state as { notice?: string } | null)?.notice
    if (!notice || noticeShown.current) return
    noticeShown.current = true
    setFlash({ tone: 'success', text: notice })
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null })
  }, [location.state, location.pathname, location.search, navigate])

  const data = view?.key === filtersKey ? view : null
  const loadError = failure?.key === filtersKey ? failure.message : ''
  const loading = data === null && loadError === ''
  const hasFilters = status !== 'all' || onlyOpen || query !== ''

  async function loadMore() {
    if (!token || !data || !data.nextCursor || loadingMore) return
    setLoadingMore(true)
    try {
      const next = await fetchAdminOrders(token, {
        status: status === 'all' ? undefined : status,
        q: query || undefined,
        fulfilmentOpen: onlyOpen,
        cursor: data.nextCursor,
      })
      setView((current) =>
        current && current.key === filtersKey
          ? {
              ...current,
              orders: [...current.orders, ...next.orders],
              nextCursor: next.nextCursor,
            }
          : current,
      )
    } catch (error) {
      setFlash({
        tone: 'error',
        text: error instanceof Error ? error.message : 'Could not load more orders',
      })
    } finally {
      setLoadingMore(false)
    }
  }

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
    setView((current) =>
      current
        ? {
            ...current,
            orders: current.orders.map((item) =>
              item.id === order.id ? order : item,
            ),
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

  const count = data?.total ?? 0
  const loaded = data?.orders.length ?? 0

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Orders</h1>
          <p className="admin-page-sub">
            {loading || !data
              ? 'Everything bought online and in the shop.'
              : `${count} in view · ${formatEuros(data.paidTotalCents)} paid${
                  loaded < count ? ` · showing ${loaded}` : ''
                }`}
          </p>
        </div>
        <div className="admin-page-actions">
          <Link to="/admin/orders/new" className="btn btn-primary">
            + New order
          </Link>
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

      {data && data.orders.length === 0 && (
        <div className="admin-empty">
          <h2>{hasFilters ? 'Nothing matches' : 'No orders here yet'}</h2>
          <p>
            {hasFilters
              ? 'Try another status, or clear the search and the “to fulfil” filter.'
              : 'Online orders and sales recorded in the shop both land here.'}
          </p>
          {!hasFilters && (
            <Link to="/admin/orders/new" className="btn btn-primary">
              Record a sale
            </Link>
          )}
        </div>
      )}

      {data && data.orders.length > 0 && (
        <>
          <OrdersTable
            orders={data.orders}
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

          {data.nextCursor && (
            <div className="admin-load-more">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => void loadMore()}
                disabled={loadingMore}
              >
                {loadingMore
                  ? 'Loading…'
                  : `Load more (${data.total - data.orders.length} older)`}
              </button>
            </div>
          )}

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
