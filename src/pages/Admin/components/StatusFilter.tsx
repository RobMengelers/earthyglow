import { ADMIN_STATUSES } from '../../../admin/api'

// The pills double as navigation: the active one is reflected in the URL so a
// filtered view can be bookmarked and the back button works.
export function StatusFilter({
  value,
  onlyOpen,
  counts,
  todoCount,
  onChange,
}: {
  value: string
  onlyOpen: boolean
  counts: Record<string, number>
  todoCount: number
  onChange: (next: { status: string; onlyOpen: boolean }) => void
}) {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0)
  const isTodo = value === 'paid' && onlyOpen

  return (
    <div className="admin-filters" role="group" aria-label="Filter orders">
      <FilterPill
        label="To do"
        count={todoCount}
        active={isTodo}
        onClick={() => onChange({ status: 'paid', onlyOpen: true })}
      />
      <FilterPill
        label="All"
        count={total}
        active={value === 'all' && !onlyOpen}
        onClick={() => onChange({ status: 'all', onlyOpen: false })}
      />
      {ADMIN_STATUSES.map((status) => (
        <FilterPill
          key={status}
          label={status}
          count={counts[status] ?? 0}
          active={value === status && !onlyOpen}
          onClick={() => onChange({ status, onlyOpen: false })}
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
