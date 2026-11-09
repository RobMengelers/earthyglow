import { type FormEvent, useState } from 'react'
import { Reveal } from '../../components/ui/Reveal'
import { Divider } from '../../components/ui/Divider'
import { SocialLinks } from '../../components/ui/SocialLinks'
import { API_URL } from '../../cart/catalog'
import { LoadingButton } from '../../components/ui/LoadingButton'
import { JsonLd } from '../../components/seo/JsonLd'
import { breadcrumbLd, organizationLd, siteMeta } from '../../lib/seo'
import { defineCopy, Link, localeFromParams, useCopy, useLocale } from '../../i18n'
import type { Route } from './+types/Contact'

type SendState = 'idle' | 'sending' | 'sent' | 'error'

const contactCopy = defineCopy({
  en: {
    metaTitle: 'Contact · EarthyGlow',
    description: 'Questions about an order or a candle? Get in touch with EarthyGlow — e-mail earthyglowcandles@gmail.com or send a message.',
    home: 'Home',
    breadcrumb: 'Breadcrumb',
    contact: 'Contact',
    title: 'Let’s get in touch',
    lede: 'Need help choosing a candle, have a question about your order, or just want to say hello? I’d love to hear from you.',
    email: 'E-mail',
    emailNote: 'Send me a note and I’ll get back to you as soon as I can.',
    follow: 'Follow along',
    business: 'Business details',
    coc: 'Chamber of Commerce',
    vat: 'VAT',
    location: 'Location',
    country: 'Netherlands',
    formTitle: 'Send a message',
    name: 'Name',
    namePlaceholder: 'Your name',
    emailLabel: 'Email address',
    emailPlaceholder: 'you@email.com',
    message: 'Message',
    messagePlaceholder: 'How can I help?',
    send: 'Send',
    sent: 'Thank you for your message. I’ll get back to you as soon as I can.',
    failed: 'Something went wrong sending your message. Please try again or e-mail us directly.',
  },
  nl: {
    metaTitle: 'Contact · EarthyGlow',
    description: 'Vragen over een bestelling of een kaars? Neem contact op met EarthyGlow — mail naar earthyglowcandles@gmail.com of stuur een bericht.',
    home: 'Home',
    breadcrumb: 'Kruimelpad',
    contact: 'Contact',
    title: 'Laten we contact houden',
    lede: 'Hulp nodig bij het kiezen van een kaars, een vraag over je bestelling, of wil je gewoon even hallo zeggen? Ik hoor graag van je.',
    email: 'E-mail',
    emailNote: 'Stuur me een berichtje, dan reageer ik zo snel mogelijk.',
    follow: 'Volg mee',
    business: 'Bedrijfsgegevens',
    coc: 'KVK',
    vat: 'Btw',
    location: 'Locatie',
    country: 'Nederland',
    formTitle: 'Stuur een bericht',
    name: 'Naam',
    namePlaceholder: 'Je naam',
    emailLabel: 'E-mailadres',
    emailPlaceholder: 'jij@email.nl',
    message: 'Bericht',
    messagePlaceholder: 'Waarmee kan ik je helpen?',
    send: 'Versturen',
    sent: 'Dankjewel voor je bericht. Ik reageer zo snel mogelijk.',
    failed: 'Er ging iets mis bij het versturen van je bericht. Probeer het nog eens of mail ons direct.',
  },
  de: {
    metaTitle: 'Kontakt · EarthyGlow',
    description: 'Fragen zu einer Bestellung oder einer Kerze? Melde dich bei EarthyGlow — schreib an earthyglowcandles@gmail.com oder schick eine Nachricht.',
    home: 'Start',
    breadcrumb: 'Brotkrümelnavigation',
    contact: 'Kontakt',
    title: 'Lass uns in Kontakt bleiben',
    lede: 'Brauchst du Hilfe bei der Auswahl einer Kerze, hast du eine Frage zu deiner Bestellung oder möchtest du einfach Hallo sagen? Ich freue mich, von dir zu hören.',
    email: 'E-Mail',
    emailNote: 'Schreib mir eine Nachricht und ich melde mich so schnell wie möglich.',
    follow: 'Folge mir',
    business: 'Unternehmensangaben',
    coc: 'Handelskammer (KVK)',
    vat: 'USt-IdNr.',
    location: 'Standort',
    country: 'Niederlande',
    formTitle: 'Nachricht senden',
    name: 'Name',
    namePlaceholder: 'Dein Name',
    emailLabel: 'E-Mail-Adresse',
    emailPlaceholder: 'du@email.de',
    message: 'Nachricht',
    messagePlaceholder: 'Wie kann ich dir helfen?',
    send: 'Senden',
    sent: 'Danke für deine Nachricht. Ich melde mich so schnell wie möglich.',
    failed: 'Beim Senden deiner Nachricht ist etwas schiefgelaufen. Bitte versuche es noch einmal oder schreib uns direkt eine E-Mail.',
  },
})

export function meta({ params }: Route.MetaArgs) {
  const locale = localeFromParams(params)
  const copy = contactCopy[locale]
  return siteMeta({ locale, title: copy.metaTitle, description: copy.description, path: '/contact' })
}

export function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sendState, setSendState] = useState<SendState>('idle')
  const locale = useLocale()
  const copy = useCopy(contactCopy)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSendState('sending')
    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, locale }),
      })
      if (!response.ok) throw new Error('Send failed')
      setName('')
      setEmail('')
      setMessage('')
      setSendState('sent')
    } catch {
      setSendState('error')
    }
  }

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: copy.home, path: '/' },
          { name: copy.contact },
        ], locale)}
      />
      <JsonLd data={organizationLd(locale)} />
      <section className="page-hero">
        <div className="container">
          <Reveal>
            <nav className="breadcrumb" aria-label={copy.breadcrumb}>
              <Link to="/" prefetch="intent">{copy.home}</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{copy.contact}</span>
            </nav>
            <p className="eyebrow">{copy.contact}</p>
            <h1>{copy.title}</h1>
            <p className="section-lede">{copy.lede}</p>
          </Reveal>
        </div>
      </section>

      <Divider white />

      <section className="contact-body">
        <div className="container contact-grid">
          <Reveal className="contact-info">
            <div className="contact-card">
              <h2>{copy.email}</h2>
              <a href="mailto:earthyglowcandles@gmail.com">
                earthyglowcandles@gmail.com
              </a>
              <p>{copy.emailNote}</p>
            </div>

            <div className="contact-card">
              <h2>{copy.follow}</h2>
              <SocialLinks className="contact-socials" />
            </div>

            <div className="contact-card">
              <h2>{copy.business}</h2>
              <ul className="contact-details">
                <li>
                  <span>{copy.coc}</span>
                  42049155
                </li>
                <li>
                  <span>{copy.vat}</span>
                  NL005456394B38
                </li>
                <li>
                  <span>{copy.location}</span>
                  {copy.country}
                </li>
              </ul>
            </div>
          </Reveal>

          <Reveal delay={100} className="contact-form-wrap">
            <form className="contact-form" onSubmit={handleSubmit}>
              <h2>{copy.formTitle}</h2>
              <label>
                <span>{copy.name}</span>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={copy.namePlaceholder}
                  required
                />
              </label>
              <label>
                <span>{copy.emailLabel}</span>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={copy.emailPlaceholder}
                  required
                />
              </label>
              <label>
                <span>{copy.message}</span>
                <textarea
                  name="message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder={copy.messagePlaceholder}
                  rows={5}
                  required
                />
              </label>
              <LoadingButton
                type="submit"
                className="btn btn-primary"
                loading={sendState === 'sending'}
              >
                {copy.send}
              </LoadingButton>
              {(sendState === 'sent' || sendState === 'error') && (
                <p
                  className={`form-note${sendState === 'error' ? ' is-error' : ''}`}
                >
                  {sendState === 'sent' ? copy.sent : copy.failed}
                </p>
              )}
            </form>
          </Reveal>
        </div>
      </section>
    </>
  )
}

export default Contact