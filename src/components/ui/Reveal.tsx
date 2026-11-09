import { useEffect, useRef, type ReactNode } from 'react'

type RevealProps = {
  children: ReactNode
  delay?: number
  className?: string
  /** For content at the top of a page: show it straight away instead of waiting for JavaScript. */
  immediate?: boolean
}

export function Reveal({ children, delay = 0, className, immediate = false }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || immediate) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-in-view')
          observer.disconnect()
        }
      },
      { threshold: 0.12 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [immediate])

  if (immediate) return <div className={className}>{children}</div>

  return (
    <div
      ref={ref}
      className={className ? `reveal ${className}` : 'reveal'}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}