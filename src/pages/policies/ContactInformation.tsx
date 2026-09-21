import { PolicyLayout } from '../../components/layout/PolicyLayout'

export function ContactInformation() {
  return (
    <PolicyLayout title="Contact Information">
      <p>
        E-mail:{' '}
        <a href="mailto:earthyglowcandles@gmail.com">earthyglowcandles@gmail.com</a>
      </p>
      <p>I’m Naomi, the maker behind EarthyGlow. Get in touch if you need help with a candle or an order.</p>
      <p>Made in the Netherlands</p>
      <p>Chamber of Commerce (KVK): 42049155</p>
      <p>VAT number: NL005456394B38</p>
    </PolicyLayout>
  )
}