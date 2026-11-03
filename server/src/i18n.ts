// Customer-facing text of the API in every storefront language: checkout and
// coupon errors, the payment page language, the emails and the invoice PDF.
// Internal mails to the shop (new order, contact form) stay in English.

export const LOCALES = ['nl', 'en', 'de'] as const
export type Locale = (typeof LOCALES)[number]

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}

/** A stored or requested language, falling back to English for anything unknown. */
export function toLocale(value: unknown): Locale {
  return isLocale(value) ? value : 'en'
}

export const LANGUAGE_NAMES: Record<Locale, string> = {
  nl: 'Dutch',
  en: 'English',
  de: 'German',
}

/** Mollie hosted-checkout and method-name language. */
export const MOLLIE_LOCALE: Record<Locale, 'nl_NL' | 'en_GB' | 'de_DE'> = {
  nl: 'nl_NL',
  en: 'en_GB',
  de: 'de_DE',
}

const INTL: Record<Locale, string> = { nl: 'nl-NL', en: 'en-GB', de: 'de-DE' }

// Prices read the same in every language: €14.95.
export function formatEuroFor(_locale: Locale, cents: number): string {
  const sign = cents < 0 ? '-' : ''
  return `${sign}€${(Math.abs(cents) / 100).toFixed(2)}`
}

export function formatDateFor(locale: Locale, date: Date): string {
  return date.toLocaleDateString(INTL[locale], { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Amsterdam' })
}

// Option labels are stored in English; this mirrors src/i18n/options.ts in the
// storefront so emails and invoices name them the way the shop page did.
const OPTION_LABELS: Record<string, { nl: string; de: string }> = {
  Small: { nl: 'Klein', de: 'Klein' },
  Medium: { nl: 'Middel', de: 'Mittel' },
  Large: { nl: 'Groot', de: 'Groß' },
  Single: { nl: 'Los', de: 'Einzeln' },
  Bundle: { nl: 'Bundel', de: 'Set' },
  'Bundle (3 colours)': { nl: 'Bundel (3 kleuren)', de: 'Set (3 Farben)' },
  White: { nl: 'Wit', de: 'Weiß' },
  Pink: { nl: 'Roze', de: 'Rosa' },
  Red: { nl: 'Rood', de: 'Rot' },
  Purple: { nl: 'Paars', de: 'Lila' },
  Brown: { nl: 'Bruin', de: 'Braun' },
  Green: { nl: 'Groen', de: 'Grün' },
  'Baby blue': { nl: 'Babyblauw', de: 'Babyblau' },
  Oyster: { nl: 'Oester', de: 'Auster' },
  Coconut: { nl: 'Kokosnoot', de: 'Kokosnuss' },
  Shell: { nl: 'Schelp', de: 'Muschel' },
  'Sea star': { nl: 'Zeester', de: 'Seestern' },
}

export const OPTION_LABEL_KEYS = Object.keys(OPTION_LABELS)

export function optionLabel(label: string, locale: Locale): string {
  if (locale === 'en') return label
  return OPTION_LABELS[label]?.[locale] ?? label
}

type Messages = {
  invalidRequest: string
  productUnavailable: (id: string) => string
  chooseOption: (name: string) => string
  variantUnavailable: (name: string) => string
  invalidVariant: string
  chooseColour: (name: string) => string
  colourUnavailable: (name: string) => string
  invalidColour: string
  couponInvalid: string
  couponEnter: string
  couponInactive: string
  couponNotYet: string
  couponExpired: string
  couponUsed: string
  klarnaCountry: string
  paymentFailed: string
  contactFailed: string
  shipping: string
  coupon: (code: string) => string
  orderDescription: (orderNumber: string) => string
}

export const MESSAGES: Record<Locale, Messages> = {
  en: {
    invalidRequest: 'Please check the form and try again.',
    productUnavailable: (id) => `Product "${id}" is not available`,
    chooseOption: (name) => `Please choose an option for "${name}" on its product page and add it to your cart again.`,
    variantUnavailable: (name) => `Variant for "${name}" is not available`,
    invalidVariant: 'Invalid product variant',
    chooseColour: (name) => `Please choose a colour for "${name}" on its product page and add it to your cart again.`,
    colourUnavailable: (name) => `Colour for "${name}" is not available`,
    invalidColour: 'Invalid product colour',
    couponInvalid: 'That coupon code is not valid.',
    couponEnter: 'Enter a coupon code.',
    couponInactive: 'This coupon code is not active.',
    couponNotYet: 'This coupon code is not active yet.',
    couponExpired: 'This coupon code has expired.',
    couponUsed: 'This coupon code has already been used.',
    klarnaCountry: 'Klarna is not available for the selected shipping country. Please choose another payment method.',
    paymentFailed: 'Could not start the payment',
    contactFailed: 'Message could not be sent right now, please try again later',
    shipping: 'Shipping',
    coupon: (code) => `Coupon ${code}`.trim(),
    orderDescription: (orderNumber) => `EarthyGlow order ${orderNumber}`,
  },
  nl: {
    invalidRequest: 'Controleer het formulier en probeer het opnieuw.',
    productUnavailable: (id) => `Product "${id}" is niet beschikbaar`,
    chooseOption: (name) => `Kies een optie voor "${name}" op de productpagina en voeg het opnieuw toe aan je winkelmand.`,
    variantUnavailable: (name) => `Deze optie van "${name}" is niet beschikbaar`,
    invalidVariant: 'Ongeldige productoptie',
    chooseColour: (name) => `Kies een kleur voor "${name}" op de productpagina en voeg het opnieuw toe aan je winkelmand.`,
    colourUnavailable: (name) => `Deze kleur van "${name}" is niet beschikbaar`,
    invalidColour: 'Ongeldige productkleur',
    couponInvalid: 'Die kortingscode is niet geldig.',
    couponEnter: 'Vul een kortingscode in.',
    couponInactive: 'Deze kortingscode is niet actief.',
    couponNotYet: 'Deze kortingscode is nog niet actief.',
    couponExpired: 'Deze kortingscode is verlopen.',
    couponUsed: 'Deze kortingscode is al gebruikt.',
    klarnaCountry: 'Klarna is niet beschikbaar voor het gekozen verzendland. Kies een andere betaalmethode.',
    paymentFailed: 'De betaling kon niet worden gestart',
    contactFailed: 'Je bericht kon nu niet worden verstuurd. Probeer het later nog eens.',
    shipping: 'Verzending',
    coupon: (code) => `Kortingscode ${code}`.trim(),
    orderDescription: (orderNumber) => `EarthyGlow-bestelling ${orderNumber}`,
  },
  de: {
    invalidRequest: 'Bitte prüfe das Formular und versuche es noch einmal.',
    productUnavailable: (id) => `Produkt "${id}" ist nicht verfügbar`,
    chooseOption: (name) => `Bitte wähle auf der Produktseite eine Option für "${name}" und lege es erneut in den Warenkorb.`,
    variantUnavailable: (name) => `Diese Option von "${name}" ist nicht verfügbar`,
    invalidVariant: 'Ungültige Produktoption',
    chooseColour: (name) => `Bitte wähle auf der Produktseite eine Farbe für "${name}" und lege es erneut in den Warenkorb.`,
    colourUnavailable: (name) => `Diese Farbe von "${name}" ist nicht verfügbar`,
    invalidColour: 'Ungültige Produktfarbe',
    couponInvalid: 'Dieser Gutscheincode ist nicht gültig.',
    couponEnter: 'Gib einen Gutscheincode ein.',
    couponInactive: 'Dieser Gutscheincode ist nicht aktiv.',
    couponNotYet: 'Dieser Gutscheincode ist noch nicht aktiv.',
    couponExpired: 'Dieser Gutscheincode ist abgelaufen.',
    couponUsed: 'Dieser Gutscheincode wurde bereits verwendet.',
    klarnaCountry: 'Klarna ist für das gewählte Lieferland nicht verfügbar. Bitte wähle eine andere Zahlungsart.',
    paymentFailed: 'Die Zahlung konnte nicht gestartet werden',
    contactFailed: 'Deine Nachricht konnte gerade nicht gesendet werden. Bitte versuche es später noch einmal.',
    shipping: 'Versand',
    coupon: (code) => `Gutschein ${code}`.trim(),
    orderDescription: (orderNumber) => `EarthyGlow Bestellung ${orderNumber}`,
  },
}

type EmailCopy = {
  eyebrow: string
  signoff: string
  role: string
  invoice: {
    subject: string
    title: (firstName: string) => string
    paid: (orderNumber: string) => string
    ordered: string
    description: string
    qty: string
    unitPrice: string
    amount: string
    attached: string
  }
  fulfillment: {
    subject: string
    title: string
    hi: (firstName: string) => string
    body: (orderNumber: string) => string
    order: string
    carrier: string
    tracking: string
    notProvided: string
    trackingNote: string
    thanks: string
  }
  refund: {
    subject: string
    title: string
    hi: (firstName: string) => string
    body: (amount: string, orderNumber: string) => string
  }
}

// Values that go into HTML are escaped by the caller before they reach these.
export const EMAIL: Record<Locale, EmailCopy> = {
  en: {
    eyebrow: 'A little note from EarthyGlow',
    signoff: 'With love,',
    role: 'Founder of EarthyGlow',
    invoice: {
      subject: 'Your EarthyGlow invoice',
      title: (firstName) => `Thank you, ${firstName}.`,
      paid: (orderNumber) => `Your order <strong>${orderNumber}</strong> is safely paid and your invoice is attached. I’ll get your candles ready and pack them with care.`,
      ordered: 'Here’s what you ordered:',
      description: 'Description',
      qty: 'Qty',
      unitPrice: 'Unit price',
      amount: 'Amount',
      attached: 'Your invoice PDF is attached.',
    },
    fulfillment: {
      subject: 'Your EarthyGlow order is on its way',
      title: 'Your glow is on its way.',
      hi: (firstName) => `Hi ${firstName},`,
      body: (orderNumber) => `Your order <strong>${orderNumber}</strong> has been packed with care and handed to the carrier. I hope you enjoy your candles.`,
      order: 'Order',
      carrier: 'Carrier',
      tracking: 'Track &amp; trace',
      notProvided: 'Not provided',
      trackingNote: 'Use your tracking code on the carrier’s website to follow your parcel. Tracking updates may take a little time to appear.',
      thanks: 'Thank you for supporting my small business.',
    },
    refund: {
      subject: 'Your EarthyGlow refund',
      title: 'Your refund has been arranged.',
      hi: (firstName) => `Hi ${firstName},`,
      body: (amount, orderNumber) => `We’ve sent a full refund of <strong>${amount}</strong> for order <strong>${orderNumber}</strong> to Mollie. The time it takes to appear depends on your bank or payment provider.`,
    },
  },
  nl: {
    eyebrow: 'Een berichtje van EarthyGlow',
    signoff: 'Liefs,',
    role: 'Oprichter van EarthyGlow',
    invoice: {
      subject: 'Je factuur van EarthyGlow',
      title: (firstName) => `Dankjewel, ${firstName}.`,
      paid: (orderNumber) => `Je bestelling <strong>${orderNumber}</strong> is betaald en je factuur zit in de bijlage. Ik maak je kaarsen klaar en pak ze met zorg in.`,
      ordered: 'Dit heb je besteld:',
      description: 'Omschrijving',
      qty: 'Aantal',
      unitPrice: 'Prijs per stuk',
      amount: 'Bedrag',
      attached: 'Je factuur zit als pdf in de bijlage.',
    },
    fulfillment: {
      subject: 'Je EarthyGlow-bestelling is onderweg',
      title: 'Je gloed is onderweg.',
      hi: (firstName) => `Hoi ${firstName},`,
      body: (orderNumber) => `Je bestelling <strong>${orderNumber}</strong> is met zorg ingepakt en meegegeven aan de vervoerder. Ik hoop dat je gaat genieten van je kaarsen.`,
      order: 'Bestelling',
      carrier: 'Vervoerder',
      tracking: 'Track &amp; trace',
      notProvided: 'Niet opgegeven',
      trackingNote: 'Volg je pakket met je trackingcode op de website van de vervoerder. Het kan even duren voordat de eerste updates zichtbaar zijn.',
      thanks: 'Dankjewel dat je mijn kleine bedrijf steunt.',
    },
    refund: {
      subject: 'Je terugbetaling van EarthyGlow',
      title: 'Je terugbetaling is geregeld.',
      hi: (firstName) => `Hoi ${firstName},`,
      body: (amount, orderNumber) => `We hebben via Mollie het volledige bedrag van <strong>${amount}</strong> voor bestelling <strong>${orderNumber}</strong> teruggestort. Hoe snel het zichtbaar is, hangt af van je bank of betaalprovider.`,
    },
  },
  de: {
    eyebrow: 'Ein paar Zeilen von EarthyGlow',
    signoff: 'Alles Liebe,',
    role: 'Gründerin von EarthyGlow',
    invoice: {
      subject: 'Deine Rechnung von EarthyGlow',
      title: (firstName) => `Danke, ${firstName}.`,
      paid: (orderNumber) => `Deine Bestellung <strong>${orderNumber}</strong> ist bezahlt und deine Rechnung hängt an. Ich mache deine Kerzen fertig und verpacke sie mit Sorgfalt.`,
      ordered: 'Das hast du bestellt:',
      description: 'Beschreibung',
      qty: 'Menge',
      unitPrice: 'Einzelpreis',
      amount: 'Betrag',
      attached: 'Deine Rechnung hängt als PDF an.',
    },
    fulfillment: {
      subject: 'Deine EarthyGlow Bestellung ist unterwegs',
      title: 'Dein Glanz ist unterwegs.',
      hi: (firstName) => `Hallo ${firstName},`,
      body: (orderNumber) => `Deine Bestellung <strong>${orderNumber}</strong> wurde mit Sorgfalt verpackt und an den Versanddienstleister übergeben. Ich hoffe, du hast viel Freude an deinen Kerzen.`,
      order: 'Bestellung',
      carrier: 'Versanddienstleister',
      tracking: 'Sendungsverfolgung',
      notProvided: 'Nicht angegeben',
      trackingNote: 'Mit deiner Sendungsnummer kannst du dein Paket auf der Website des Versanddienstleisters verfolgen. Es kann etwas dauern, bis die ersten Updates erscheinen.',
      thanks: 'Danke, dass du mein kleines Unternehmen unterstützt.',
    },
    refund: {
      subject: 'Deine Erstattung von EarthyGlow',
      title: 'Deine Erstattung ist veranlasst.',
      hi: (firstName) => `Hallo ${firstName},`,
      body: (amount, orderNumber) => `Wir haben über Mollie den vollen Betrag von <strong>${amount}</strong> für Bestellung <strong>${orderNumber}</strong> erstattet. Wie lange es dauert, bis er erscheint, hängt von deiner Bank oder deinem Zahlungsanbieter ab.`,
    },
  },
}

type InvoiceCopy = {
  tagline: string
  billedTo: string
  invoice: string
  paidOn: (date: string) => string
  order: (orderNumber: string) => string
  description: string
  qty: string
  unitPrice: string
  amount: string
  subtotal: string
  subtotalExVat: string
  shipping: string
  discount: (code: string) => string
  total: string
  withoutVat: string
  inclVat: (amount: string) => string
  freeShippingCoupon: (code: string) => string
  thanks: string
  questions: string
}

export const INVOICE: Record<Locale, InvoiceCopy> = {
  en: {
    tagline: 'HAND-POURED CANDLES · INVOICE',
    billedTo: 'BILLED TO',
    invoice: 'INVOICE',
    paidOn: (date) => `Paid on ${date}`,
    order: (orderNumber) => `Order ${orderNumber}`,
    description: 'DESCRIPTION',
    qty: 'QTY',
    unitPrice: 'UNIT PRICE',
    amount: 'AMOUNT',
    subtotal: 'Subtotal',
    subtotalExVat: 'Subtotal excl. VAT',
    shipping: 'Shipping',
    discount: (code) => `Discount (${code})`,
    total: 'Total',
    withoutVat: 'Without VAT',
    inclVat: (amount) => `(incl. 21% VAT: ${amount})`,
    freeShippingCoupon: (code) => `Coupon ${code} applied — free shipping`,
    thanks: 'Thank you for your order.',
    questions: 'Questions about this invoice?',
  },
  nl: {
    tagline: 'HANDGEGOTEN KAARSEN · FACTUUR',
    billedTo: 'FACTUUR AAN',
    invoice: 'FACTUUR',
    paidOn: (date) => `Betaald op ${date}`,
    order: (orderNumber) => `Bestelling ${orderNumber}`,
    description: 'OMSCHRIJVING',
    qty: 'AANTAL',
    unitPrice: 'PRIJS P/ST',
    amount: 'BEDRAG',
    subtotal: 'Subtotaal',
    subtotalExVat: 'Subtotaal excl. btw',
    shipping: 'Verzending',
    discount: (code) => `Korting (${code})`,
    total: 'Totaal',
    withoutVat: 'Zonder btw',
    inclVat: (amount) => `(incl. 21% btw: ${amount})`,
    freeShippingCoupon: (code) => `Kortingscode ${code} toegepast — gratis verzending`,
    thanks: 'Dankjewel voor je bestelling.',
    questions: 'Vragen over deze factuur?',
  },
  de: {
    tagline: 'HANDGEGOSSENE KERZEN · RECHNUNG',
    billedTo: 'RECHNUNG AN',
    invoice: 'RECHNUNG',
    paidOn: (date) => `Bezahlt am ${date}`,
    order: (orderNumber) => `Bestellung ${orderNumber}`,
    description: 'BESCHREIBUNG',
    qty: 'MENGE',
    unitPrice: 'EINZELPREIS',
    amount: 'BETRAG',
    subtotal: 'Zwischensumme',
    subtotalExVat: 'Zwischensumme exkl. MwSt.',
    shipping: 'Versand',
    discount: (code) => `Rabatt (${code})`,
    total: 'Gesamt',
    withoutVat: 'Ohne MwSt.',
    inclVat: (amount) => `(inkl. 21 % MwSt.: ${amount})`,
    freeShippingCoupon: (code) => `Gutschein ${code} eingelöst — kostenloser Versand`,
    thanks: 'Danke für deine Bestellung.',
    questions: 'Fragen zu dieser Rechnung?',
  },
}
