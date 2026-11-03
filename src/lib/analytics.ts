// Google Analytics 4, loaded only after the visitor accepts analytics cookies.
//
// Nothing from Google is fetched and no cookie is set until consent is given
// (Consent Mode "basic"): EU law requires opt-in for analytics cookies. Without
// VITE_GA_MEASUREMENT_ID (local development) the whole module does nothing and
// the cookie banner stays hidden.
//
// Page views are sent by hand from the layout (usePageViews) so client-side
// navigations are counted exactly once. Shop events follow GA4's recommended
// e-commerce names so the built-in funnel and purchase reports work:
// view_item → add_to_cart → begin_checkout → add_payment_info → purchase.

import { useLayoutEffect, useSyncExternalStore } from 'react'
import { useLocation } from 'react-router'
import type { CartItem } from '../cart/CartContext'

export const GA_MEASUREMENT_ID: string = import.meta.env.VITE_GA_MEASUREMENT_ID ?? ''
export const analyticsEnabled = GA_MEASUREMENT_ID !== ''

const CONSENT_KEY = 'earthyglow-consent-v1'
const CONSENT_EVENT = 'earthyglow-consent-change'

export type Consent = 'granted' | 'denied'

type GtagWindow = Window & {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
} & Record<string, unknown>

function gaWindow(): GtagWindow | null {
  return typeof window === 'undefined' ? null : (window as unknown as GtagWindow)
}

// ---- Consent ---------------------------------------------------------------

export function readConsent(): Consent | null {
  try {
    const value = localStorage.getItem(CONSENT_KEY)
    return value === 'granted' || value === 'denied' ? value : null
  } catch {
    return null
  }
}

export function setConsent(consent: Consent) {
  try {
    localStorage.setItem(CONSENT_KEY, consent)
  } catch {
    // Storage can be unavailable (private mode); the choice holds for this visit.
  }
  memoryConsent = consent
  applyConsent(consent)
  // Count the page the visitor accepted on; later pages follow usePageViews.
  if (consent === 'granted') sendPageView()
  window.dispatchEvent(new Event(CONSENT_EVENT))
}

// Forget the choice so the banner asks again (the footer's "Cookie settings").
export function resetConsent() {
  try {
    localStorage.removeItem(CONSENT_KEY)
  } catch {
    // ignore
  }
  memoryConsent = null
  window.dispatchEvent(new Event(CONSENT_EVENT))
}

let memoryConsent: Consent | null = null

function currentConsent(): Consent | null {
  return readConsent() ?? memoryConsent
}

function subscribe(onChange: () => void) {
  window.addEventListener(CONSENT_EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(CONSENT_EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

// 'unknown' while server rendering and hydrating, so the banner never flashes
// for visitors who already chose.
export function useConsent(): Consent | null | 'unknown' {
  return useSyncExternalStore<Consent | null | 'unknown'>(
    subscribe,
    currentConsent,
    () => 'unknown',
  )
}

// ---- Loading gtag ----------------------------------------------------------

let loaded = false

function loadGtag() {
  const w = gaWindow()
  if (!w || loaded || !analyticsEnabled) return
  loaded = true

  w.dataLayer = w.dataLayer ?? []
  w.gtag = function gtag() {
    // gtag.js expects the arguments object itself, not an array.
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments)
  }
  w.gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  })
  w.gtag('js', new Date())
  w.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`
  document.head.appendChild(script)
}

function deleteGaCookies() {
  const host = window.location.hostname
  const domains = ['', host, `.${host}`, `.${host.replace(/^www\./, '')}`]
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0]?.trim()
    if (!name || !(name === '_ga' || name.startsWith('_ga_') || name === '_gid')) continue
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ''}`
    }
  }
}

function applyConsent(consent: Consent) {
  const w = gaWindow()
  if (!w || !analyticsEnabled) return
  const disableKey = `ga-disable-${GA_MEASUREMENT_ID}`
  if (consent === 'granted') {
    w[disableKey] = false
    if (loaded) {
      w.gtag?.('consent', 'update', { analytics_storage: 'granted' })
    } else {
      loadGtag()
    }
  } else {
    // Withdrawn: stop all hits and remove the cookies GA already set.
    w[disableKey] = true
    w.gtag?.('consent', 'update', { analytics_storage: 'denied' })
    deleteGaCookies()
  }
}

// ---- Events ----------------------------------------------------------------

function canTrack() {
  if (!analyticsEnabled || currentConsent() !== 'granted') return false
  // Components can report events before the layout's first page view on a
  // fresh load; make sure gtag is set up for them too.
  if (!loaded) applyConsent('granted')
  return true
}

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (!canTrack()) return
  gaWindow()?.gtag?.('event', name, params)
}

// Order numbers in the confirmation URL are left out of page views.
function sendPageView() {
  const url = new URL(window.location.href)
  url.searchParams.delete('order')
  url.searchParams.delete('mock')
  trackEvent('page_view', {
    page_location: url.toString(),
    page_path: `${url.pathname}${url.search}`,
    page_title: document.title,
  })
}

// Sends a page_view for every route change, including query changes such as
// the shop's season filter. A layout effect runs before the pages' own effects,
// so the page view always comes before events like view_item.
export function usePageViews() {
  const location = useLocation()
  useLayoutEffect(() => {
    sendPageView()
  }, [location.pathname, location.search])
}

export type AnalyticsItem = {
  item_id: string
  item_name: string
  item_category?: string
  item_variant?: string
  price: number
  quantity: number
}

export function cartItemToAnalytics(item: CartItem): AnalyticsItem {
  const variant = [item.variantLabel, item.colorLabel].filter(Boolean).join(' / ')
  return {
    item_id: item.productId,
    item_name: item.name,
    item_category: item.collectionTitle,
    ...(variant ? { item_variant: variant } : {}),
    price: centsToEuros(item.priceCents),
    quantity: item.quantity,
  }
}

export function centsToEuros(cents: number) {
  return Math.round(cents) / 100
}

export function itemsValue(items: AnalyticsItem[]) {
  return Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100
}

// The same order can be shown again (reload, back button); report it once.
export function trackPurchaseOnce(
  orderNumber: string,
  params: Record<string, unknown>,
) {
  if (!canTrack()) return
  const key = `earthyglow-ga-purchase-${orderNumber}`
  try {
    if (localStorage.getItem(key)) return
    localStorage.setItem(key, '1')
  } catch {
    // Without storage GA still de-duplicates on transaction_id.
  }
  trackEvent('purchase', { transaction_id: orderNumber, currency: 'EUR', ...params })
}
