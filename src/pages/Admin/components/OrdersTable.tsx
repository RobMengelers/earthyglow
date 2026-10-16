import { useState } from 'react'
import {
  displayText,
  downloadAdminInvoice,
  formatDateTime,
  formatDateTimeOrDash,
  formatEuros,
  type AdminOrder,
} from '../../../admin/api'

export type OrderRowAction = 'process' | 'refund'

export function OrdersTable({
  orders,
  token,
  expanded,
  onToggleExpand,
  onAction,
}: {
  orders: AdminOrder[]
  token: string
  expanded: string | null
  onToggleExpand: (id: string) => void
  onAction: (action: OrderRowAction, order: AdminOrder) => void
}) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Placed</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Total</th>
            <th>Invoice</th>
            <th>Fulfilment</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              token={token}
              open={expanded === order.id}
              onToggleExpand={() => onToggleExpand(order.id)}
              onAction={onAction}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function OrderRow({
  order,
  token,
  open,
  onToggleExpand,
  onAction,
}: {
  order: AdminOrder
  token: string
  open: boolean
  onToggleExpand: () => void
  onAction: (action: OrderRowAction, order: AdminOrder) => void
}) {
  const detailId = `order-detail-${order.id}`
  const customer = order.customer

  return (
    <>
      <tr className={`admin-order${open ? ' is-open' : ''}`}>
        <td>
          <button
            type="button"
            className="admin-order-number"
            onClick={onToggleExpand}
            aria-expanded={open}
            aria-controls={detailId}
          >
            <span className="admin-caret" aria-hidden="true">
              {open ? '▾' : '▸'}
            </span>
            {order.orderNumber}
          </button>
        </td>
        <td>
          <time dateTime={order.createdAt} title={formatDateTime(order.createdAt)}>
            {formatDateTimeOrDash(order.createdAt)}
          </time>
        </td>
        <td>
          <span className="admin-customer">
            <strong>{displayName(order)}</strong>
            {customer.email ? (
              <a href={`mailto:${customer.email}`}>{customer.email}</a>
            ) : (
              <span className="admin-muted">Walk-in</span>
            )}
          </span>
        </td>
        <td>
          <span className={`admin-badge is-${order.status}`}>{order.status}</span>
        </td>
        <td className="admin-price">{formatEuros(order.totalCents)}</td>
        <td>
          <InvoiceCell order={order} token={token} />
        </td>
        <td>
          <span className={`admin-badge admin-fulfillment-badge is-${order.fulfillmentStatus}`}>
            {order.fulfillmentStatus === 'open' ? 'To do' : 'Sent'}
          </span>
        </td>
        <td>
          <div className="admin-row-actions">
            {order.status === 'paid' && order.fulfillmentStatus === 'open' && (
              <button
                type="button"
                className="admin-row-action"
                onClick={() => onAction('process', order)}
              >
                Send
              </button>
            )}
            {order.status === 'paid' && (
              <button
                type="button"
                className="admin-row-action is-quiet"
                onClick={() => onAction('refund', order)}
              >
                Refund
              </button>
            )}
          </div>
        </td>
      </tr>
      {open && (
        <tr className="admin-order-detail-row" id={detailId}>
          <td colSpan={8}>
            <OrderDetail order={order} />
          </td>
        </tr>
      )}
    </>
  )
}

function displayName(order: AdminOrder): string {
  const name = `${order.customer.firstName} ${order.customer.lastName}`.trim()
  // Walk-in sales store every blank as a dash, so "- -" is not a name.
  return name.replace(/[\s-]/g, '').length === 0 ? 'Walk-in customer' : name
}

function InvoiceCell({ order, token }: { order: AdminOrder; token: string }) {
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')

  async function handleDownload() {
    setDownloading(true)
    setError('')
    try {
      await downloadAdminInvoice(token, order.id, order.orderNumber)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not download invoice')
    } finally {
      setDownloading(false)
    }
  }

  if (!order.hasInvoicePdf) {
    // Orders invoiced before archiving existed cannot produce a faithful copy,
    // so say that rather than offering a button that cannot work.
    return (
      <span className="admin-invoice-cell">
        <span className="admin-invoice-badge is-missing">
          {order.invoiceSentAt ? 'Not archived' : 'No invoice'}
        </span>
      </span>
    )
  }

  return (
    <span className="admin-invoice-cell">
      <span className="admin-invoice-top">
        <span className={`admin-invoice-badge ${order.invoiceSentAt ? 'is-sent' : 'is-pending'}`}>
          {order.invoiceSentAt ? 'Sent' : 'Not sent'}
        </span>
        <button
          type="button"
          className="admin-invoice-download"
          onClick={() => void handleDownload()}
          disabled={downloading}
          aria-label={`Download invoice ${order.orderNumber} as PDF`}
          title="Download invoice PDF"
        >
          {downloading ? (
            '…'
          ) : (
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path
                d="M8 1.5v8m0 0 3-3m-3 3-3-3M3 12.5h10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </span>
      {error !== '' && <small className="admin-invoice-error">{error}</small>}
    </span>
  )
}

function OrderDetail({ order }: { order: AdminOrder }) {
  const customer = order.customer

  return (
    <div className="admin-order-detail">
      <section className="admin-detail-col">
        <h3>Items</h3>
        <table className="admin-detail-items">
          <tbody>
            {order.items.map((item, index) => (
              <tr key={index}>
                <td>
                  {item.name}
                  {item.variantLabel && (
                    <small className="admin-order-variant">{item.variantLabel}</small>
                  )}
                  <small className="admin-muted">
                    {formatEuros(item.unitPriceCents)} × {item.quantity}
                  </small>
                </td>
                <td>{formatEuros(item.lineTotalCents)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Subtotal</td>
              <td>{formatEuros(order.subtotalCents)}</td>
            </tr>
            {order.shippingCents > 0 && (
              <tr>
                <td>Shipping</td>
                <td>{formatEuros(order.shippingCents)}</td>
              </tr>
            )}
            <tr className="is-total">
              <td>Total</td>
              <td>{formatEuros(order.totalCents)}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      <section className="admin-detail-col">
        <h3>Customer</h3>
        <p>{displayName(order)}</p>
        <p>
          {customer.email ? <a href={`mailto:${customer.email}`}>{customer.email}</a> : '—'}
          <br />
          {customer.phone ? customer.phone : '—'}
        </p>

        <h3>Ship to</h3>
        <p>
          {displayText(order.address)}
          <br />
          {displayText(order.postalCode)} {displayText(order.city)}
          <br />
          {displayText(order.country)}
        </p>

        {order.notes && (
          <>
            <h3>Notes</h3>
            <p>{order.notes}</p>
          </>
        )}
      </section>

      <section className="admin-detail-col">
        <h3>Payment</h3>
        <p>{paymentLabel(order)}</p>
        <dl className="admin-detail-list">
          <div>
            <dt>Paid</dt>
            <dd>{formatDateTimeOrDash(order.paidAt)}</dd>
          </div>
          <div>
            <dt>Invoice sent</dt>
            <dd>{formatDateTimeOrDash(order.invoiceSentAt)}</dd>
          </div>
        </dl>

        <h3>Shipping</h3>
        {order.fulfillmentStatus === 'processed' ? (
          <dl className="admin-detail-list">
            <div>
              <dt>Transporter</dt>
              <dd>{displayText(order.carrier)}</dd>
            </div>
            <div>
              <dt>Track &amp; trace</dt>
              <dd>{displayText(order.trackingCode)}</dd>
            </div>
            <div>
              <dt>Sent</dt>
              <dd>{formatDateTimeOrDash(order.fulfilledAt)}</dd>
            </div>
          </dl>
        ) : (
          <p className="admin-muted">
            {order.status === 'paid'
              ? 'Not marked as sent yet.'
              : 'Only paid orders are shipped.'}
          </p>
        )}
      </section>
    </div>
  )
}

// In-person sales carry no payment method because the money changed hands on
// the spot. Say that rather than "not available", which reads as a bug.
function paymentLabel(order: AdminOrder): string {
  if (order.paymentMethod) return order.paymentMethod
  if (order.status === 'paid' && order.shippingCents === 0) {
    return 'Paid in person'
  }
  return 'Not available'
}
