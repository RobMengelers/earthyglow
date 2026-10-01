import { type FormEvent, useState } from 'react'
import type { AdminOrder } from '../../../admin/api'
import { Modal } from './Modal'

// Marking an order as sent emails the customer and cannot be undone from here,
// so the dialog asks twice and shows exactly what will go out.
export function FulfillmentDialog({
  order,
  busy,
  onClose,
  onConfirm,
}: {
  order: AdminOrder
  busy: boolean
  onClose: () => void
  onConfirm: (input: { carrier: string; trackingCode: string }) => void
}) {
  const [carrier, setCarrier] = useState('')
  const [trackingCode, setTrackingCode] = useState('')
  const [confirming, setConfirming] = useState(false)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (confirming) {
      onConfirm({ carrier: carrier.trim(), trackingCode: trackingCode.trim() })
      return
    }
    setConfirming(true)
  }

  return (
    <Modal
      title={confirming ? 'Confirm dispatch' : 'Mark as sent'}
      description={
        confirming
          ? 'The customer receives a shipping email with these details.'
          : 'These details are emailed to the customer and stored on the order.'
      }
      onClose={onClose}
    >
      <form className="admin-form" onSubmit={handleSubmit}>
        <label>
          Transporter
          <input
            value={carrier}
            onChange={(event) => setCarrier(event.target.value)}
            placeholder="e.g. PostNL"
            required
          />
        </label>
        <label>
          Track &amp; trace code
          <input
            value={trackingCode}
            onChange={(event) => setTrackingCode(event.target.value)}
            placeholder="3SABC123456789"
            required
          />
        </label>

        {confirming && (
          <div className="admin-confirmation">
            <strong>{order.orderNumber} will be marked as sent</strong>
            <span>
              {carrier.trim()} · {trackingCode.trim()}
            </span>
          </div>
        )}

        <div className="admin-modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Sending…' : confirming ? 'Confirm and send' : 'Continue'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
