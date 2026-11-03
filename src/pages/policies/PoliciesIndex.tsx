import { Reveal } from '../../components/ui/Reveal'
import { Divider } from '../../components/ui/Divider'
import { JsonLd } from '../../components/seo/JsonLd'
import { breadcrumbLd, siteMeta } from '../../lib/seo'
import { defineCopy, Link, localeFromParams, useCopy, useLocale } from '../../i18n'
import { policyLinks } from './policy-links'
import type { Route } from './+types/PoliciesIndex'

const indexCopy = defineCopy({
  en: {
    title: 'Policies',
    home: 'Home',
    breadcrumb: 'Breadcrumb',
    lede: 'How EarthyGlow handles your data, orders, returns and enquiries.',
    description: 'EarthyGlow policies: privacy, refunds and returns, terms of service and contact information.',
  },
  nl: {
    title: 'Beleid',
    home: 'Home',
    breadcrumb: 'Kruimelpad',
    lede: 'Hoe EarthyGlow omgaat met je gegevens, bestellingen, retouren en vragen.',
    description: 'Het beleid van EarthyGlow: privacy, terugbetalingen en retouren, algemene voorwaarden en contactgegevens.',
  },
  de: {
    title: 'Richtlinien',
    home: 'Start',
    breadcrumb: 'Brotkrümelnavigation',
    lede: 'Wie EarthyGlow mit deinen Daten, Bestellungen, Rücksendungen und Anfragen umgeht.',
    description: 'Richtlinien von EarthyGlow: Datenschutz, Erstattungen und Rücksendungen, AGB und Kontaktinformationen.',
  },
})

export function meta({ params }: Route.MetaArgs) {
  const locale = localeFromParams(params)
  const copy = indexCopy[locale]
  return siteMeta({
    locale,
    title: `${copy.title} · EarthyGlow`,
    description: copy.description,
    path: '/policies',
  })
}

export function PoliciesIndex() {
  const locale = useLocale()
  const copy = useCopy(indexCopy)
  return (
    <>
      <JsonLd
        data={breadcrumbLd([{ name: copy.home, path: '/' }, { name: copy.title }], locale)}
      />
      <section className="page-hero">
        <div className="container">
          <Reveal>
            <nav className="breadcrumb" aria-label={copy.breadcrumb}>
              <Link to="/" prefetch="intent">{copy.home}</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{copy.title}</span>
            </nav>
            <p className="eyebrow">{copy.title}</p>
            <h1>{copy.title}</h1>
            <p className="section-lede">{copy.lede}</p>
          </Reveal>
        </div>
      </section>

      <Divider white />

      <section className="policy-body">
        <div className="container">
          <div className="policy-prose">
            <ul>
              {policyLinks[locale].map((policy) => (
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
