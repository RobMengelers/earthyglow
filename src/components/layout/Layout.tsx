import { useRef } from 'react'
import { Outlet, type ClientLoaderFunctionArgs, type LoaderFunctionArgs } from 'react-router'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { ScrollToTop } from './ScrollToTop'
import { CartDrawer } from '../../cart/components/CartDrawer'
import { isLocale } from '../../i18n'
import { clientLanguageRedirect, languageRedirect } from '../../i18n/redirect'
import { useLocaleSwitchAnimation } from '../../i18n/useLocaleSwitchAnimation'

// The first segment must be a language. Anything else is a URL from before the
// site had languages (/shop, /product/…) and moves to the visitor's language.
export function loader({ params, request }: LoaderFunctionArgs) {
  if (!isLocale(params.lang)) throw languageRedirect(request)
  return null
}

export function clientLoader({ params, request }: ClientLoaderFunctionArgs) {
  if (!isLocale(params.lang)) throw clientLanguageRedirect(request)
  return null
}

export default function Layout() {
  const pageRef = useRef<HTMLDivElement>(null)
  useLocaleSwitchAnimation(pageRef)

  return (
    <div ref={pageRef} className="site-page">
      <ScrollToTop />
      <Navbar />
      <main className="site-main">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}
