import { PolicyLayout } from '../../components/layout/PolicyLayout'
import { siteMeta } from '../../lib/seo'
import { localeFromParams, useLocale, type Locale } from '../../i18n'
import { policyLink, policyMetaOptions } from './policy-links'
import type { Route } from './+types/PrivacyPolicy'

const PATH = '/policies/privacy-policy'

const UPDATED: Record<Locale, string> = {
  en: '9 November 2026',
  nl: '9 november 2026',
  de: '9. November 2026',
}

export function meta({ params }: Route.MetaArgs) {
  return siteMeta(policyMetaOptions(localeFromParams(params), PATH))
}

export function PrivacyPolicy() {
  const locale = useLocale()
  return (
    <PolicyLayout title={policyLink(locale, PATH).label} updated={UPDATED[locale]}>
      {locale === 'nl' ? (
        <>
          <p>
            Dit beleid legt uit hoe EarthyGlow omgaat met persoonsgegevens wanneer je
            deze website gebruikt, contact met ons opneemt of een bestelling plaatst.
            EarthyGlow wordt gerund door Naomi. Ons KVK-nummer is 42049155 en ons
            btw-nummer is NL005456394B38.
          </p>

          <h2>Wat we verzamelen</h2>
          <p>Afhankelijk van hoe je de site gebruikt, kunnen we het volgende ontvangen:</p>
          <ul>
            <li>je naam, e-mailadres, telefoonnummer en bezorgadres wanneer je afrekent;</li>
            <li>je bestelling, betaalmethode en gegevens over bezorging en retour;</li>
            <li>je naam, e-mailadres en bericht wanneer je contact met ons opneemt;</li>
            <li>technische informatie die nodig is om de site veilig en werkend te houden; en</li>
            <li>de artikelen in je winkelmand, lokaal opgeslagen in je browser zodat de winkelmand tussen pagina’s blijft werken.</li>
          </ul>
          <p>We vragen je niet om een account aan te maken en verzamelen zelf geen kaartgegevens. Betalingen worden afgehandeld door onze betaalprovider.</p>

          <h2>Waarom we je gegevens gebruiken</h2>
          <ul>
            <li>Om je bestelling aan te nemen en uit te voeren, de bezorging te regelen, terugbetalingen te verwerken en updates over je bestelling te sturen (overeenkomst).</li>
            <li>Om onze boekhouding en belastingadministratie bij te houden en aan andere wettelijke plichten te voldoen (wettelijke verplichting).</li>
            <li>Om berichten te beantwoorden, misbruik te voorkomen en de website te beveiligen (gerechtvaardigd belang).</li>
          </ul>
          <p>Als je analytische cookies accepteert, gebruiken we Google Analytics om te zien hoe de site wordt gebruikt, bijvoorbeeld welke pagina&apos;s worden bezocht en waar mensen het afrekenen verlaten, zodat we de winkel kunnen verbeteren (toestemming). We versturen op dit moment geen nieuwsbrieven en doen niet aan gedragsgerichte advertenties. We vragen toestemming voordat we optionele marketing invoeren waarvoor dat nodig is.</p>

          <h2>Wie je gegevens ontvangt</h2>
          <p>We delen alleen wat nodig is met dienstverleners die ons helpen de winkel te runnen: Mollie voor betalingen, Resend voor transactionele e-mails en contactmails, Google voor websitestatistieken als je analytische cookies accepteert, onze hosting- en databaseproviders (waaronder Netlify en Railway), en bezorgpartners wanneer dat nodig is om een bestelling te bezorgen. We kunnen gegevens aan autoriteiten verstrekken als de wet dat vereist. Deze providers verwerken gegevens onder hun eigen voorwaarden en, waar van toepassing, verwerkersovereenkomsten.</p>

          <h2>E-mails en contactformulieren</h2>
          <p>We gebruiken je e-mailadres om bevestigingen, verzendupdates en andere berichten te sturen die direct met je bestelling te maken hebben. Een bericht via het contactformulier wordt naar ons doorgestuurd zodat we kunnen reageren; het wordt niet aan een marketinglijst toegevoegd.</p>

          <h2>Cookies en lokale opslag</h2>
          <p>De winkel gebruikt noodzakelijke browseropslag voor je winkelmand en een functionele cookie die je taalkeuze onthoudt, en om je cookiekeuze te onthouden. Analytische cookies van Google Analytics (met de namen <code>_ga</code> en <code>_ga_…</code>, maximaal 2 jaar bewaard) worden pas geplaatst nadat je ze in de cookiebanner hebt geaccepteerd. Ze geven je browser een willekeurige ID zodat bezoeken geteld kunnen worden; we sturen je naam, e-mailadres of bestelgegevens niet naar Google, Google Signals en advertentiepersonalisatie staan uit, en Google Analytics slaat geen IP-adressen op. Je kunt je keuze altijd wijzigen via &ldquo;Cookie-instellingen&rdquo; onderaan de site; als je weigert, worden de analytische cookies verwijderd. We plaatsen geen advertentiecookies. Links naar sociale media openen de externe site in plaats van een social widget hier in te sluiten. Hosting- of betaalproviders kunnen hun eigen technische cookies gebruiken wanneer je hun diensten bezoekt; daar geldt hun privacybeleid.</p>

          <h2>Hoe lang we gegevens bewaren</h2>
          <p>We bewaren bestel- en betaalgegevens zo lang als nodig is om de bestelling uit te voeren, retouren of geschillen af te handelen en aan onze boekhoud- en belastingplichten te voldoen. Contactberichten bewaren we zo lang als nodig is om te reageren en het contact te onderhouden. Daarna verwijderen of anonimiseren we gegevens wanneer er geen wettige reden meer is om ze te bewaren. We beloven geen vaste termijn waar wettelijke verplichtingen een andere vereisen.</p>

          <h2>Je rechten</h2>
          <p>Onder de AVG kun je vragen om inzage in, correctie of verwijdering van je persoonsgegevens, beperking van de verwerking, of bezwaar maken tegen verwerking op basis van gerechtvaardigd belang. Waar van toepassing kun je ook om gegevensoverdraagbaarheid vragen of je toestemming intrekken. Mail je verzoek naar <a href="mailto:earthyglowcandles@gmail.com">earthyglowcandles@gmail.com</a>. Mogelijk moeten we je identiteit controleren, en sommige gegevens moeten we bewaren om aan wettelijke verplichtingen te voldoen.</p>

          <h2>Doorgifte buiten de EER</h2>
          <p>Sommige providers kunnen gegevens buiten de Europese Economische Ruimte verwerken. We gebruiken de waarborgen die de privacywetgeving vereist, zoals een adequaatheidsbesluit of standaardcontractbepalingen waar nodig. Zie de privacyinformatie van de betreffende provider voor de actuele locaties en waarborgen.</p>

          <h2>Beveiliging en kinderen</h2>
          <p>We nemen redelijke technische en organisatorische maatregelen om je gegevens te beschermen, maar geen enkele online overdracht of opslag is volledig veilig te garanderen. De winkel is niet gericht op kinderen en we verzamelen niet bewust persoonsgegevens van kinderen.</p>

          <h2>Vragen en klachten</h2>
          <p>Voor vragen of verzoeken over privacy kun je mailen naar <a href="mailto:earthyglowcandles@gmail.com">earthyglowcandles@gmail.com</a>. Je kunt ook een klacht indienen bij de Autoriteit Persoonsgegevens of bij de toezichthouder in het land waar je woont of werkt.</p>

          <h2>Wijzigingen in dit beleid</h2>
          <p>We kunnen dit beleid bijwerken wanneer de website, onze providers of de wet veranderen. De datum bovenaan laat zien wanneer het voor het laatst is bijgewerkt.</p>
        </>
      ) : locale === 'de' ? (
        <>
          <p>
            Diese Erklärung beschreibt, wie EarthyGlow mit personenbezogenen Daten umgeht,
            wenn du diese Website nutzt, uns kontaktierst oder eine Bestellung aufgibst.
            EarthyGlow wird von Naomi betrieben. Unsere Handelsregisternummer (KVK) ist
            42049155 und unsere USt-IdNr. ist NL005456394B38.
          </p>

          <h2>Welche Daten wir erheben</h2>
          <p>Je nachdem, wie du die Website nutzt, erhalten wir möglicherweise:</p>
          <ul>
            <li>deinen Namen, deine E-Mail-Adresse, Telefonnummer und Lieferadresse, wenn du bestellst;</li>
            <li>deine Bestellung, Zahlungsart sowie Liefer- und Rücksendedaten;</li>
            <li>deinen Namen, deine E-Mail-Adresse und deine Nachricht, wenn du uns kontaktierst;</li>
            <li>technische Informationen, die nötig sind, um die Website sicher und funktionsfähig zu halten; und</li>
            <li>die Artikel in deinem Warenkorb, lokal in deinem Browser gespeichert, damit der Warenkorb seitenübergreifend funktioniert.</li>
          </ul>
          <p>Wir verlangen kein Kundenkonto und erheben selbst keine Kartendaten. Zahlungen werden von unserem Zahlungsdienstleister abgewickelt.</p>

          <h2>Wozu wir deine Daten verwenden</h2>
          <ul>
            <li>Um deine Bestellung anzunehmen und auszuführen, den Versand zu organisieren, Erstattungen zu bearbeiten und dir Updates zu deiner Bestellung zu senden (Vertrag).</li>
            <li>Um unsere Buchhaltungs- und Steuerunterlagen zu führen und weitere gesetzliche Pflichten zu erfüllen (rechtliche Verpflichtung).</li>
            <li>Um Nachrichten zu beantworten, Missbrauch zu verhindern und die Website zu schützen (berechtigtes Interesse).</li>
          </ul>
          <p>Wenn du Analyse-Cookies akzeptierst, nutzen wir Google Analytics, um zu sehen, wie die Website genutzt wird, zum Beispiel welche Seiten besucht werden und wo Menschen den Bestellvorgang verlassen, damit wir den Shop verbessern können (Einwilligung). Wir versenden derzeit keine Newsletter und betreiben keine verhaltensbasierte Werbung. Bevor wir optionales Marketing einführen, für das eine Einwilligung nötig ist, fragen wir dich danach.</p>

          <h2>Wer deine Daten erhält</h2>
          <p>Wir teilen nur das Nötige mit Dienstleistern, die uns beim Betrieb des Shops helfen: Mollie für Zahlungen, Resend für Transaktions- und Kontakt-E-Mails, Google für Website-Statistiken, wenn du Analyse-Cookies akzeptierst, unsere Hosting- und Datenbankanbieter (darunter Netlify und Railway) sowie Versandpartner, wenn das für die Zustellung einer Bestellung nötig ist. Wo das Gesetz es verlangt, können wir Daten an Behörden weitergeben. Diese Anbieter verarbeiten Daten nach ihren eigenen Bedingungen und, wo zutreffend, nach Auftragsverarbeitungsverträgen.</p>

          <h2>E-Mails und Kontaktformulare</h2>
          <p>Wir nutzen deine E-Mail-Adresse, um Bestätigungen, Versandupdates und andere Nachrichten zu senden, die direkt mit deiner Bestellung zusammenhängen. Eine Nachricht über das Kontaktformular wird an uns weitergeleitet, damit wir antworten können; sie wird nicht in eine Marketingliste aufgenommen.</p>

          <h2>Cookies und lokale Speicherung</h2>
          <p>Der Shop nutzt notwendigen Browserspeicher für deinen Warenkorb und ein funktionales Cookie, das deine Sprachwahl speichert, sowie zum Speichern deiner Cookie-Auswahl. Analyse-Cookies von Google Analytics (mit den Namen <code>_ga</code> und <code>_ga_…</code>, bis zu 2 Jahre gespeichert) werden erst gesetzt, nachdem du sie im Cookie-Banner akzeptiert hast. Sie geben deinem Browser eine zufällige ID, damit Besuche gezählt werden können; wir senden weder deinen Namen noch deine E-Mail-Adresse oder Bestelldaten an Google, Google Signals und die Personalisierung von Anzeigen sind deaktiviert, und Google Analytics speichert keine IP-Adressen. Du kannst deine Wahl jederzeit über &bdquo;Cookie-Einstellungen&ldquo; unten auf der Seite ändern; wenn du ablehnst, werden die Analyse-Cookies entfernt. Wir setzen keine Werbecookies. Links zu sozialen Medien öffnen die externe Website, statt hier ein Social-Widget einzubetten. Hosting- oder Zahlungsanbieter können eigene technische Cookies verwenden, wenn du ihre Dienste besuchst; dort gilt deren Datenschutzerklärung.</p>

          <h2>Wie lange wir Daten speichern</h2>
          <p>Wir speichern Bestell- und Zahlungsdaten so lange, wie es nötig ist, um die Bestellung auszuführen, Rücksendungen oder Streitfälle zu bearbeiten und Buchhaltungs- und Steuerpflichten zu erfüllen. Kontaktnachrichten speichern wir so lange, wie es nötig ist, um zu antworten und den Kontakt zu pflegen. Danach löschen oder anonymisieren wir Daten, sobald es keinen rechtmäßigen Grund mehr gibt, sie aufzubewahren. Wir versprechen keine feste Frist, wo gesetzliche Pflichten eine andere vorschreiben.</p>

          <h2>Deine Rechte</h2>
          <p>Nach der DSGVO kannst du Auskunft über deine personenbezogenen Daten, deren Berichtigung oder Löschung sowie die Einschränkung der Verarbeitung verlangen oder einer Verarbeitung auf Grundlage berechtigter Interessen widersprechen. Wo zutreffend, kannst du auch Datenübertragbarkeit verlangen oder deine Einwilligung widerrufen. Sende deine Anfrage per E-Mail an <a href="mailto:earthyglowcandles@gmail.com">earthyglowcandles@gmail.com</a>. Möglicherweise müssen wir deine Identität prüfen, und manche Unterlagen müssen wir aufbewahren, um gesetzliche Pflichten zu erfüllen.</p>

          <h2>Übermittlung in Drittländer</h2>
          <p>Einige Anbieter verarbeiten Daten möglicherweise außerhalb des Europäischen Wirtschaftsraums. Wir nutzen die Garantien, die das Datenschutzrecht vorschreibt, etwa einen Angemessenheitsbeschluss oder Standardvertragsklauseln, wo nötig. Die aktuellen Standorte und Garantien findest du in den Datenschutzinformationen des jeweiligen Anbieters.</p>

          <h2>Sicherheit und Kinder</h2>
          <p>Wir treffen angemessene technische und organisatorische Maßnahmen zum Schutz deiner Daten, doch keine Übertragung oder Speicherung im Internet kann vollständig sicher garantiert werden. Der Shop richtet sich nicht an Kinder, und wir erheben nicht wissentlich personenbezogene Daten von Kindern.</p>

          <h2>Fragen und Beschwerden</h2>
          <p>Bei Fragen oder Anliegen zum Datenschutz schreib an <a href="mailto:earthyglowcandles@gmail.com">earthyglowcandles@gmail.com</a>. Du kannst dich auch bei der niederländischen Datenschutzbehörde (Autoriteit Persoonsgegevens) oder bei der Aufsichtsbehörde an deinem Wohn- oder Arbeitsort beschweren.</p>

          <h2>Änderungen dieser Erklärung</h2>
          <p>Wir können diese Erklärung aktualisieren, wenn sich die Website, unsere Dienstleister oder die Rechtslage ändern. Das Datum oben zeigt, wann sie zuletzt aktualisiert wurde.</p>
        </>
      ) : (
        <>
          <p>
            This policy explains how EarthyGlow handles personal data when you use
            this website, contact us, or place an order. EarthyGlow is operated by
            Naomi. Our Chamber of Commerce number is 42049155 and our VAT number is
            NL005456394B38.
          </p>

          <h2>What we collect</h2>
          <p>Depending on how you use the site, we may receive:</p>
          <ul>
            <li>your name, email address, phone number and delivery address when you check out;</li>
            <li>your order, payment method, delivery and return details;</li>
            <li>your name, email address and message when you contact us;</li>
            <li>technical information needed to keep the site secure and working; and</li>
            <li>the items in your cart, stored locally in your browser so the cart works between pages.</li>
          </ul>
          <p>We do not ask you to create an account and do not collect card details ourselves. Payments are handled by our payment provider.</p>

          <h2>Why we use your data</h2>
          <ul>
            <li>To take and fulfil your order, arrange delivery, process refunds and send order updates (contract).</li>
            <li>To keep accounting and tax records and meet other legal duties (legal obligation).</li>
            <li>To answer messages, prevent misuse and secure the website (legitimate interests).</li>
          </ul>
          <p>If you accept analytics cookies, we use Google Analytics to see how the site is used, such as which pages are visited and where people leave the checkout, so we can improve the shop (consent). We do not currently send newsletters or run behavioural advertising. We will ask for consent before introducing optional marketing that needs it.</p>

          <h2>Who receives your data</h2>
          <p>We share only what is needed with service providers that help us run the shop: Mollie for payments, Resend for transactional and contact emails, Google for website analytics if you accept analytics cookies, our hosting and database providers (including Netlify and Railway), and delivery partners when needed to deliver an order. We may disclose data to authorities where the law requires it. These providers process data under their own terms and, where relevant, data-processing agreements.</p>

          <h2>Emails and contact forms</h2>
          <p>We use your email address to send receipts, fulfilment updates and other messages directly related to your order. A message sent through the contact form is forwarded to us so we can reply; it is not added to a marketing list.</p>

          <h2>Cookies and local storage</h2>
          <p>The shop uses necessary browser storage for your cart and a functional cookie that remembers your language choice, and to remember your cookie choice. Analytics cookies from Google Analytics (named <code>_ga</code> and <code>_ga_…</code>, kept for up to 2 years) are only set after you accept them in the cookie banner. They give your browser a random ID so visits can be counted; we do not send your name, email address or order details to Google, Google signals and ad personalisation are switched off, and Google Analytics does not store IP addresses. You can change your choice at any time through &ldquo;Cookie settings&rdquo; in the footer; declining removes the analytics cookies. We do not set advertising cookies. Links to social media open the third-party site rather than embedding a social widget here. Hosting or payment providers may use their own technical cookies when you visit their services; their privacy policies apply there.</p>

          <h2>How long we keep data</h2>
          <p>We keep order and payment records for as long as needed to fulfil the order, handle returns or disputes, and meet accounting and tax duties. Contact messages are kept for as long as needed to respond and manage the relationship. We then delete or anonymise data when there is no longer a lawful reason to keep it. We do not promise a fixed period where legal obligations require a different one.</p>

          <h2>Your rights</h2>
          <p>Under the GDPR, you can ask for access to, correction or deletion of your personal data, restriction of processing, or object to processing based on legitimate interests. Where applicable, you can also request data portability or withdraw consent. Email your request to <a href="mailto:earthyglowcandles@gmail.com">earthyglowcandles@gmail.com</a>. We may need to verify your identity, and some records must be retained to meet legal obligations.</p>

          <h2>International transfers</h2>
          <p>Some providers may process data outside the European Economic Area. We use the safeguards required by applicable data-protection law, such as an adequacy decision or standard contractual clauses where needed. See the relevant provider&apos;s privacy information for its current locations and safeguards.</p>

          <h2>Security and children</h2>
          <p>We use reasonable technical and organisational measures to protect your data, but no online transmission or storage can be guaranteed to be completely secure. The shop is not directed at children and we do not knowingly collect children&apos;s personal data.</p>

          <h2>Questions and complaints</h2>
          <p>For privacy questions or requests, contact <a href="mailto:earthyglowcandles@gmail.com">earthyglowcandles@gmail.com</a>. You can also complain to the Dutch Data Protection Authority (Autoriteit Persoonsgegevens) or the supervisory authority where you live or work.</p>

          <h2>Changes to this policy</h2>
          <p>We may update this policy when the website, our providers or the law changes. The date at the top shows when it was last updated.</p>
        </>
      )}
    </PolicyLayout>
  )
}

export default PrivacyPolicy
