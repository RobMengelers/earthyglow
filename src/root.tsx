import type { ReactNode } from 'react'
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  redirect,
  useRouteError,
  type LoaderFunctionArgs,
} from 'react-router'
import { CartProvider } from './cart/CartProvider'
import { siteMeta } from './lib/seo'
import './index.css'

export function meta() {
  return siteMeta({ path: '/' })
}

export function links() {
  return [
    { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
    { rel: 'icon', type: 'image/png', href: '/logo.png' },
    { rel: 'apple-touch-icon', href: '/logo.png' },
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
  ]
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
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

export default function Root() {
  return (
    <CartProvider>
      <Outlet />
    </CartProvider>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()
  const status = isRouteErrorResponse(error) ? error.status : 500
  const message = isRouteErrorResponse(error)
    ? error.statusText || 'Something went wrong.'
    : 'Something went wrong on our side. Please try again.'

  return (
    <section className="not-found">
      <div className="container">
        <p className="eyebrow">{status}</p>
        <h1>{status === 404 ? 'This page drifted away' : 'Something went wrong'}</h1>
        <p>{message}</p>
        <div className="hero-actions">
          <Link to="/" className="btn btn-primary">
            Back home
          </Link>
          <Link to="/shop" className="btn btn-ghost">
            Shop the collection
          </Link>
        </div>
      </div>
    </section>
  )
}
