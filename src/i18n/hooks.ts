import {
  useLocation,
  useNavigate,
  type NavigateOptions,
  type To,
} from 'react-router'
import { DEFAULT_LOCALE, formatPriceFor, isLocale, LOCALE_COOKIE, localizePath, pageHref, type Locale } from './locales'

/**
 * The language of the current page, read from the URL's first segment. It reads
 * the location rather than route params so it also works above the /:lang
 * route: in the document shell, the cart provider and error pages.
 */
export function useLocale(): Locale {
  const lang = useLocation().pathname.split('/')[1]
  return isLocale(lang) ? lang : DEFAULT_LOCALE
}

/**
 * Declares a component's text in every language. The English copy sets the
 * shape and the other languages must match it, so a missing translation is a
 * type error rather than a blank on the page.
 */
export function defineCopy<T>(copy: { en: T } & Record<Exclude<Locale, 'en'>, NoInfer<T>>): Record<Locale, T> {
  return copy
}

/** The current language's entry from a defineCopy table. */
export function useCopy<T>(copy: Record<Locale, T>): T {
  return copy[useLocale()]
}

export function useFormatPrice(): (cents: number) => string {
  const locale = useLocale()
  return (cents) => formatPriceFor(locale, cents)
}

/** Keeps an absolute path in the given language; relative links are left alone. */
export function localizeTo(locale: Locale, to: To): To {
  if (typeof to === 'string') {
    return to.startsWith('/') ? pageHref(localizePath(locale, to)) : to
  }
  return to.pathname?.startsWith('/')
    ? { ...to, pathname: pageHref(localizePath(locale, to.pathname)) }
    : to
}

/** Builds the current-language URL for a site path, e.g. '/shop' → '/nl/shop'. */
export function useLocalePath(): (path: string) => string {
  const locale = useLocale()
  return (path) => localizePath(locale, path)
}

/** useNavigate that keeps absolute paths in the current language. */
export function useLocaleNavigate() {
  const navigate = useNavigate()
  const locale = useLocale()
  return (to: To, options?: NavigateOptions) => navigate(localizeTo(locale, to), options)
}

/** Remembers a language picked in the switcher for a year. */
export function rememberLocale(locale: Locale): void {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`
}
