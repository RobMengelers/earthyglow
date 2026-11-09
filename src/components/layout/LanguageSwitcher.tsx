import { useEffect, useId, useRef, useState } from 'react'
import { Link as RouterLink, useLocation } from 'react-router'
import { LOCALE_INFO, LOCALES, localizePath, pageHref, rememberLocale, useLocale, type Locale } from '../../i18n'

const LABEL: Record<Locale, string> = {
  nl: 'Taal kiezen',
  en: 'Choose language',
  de: 'Sprache wählen',
}

// Flags are drawn rather than emoji: Windows shows emoji flags as two letters.
function Flag({ locale }: { locale: Locale }) {
  const id = useId()
  if (locale === 'nl') {
    return (
      <svg viewBox="0 0 9 6" aria-hidden="true" preserveAspectRatio="none">
        <rect width="9" height="2" fill="#ae1c28" />
        <rect y="2" width="9" height="2" fill="#fff" />
        <rect y="4" width="9" height="2" fill="#21468b" />
      </svg>
    )
  }
  if (locale === 'de') {
    return (
      <svg viewBox="0 0 5 3" aria-hidden="true" preserveAspectRatio="none">
        <rect width="5" height="1" fill="#000" />
        <rect y="1" width="5" height="1" fill="#dd0000" />
        <rect y="2" width="5" height="1" fill="#ffce00" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 60 30" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <clipPath id={`${id}-t`}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${id}-t)`} stroke="#c8102e" strokeWidth="4" />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#c8102e" strokeWidth="6" />
    </svg>
  )
}

/**
 * A flag button that opens a small menu of the three languages. Each entry is a
 * real link to the current page in that language (so crawlers find them too),
 * and the choice is remembered in a cookie, which outranks the browser language.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const current = useLocale()
  const { pathname: rawPathname, search, hash } = useLocation()
  // Netlify serves prerendered pages with a trailing slash; links never carry one.
  const pathname = rawPathname.replace(/(.)\/+$/, '$1')
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  // Close on a click outside or Escape, like any other menu.
  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className={`language-switcher${open ? ' is-open' : ''}${className ? ` ${className}` : ''}`}>
      <button
        type="button"
        className="language-switcher-trigger"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`${LABEL[current]}: ${LOCALE_INFO[current].name}`}
        onClick={() => setOpen((value) => !value)}
      >
        <Flag locale={current} />
        <span className="language-switcher-code">{current.toUpperCase()}</span>
        <svg className="language-switcher-chevron" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <ul id={menuId} className="language-switcher-menu" aria-label={LABEL[current]} hidden={!open}>
        {LOCALES.map((locale) => (
          <li key={locale}>
            <RouterLink
              to={pageHref(`${localizePath(locale, pathname)}${search}${hash}`)}
              className={locale === current ? 'is-active' : undefined}
              aria-current={locale === current ? 'true' : undefined}
              hrefLang={locale}
              lang={locale}
              preventScrollReset
              onClick={() => {
                rememberLocale(locale)
                setOpen(false)
              }}
            >
              <Flag locale={locale} />
              <span>{LOCALE_INFO[locale].name}</span>
            </RouterLink>
          </li>
        ))}
      </ul>
    </div>
  )
}
