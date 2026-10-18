import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { ContentProvider } from './context/ContentContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

import { Header } from './components/common/Header.jsx';
import { Footer } from './components/common/Footer.jsx';
import { PwaBottomNav } from './components/common/PwaBottomNav.jsx';
import { CookieConsentBanner } from './components/common/CookieConsentBanner.jsx';
import { ScrollToTop } from './components/common/ScrollToTop.jsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.jsx';

// Pages
import { HomePage } from './pages/HomePage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';
import { ErrorPage } from './pages/ErrorPage.jsx';
import { ListingPage } from './pages/ListingPage.jsx';
import { ProductDetailPage } from './pages/ProductDetailPage.jsx';
import { CartPage } from './pages/CartPage.jsx';
import { CheckoutPage } from './pages/CheckoutPage.jsx';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage.jsx';
import { TrackOrderPage } from './pages/TrackOrderPage.jsx';
import { OrdersPage } from './pages/OrdersPage.jsx';
import { WishlistPage } from './pages/WishlistPage.jsx';
import { AccountPage } from './pages/AccountPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { ContactPage } from './pages/ContactPage.jsx';
import { ShippingPolicyPage } from './pages/ShippingPolicyPage.jsx';
import { ReturnsPage } from './pages/ReturnsPage.jsx';
import { SizeGuidePage } from './pages/SizeGuidePage.jsx';
import { FaqPage } from './pages/FaqPage.jsx';
import { TermsPage } from './pages/TermsPage.jsx';
import { PrivacyPage } from './pages/PrivacyPage.jsx';
import { AboutPage } from './pages/AboutPage.jsx';
import { CookiePolicyPage } from './pages/CookiePolicyPage.jsx';
import { SitemapPage } from './pages/SitemapPage.jsx';

// Admin Pages (Code-split via React.lazy to keep customer bundle lightweight and eliminate unused JavaScript)
const AdminLayout = React.lazy(() => import('./pages/admin/AdminLayout.jsx').then(m => ({ default: m.AdminLayout })));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard.jsx').then(m => ({ default: m.AdminDashboard })));
const AdminAnalytics = React.lazy(() => import('./pages/admin/AdminAnalytics.jsx').then(m => ({ default: m.AdminAnalytics })));
const AdminOrders = React.lazy(() => import('./pages/admin/AdminOrders.jsx').then(m => ({ default: m.AdminOrders })));
const AdminReturns = React.lazy(() => import('./pages/admin/AdminReturns.jsx').then(m => ({ default: m.AdminReturns })));
const AdminShiprocket = React.lazy(() => import('./pages/admin/AdminShiprocket.jsx').then(m => ({ default: m.AdminShiprocket })));
const AdminProducts = React.lazy(() => import('./pages/admin/AdminProducts.jsx').then(m => ({ default: m.AdminProducts })));
const AdminCustomers = React.lazy(() => import('./pages/admin/AdminCustomers.jsx').then(m => ({ default: m.AdminCustomers })));
const AdminContentManager = React.lazy(() => import('./pages/admin/AdminContentManager.jsx').then(m => ({ default: m.AdminContentManager })));
const AdminInventory = React.lazy(() => import('./pages/admin/AdminInventory.jsx').then(m => ({ default: m.AdminInventory })));
const AdminInquiries = React.lazy(() => import('./pages/admin/AdminInquiries.jsx').then(m => ({ default: m.AdminInquiries })));
const AdminNavigation = React.lazy(() => import('./pages/admin/AdminNavigation.jsx').then(m => ({ default: m.AdminNavigation })));
const AdminSeoManager = React.lazy(() => import('./pages/admin/AdminSeoManager.jsx').then(m => ({ default: m.AdminSeoManager })));
const AdminDatabase = React.lazy(() => import('./pages/admin/AdminDatabase.jsx').then(m => ({ default: m.AdminDatabase })));
import { UnderDevelopmentLaunch } from './components/common/UnderDevelopmentLaunch.jsx';
import { BackToTopButton } from './components/common/BackToTopButton.jsx';
import { ScrollProgressBar } from './components/common/ScrollProgressBar.jsx';
import { FloatingContactButton } from './components/common/FloatingContactButton.jsx';
import { captureUtmParams } from './utils/utmTracking.js';
import { useAuth } from './context/AuthContext.jsx';
import { useContent } from './context/ContentContext.jsx';
import { Link } from 'react-router-dom';

// Whitelist of SEO, Policy, and Statutory Compliance routes
// These pages MUST NEVER be blocked by the Under Development countdown screen
// so search engine crawlers (Googlebot, Bing) and merchant reviewers have full access.
const SEO_AND_POLICY_ROUTES = [
  '/sitemap',
  '/sitemap.xml',
  '/robots.txt',
  '/llms.txt',
  '/llms-full.txt',
  '/.well-known/ai-catalog.json',
  '/.well-known/ard.json',
  '/ai-catalog.json',
  '/about',
  '/contact',
  '/shipping-policy',
  '/returns',
  '/refund-policy',
  '/size-guide',
  '/faq',
  '/terms',
  '/terms-and-conditions',
  '/privacy',
  '/privacy-policy',
  '/cookie-policy',
  '/cookies',
  '/track-order',
];

function MainLayout({ children }) {
  const location = useLocation();
  const { siteMode, isAdmin, updateSiteMode } = useAuth();
  const { content } = useContent();

  // If either CMS content or siteMode reports live, store is live for all visitors
  const isCmsLive = content?.site_mode === 'live' || content?.page_availability?.storefront_live === true;
  const isCmsDev = content?.site_mode === 'under_development' || (content?.page_availability?.storefront_live === false && content?.site_mode !== 'live');
  
  // By default, if siteMode is 'live' or CMS content is 'live', the store is live
  const isDevMode = (siteMode === 'under_development' || isCmsDev) && !isCmsLive && siteMode !== 'live';

  const currentPath = location.pathname.replace(/\/+$/, '') || '/';
  const isExplicitAdminRoute = location.pathname.startsWith('/admin');
  const isAuthPage = currentPath === '/login' || currentPath === '/register';
  const isSeoOrPolicyRoute = SEO_AND_POLICY_ROUTES.includes(currentPath);

  // 1. Admin pages & Login/Register are ALWAYS accessible
  if (isExplicitAdminRoute || isAuthPage) {
    return <>{children}</>;
  }

  // 2. Under Development Mode:
  // If not live yet and not an SEO/statutory compliance route, non-admins see the UnderDevelopmentLaunch page
  if (isDevMode && !isAdmin && !isSeoOrPolicyRoute) {
    return <UnderDevelopmentLaunch />;
  }

  // 3. Storefront layout (with admin preview alert if store is under development)
  return (
    <div className="min-h-screen flex flex-col justify-between bg-brand-cream pb-14 lg:pb-0 font-sans">
      <ScrollProgressBar />
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>
      <div>
        {isDevMode && isAdmin && (
          <div className="bg-amber-950 text-amber-100 text-xs px-4 py-2 border-b border-amber-800 flex flex-wrap items-center justify-between gap-2 z-50 sticky top-0">
            <div className="flex items-center space-x-2">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-semibold tracking-wide">
                STORE STATUS: UNDER DEVELOPMENT (LAUNCH PAGE ACTIVE FOR PUBLIC)
              </span>
              <span className="hidden md:inline text-amber-300">
                — You can preview the storefront because you are signed in as Administrator.
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Link
                to="/admin/content"
                className="px-2.5 py-1 bg-amber-800 hover:bg-amber-700 text-white rounded text-[11px] font-medium"
              >
                Admin Panel
              </Link>
              <button
                onClick={async () => {
                  if (window.confirm('Make the store LIVE for all visitors now?')) {
                    await updateSiteMode('live');
                  }
                }}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold cursor-pointer"
              >
                Set Store to Live
              </button>
            </div>
          </div>
        )}
        <Header />
        <main id="main-content" tabIndex="-1" className="outline-none">
          {children}
        </main>
      </div>
      <Footer />
      <CookieConsentBanner />
      <PwaBottomNav />
      <FloatingContactButton />
      <BackToTopButton />
    </div>
  );
}

export default function App() {
  React.useEffect(() => {
    captureUtmParams();
  }, []);

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <AuthProvider>
          <ToastProvider>
            <CartProvider>
              <WishlistProvider>
                <ContentProvider>
                  <ScrollToTop />
                  <MainLayout>
                  <ErrorBoundary>
                    <Routes>
                      {/* Storefront Routes */}
                      <Route path="/" element={<HomePage />} />
                      <Route path="/new-arrivals" element={<ListingPage isNewArrivals={true} />} />
                      <Route path="/category/:categorySlug" element={<ListingPage />} />
                      <Route path="/product/:slug" element={<ProductDetailPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/order-success/:orderNumber" element={<OrderConfirmationPage />} />
                      <Route path="/track-order" element={<TrackOrderPage />} />
                      <Route path="/orders" element={<OrdersPage />} />
                      <Route path="/orders/:orderNumber" element={<OrdersPage />} />
                      <Route path="/wishlist" element={<WishlistPage />} />
                      <Route path="/account" element={<AccountPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />

                      {/* Customer Care & Policy Pages */}
                      <Route path="/sitemap" element={<SitemapPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
                      <Route path="/returns" element={<ReturnsPage />} />
                      <Route path="/size-guide" element={<SizeGuidePage />} />
                      <Route path="/faq" element={<FaqPage />} />
                      <Route path="/terms" element={<TermsPage />} />
                      <Route path="/terms-and-conditions" element={<TermsPage />} />
                      <Route path="/privacy" element={<PrivacyPage />} />
                      <Route path="/privacy-policy" element={<PrivacyPage />} />
                      <Route path="/cookie-policy" element={<CookiePolicyPage />} />
                      <Route path="/cookies" element={<CookiePolicyPage />} />
                      <Route path="/refund-policy" element={<ReturnsPage />} />
                      <Route path="/about" element={<AboutPage />} />

                      {/* Admin Routes (Lazy-loaded with enterprise fallback) */}
                      <Route
                        path="/admin"
                        element={
                          <React.Suspense
                            fallback={
                              <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-neutral-400">
                                <div className="w-8 h-8 border-2 border-neutral-700 border-t-white rounded-full animate-spin mb-3"></div>
                                <span className="text-xs tracking-wider uppercase font-mono">Loading Administration...</span>
                              </div>
                            }
                          >
                            <AdminLayout />
                          </React.Suspense>
                        }
                      >
                        <Route index element={<AdminDashboard />} />
                        <Route path="seo" element={<AdminSeoManager />} />
                        <Route path="inventory" element={<AdminInventory />} />
                        <Route path="analytics" element={<AdminAnalytics />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="returns" element={<AdminReturns />} />
                        <Route path="shiprocket" element={<AdminShiprocket />} />
                        <Route path="delhivery" element={<AdminShiprocket />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="customers" element={<AdminCustomers />} />
                        <Route path="inquiries" element={<AdminInquiries />} />
                        <Route path="navigation" element={<AdminNavigation />} />
                        <Route path="content" element={<AdminContentManager />} />
                        <Route path="database" element={<AdminDatabase />} />
                      </Route>

                      {/* Error Routes */}
                      <Route path="/error" element={<ErrorPage />} />
                      <Route path="/500" element={<ErrorPage />} />

                      {/* 404 Fallback */}
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </ErrorBoundary>
                </MainLayout>
              </ContentProvider>
            </WishlistProvider>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}
