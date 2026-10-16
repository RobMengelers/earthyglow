import { Link } from 'react-router'
import { Reveal } from '../../components/ui/Reveal'
import { Divider } from '../../components/ui/Divider'
import { JsonLd } from '../../components/seo/JsonLd'
import { breadcrumbLd, siteMeta } from '../../lib/seo'

const policies = [
  {
    label: 'Privacy Policy',
    to: '/policies/privacy-policy',
    summary: 'what I collect, why, and how your data is handled.',
  },
  {
    label: 'Refund Policy',
    to: '/policies/refund-policy',
    summary: 'how problems with handmade, made-to-order candles are resolved.',
  },
  {
    label: 'Terms of Service',
    to: '/policies/terms-of-service',
    summary: 'the terms that apply when you order from EarthyGlow.',
  },
  {
    label: 'Contact Information',
    to: '/policies/contact-information',
    summary: 'business details and how to reach me.',
  },
]

export function meta() {
  return siteMeta({
    title: 'Policies · EarthyGlow',
    description:
      'EarthyGlow policies: privacy, refunds and returns, terms of service and contact information.',
    path: '/policies',
  })
}

export function PoliciesIndex() {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Policies' }])}
      />
      <section className="page-hero">
        <div className="container">
          <Reveal>
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link to="/" prefetch="intent">Home</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Policies</span>
            </nav>
            <p className="eyebrow">Policies</p>
            <h1>Policies</h1>
            <p className="section-lede">
              How EarthyGlow handles your data, orders, returns and enquiries.
            </p>
          </Reveal>
        </div>
      </section>

      <Divider white />

      <section className="policy-body">
        <div className="container">
          <div className="policy-prose">
            <ul>
              {policies.map((policy) => (
                <li key={policy.to}>
                  <Link to={policy.to} prefetch="intent">{policy.label}</Link> — {policy.summary}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  )
}

export default PoliciesIndex
