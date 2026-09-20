import { countries } from '../countries'

type ShippingFieldsProps = {
  country: string
  onCountryChange: (country: string) => void
}

export function ShippingFields({ country, onCountryChange }: ShippingFieldsProps) {
  return (
    <fieldset className="checkout-fieldset">
      <legend>Shipping address</legend>
      <label className="field">
        <span>Street and number</span>
        <input
          type="text"
          name="address"
          autoComplete="street-address"
          required
        />
      </label>
      <div className="field-row">
        <label className="field">
          <span>Postal code</span>
          <input
            type="text"
            name="postalCode"
            autoComplete="postal-code"
            required
          />
        </label>
        <label className="field">
          <span>City</span>
          <input type="text" name="city" autoComplete="address-level2" required />
        </label>
      </div>
      <label className="field">
        <span>Country</span>
        <select
          name="country"
          autoComplete="country-name"
          value={country}
          onChange={(event) => onCountryChange(event.target.value)}
          required
        >
          <option value="" disabled>
            Pick your country
          </option>
          {countries.map((option) => (
            <option key={option.code} value={option.code}>
              {option.name}
            </option>
          ))}
        </select>
      </label>
    </fieldset>
  )
}
