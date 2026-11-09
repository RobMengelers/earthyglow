import type { PaymentMethodOption } from '../../../cart/checkout'
import { defineCopy, useCopy } from '../../../i18n'

const paymentCopy = defineCopy({
  en: {
    legend: 'Payment method',
    note: 'You’ll be redirected to a secure page to complete your order. Your order is confirmed once payment succeeds.',
  },
  nl: {
    legend: 'Betaalmethode',
    note: 'Je wordt doorgestuurd naar een beveiligde pagina om je bestelling af te ronden. Je bestelling is bevestigd zodra de betaling gelukt is.',
  },
  de: {
    legend: 'Zahlungsart',
    note: 'Du wirst zu einer sicheren Seite weitergeleitet, um deine Bestellung abzuschließen. Deine Bestellung ist bestätigt, sobald die Zahlung erfolgreich war.',
  },
})

type PaymentMethodsProps = {
  methods: PaymentMethodOption[]
  paymentMethod: string
  onChange: (method: string) => void
}

export function PaymentMethods({ methods, paymentMethod, onChange }: PaymentMethodsProps) {
  const copy = useCopy(paymentCopy)
  return (
    <fieldset className="checkout-fieldset">
      <legend>{copy.legend}</legend>
      <div className="payment-methods" role="radiogroup">
        {methods.map((method) => {
          const selected = paymentMethod === method.id
          return (
            <label
              key={method.id}
              className={`payment-method${selected ? ' is-selected' : ''}`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={selected}
                onChange={() => onChange(method.id)}
                required
              />
              {method.icon && (
                <img
                  className="payment-method-icon"
                  src={method.icon}
                  alt=""
                  loading="lazy"
                />
              )}
              <span className="payment-method-name">{method.name}</span>
            </label>
          )
        })}
      </div>
      <p className="payment-note">{copy.note}</p>
    </fieldset>
  )
}
