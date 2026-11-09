// The storefront languages. Every public page lives under its language prefix
// (/nl/…, /en/…, /de/…); the first entry is the order the switcher shows.
export const LOCALES = ['nl', 'en', 'de'] as const
export type Locale = (typeof LOCALES)[number]

/** The language for visitors whose browser asks for none of ours, and for crawlers. */
export const DEFAULT_LOCALE: Locale = 'en'

/** Cookie that remembers a language picked in the switcher; it beats the browser language. */
export const LOCALE_COOKIE = 'lang'

export const LOCALE_INFO: Record<Locale, { name: string; intl: string; og: string }> = {
  nl: { name: 'Nederlands', intl: 'nl-NL', og: 'nl_NL' },
  en: { name: 'English', intl: 'en-GB', og: 'en_GB' },
  de: { name: 'Deutsch', intl: 'de-DE', og: 'de_DE' },
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}

/**
 * Prefixes a site path with a language: ('nl', '/shop') → '/nl/shop', and the
 * home page '/' → '/nl'. Paths that already carry a language are re-prefixed,
 * so the switcher can pass the current URL straight in.
 */
export function localizePath(locale: Locale, path: string): string {
  const bare = stripLocale(path)
  return bare === '/' ? `/${locale}` : `/${locale}${bare.startsWith('/') ? '' : '/'}${bare}`
}

/** Drops a leading language segment: '/nl/shop?x=1' → '/shop?x=1', '/nl' → '/'. */
export function stripLocale(path: string): string {
  const match = /^\/([a-z]{2})(?=\/|\?|#|$)/.exec(path)
  if (!match || !isLocale(match[1])) return path
  const rest = path.slice(match[0].length)
  return rest === '' || rest.startsWith('?') || rest.startsWith('#') ? `/${rest}` : rest
}

/**
 * Picks the language for a visitor: an explicit choice (the cookie) first, then
 * the first of the browser's preferred languages that we have, then English.
 */
export function detectLocale(cookieHeader: string | null, acceptLanguage: string | null): Locale {
  const cookie = readCookie(cookieHeader, LOCALE_COOKIE)
  if (isLocale(cookie)) return cookie

  const preferred = (acceptLanguage ?? '')
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';')
      const q = params.find((param) => param.trim().startsWith('q='))
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q.trim().slice(2)) : 1 }
    })
    .filter((entry) => entry.tag && !Number.isNaN(entry.q) && entry.q > 0)
    .sort((a, b) => b.q - a.q)

  for (const { tag } of preferred) {
    const base = tag.split('-')[0]
    if (isLocale(base)) return base
  }
  return DEFAULT_LOCALE
}

function readCookie(header: string | null, name: string): string | undefined {
  for (const part of (header ?? '').split(';')) {
    const [key, ...value] = part.trim().split('=')
    if (key === name) return decodeURIComponent(value.join('='))
  }
  return undefined
}

/** Formats euro cents the way each language writes them: €14.95 in English, €14,95 in Dutch and German. */
export function formatPriceFor(locale: Locale, cents: number): string {
  const price = formatEuroCents(cents)
  return locale === 'en' ? price : price.replace('.', ',')
}

export function formatEuroCents(cents: number): string {
  const sign = cents < 0 ? '-' : ''
  return `${sign}€${(Math.abs(cents) / 100).toFixed(2)}`
}

/** The language of a route from its params (for meta functions, which cannot use hooks). */
export function localeFromParams(params: { lang?: string }): Locale {
  return isLocale(params.lang) ? params.lang : DEFAULT_LOCALE
}
