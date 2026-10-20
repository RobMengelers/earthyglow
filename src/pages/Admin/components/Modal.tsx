import { type ReactNode, useEffect, useRef } from 'react'
import { lockBodyScroll } from '../../../lib/scrollLock'

// One dialog implementation for the whole portal so escape-to-close, the
// backdrop click and the initial focus behave the same everywhere.
export function Modal({
  title,
  description,
  onClose,
  children,
  wide = false,
}: {
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}) {
  const panel = useRef<HTMLDivElement>(null)
  const close = useRef(onClose)

  // Parents pass a fresh arrow on every render; the escape handler should see
  // the latest one without the whole effect being torn down and rebuilt.
  useEffect(() => {
    close.current = onClose
  })

  // Runs once per dialog: escape-to-close, no background scrolling, and the
  // first field takes focus so the keyboard works straight away.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') close.current()
    }
    document.addEventListener('keydown', onKeyDown)
    const unlockBodyScroll = lockBodyScroll()
    const body = panel.current
    const focusable =
      body?.querySelector<HTMLElement>('form input, form select, form textarea') ??
      body?.querySelector<HTMLElement>('input, select, textarea')
    focusable?.focus()
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      unlockBodyScroll()
    }
  }, [])

  return (
    <div
      className="admin-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={panel}
        className={`admin-modal${wide ? ' is-wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="admin-modal-head">
          <h2>{title}</h2>
          <button
            type="button"
            className="admin-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>
        {description !== undefined && <p className="admin-modal-desc">{description}</p>}
        {children}
      </div>
    </div>
  )
}
