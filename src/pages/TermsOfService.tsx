import { PolicyLayout } from '../components/PolicyLayout'

export function TermsOfService() {
  return (
    <PolicyLayout title="Terms of Service">
      <h2>1. Company Information</h2>
      <p>
        EarthyGlow is a small business specializing in handmade candles crafted
        with natural ingredients.
      </p>
      <p>
        Contact:{' '}
        <a href="mailto:earthyglowcandles@gmail.com">earthyglowcandles@gmail.com</a>
      </p>

      <h2>2. Products</h2>
      <p>
        All candles are carefully handmade. Due to the artisanal nature of the
        products, colors, shapes, or small details may vary slightly from item to
        item.
      </p>

      <h2>3. Prices &amp; Payment</h2>
      <ul>
        <li>All prices include VAT</li>
        <li>Orders are shipped after payment has been received in full.</li>
      </ul>

      <h2>4. Shipping Costs</h2>
      <ul>
        <li>
          Shipping costs (NL) are €4.95 if you spend less than €25,-
        </li>
        <li>
          Estimated delivery time: 3-7 business days after payment but can vary
        </li>
        <li>EarthyGlow is not responsible for delays caused by the carrier.</li>
      </ul>

      <h2>5. Warranty</h2>
      <p>Did your candle arrive damaged?</p>
      <p>
        Please contact us within 48 hours, preferably with a photo of the damage.
        We will work with you to find a suitable solution.
      </p>
    </PolicyLayout>
  )
}