import { type ReactNode } from 'react'
import { Reveal } from '../ui/Reveal'
import { Divider } from '../ui/Divider'
import { JsonLd } from '../seo/JsonLd'
import { breadcrumbLd } from '../../lib/seo'
import { defineCopy, Link, useCopy, useLocale } from '../../i18n'

const policyCopy = defineCopy({
  en: { home: 'Home', policies: 'Policies', breadcrumb: 'Breadcrumb', updated: 'Last updated' },
  nl: { home: 'Home', policies: 'Beleid', breadcrumb: 'Kruimelpad', updated: 'Laatst bijgewerkt' },
  de: { home: 'Start', policies: 'Richtlinien', breadcrumb: 'Brotkrümelnavigation', updated: 'Zuletzt aktualisiert' },
})

type PolicyLayoutProps = {
  title: string
  updated?: string
  children: ReactNode
}

export function PolicyLayout({ title, updated, children }: PolicyLayoutProps) {
  const locale = useLocale()
  const copy = useCopy(policyCopy)
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: copy.home, path: '/' },
          { name: copy.policies, path: '/policies' },
          { name: title },
        ], locale)}
      />
      <section className="page-hero">
        <div className="container">
          <Reveal>
            <nav className="breadcrumb" aria-label={copy.breadcrumb}>
              <Link to="/" prefetch="intent">{copy.home}</Link>
              <span aria-hidden="true">/</span>
              <Link to="/policies" prefetch="intent">{copy.policies}</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{title}</span>
            </nav>
            <p className="eyebrow">{copy.policies}</p>
            <h1>{title}</h1>
            {updated && <p className="section-lede">{copy.updated}: {updated}</p>}
          </Reveal>
        </div>
      </section>

      <Divider white />

      <section className="policy-body">
        <div className="container">
          <div className="policy-prose">{children}</div>
        </div>
      </section>
    </>
  )
}