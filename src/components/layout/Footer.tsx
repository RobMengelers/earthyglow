import { Link } from 'react-router-dom'
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
          <Link to="/" className="brand brand-light">
            <img src="/logo-mark.png" className="brand-logo" alt="" />
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
            <li><Link to="/shop">All products</Link></li>
            {seasons.map((season) => (
              <li key={season.id}>
                <Link to={`/shop?season=${season.id}`}>{season.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h3>Explore</h3>
          <ul>
            <li><Link to="/about">Our story</Link></li>
            <li><Link to="/care">Candle care</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Information</h3>
          <ul>
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
