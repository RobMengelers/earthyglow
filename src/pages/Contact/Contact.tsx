import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { Reveal } from '../../components/ui/Reveal'
import { SocialLinks } from '../../components/ui/SocialLinks'
import { API_URL } from '../../cart/catalog'
import { LoadingButton } from '../../components/ui/LoadingButton'

type SendState = 'idle' | 'sending' | 'sent' | 'error'

export function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sendState, setSendState] = useState<SendState>('idle')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSendState('sending')
    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
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
      <section className="page-hero">
        <div className="container">
          <Reveal>
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Contact</span>
            </nav>
            <p className="eyebrow">Contact</p>
            <h1>Let’s get in touch</h1>
            <p className="section-lede">
              Need help choosing a candle, have a question about your order,
              or just want to say hello? I’d love to hear from you.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="contact-body">
        <div className="container contact-grid">
          <Reveal className="contact-info">
            <div className="contact-card">
              <h2>E-mail</h2>
              <a href="mailto:earthyglowcandles@gmail.com">
                earthyglowcandles@gmail.com
              </a>
              <p>Send me a note and I’ll get back to you as soon as I can.</p>
            </div>

            <div className="contact-card">
              <h2>Follow along</h2>
              <SocialLinks className="contact-socials" />
            </div>

            <div className="contact-card">
              <h2>Business details</h2>
              <ul className="contact-details">
                <li>
                  <span>Chamber of Commerce</span>
                  42049155
                </li>
                <li>
                  <span>VAT</span>
                  NL005456394B38
                </li>
                <li>
                  <span>Location</span>
                  Netherlands
                </li>
              </ul>
            </div>
          </Reveal>

          <Reveal delay={100} className="contact-form-wrap">
            <form className="contact-form" onSubmit={handleSubmit}>
              <h2>Send a message</h2>
              <label>
                <span>Name</span>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  required
                />
              </label>
              <label>
                <span>Email address</span>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@email.com"
                  required
                />
              </label>
              <label>
                <span>Message</span>
                <textarea
                  name="message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="How can I help?"
                  rows={5}
                  required
                />
              </label>
              <LoadingButton
                type="submit"
                className="btn btn-primary"
                loading={sendState === 'sending'}
              >
                Send
              </LoadingButton>
              {(sendState === 'sent' || sendState === 'error') && (
                <p
                  className={`form-note${sendState === 'error' ? ' is-error' : ''}`}
                >
                  {sendState === 'sent'
                    ? 'Thank you for your message. I’ll get back to you as soon as I can.'
                    : 'Something went wrong sending your message. Please try again or e-mail us directly.'}
                </p>
              )}
            </form>
          </Reveal>
        </div>
      </section>
    </>
  )
}