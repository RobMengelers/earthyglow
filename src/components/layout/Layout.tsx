import { Outlet } from 'react-router'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { ScrollToTop } from './ScrollToTop'
import { CartDrawer } from '../../cart/components/CartDrawer'
import { CookieBanner } from './CookieBanner'

export default function Layout() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main className="site-main">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <CookieBanner />
    </>
  )
}