import { Link } from 'react-router'
import { analyticsEnabled, setConsent, useConsent, usePageViews } from '../../lib/analytics'

// Asks once for analytics consent and sends page views after a yes. Renders
// nothing until the stored choice is known, so returning visitors never see it
// flash, and nothing at all when analytics is not configured.
export function CookieBanner() {
  const consent = useConsent()
  usePageViews()

  if (!analyticsEnabled || consent !== null) return null

  return (
    <div className="cookie-banner" role="region" aria-label="Cookie consent">
      <p>
        May I use analytics cookies? They show me which pages people visit, so
        I can make the shop better. No ads, and your data is never sold.{' '}
        <Link to="/policies/privacy-policy" prefetch="intent">Privacy policy</Link>
      </p>
      <div className="cookie-banner-actions">
        <button type="button" className="btn btn-ghost" onClick={() => setConsent('denied')}>
          No thanks
        </button>
        <button type="button" className="btn btn-primary" onClick={() => setConsent('granted')}>
          Accept
        </button>
      </div>
    </div>
  )
}
