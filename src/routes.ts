import {
  index,
  layout,
  route,
  type RouteConfig,
} from '@react-router/dev/routes'

export default [
  route('sitemap.xml', './routes/sitemap.ts'),
  route('admin', './pages/Admin/AdminLayout.tsx', [
    index('./pages/Admin/admin-index.tsx'),
    route('overview', './pages/Admin/OverviewPage.tsx'),
    route('purchases', './pages/Admin/PurchasesPage.tsx'),
    route('purchases/new', './pages/Admin/NewPurchasePage.tsx'),
    route('materials', './pages/Admin/MaterialsPage.tsx'),
    route('materials/new', './pages/Admin/NewMaterialPage.tsx'),
    route('recipes/new', './pages/Admin/NewRecipePage.tsx'),
    route('orders', './pages/Admin/OrdersPage.tsx'),
    route('coupons', './pages/Admin/CouponsPage.tsx'),
    route('orders/new', './pages/Admin/NewOrderPage.tsx'),
  ]),
  layout('./components/layout/Layout.tsx', [
    index('./pages/Home/Home.tsx'),
    route('shop/:collectionId?', './pages/Shop/Shop.tsx'),
    route('product/:productId', './pages/ProductPage/ProductPage.tsx'),
    route('about', './pages/About/About.tsx'),
    route('care', './pages/Care/Care.tsx'),
    route('contact', './pages/Contact/Contact.tsx'),
    route('cart', './pages/Cart/Cart.tsx'),
    route('checkout', './pages/Checkout/Checkout.tsx'),
    route('checkout/confirmation', './pages/CheckoutConfirmation/CheckoutConfirmation.tsx'),
    route('policies', './pages/policies/PoliciesIndex.tsx'),
    route('policies/privacy-policy', './pages/policies/PrivacyPolicy.tsx'),
    route('policies/refund-policy', './pages/policies/RefundPolicy.tsx'),
    route('policies/terms-of-service', './pages/policies/TermsOfService.tsx'),
    route('policies/contact-information', './pages/policies/ContactInformation.tsx'),
    route('*', './pages/NotFound/NotFound.tsx'),
  ]),
] satisfies RouteConfig
