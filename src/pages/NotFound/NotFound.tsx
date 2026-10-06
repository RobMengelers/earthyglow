import { Link, isRouteErrorResponse, useRouteError } from 'react-router'
import { siteMeta } from '../../lib/seo'

export function meta() {
  return siteMeta({ title: 'Page not found · EarthyGlow', robots: 'noindex, follow' })
}

// Matched by the `*` route: unknown URLs must respond with a real 404 status.
export function loader() {
  throw new Response('Not Found', { status: 404 })
}

export function NotFound() {
  return (
    <section className="not-found">
      <div className="container">
        <p className="eyebrow">404</p>
        <h1>This page drifted away</h1>
        <p>
          We couldn’t find that page. There’s still something warm and
          cozy probably does. Browse the collection instead.
        </p>
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

export function ErrorBoundary() {
  const error = useRouteError()

  if (isRouteErrorResponse(error) && error.status !== 404) {
    return (
      <section className="not-found">
        <div className="container">
          <p className="eyebrow">{error.status}</p>
          <h1>Something went wrong</h1>
          <p>{error.statusText || 'Please try again in a moment.'}</p>
          <div className="hero-actions">
            <Link to="/" className="btn btn-primary">
              Back home
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return <NotFound />
}

export default NotFound
