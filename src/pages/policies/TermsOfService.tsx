import { PolicyLayout } from '../../components/layout/PolicyLayout'

export function TermsOfService() {
  return (
    <PolicyLayout title="Terms of Service">
      <h2>1. Company Information</h2>
      <p>
        I’m Naomi, the maker behind EarthyGlow. I make candles by hand in
        the Netherlands using 100% soy wax.
      </p>
      <p>
        Contact:{' '}
        <a href="mailto:earthyglowcandles@gmail.com">earthyglowcandles@gmail.com</a>
      </p>

      <h2>2. Products</h2>
      <p>
        I make each candle by hand, so colours, shapes and small details
        may vary a little. That’s part of what makes each one personal.
      </p>

      <h2>3. Prices &amp; Payment</h2>
      <ul>
        <li>All prices include VAT</li>
        <li>Orders are shipped after payment has been received in full.</li>
      </ul>

      <h2>4. Shipping Costs</h2>
      <ul>
        <li>
          Shipping costs (NL) are €6.99, free for orders of €25 or more
        </li>
        <li>
          International shipping is €12.95, free for orders of €50 or more
        </li>
        <li>
          Estimated delivery: 3 to 7 business days after payment. Delivery times can vary.
        </li>
        <li>EarthyGlow is not responsible for delays caused by the carrier.</li>
      </ul>

      <h2>5. Warranty</h2>
      <p>Did your candle arrive damaged?</p>
      <p>
        Please contact us within 48 hours, preferably with a photo of the damage.
        I’ll look into it with you and help find a solution.
      </p>
    </PolicyLayout>
  )
}