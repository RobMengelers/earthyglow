import type { ReactNode } from 'react'
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  redirect,
  useRouteError,
  type ClientLoaderFunctionArgs,
  type LoaderFunctionArgs,
} from 'react-router'
import { CartProvider } from './cart/CartProvider'
import { siteMeta } from './lib/seo'
import { defineCopy, Link, useCopy, useLocale } from './i18n'
import './index.css'

// Fallback for routes without their own meta; it claims no canonical URL.
export function meta() {
  return siteMeta({})
}

export function links() {
  return [
    { rel: 'icon', type: 'image/png', href: '/favicon.png', sizes: '64x64' },
    { rel: 'apple-touch-icon', type: 'image/png', href: '/favicon.png' },
    { rel: 'manifest', href: '/site.webmanifest' },
    {
      rel: 'preload',
      as: 'font',
      type: 'font/woff2',
      href: '/fonts/inter-normal-latin.woff2',
      crossOrigin: 'anonymous',
    },
    {
      rel: 'preload',
      as: 'font',
      type: 'font/woff2',
      href: '/fonts/fraunces-normal-latin.woff2',
      crossOrigin: 'anonymous',
    },
    {
      rel: 'preload',
      as: 'font',
      type: 'font/woff2',
      href: '/fonts/fraunces-italic-latin.woff2',
      crossOrigin: 'anonymous',
    },
  ]
}

export function Layout({ children }: { children: ReactNode }) {
  const locale = useLocale()
  return (
    <html lang={locale}>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export function loader({ request }: LoaderFunctionArgs) {
  // Canonical URLs have no trailing slash (Netlify cannot express this as a
  // redirect rule without looping), so enforce it at the application layer.
  const url = new URL(request.url)
  if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.replace(/\/+$/, '')
    return redirect(`${url.pathname}${url.search}`, 301)
  }
  return null
}

// Client navigation never needs the server: the root only canonicalises the
// trailing slash, and mirroring it here keeps navigations off the serverless
// function (e.g. shop season filters change the query and would otherwise
// revalidate this loader on the server). The server loader still runs for real
// document requests.
export function clientLoader({ request }: ClientLoaderFunctionArgs) {
  const url = new URL(request.url)
  if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.replace(/\/+$/, '')
    return redirect(`${url.pathname}${url.search}`, 301)
  }
  return null
}

export default function Root() {
  return (
    <CartProvider>
      <Outlet />
    </CartProvider>
  )
}

const errorCopy = defineCopy({
  en: {
    notFound: 'This page drifted away',
    failed: 'Something went wrong',
    fallback: 'Something went wrong.',
    serverError: 'Something went wrong on our side. Please try again.',
    home: 'Back home',
    shop: 'Shop the collection',
  },
  nl: {
    notFound: 'Deze pagina is weggedreven',
    failed: 'Er ging iets mis',
    fallback: 'Er ging iets mis.',
    serverError: 'Er ging aan onze kant iets mis. Probeer het nog eens.',
    home: 'Terug naar home',
    shop: 'Bekijk de collectie',
  },
  de: {
    notFound: 'Diese Seite ist davongeschwebt',
    failed: 'Etwas ist schiefgelaufen',
    fallback: 'Etwas ist schiefgelaufen.',
    serverError: 'Bei uns ist etwas schiefgelaufen. Bitte versuche es noch einmal.',
    home: 'Zur Startseite',
    shop: 'Zur Kollektion',
  },
})

export function ErrorBoundary() {
  const error = useRouteError()
  const copy = useCopy(errorCopy)
  const status = isRouteErrorResponse(error) ? error.status : 500
  const message = isRouteErrorResponse(error)
    ? status === 404
      ? copy.fallback
      : error.statusText || copy.fallback
    : copy.serverError

  return (
    <section className="not-found">
      <div className="container">
        <p className="eyebrow">{status}</p>
        <h1>{status === 404 ? copy.notFound : copy.failed}</h1>
        <p>{message}</p>
        <div className="hero-actions">
          <Link to="/" className="btn btn-primary">
            {copy.home}
          </Link>
          <Link to="/shop" className="btn btn-ghost">
            {copy.shop}
          </Link>
        </div>
      </div>
    </section>
  )
}
