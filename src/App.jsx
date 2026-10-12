import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { ContentProvider } from './context/ContentContext.jsx';

import { Header } from './components/common/Header.jsx';
import { Footer } from './components/common/Footer.jsx';
import { PwaBottomNav } from './components/common/PwaBottomNav.jsx';
import { CookieConsentBanner } from './components/common/CookieConsentBanner.jsx';
import { ScrollToTop } from './components/common/ScrollToTop.jsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.jsx';

// Pages
import { HomePage } from './pages/HomePage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';
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

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout.jsx';
import { AdminDashboard } from './pages/admin/AdminDashboard.jsx';
import { AdminAnalytics } from './pages/admin/AdminAnalytics.jsx';
import { AdminOrders } from './pages/admin/AdminOrders.jsx';
import { AdminReturns } from './pages/admin/AdminReturns.jsx';
import { AdminShiprocket } from './pages/admin/AdminShiprocket.jsx';
import { AdminProducts } from './pages/admin/AdminProducts.jsx';
import { AdminCustomers } from './pages/admin/AdminCustomers.jsx';
import { AdminContentManager } from './pages/admin/AdminContentManager.jsx';
import { AdminInventory } from './pages/admin/AdminInventory.jsx';
import { AdminInquiries } from './pages/admin/AdminInquiries.jsx';
import { AdminDatabase } from './pages/admin/AdminDatabase.jsx';
import { UnderDevelopmentLaunch } from './components/common/UnderDevelopmentLaunch.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { Link } from 'react-router-dom';

function MainLayout({ children }) {
  const location = useLocation();
  const { siteMode, isAdmin, updateSiteMode } = useAuth();
  const isDevMode = siteMode === 'under_development';

  const isExplicitAdminRoute = location.pathname.startsWith('/admin');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // 1. Admin pages & Login/Register are ALWAYS accessible
  if (isExplicitAdminRoute || isAuthPage) {
    return <>{children}</>;
  }

  // 2. Under Development Mode:
  // If not live yet, non-admins see the UnderDevelopmentLaunch page based on launch.html
  if (isDevMode && !isAdmin) {
    return <UnderDevelopmentLaunch />;
  }

  // 3. Storefront layout (with admin preview alert if store is under development)
  return (
    <div className="min-h-screen flex flex-col justify-between bg-brand-cream pb-14 lg:pb-0 font-sans">
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
        <main>{children}</main>
      </div>
      <Footer />
      <CookieConsentBanner />
      <PwaBottomNav />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <AuthProvider>
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

                      {/* Admin Routes */}
                      <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="inventory" element={<AdminInventory />} />
                        <Route path="analytics" element={<AdminAnalytics />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="returns" element={<AdminReturns />} />
                        <Route path="shiprocket" element={<AdminShiprocket />} />
                        <Route path="delhivery" element={<AdminShiprocket />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="customers" element={<AdminCustomers />} />
                        <Route path="inquiries" element={<AdminInquiries />} />
                        <Route path="content" element={<AdminContentManager />} />
                        <Route path="database" element={<AdminDatabase />} />
                      </Route>

                      {/* 404 Fallback */}
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </ErrorBoundary>
                </MainLayout>
              </ContentProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}
