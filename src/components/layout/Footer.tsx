import { SocialLinks } from '../ui/SocialLinks'
import { seasons } from '../../data/seasons'
import { localizedSeason } from '../../data/catalog-i18n'
import { defineCopy, Link, useCopy, useLocale } from '../../i18n'
import { policyLinks } from '../../pages/policies/policy-links'
import { analyticsEnabled, resetConsent } from '../../lib/analytics'

const footerCopy = defineCopy({
  en: {
    intro: 'Candles made by Naomi in the Netherlands, poured by hand with 100% soy wax. Thank you for supporting my small business.',
    shop: 'Shop',
    allProducts: 'All products',
    explore: 'Explore',
    story: 'Our story',
    care: 'Candle care',
    contact: 'Contact',
    information: 'Information',
    rights: 'All rights reserved.',
    vat: 'VAT',
    madeIn: 'Handmade with care in the Netherlands',
    cookieSettings: 'Cookie settings',
  },
  nl: {
    intro: 'Kaarsen gemaakt door Naomi in Nederland, met de hand gegoten van 100% sojawas. Dankjewel dat je mijn kleine bedrijf steunt.',
    shop: 'Shop',
    allProducts: 'Alle producten',
    explore: 'Ontdek',
    story: 'Ons verhaal',
    care: 'Kaarsverzorging',
    contact: 'Contact',
    information: 'Informatie',
    rights: 'Alle rechten voorbehouden.',
    vat: 'Btw',
    madeIn: 'Met zorg handgemaakt in Nederland',
    cookieSettings: 'Cookie-instellingen',
  },
  de: {
    intro: 'Kerzen von Naomi aus den Niederlanden, von Hand gegossen aus 100 % Sojawachs. Danke, dass du mein kleines Unternehmen unterstützt.',
    shop: 'Shop',
    allProducts: 'Alle Produkte',
    explore: 'Entdecken',
    story: 'Unsere Geschichte',
    care: 'Kerzenpflege',
    contact: 'Kontakt',
    information: 'Informationen',
    rights: 'Alle Rechte vorbehalten.',
    vat: 'USt-IdNr.',
    madeIn: 'Mit Liebe handgemacht in den Niederlanden',
    cookieSettings: 'Cookie-Einstellungen',
  },
})

export function Footer() {
  const locale = useLocale()
  const copy = useCopy(footerCopy)

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
          <p>{copy.intro}</p>
          <SocialLinks className="footer-socials" />
        </div>

        <div className="footer-col">
          <h3>{copy.shop}</h3>
          <ul>
            <li><Link to="/shop" prefetch="intent">{copy.allProducts}</Link></li>
            {seasons.map((season) => (
              <li key={season.id}>
                <Link to={`/shop?season=${season.id}`} prefetch="intent">
                  {localizedSeason(season, locale).label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h3>{copy.explore}</h3>
          <ul>
            <li><Link to="/about" prefetch="intent">{copy.story}</Link></li>
            <li><Link to="/care" prefetch="intent">{copy.care}</Link></li>
            <li><Link to="/contact" prefetch="intent">{copy.contact}</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>{copy.information}</h3>
          <ul>
            {policyLinks[locale].map((policy) => (
              <li key={policy.to}>
                <Link to={policy.to} prefetch="intent">{policy.label}</Link>
              </li>
            ))}
            {analyticsEnabled && (
              <li>
                <button type="button" className="footer-cookie-settings" onClick={resetConsent}>
                  {copy.cookieSettings}
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-legal">
            <span>© {new Date().getFullYear()} EarthyGlow. {copy.rights}</span>
            <span>KVK 42049155</span>
            <span>{copy.vat} NL005456394B38</span>
          </div>
          <span>{copy.madeIn}</span>
        </div>
      </div>
    </footer>
  )
}
