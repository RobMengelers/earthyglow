import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Reveal } from './Reveal'

type PolicyLayoutProps = {
  title: string
  updated?: string
  children: ReactNode
}

export function PolicyLayout({ title, updated, children }: PolicyLayoutProps) {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Reveal>
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span>Policies</span>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{title}</span>
            </nav>
            <p className="eyebrow">Policies</p>
            <h1>{title}</h1>
            {updated && <p className="section-lede">Last updated: {updated}</p>}
          </Reveal>
        </div>
      </section>

      <section className="policy-body">
        <div className="container">
          <div className="policy-prose">{children}</div>
        </div>
      </section>
    </>
  )
}