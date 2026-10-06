import { PolicyLayout } from '../../components/layout/PolicyLayout'
import { siteMeta } from '../../lib/seo'

export function meta() {
  return siteMeta({
    title: 'Contact Information · EarthyGlow',
    description:
      'Contact EarthyGlow: e-mail, Chamber of Commerce number 42049155, VAT number NL005456394B38, made in the Netherlands.',
    path: '/policies/contact-information',
  })
}

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

export default ContactInformation