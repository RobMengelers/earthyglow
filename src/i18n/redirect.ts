import { redirect, type RouterContextProvider } from 'react-router'
import { netlifyRouterContext } from '@netlify/vite-plugin-react-router/serverless'
import { legacyPath } from './legacy-paths'
import { detectLocale, localizePath, pageHref, type Locale } from './locales'

/**
 * The same page in the visitor's language (see detectLocale). A 302 because the
 * target depends on who asks — crawlers send no language and land on English.
 */
function redirectTo(locale: Locale, url: URL): Response {
  // Old shop addresses carry their own query (?season=…); keep the visitor's too.
  const [path, legacyQuery = ''] = legacyPath(url.pathname).split('?')
  const query = [legacyQuery, url.search.slice(1)].filter(Boolean).join('&')
  return redirect(`${pageHref(localizePath(locale, path))}${query ? `?${query}` : ''}${url.hash}`, {
    status: 302,
    headers: { 'Cache-Control': 'private, no-store', Vary: 'Accept-Language, Cookie' },
  })
}

/** The visitor's country code from Netlify's geo lookup; none in local dev. */
function visitorCountry(context: Readonly<RouterContextProvider>): string | undefined {
  try {
    return context.get(netlifyRouterContext).geo?.country?.code
  } catch {
    return undefined
  }
}

export function languageRedirect(request: Request, context: Readonly<RouterContextProvider>): Response {
  const locale = detectLocale(
    request.headers.get('Cookie'),
    request.headers.get('Accept-Language'),
    visitorCountry(context),
  )
  return redirectTo(locale, new URL(request.url))
}

/**
 * Client-side twin of languageRedirect, for navigations that never reach the
 * server. It has no country, so it can only go by the browser's languages.
 */
export function clientLanguageRedirect(request: Request): Response {
  const locale = detectLocale(document.cookie, navigator.languages.join(','))
  return redirectTo(locale, new URL(request.url))
}
