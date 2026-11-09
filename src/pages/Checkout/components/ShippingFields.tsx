import { countryOptions } from '../countries'
import { defineCopy, useCopy, useLocale } from '../../../i18n'

const shippingCopy = defineCopy({
  en: { legend: 'Shipping address', street: 'Street and number', postalCode: 'Postal code', city: 'City', country: 'Country', pick: 'Pick your country' },
  nl: { legend: 'Verzendadres', street: 'Straat en huisnummer', postalCode: 'Postcode', city: 'Plaats', country: 'Land', pick: 'Kies je land' },
  de: { legend: 'Lieferadresse', street: 'Straße und Hausnummer', postalCode: 'Postleitzahl', city: 'Ort', country: 'Land', pick: 'Wähle dein Land' },
})

type ShippingFieldsProps = {
  country: string
  onCountryChange: (country: string) => void
}

export function ShippingFields({ country, onCountryChange }: ShippingFieldsProps) {
  const copy = useCopy(shippingCopy)
  const locale = useLocale()
  return (
    <fieldset className="checkout-fieldset">
      <legend>{copy.legend}</legend>
      <label className="field">
        <span>{copy.street}</span>
        <input
          type="text"
          name="address"
          autoComplete="street-address"
          required
        />
      </label>
      <div className="field-row">
        <label className="field">
          <span>{copy.postalCode}</span>
          <input
            type="text"
            name="postalCode"
            autoComplete="postal-code"
            required
          />
        </label>
        <label className="field">
          <span>{copy.city}</span>
          <input type="text" name="city" autoComplete="address-level2" required />
        </label>
      </div>
      <label className="field">
        <span>{copy.country}</span>
        <select
          name="country"
          autoComplete="country-name"
          value={country}
          onChange={(event) => onCountryChange(event.target.value)}
          required
        >
          <option value="" disabled>
            {copy.pick}
          </option>
          {countryOptions(locale).map((option) => (
            <option key={option.code} value={option.code}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </fieldset>
  )
}
