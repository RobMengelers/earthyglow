import { defineCopy, useCopy } from '../../../i18n'

const contactCopy = defineCopy({
  en: { legend: 'Contact', firstName: 'First name', lastName: 'Last name', email: 'Email', phone: 'Phone (optional)' },
  nl: { legend: 'Contactgegevens', firstName: 'Voornaam', lastName: 'Achternaam', email: 'E-mail', phone: 'Telefoon (optioneel)' },
  de: { legend: 'Kontakt', firstName: 'Vorname', lastName: 'Nachname', email: 'E-Mail', phone: 'Telefon (optional)' },
})

export function ContactFields() {
  const copy = useCopy(contactCopy)
  return (
    <fieldset className="checkout-fieldset">
      <legend>{copy.legend}</legend>
      <div className="field-row">
        <label className="field">
          <span>{copy.firstName}</span>
          <input type="text" name="firstName" autoComplete="given-name" required />
        </label>
        <label className="field">
          <span>{copy.lastName}</span>
          <input type="text" name="lastName" autoComplete="family-name" required />
        </label>
      </div>
      <div className="field-row">
        <label className="field">
          <span>{copy.email}</span>
          <input type="email" name="email" autoComplete="email" required />
        </label>
        <label className="field">
          <span>{copy.phone}</span>
          <input type="tel" name="phone" autoComplete="tel" />
        </label>
      </div>
    </fieldset>
  )
}
