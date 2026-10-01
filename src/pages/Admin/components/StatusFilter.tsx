import { ADMIN_STATUSES } from '../../../admin/api'

// The pills double as navigation: the active one is reflected in the URL so a
// filtered view can be bookmarked and the back button works.
export function StatusFilter({
  value,
  counts,
  onChange,
}: {
  value: string
  counts: Record<string, number>
  onChange: (status: string) => void
}) {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0)

  return (
    <div className="admin-filters" role="group" aria-label="Filter by status">
      <FilterPill
        label="All"
        count={total}
        active={value === 'all'}
        onClick={() => onChange('all')}
      />
      {ADMIN_STATUSES.map((status) => (
        <FilterPill
          key={status}
          label={status}
          count={counts[status] ?? 0}
          active={value === status}
          onClick={() => onChange(status)}
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
