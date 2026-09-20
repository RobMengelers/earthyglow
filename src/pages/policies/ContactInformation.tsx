import { PolicyLayout } from '../../components/layout/PolicyLayout'

export function ContactInformation() {
  return (
    <PolicyLayout title="Contact Information">
      <p>
        E-mail:{' '}
        <a href="mailto:earthyglowcandles@gmail.com">earthyglowcandles@gmail.com</a>
      </p>
      <p>Made in the Netherlands</p>
    </PolicyLayout>
  )
}