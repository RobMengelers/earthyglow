import type { Locale } from '../../i18n/locales'

export type PolicyLink = { label: string; to: string; summary: string; description: string }

// The four policy pages: their names, one-line summaries for the overview, and
// the search-result descriptions.
export const policyLinks: Record<Locale, PolicyLink[]> = {
  en: [
    {
      label: 'Privacy Policy',
      to: '/policies/privacy-policy',
      summary: 'what I collect, why, and how your data is handled.',
      description: 'How EarthyGlow handles personal data: what we collect when you order or contact us, why we use it, who receives it, and your GDPR rights.',
    },
    {
      label: 'Refund Policy',
      to: '/policies/refund-policy',
      summary: 'how problems with handmade, made-to-order candles are resolved.',
      description: 'Refunds and returns for EarthyGlow candles: why handmade items are not automatically accepted, how to report a problem, and return costs.',
    },
    {
      label: 'Terms of Service',
      to: '/policies/terms-of-service',
      summary: 'the terms that apply when you order from EarthyGlow.',
      description: 'Terms of service for EarthyGlow: company information, handmade products, prices and payment, shipping costs and warranty on candles.',
    },
    {
      label: 'Contact Information',
      to: '/policies/contact-information',
      summary: 'business details and how to reach me.',
      description: 'Contact EarthyGlow: e-mail, Chamber of Commerce number 42049155, VAT number NL005456394B38, made in the Netherlands.',
    },
  ],
  nl: [
    {
      label: 'Privacybeleid',
      to: '/policies/privacy-policy',
      summary: 'wat ik verzamel, waarom, en hoe er met je gegevens wordt omgegaan.',
      description: 'Hoe EarthyGlow omgaat met persoonsgegevens: wat we verzamelen als je bestelt of contact opneemt, waarom, wie ze ontvangt en je rechten onder de AVG.',
    },
    {
      label: 'Retourbeleid',
      to: '/policies/refund-policy',
      summary: 'hoe problemen met handgemaakte, op bestelling gemaakte kaarsen worden opgelost.',
      description: 'Terugbetalingen en retouren van EarthyGlow-kaarsen: waarom handgemaakte artikelen niet automatisch retour kunnen, hoe je een probleem meldt en de retourkosten.',
    },
    {
      label: 'Algemene voorwaarden',
      to: '/policies/terms-of-service',
      summary: 'de voorwaarden die gelden als je bij EarthyGlow bestelt.',
      description: 'Algemene voorwaarden van EarthyGlow: bedrijfsgegevens, handgemaakte producten, prijzen en betaling, verzendkosten en garantie op kaarsen.',
    },
    {
      label: 'Contactgegevens',
      to: '/policies/contact-information',
      summary: 'bedrijfsgegevens en hoe je mij bereikt.',
      description: 'Contact met EarthyGlow: e-mail, KVK-nummer 42049155, btw-nummer NL005456394B38, gemaakt in Nederland.',
    },
  ],
  de: [
    {
      label: 'Datenschutzerklärung',
      to: '/policies/privacy-policy',
      summary: 'was ich erhebe, warum, und wie mit deinen Daten umgegangen wird.',
      description: 'Wie EarthyGlow mit personenbezogenen Daten umgeht: was wir bei Bestellung oder Kontakt erheben, wozu, wer sie erhält und deine Rechte nach der DSGVO.',
    },
    {
      label: 'Rückgaberichtlinie',
      to: '/policies/refund-policy',
      summary: 'wie Probleme mit handgemachten, auf Bestellung gefertigten Kerzen gelöst werden.',
      description: 'Erstattungen und Rücksendungen bei EarthyGlow: warum Handgemachtes nicht automatisch zurückgenommen wird, wie du ein Problem meldest und die Rücksendekosten.',
    },
    {
      label: 'AGB',
      to: '/policies/terms-of-service',
      summary: 'die Bedingungen, die gelten, wenn du bei EarthyGlow bestellst.',
      description: 'Allgemeine Geschäftsbedingungen von EarthyGlow: Unternehmensangaben, handgemachte Produkte, Preise und Zahlung, Versandkosten und Gewährleistung.',
    },
    {
      label: 'Kontaktinformationen',
      to: '/policies/contact-information',
      summary: 'Unternehmensangaben und wie du mich erreichst.',
      description: 'Kontakt zu EarthyGlow: E-Mail, Handelsregisternummer (KVK) 42049155, USt-IdNr. NL005456394B38, hergestellt in den Niederlanden.',
    },
  ],
}

export function policyLink(locale: Locale, to: string): PolicyLink {
  return policyLinks[locale].find((policy) => policy.to === to)!
}

/** Title, description and canonical path of a policy page, for its meta function. */
export function policyMetaOptions(locale: Locale, to: string) {
  const policy = policyLink(locale, to)
  return { locale, title: `${policy.label} · EarthyGlow`, description: policy.description, path: to }
}
