import { forwardRef } from 'react'
import {
  Link as RouterLink,
  NavLink as RouterNavLink,
  type LinkProps,
  type NavLinkProps,
} from 'react-router'
import { localizeTo, useLocale } from './hooks'

/**
 * Drop-in replacement for React Router's Link: absolute paths stay in the
 * current language, so components keep writing to="/shop".
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link({ to, ...props }, ref) {
  const locale = useLocale()
  return <RouterLink ref={ref} to={localizeTo(locale, to)} {...props} />
})

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(function NavLink({ to, ...props }, ref) {
  const locale = useLocale()
  return <RouterNavLink ref={ref} to={localizeTo(locale, to)} {...props} />
})
