import { type ButtonHTMLAttributes, type ReactNode } from 'react'

type LoadingButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean
  children: ReactNode
}

export function LoadingButton({
  loading = false,
  children,
  disabled,
  className,
  ...buttonProps
}: LoadingButtonProps) {
  return (
    <button
      {...buttonProps}
      className={loading ? `${className ?? ''} is-loading`.trim() : className}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      <span className="btn-label">{children}</span>
      {loading && <span className="btn-spinner" aria-hidden="true" />}
    </button>
  )
}