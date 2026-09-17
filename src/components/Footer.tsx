import { Link } from 'react-router-dom'
import { SocialLinks } from './SocialLinks'

const policies = [
  { label: 'Privacy Policy', to: '/policies/privacy-policy' },
  { label: 'Refund Policy', to: '/policies/refund-policy' },
  { label: 'Terms of Service', to: '/policies/terms-of-service' },
  { label: 'Contact Information', to: '/policies/contact-information' },
]

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link to="/" className="brand brand-light">
            <img src="/logo-mark.png" className="brand-logo" alt="" />
            <span className="brand-wordmark">
              Earthy<span>Glow</span>
            </span>
          </Link>
          <p>
            Hand-poured 100% soy wax candles, made in small batches in the
            Netherlands. Natural, vegan and cruelty-free.
          </p>
          <SocialLinks className="footer-socials" />
        </div>

        <div className="footer-col">
          <h3>Shop</h3>
          <ul>
            <li><Link to="/shop">All products</Link></li>
            <li><Link to="/shop/little-glow">The Little Glow</Link></li>
            <li><Link to="/shop/scented-glow">The Scented Glow</Link></li>
            <li><Link to="/shop/natural-glow">The Natural Glow</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Explore</h3>
          <ul>
            <li><Link to="/about">Our story</Link></li>
            <li><Link to="/care">Candle care</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li>
              <a href="mailto:earthyglowcandles@gmail.com">
                earthyglowcandles@gmail.com
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Information</h3>
          <ul>
            <li>Chamber of Commerce: 42049155</li>
            <li>VAT: NL005456394B38</li>
            {policies.map((policy) => (
              <li key={policy.label}>
                <Link to={policy.to}>{policy.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <span>© {new Date().getFullYear()} EarthyGlow. All rights reserved.</span>
          <span>Handmade with care in the Netherlands</span>
        </div>
      </div>
    </footer>
  )
}