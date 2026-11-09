import { PolicyLayout } from '../../components/layout/PolicyLayout'
import { siteMeta } from '../../lib/seo'
import { localeFromParams, useLocale, type Locale } from '../../i18n'
import { policyLink, policyMetaOptions } from './policy-links'
import type { Route } from './+types/RefundPolicy'

const PATH = '/policies/refund-policy'

export function meta({ params }: Route.MetaArgs) {
  return siteMeta(policyMetaOptions(localeFromParams(params), PATH))
}

const UPDATED: Record<Locale, string> = {
  en: '9 November 2026',
  nl: '9 november 2026',
  de: '9. November 2026',
}

const MAIL = <a href="mailto:earthyglowcandles@gmail.com">earthyglowcandles@gmail.com</a>

export function RefundPolicy() {
  const locale = useLocale()
  return (
    <PolicyLayout title={policyLink(locale, PATH).label} updated={UPDATED[locale]}>
      {locale === 'nl' ? (
        <>
          <h2>1. Herroepingsrecht</h2>
          <p>
            Je kunt je bestelling binnen 14 dagen na ontvangst zonder opgave van reden annuleren. Laat het ons binnen die 14 dagen weten via {MAIL} en vermeld je bestelnummer.
          </p>
          <h2>2. Terugsturen</h2>
          <p>
            Stuur de kaarsen binnen 14 dagen nadat je ons hebt laten weten dat je wilt annuleren terug. Stuur ze ongebruikt en goed verpakt terug. Is een kaars gebrand of beschadigd door gebruik, dan kan het terugbetaalde bedrag lager uitvallen.
          </p>
          <h2>3. Terugbetaling</h2>
          <p>
            We betalen het bedrag dat je hebt betaald, inclusief de standaard verzendkosten, binnen 14 dagen na je annulering terug. We mogen wachten met terugbetalen tot we de kaarsen hebben ontvangen of tot je kunt aantonen dat je ze hebt verzonden.
          </p>
          <h2>4. Retourkosten</h2>
          <p>
            De verzendkosten voor het terugsturen zijn voor jouw rekening.
          </p>
          <h2>5. Gepersonaliseerde artikelen</h2>
          <p>
            Kaarsen die speciaal volgens jouw eigen wensen zijn gemaakt, bijvoorbeeld met een naam of eigen ontwerp, zijn uitgesloten van het herroepingsrecht, tenzij ze een gebrek hebben.
          </p>
          <h2>6. Beschadigd of verkeerd geleverd?</h2>
          <p>
            Is er iets beschadigd aangekomen of heb je het verkeerde artikel ontvangen? Neem dan zo snel mogelijk contact op via {MAIL}, het liefst met een foto. We zoeken samen een oplossing, zoals een vervanging of terugbetaling, en dan zijn de retourkosten voor ons.
          </p>
        </>
      ) : locale === 'de' ? (
        <>
          <h2>1. Widerrufsrecht</h2>
          <p>
            Du kannst deine Bestellung innerhalb von 14 Tagen nach Erhalt ohne Angabe von Gründen widerrufen. Teile uns das innerhalb dieser 14 Tage per E-Mail an {MAIL} mit und nenne deine Bestellnummer.
          </p>
          <h2>2. Rücksendung</h2>
          <p>
            Bitte sende die Kerzen innerhalb von 14 Tagen zurück, nachdem du uns den Widerruf mitgeteilt hast. Sende sie unbenutzt und gut verpackt zurück. Wurde eine Kerze angezündet oder durch Gebrauch beschädigt, kann sich der Erstattungsbetrag verringern.
          </p>
          <h2>3. Erstattung</h2>
          <p>
            Wir erstatten den von dir gezahlten Betrag, einschließlich der Standardversandkosten, innerhalb von 14 Tagen nach deinem Widerruf. Wir können die Erstattung zurückhalten, bis wir die Kerzen erhalten haben oder du den Versand nachgewiesen hast.
          </p>
          <h2>4. Rücksendekosten</h2>
          <p>
            Die Kosten für die Rücksendung trägst du selbst.
          </p>
          <h2>5. Personalisierte Artikel</h2>
          <p>
            Kerzen, die speziell nach deinen Wünschen angefertigt wurden, zum Beispiel mit einem Namen oder eigenem Design, sind vom Widerrufsrecht ausgeschlossen, sofern sie keinen Mangel haben.
          </p>
          <h2>6. Beschädigt oder falsch geliefert?</h2>
          <p>
            Ist etwas beschädigt angekommen oder hast du den falschen Artikel erhalten? Melde dich bitte so schnell wie möglich per E-Mail an {MAIL}, am besten mit einem Foto. Wir finden gemeinsam eine Lösung, zum Beispiel Ersatz oder eine Erstattung, und übernehmen dann die Rücksendekosten.
          </p>
        </>
      ) : (
        <>
          <h2>1. Your right to cancel</h2>
          <p>
            You can cancel your order within 14 days after receiving it, without giving a reason. Let us know within those 14 days by emailing {MAIL} with your order number.
          </p>
          <h2>2. Sending it back</h2>
          <p>
            Please send the candles back within 14 days after telling us you want to cancel. Send them unused and well packed. If a candle has been burned or damaged through use, the amount refunded may be reduced.
          </p>
          <h2>3. Your refund</h2>
          <p>
            We refund what you paid, including standard shipping costs, within 14 days of your cancellation. We may wait to refund you until we have received the candles or you can show that you have sent them.
          </p>
          <h2>4. Return costs</h2>
          <p>
            The shipping costs for sending the candles back are your responsibility.
          </p>
          <h2>5. Personalised items</h2>
          <p>
            Candles made specially to your own specifications, such as with a name or your own design, cannot be cancelled unless they are faulty.
          </p>
          <h2>6. Damaged or wrong item?</h2>
          <p>
            If something arrived damaged or you received the wrong item, please contact us as soon as possible at {MAIL}, ideally with a photo. We will find a solution together, such as a replacement or refund, and in that case we cover the return costs.
          </p>
        </>
      )}
    </PolicyLayout>
  )
}

export default RefundPolicy
