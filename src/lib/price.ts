import { formatEuroCents } from '../i18n/locales'

// One price format across the storefront: €14.95.
export function formatPrice(cents: number): string {
  return formatEuroCents(cents)
}
