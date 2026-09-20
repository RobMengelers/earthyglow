import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Home } from './pages/Home/Home'
import { Shop } from './pages/Shop/Shop'
import { ProductPage } from './pages/ProductPage/ProductPage'
import { About } from './pages/About/About'
import { Care } from './pages/Care/Care'
import { Contact } from './pages/Contact/Contact'
import { PrivacyPolicy } from './pages/policies/PrivacyPolicy'
import { RefundPolicy } from './pages/policies/RefundPolicy'
import { TermsOfService } from './pages/policies/TermsOfService'
import { ContactInformation } from './pages/policies/ContactInformation'
import { Cart } from './pages/Cart/Cart'
import { Checkout } from './pages/Checkout/Checkout'
import { CheckoutConfirmation } from './pages/CheckoutConfirmation/CheckoutConfirmation'
import { Admin } from './pages/Admin/Admin'
import { NotFound } from './pages/NotFound/NotFound'

function App() {
  return (
    <Routes>
      <Route path="/admin" element={<Admin />} />
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