import { redirect } from 'react-router'
import { detectLocale, localizePath, pageHref, type Locale } from './locales'

/**
 * The same page in the visitor's language: an explicit choice (cookie) first,
 * then the browser's languages, then English. A 302 because the target depends
 * on who asks — crawlers send no language and land on English.
 */
function redirectTo(locale: Locale, url: URL): Response {
  return redirect(`${pageHref(localizePath(locale, url.pathname))}${url.search}${url.hash}`, {
    status: 302,
    headers: { 'Cache-Control': 'private, no-store', Vary: 'Accept-Language, Cookie' },
  })
}

export function languageRedirect(request: Request): Response {
  const locale = detectLocale(request.headers.get('Cookie'), request.headers.get('Accept-Language'))
  return redirectTo(locale, new URL(request.url))
}

/** Client-side twin of languageRedirect, for navigations that never reach the server. */
export function clientLanguageRedirect(request: Request): Response {
  const locale = detectLocale(document.cookie, navigator.languages.join(','))
  return redirectTo(locale, new URL(request.url))
}
