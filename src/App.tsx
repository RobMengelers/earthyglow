import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Shop } from './pages/Shop'
import { ProductPage } from './pages/ProductPage'
import { About } from './pages/About'
import { Care } from './pages/Care'
import { Contact } from './pages/Contact'
import { PrivacyPolicy } from './pages/PrivacyPolicy'
import { RefundPolicy } from './pages/RefundPolicy'
import { TermsOfService } from './pages/TermsOfService'
import { ContactInformation } from './pages/ContactInformation'
import { Cart } from './pages/Cart'
import { Checkout } from './pages/Checkout'
import { CheckoutConfirmation } from './pages/CheckoutConfirmation'
import { NotFound } from './pages/NotFound'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:collectionId" element={<Shop />} />
        <Route path="/product/:productId" element={<ProductPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/care" element={<Care />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route
          path="/checkout/confirmation"
          element={<CheckoutConfirmation />}
        />
        <Route path="/policies/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/policies/refund-policy" element={<RefundPolicy />} />
        <Route path="/policies/terms-of-service" element={<TermsOfService />} />
        <Route
          path="/policies/contact-information"
          element={<ContactInformation />}
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App