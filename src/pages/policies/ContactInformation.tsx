import { PolicyLayout } from '../../components/layout/PolicyLayout'
import { siteMeta } from '../../lib/seo'
import { localeFromParams, useLocale } from '../../i18n'
import { policyLink, policyMetaOptions } from './policy-links'
import type { Route } from './+types/ContactInformation'

const PATH = '/policies/contact-information'

export function meta({ params }: Route.MetaArgs) {
  return siteMeta(policyMetaOptions(localeFromParams(params), PATH))
}

const MAIL = <a href="mailto:earthyglowcandles@gmail.com">earthyglowcandles@gmail.com</a>

export function ContactInformation() {
  const locale = useLocale()
  return (
    <PolicyLayout title={policyLink(locale, PATH).label}>
      {locale === 'nl' ? (
        <>
          <p>E-mail: {MAIL}</p>
          <p>Ik ben Naomi, de maker achter EarthyGlow. Neem gerust contact op als je hulp nodig hebt met een kaars of een bestelling.</p>
          <p>Gemaakt in Nederland</p>
          <p>Kamer van Koophandel (KVK): 42049155</p>
          <p>Btw-nummer: NL005456394B38</p>
        </>
      ) : locale === 'de' ? (
        <>
          <p>E-Mail: {MAIL}</p>
          <p>Ich bin Naomi, die Macherin hinter EarthyGlow. Melde dich gern, wenn du Hilfe bei einer Kerze oder einer Bestellung brauchst.</p>
          <p>Hergestellt in den Niederlanden</p>
          <p>Handelskammer (KVK): 42049155</p>
          <p>USt-IdNr.: NL005456394B38</p>
        </>
      ) : (
        <>
          <p>E-mail: {MAIL}</p>
          <p>I’m Naomi, the maker behind EarthyGlow. Get in touch if you need help with a candle or an order.</p>
          <p>Made in the Netherlands</p>
          <p>Chamber of Commerce (KVK): 42049155</p>
          <p>VAT number: NL005456394B38</p>
        </>
      )}
    </PolicyLayout>
  )
}

export default ContactInformation
