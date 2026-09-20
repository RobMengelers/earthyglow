export function ContactFields() {
  return (
    <fieldset className="checkout-fieldset">
      <legend>Contact</legend>
      <div className="field-row">
        <label className="field">
          <span>First name</span>
          <input type="text" name="firstName" autoComplete="given-name" required />
        </label>
        <label className="field">
          <span>Last name</span>
          <input type="text" name="lastName" autoComplete="family-name" required />
        </label>
      </div>
      <div className="field-row">
        <label className="field">
          <span>Email</span>
          <input type="email" name="email" autoComplete="email" required />
        </label>
        <label className="field">
          <span>Phone (optional)</span>
          <input type="tel" name="phone" autoComplete="tel" />
        </label>
      </div>
    </fieldset>
  )
}
