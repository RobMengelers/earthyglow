import { PolicyLayout } from '../../components/layout/PolicyLayout'

export function RefundPolicy() {
  return (
    <PolicyLayout title="Refund Policy">
      <h2>1. Handmade &amp; Personalized Items</h2>
      <p>
        Because our candles are handmade and made to order, returns are not
        automatically accepted. However, we will always do our best to help if
        something went wrong.
      </p>

      <h2>2. Not satisfied?</h2>
      <p>
        Please contact us within 7 days via email at{' '}
        <a href="mailto:earthyglowcandles@gmail.com">earthyglowcandles@gmail.com</a>
        . We will look for a suitable solution together, such as a replacement or
        partial refund.
      </p>

      <h2>3. Return Costs</h2>
      <p>
        If a return is agreed upon, return shipping costs are the responsibility
        of the customer unless otherwise agreed.
      </p>
    </PolicyLayout>
  )
}