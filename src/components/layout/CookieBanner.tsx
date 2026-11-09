import { defineCopy, Link, useCopy } from '../../i18n'
import { analyticsEnabled, setConsent, useConsent, usePageViews } from '../../lib/analytics'

const bannerCopy = defineCopy({
  en: {
    label: 'Cookie consent',
    question: 'May I use analytics cookies? They show me which pages people visit, so I can make the shop better. No ads, and your data is never sold.',
    privacy: 'Privacy policy',
    decline: 'No thanks',
    accept: 'Accept',
  },
  nl: {
    label: 'Cookietoestemming',
    question: "Mag ik analytische cookies gebruiken? Ze laten me zien welke pagina's mensen bezoeken, zodat ik de winkel kan verbeteren. Geen advertenties, en je gegevens worden nooit verkocht.",
    privacy: 'Privacybeleid',
    decline: 'Nee, bedankt',
    accept: 'Accepteren',
  },
  de: {
    label: 'Cookie-Einwilligung',
    question: 'Darf ich Analyse-Cookies verwenden? Sie zeigen mir, welche Seiten besucht werden, damit ich den Shop verbessern kann. Keine Werbung, und deine Daten werden niemals verkauft.',
    privacy: 'Datenschutzerklärung',
    decline: 'Nein, danke',
    accept: 'Akzeptieren',
  },
})

// Asks once for analytics consent and sends page views after a yes. Renders
// nothing until the stored choice is known, so returning visitors never see it
// flash, and nothing at all when analytics is not configured.
export function CookieBanner() {
  const consent = useConsent()
  const copy = useCopy(bannerCopy)
  usePageViews()

  if (!analyticsEnabled || consent !== null) return null

  return (
    <div className="cookie-banner" role="region" aria-label={copy.label}>
      <p>
        {copy.question}{' '}
        <Link to="/policies/privacy-policy" prefetch="intent">{copy.privacy}</Link>
      </p>
      <div className="cookie-banner-actions">
        <button type="button" className="btn btn-ghost" onClick={() => setConsent('denied')}>
          {copy.decline}
        </button>
        <button type="button" className="btn btn-primary" onClick={() => setConsent('granted')}>
          {copy.accept}
        </button>
      </div>
    </div>
  )
}
