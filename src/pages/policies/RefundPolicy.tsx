import { PolicyLayout } from '../../components/layout/PolicyLayout'
import { siteMeta } from '../../lib/seo'
import { localeFromParams, useLocale } from '../../i18n'
import { policyLink, policyMetaOptions } from './policy-links'
import type { Route } from './+types/RefundPolicy'

const PATH = '/policies/refund-policy'

export function meta({ params }: Route.MetaArgs) {
  return siteMeta(policyMetaOptions(localeFromParams(params), PATH))
}

const MAIL = <a href="mailto:earthyglowcandles@gmail.com">earthyglowcandles@gmail.com</a>

export function RefundPolicy() {
  const locale = useLocale()
  return (
    <PolicyLayout title={policyLink(locale, PATH).label}>
      {locale === 'nl' ? (
        <>
          <h2>1. Handgemaakte &amp; gepersonaliseerde artikelen</h2>
          <p>
            Omdat onze kaarsen handgemaakt zijn en op bestelling worden gemaakt,
            worden retouren niet automatisch geaccepteerd. Is er iets misgegaan?
            Neem dan contact op, dan help ik je graag.
          </p>
          <h2>2. Niet tevreden?</h2>
          <p>
            Neem binnen 7 dagen na ontvangst van de kaarsen contact met ons op via {MAIL}.
            Ik bekijk het samen met je en we zoeken een passende oplossing, zoals een
            vervanging of een gedeeltelijke terugbetaling.
          </p>
          <h2>3. Retourkosten</h2>
          <p>
            Als er een retour wordt afgesproken, zijn de verzendkosten voor de retour
            voor rekening van de klant, tenzij anders afgesproken.
          </p>
        </>
      ) : locale === 'de' ? (
        <>
          <h2>1. Handgemachte &amp; personalisierte Artikel</h2>
          <p>
            Da unsere Kerzen handgemacht und auf Bestellung gefertigt sind, werden
            Rücksendungen nicht automatisch angenommen. Wenn etwas schiefgelaufen ist,
            melde dich bitte, damit ich dir helfen kann.
          </p>
          <h2>2. Nicht zufrieden?</h2>
          <p>
            Bitte kontaktiere uns innerhalb von 7 Tagen nach Erhalt der Kerzen per E-Mail an {MAIL}.
            Ich schaue mir das gemeinsam mit dir an und wir besprechen eine passende Lösung,
            zum Beispiel einen Ersatz oder eine teilweise Erstattung.
          </p>
          <h2>3. Rücksendekosten</h2>
          <p>
            Wenn eine Rücksendung vereinbart wird, trägt der Kunde die Kosten für den
            Rückversand, sofern nichts anderes vereinbart wurde.
          </p>
        </>
      ) : (
        <>
          <h2>1. Handmade &amp; Personalized Items</h2>
          <p>
            Because our candles are handmade and made to order, returns are not
            automatically accepted. If something went wrong,
            please get in touch so I can help.
          </p>
          <h2>2. Not satisfied?</h2>
          <p>
            Please contact us within 7 days after receiving the candles via email at {MAIL}.
            I’ll look into it with you and discuss a suitable solution, such as a
            replacement or partial refund.
          </p>
          <h2>3. Return Costs</h2>
          <p>
            If a return is agreed upon, return shipping costs are the responsibility
            of the customer unless otherwise agreed.
          </p>
        </>
      )}
    </PolicyLayout>
  )
}

export default RefundPolicy
