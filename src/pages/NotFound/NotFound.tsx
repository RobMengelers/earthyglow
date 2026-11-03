import { isRouteErrorResponse, useRouteError } from 'react-router'
import { siteMeta } from '../../lib/seo'
import { defineCopy, Link, localeFromParams, useCopy } from '../../i18n'
import type { Route } from './+types/NotFound'

const notFoundCopy = defineCopy({
  en: {
    metaTitle: 'Page not found · EarthyGlow',
    title: 'This page drifted away',
    body: 'We couldn’t find that page, but there’s still plenty that’s warm and cosy in the shop. Browse the collection instead.',
    home: 'Back home',
    shop: 'Shop the collection',
    failed: 'Something went wrong',
    retry: 'Please try again in a moment.',
  },
  nl: {
    metaTitle: 'Pagina niet gevonden · EarthyGlow',
    title: 'Deze pagina is weggedreven',
    body: 'We konden die pagina niet vinden, maar in de shop is nog genoeg warms en knus te vinden. Bekijk de collectie.',
    home: 'Terug naar home',
    shop: 'Bekijk de collectie',
    failed: 'Er ging iets mis',
    retry: 'Probeer het zo nog eens.',
  },
  de: {
    metaTitle: 'Seite nicht gefunden · EarthyGlow',
    title: 'Diese Seite ist davongeschwebt',
    body: 'Wir konnten diese Seite nicht finden, aber im Shop gibt es noch jede Menge Warmes und Gemütliches. Stöbere stattdessen in der Kollektion.',
    home: 'Zur Startseite',
    shop: 'Zur Kollektion',
    failed: 'Etwas ist schiefgelaufen',
    retry: 'Bitte versuche es gleich noch einmal.',
  },
})

export function meta({ params }: Route.MetaArgs) {
  return siteMeta({ locale: localeFromParams(params), title: notFoundCopy[localeFromParams(params)].metaTitle, robots: 'noindex, follow' })
}

// Matched by the `*` route: unknown URLs must respond with a real 404 status.
export function loader() {
  throw new Response('Not Found', { status: 404 })
}

export function NotFound() {
  const copy = useCopy(notFoundCopy)
  return (
    <section className="not-found">
      <div className="container">
        <p className="eyebrow">404</p>
        <h1>{copy.title}</h1>
        <p>{copy.body}</p>
        <div className="hero-actions">
          <Link to="/" className="btn btn-primary" prefetch="intent">
            {copy.home}
          </Link>
          <Link to="/shop" className="btn btn-ghost" prefetch="intent">
            {copy.shop}
          </Link>
        </div>
      </div>
    </section>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()
  const copy = useCopy(notFoundCopy)

  if (isRouteErrorResponse(error) && error.status !== 404) {
    return (
      <section className="not-found">
        <div className="container">
          <p className="eyebrow">{error.status}</p>
          <h1>{copy.failed}</h1>
          <p>{copy.retry}</p>
          <div className="hero-actions">
            <Link to="/" className="btn btn-primary" prefetch="intent">
              {copy.home}
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return <NotFound />
}

export default NotFound
