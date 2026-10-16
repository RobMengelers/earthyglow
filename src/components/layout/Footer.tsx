import { Link } from 'react-router'
import { SocialLinks } from '../ui/SocialLinks'
import { seasons } from '../../data/seasons'

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
          <Link to="/" className="brand brand-light" prefetch="intent">
            <img
              src="/logo-mark.png"
              width={280}
              height={280}
              className="brand-logo"
              alt=""
            />
            <span className="brand-wordmark">
              Earthy<span>Glow</span>
            </span>
          </Link>
          <p>
            Candles made by Naomi in the Netherlands, poured by hand with
            100% soy wax. Thank you for supporting my small business.
          </p>
          <SocialLinks className="footer-socials" />
        </div>

        <div className="footer-col">
          <h3>Shop</h3>
          <ul>
            <li><Link to="/shop" prefetch="intent">All products</Link></li>
            {seasons.map((season) => (
              <li key={season.id}>
                <Link to={`/shop?season=${season.id}`} prefetch="intent">{season.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h3>Explore</h3>
          <ul>
            <li><Link to="/about" prefetch="intent">Our story</Link></li>
            <li><Link to="/care" prefetch="intent">Candle care</Link></li>
            <li><Link to="/contact" prefetch="intent">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Information</h3>
          <ul>
            {policies.map((policy) => (
              <li key={policy.label}>
                <Link to={policy.to} prefetch="intent">{policy.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-legal">
            <span>© {new Date().getFullYear()} EarthyGlow. All rights reserved.</span>
            <span>KVK 42049155</span>
            <span>VAT NL005456394B38</span>
          </div>
          <span>Handmade with care in the Netherlands</span>
        </div>
      </div>
    </footer>
  )
}
