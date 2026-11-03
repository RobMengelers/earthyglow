import { PolicyLayout } from '../../components/layout/PolicyLayout'
import { siteMeta } from '../../lib/seo'
import { localeFromParams, useLocale } from '../../i18n'
import { policyLink, policyMetaOptions } from './policy-links'
import type { Route } from './+types/TermsOfService'

const PATH = '/policies/terms-of-service'

export function meta({ params }: Route.MetaArgs) {
  return siteMeta(policyMetaOptions(localeFromParams(params), PATH))
}

const MAIL = <a href="mailto:earthyglowcandles@gmail.com">earthyglowcandles@gmail.com</a>

export function TermsOfService() {
  const locale = useLocale()
  return (
    <PolicyLayout title={policyLink(locale, PATH).label}>
      {locale === 'nl' ? (
        <>
          <h2>1. Bedrijfsgegevens</h2>
          <p>Ik ben Naomi, de maker achter EarthyGlow. Ik maak kaarsen met de hand in Nederland van 100% sojawas.</p>
          <p>Contact: {MAIL}</p>
          <h2>2. Producten</h2>
          <p>
            Ik maak elke kaars met de hand, dus kleuren, vormen en kleine details kunnen
            een beetje verschillen. Dat maakt elke kaars juist persoonlijk.
          </p>
          <h2>3. Prijzen &amp; betaling</h2>
          <ul>
            <li>Alle prijzen zijn inclusief btw.</li>
            <li>Bestellingen worden verzonden nadat de betaling volledig is ontvangen.</li>
          </ul>
          <h2>4. Verzendkosten</h2>
          <ul>
            <li>Verzendkosten (NL) zijn €6.99, gratis bij bestellingen vanaf €25</li>
            <li>Internationale verzending kost €12.95, gratis bij bestellingen vanaf €50</li>
            <li>Verwachte levering: 3 tot 7 werkdagen na betaling. Levertijden kunnen variëren.</li>
            <li>EarthyGlow is niet verantwoordelijk voor vertragingen door de vervoerder.</li>
          </ul>
          <h2>5. Garantie</h2>
          <p>Is je kaars beschadigd aangekomen?</p>
          <p>
            Neem binnen 48 uur contact met ons op, het liefst met een foto van de schade.
            Ik bekijk het samen met je en help je een oplossing te vinden.
          </p>
        </>
      ) : locale === 'de' ? (
        <>
          <h2>1. Unternehmensangaben</h2>
          <p>Ich bin Naomi, die Macherin hinter EarthyGlow. Ich fertige Kerzen von Hand in den Niederlanden aus 100 % Sojawachs.</p>
          <p>Kontakt: {MAIL}</p>
          <h2>2. Produkte</h2>
          <p>
            Ich fertige jede Kerze von Hand, daher können Farben, Formen und kleine Details
            etwas variieren. Genau das macht jede Kerze persönlich.
          </p>
          <h2>3. Preise &amp; Zahlung</h2>
          <ul>
            <li>Alle Preise verstehen sich inklusive Mehrwertsteuer.</li>
            <li>Bestellungen werden versandt, nachdem die Zahlung vollständig eingegangen ist.</li>
          </ul>
          <h2>4. Versandkosten</h2>
          <ul>
            <li>Versandkosten (NL) betragen €6.99, kostenlos ab einem Bestellwert von €25</li>
            <li>Internationaler Versand kostet €12.95, kostenlos ab einem Bestellwert von €50</li>
            <li>Voraussichtliche Lieferung: 3 bis 7 Werktage nach Zahlung. Lieferzeiten können variieren.</li>
            <li>EarthyGlow ist nicht verantwortlich für Verzögerungen durch den Versanddienstleister.</li>
          </ul>
          <h2>5. Gewährleistung</h2>
          <p>Ist deine Kerze beschädigt angekommen?</p>
          <p>
            Bitte kontaktiere uns innerhalb von 48 Stunden, am besten mit einem Foto des Schadens.
            Ich schaue mir das gemeinsam mit dir an und helfe dir, eine Lösung zu finden.
          </p>
        </>
      ) : (
        <>
          <h2>1. Company Information</h2>
          <p>I’m Naomi, the maker behind EarthyGlow. I make candles by hand in the Netherlands using 100% soy wax.</p>
          <p>Contact: {MAIL}</p>
          <h2>2. Products</h2>
          <p>
            I make each candle by hand, so colours, shapes and small details
            may vary a little. That’s part of what makes each one personal.
          </p>
          <h2>3. Prices &amp; Payment</h2>
          <ul>
            <li>All prices include VAT</li>
            <li>Orders are shipped after payment has been received in full.</li>
          </ul>
          <h2>4. Shipping Costs</h2>
          <ul>
            <li>Shipping costs (NL) are €6.99, free for orders of €25 or more</li>
            <li>International shipping is €12.95, free for orders of €50 or more</li>
            <li>Estimated delivery: 3 to 7 business days after payment. Delivery times can vary.</li>
            <li>EarthyGlow is not responsible for delays caused by the carrier.</li>
          </ul>
          <h2>5. Warranty</h2>
          <p>Did your candle arrive damaged?</p>
          <p>
            Please contact us within 48 hours, preferably with a photo of the damage.
            I’ll look into it with you and help find a solution.
          </p>
        </>
      )}
    </PolicyLayout>
  )
}

export default TermsOfService
