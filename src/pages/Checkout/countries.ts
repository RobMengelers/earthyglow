import type { Locale } from '../../i18n/locales'

// Shipping countries. `name` is the English name the order stores (the admin
// and invoices read it); the checkout shows the name in the visitor's language.
export const countries: { name: string; code: string; nl: string; de: string }[] = [
  { name: 'Netherlands', code: 'NL', nl: 'Nederland', de: 'Niederlande' },
  { name: 'Austria', code: 'AT', nl: 'Oostenrijk', de: 'Österreich' },
  { name: 'Belgium', code: 'BE', nl: 'België', de: 'Belgien' },
  { name: 'Bulgaria', code: 'BG', nl: 'Bulgarije', de: 'Bulgarien' },
  { name: 'Croatia', code: 'HR', nl: 'Kroatië', de: 'Kroatien' },
  { name: 'Cyprus', code: 'CY', nl: 'Cyprus', de: 'Zypern' },
  { name: 'Czech Republic', code: 'CZ', nl: 'Tsjechië', de: 'Tschechien' },
  { name: 'Denmark', code: 'DK', nl: 'Denemarken', de: 'Dänemark' },
  { name: 'Estonia', code: 'EE', nl: 'Estland', de: 'Estland' },
  { name: 'Finland', code: 'FI', nl: 'Finland', de: 'Finnland' },
  { name: 'France', code: 'FR', nl: 'Frankrijk', de: 'Frankreich' },
  { name: 'Germany', code: 'DE', nl: 'Duitsland', de: 'Deutschland' },
  { name: 'Greece', code: 'GR', nl: 'Griekenland', de: 'Griechenland' },
  { name: 'Hungary', code: 'HU', nl: 'Hongarije', de: 'Ungarn' },
  { name: 'Ireland', code: 'IE', nl: 'Ierland', de: 'Irland' },
  { name: 'Italy', code: 'IT', nl: 'Italië', de: 'Italien' },
  { name: 'Latvia', code: 'LV', nl: 'Letland', de: 'Lettland' },
  { name: 'Lithuania', code: 'LT', nl: 'Litouwen', de: 'Litauen' },
  { name: 'Luxembourg', code: 'LU', nl: 'Luxemburg', de: 'Luxemburg' },
  { name: 'Malta', code: 'MT', nl: 'Malta', de: 'Malta' },
  { name: 'Poland', code: 'PL', nl: 'Polen', de: 'Polen' },
  { name: 'Portugal', code: 'PT', nl: 'Portugal', de: 'Portugal' },
  { name: 'Romania', code: 'RO', nl: 'Roemenië', de: 'Rumänien' },
  { name: 'Slovakia', code: 'SK', nl: 'Slowakije', de: 'Slowakei' },
  { name: 'Slovenia', code: 'SI', nl: 'Slovenië', de: 'Slowenien' },
  { name: 'Spain', code: 'ES', nl: 'Spanje', de: 'Spanien' },
  { name: 'Sweden', code: 'SE', nl: 'Zweden', de: 'Schweden' },
]

/** The countries with their names in one language: the visitor's own country first, the rest alphabetical. */
export function countryOptions(locale: Locale): { code: string; label: string }[] {
  const first = locale === 'de' ? 'DE' : 'NL'
  const label = (country: (typeof countries)[number]) => (locale === 'en' ? country.name : country[locale])
  return countries
    .map((country) => ({ code: country.code, label: label(country) }))
    .sort((a, b) =>
      a.code === first ? -1 : b.code === first ? 1 : a.label.localeCompare(b.label, locale),
    )
}
