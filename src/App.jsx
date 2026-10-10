import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { ContentProvider } from './context/ContentContext.jsx';

import { TopAnnouncementBar } from './components/common/TopAnnouncementBar.jsx';
import { Header } from './components/common/Header.jsx';
import { Footer } from './components/common/Footer.jsx';
import { PwaBottomNav } from './components/common/PwaBottomNav.jsx';

// Pages
import { HomePage } from './pages/HomePage.jsx';
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

function MainLayout({ children }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAdmin || isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-brand-cream pb-14 lg:pb-0">
      <div>
        <TopAnnouncementBar />
        <Header />
        <main>{children}</main>
      </div>
      <Footer />
      <PwaBottomNav />
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ContentProvider>
              <MainLayout>
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
                  <Route path="/privacy" element={<PrivacyPage />} />
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
                    <Route path="coupons" element={<Navigate to="/admin" replace />} />
                    <Route path="customers" element={<AdminCustomers />} />
                    <Route path="content" element={<AdminContentManager />} />
                  </Route>


                  {/* 404 Fallback */}
                  <Route path="*" element={<HomePage />} />
                </Routes>
              </MainLayout>
            </ContentProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}
