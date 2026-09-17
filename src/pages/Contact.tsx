import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { Reveal } from '../components/Reveal'
import { SocialLinks } from '../components/SocialLinks'

export function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const subject = encodeURIComponent(`Message from ${name || 'a visitor'}`)
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\n${message}`,
    )
    window.location.href = `mailto:earthyglowcandles@gmail.com?subject=${subject}&body=${body}`
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
              Questions about an order, a custom piece, or just want to say hi?
              We’d love to hear from you.
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
              <p>We do our best to reply within 24 hours.</p>
            </div>

            <div className="contact-card">
              <h2>Follow us</h2>
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
                  placeholder="How can we help?"
                  rows={5}
                  required
                />
              </label>
              <button type="submit" className="btn btn-primary">
                Send
              </button>
              <p className="form-note">
                This opens your email app with your message ready to send to
                earthyglowcandles@gmail.com.
              </p>
            </form>
          </Reveal>
        </div>
      </section>
    </>
  )
}