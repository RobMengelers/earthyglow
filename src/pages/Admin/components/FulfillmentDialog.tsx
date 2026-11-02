import { type FormEvent, useState } from 'react'
import type { AdminOrder } from '../../../admin/api'
import { Modal } from './Modal'

// Confirm the dispatch details and whether the customer will receive an email.
export function FulfillmentDialog({
  order,
  busy,
  onClose,
  onConfirm,
}: {
  order: AdminOrder
  busy: boolean
  onClose: () => void
  onConfirm: (input: { carrier: string; trackingCode: string; skipEmail: boolean }) => void
}) {
  const [carrier, setCarrier] = useState('PostNL')
  const [trackingCode, setTrackingCode] = useState('')
  const [skipEmail, setSkipEmail] = useState(false)
  const [confirming, setConfirming] = useState(false)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (confirming) {
      onConfirm({ carrier: skipEmail ? '' : carrier, trackingCode: skipEmail ? '' : trackingCode.trim(), skipEmail })
      return
    }
    setConfirming(true)
  }

  return (
    <Modal
      title={confirming ? 'Confirm dispatch' : 'Mark as sent'}
      description={
        skipEmail
          ? 'The order will be marked as sent without sending an email.'
          : confirming
          ? 'The customer receives a shipping email with these details.'
          : 'These details are emailed to the customer and stored on the order.'
      }
      onClose={onClose}
    >
      <form className="admin-form" onSubmit={handleSubmit}>
        <label className="admin-manual-checkbox">
          <input
            type="checkbox"
            checked={skipEmail}
            onChange={(event) => setSkipEmail(event.target.checked)}
            disabled={busy}
          />
          <span>Don’t send an email</span>
        </label>
        <label>
          Carrier
          <select
            value={carrier}
            onChange={(event) => setCarrier(event.target.value)}
            disabled={skipEmail || busy}
            required={!skipEmail}
          >
            <option value="PostNL">PostNL</option>
            <option value="DHL">DHL</option>
          </select>
        </label>
        <label>
          Track &amp; trace code
          <input
            value={trackingCode}
            onChange={(event) => setTrackingCode(event.target.value)}
            placeholder="3SABC123456789"
            disabled={skipEmail || busy}
            required={!skipEmail}
          />
        </label>

        {confirming && (
          <div className="admin-confirmation">
            <strong>{order.orderNumber} will be marked as sent</strong>
            <span>
              {skipEmail ? 'No email will be sent.' : `${carrier} · ${trackingCode.trim()}`}
            </span>
          </div>
        )}

        <div className="admin-modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving…' : confirming ? (skipEmail ? 'Confirm and mark as sent' : 'Confirm and send') : 'Continue'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
