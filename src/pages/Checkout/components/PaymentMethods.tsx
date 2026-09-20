import type { PaymentMethodOption } from '../../../cart/checkout'

type PaymentMethodsProps = {
  methods: PaymentMethodOption[]
  paymentMethod: string
  onChange: (method: string) => void
}

export function PaymentMethods({ methods, paymentMethod, onChange }: PaymentMethodsProps) {
  return (
    <fieldset className="checkout-fieldset">
      <legend>Payment method</legend>
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
      <p className="payment-note">
        You&rsquo;ll be redirected to a secure page to complete
        your order — it is only confirmed once it succeeds.
      </p>
    </fieldset>
  )
}
