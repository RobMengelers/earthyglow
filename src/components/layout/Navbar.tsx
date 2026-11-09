import { useState } from 'react'
import { useCart } from '../../cart/useCart'
import { defineCopy, Link, NavLink, useCopy } from '../../i18n'
import { LanguageSwitcher } from './LanguageSwitcher'

const navCopy = defineCopy({
  en: {
    links: { home: 'Home', shop: 'Shop', about: 'Our Story', care: 'Candle Care', contact: 'Contact' },
    homeLabel: 'EarthyGlow home',
    mainNav: 'Main navigation',
    openCart: 'Open cart',
    openCartCount: (count: number) => `Open cart, ${count} ${count === 1 ? 'item' : 'items'}`,
    openMenu: 'Open menu',
  },
  nl: {
    links: { home: 'Home', shop: 'Shop', about: 'Ons verhaal', care: 'Kaarsverzorging', contact: 'Contact' },
    homeLabel: 'EarthyGlow home',
    mainNav: 'Hoofdmenu',
    openCart: 'Winkelmand openen',
    openCartCount: (count: number) => `Winkelmand openen, ${count} ${count === 1 ? 'artikel' : 'artikelen'}`,
    openMenu: 'Menu openen',
  },
  de: {
    links: { home: 'Start', shop: 'Shop', about: 'Unsere Geschichte', care: 'Kerzenpflege', contact: 'Kontakt' },
    homeLabel: 'EarthyGlow Startseite',
    mainNav: 'Hauptnavigation',
    openCart: 'Warenkorb öffnen',
    openCartCount: (count: number) => `Warenkorb öffnen, ${count} ${count === 1 ? 'Artikel' : 'Artikel'}`,
    openMenu: 'Menü öffnen',
  },
})

const links = [
  { key: 'home', to: '/' },
  { key: 'shop', to: '/shop' },
  { key: 'about', to: '/about' },
  { key: 'care', to: '/care' },
  { key: 'contact', to: '/contact' },
] as const

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { itemCount, openDrawer } = useCart()
  const copy = useCopy(navCopy)

  return (
    <header className="navbar">
      <nav className="navbar-inner">
        <Link
          to="/"
          className="brand"
          aria-label={copy.homeLabel}
          prefetch="viewport"
          onClick={() => setOpen(false)}
        >
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

        <ul
          className={open ? 'nav-links menu-open' : 'nav-links'}
          aria-label={copy.mainNav}
        >
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === '/'}
                prefetch="viewport"
                className={({ isActive }) => (isActive ? 'active' : undefined)}
                onClick={() => setOpen(false)}
              >
                {copy.links[link.key]}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="nav-actions">
          <LanguageSwitcher />
          <button
            type="button"
            className="cart-link"
            aria-label={itemCount > 0 ? copy.openCartCount(itemCount) : copy.openCart}
            onClick={openDrawer}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 8h12l-1.2 11.1a2 2 0 0 1-2 1.9H9.2a2 2 0 0 1-2-1.9L6 8Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path
                d="M9 10V7a3 3 0 0 1 6 0v3"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            {itemCount > 0 && (
              <span className="cart-badge">{itemCount}</span>
            )}
          </button>
          <button
            type="button"
            className={open ? 'mobile-toggle is-open' : 'mobile-toggle'}
            aria-label={copy.openMenu}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>
    </header>
  )
}