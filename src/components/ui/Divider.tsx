export function Divider() {
  return (
    <div className="page-divider" aria-hidden="true">
      <span className="divider-line" />
      <span className="divider-ornament">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2c1.9 3.1 4.6 4.7 4.6 8.1a4.6 4.6 0 0 1-9.2 0C7.4 6.7 10.1 5.1 12 2Z"
            fill="currentColor"
          />
          <path
            d="M12 6.2c1 1.7 2.4 2.5 2.4 4.2a2.4 2.4 0 0 1-4.8 0c0-1.7 1.4-2.5 2.4-4.2Z"
            fill="var(--amber)"
          />
          <path
            d="M12 10.4V21"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="divider-line" />
    </div>
  )
}