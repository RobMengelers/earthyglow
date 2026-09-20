import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../../cart/useCart'

const links = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'Our Story', to: '/about' },
  { label: 'Candle Care', to: '/care' },
  { label: 'Contact', to: '/contact' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { itemCount, openDrawer } = useCart()

  return (
    <header className="navbar">
      <nav className="navbar-inner">
        <Link
          to="/"
          className="brand"
          aria-label="EarthyGlow — home"
          onClick={() => setOpen(false)}
        >
          <img src="/logo-mark.png" className="brand-logo" alt="" />
          <span className="brand-wordmark">
            Earthy<span>Glow</span>
          </span>
        </Link>

        <ul
          className={open ? 'nav-links menu-open' : 'nav-links'}
          aria-label="Main navigation"
        >
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => (isActive ? 'active' : undefined)}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="nav-actions">
          <button
            type="button"
            className="cart-link"
            aria-label={
              itemCount > 0
                ? `Open cart, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`
                : 'Open cart'
            }
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
            aria-label="Open menu"
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