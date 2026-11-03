import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { stripLocale } from '../../i18n'

export function ScrollToTop() {
  // A language switch keeps the visitor on the same page, so it keeps the
  // scroll position too; only a different page starts at the top.
  const page = stripLocale(useLocation().pathname).replace(/(.)\/+$/, '$1')

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [page])

  return null
}