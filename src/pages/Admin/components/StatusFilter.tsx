import { ADMIN_STATUSES } from '../../../admin/api'

export type FulfilmentFilter = 'open' | 'processed' | null

// The pills double as navigation: the active one is reflected in the URL so a
// filtered view can be bookmarked and the back button works.
export function StatusFilter({
  value,
  fulfilment,
  counts,
  todoCount,
  doneCount,
  onChange,
}: {
  value: string
  fulfilment: FulfilmentFilter
  counts: Record<string, number>
  todoCount: number
  doneCount: number
  onChange: (next: { status: string; fulfilment: FulfilmentFilter }) => void
}) {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0)

  return (
    <div className="admin-filters" role="group" aria-label="Filter orders">
      <FilterPill
        label="To do"
        count={todoCount}
        active={fulfilment === 'open'}
        onClick={() => onChange({ status: 'paid', fulfilment: 'open' })}
      />
      <FilterPill
        label="Done"
        count={doneCount}
        active={fulfilment === 'processed'}
        onClick={() => onChange({ status: 'all', fulfilment: 'processed' })}
      />
      <span className="admin-filters-divider" aria-hidden="true" />
      <FilterPill
        label="All"
        count={total}
        active={value === 'all' && fulfilment === null}
        onClick={() => onChange({ status: 'all', fulfilment: null })}
      />
      {ADMIN_STATUSES.map((status) => (
        <FilterPill
          key={status}
          label={status}
          count={counts[status] ?? 0}
          active={value === status && fulfilment === null}
          onClick={() => onChange({ status, fulfilment: null })}
        />
      ))}
    </div>
  )
}

function FilterPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={`admin-filter${active ? ' is-active' : ''}`}
      onClick={onClick}
      aria-pressed={active}
    >
      {label}
      <span className="admin-filter-count">{count}</span>
    </button>
  )
}
