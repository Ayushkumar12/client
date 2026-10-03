import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';

import { TopAnnouncementBar } from './components/common/TopAnnouncementBar.jsx';
import { Header } from './components/common/Header.jsx';
import { Footer } from './components/common/Footer.jsx';
import { CartDrawer } from './components/common/CartDrawer.jsx';
import { PwaBottomNav } from './components/common/PwaBottomNav.jsx';

// Pages
import { HomePage } from './pages/HomePage.jsx';
import { ListingPage } from './pages/ListingPage.jsx';
import { ProductDetailPage } from './pages/ProductDetailPage.jsx';
import { CheckoutPage } from './pages/CheckoutPage.jsx';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage.jsx';
import { TrackOrderPage } from './pages/TrackOrderPage.jsx';
import { AccountPage } from './pages/AccountPage.jsx';
import { WishlistPage } from './pages/WishlistPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout.jsx';
import { AdminDashboard } from './pages/admin/AdminDashboard.jsx';
import { AdminOrders } from './pages/admin/AdminOrders.jsx';
import { AdminShiprocket } from './pages/admin/AdminShiprocket.jsx';
import { AdminProducts } from './pages/admin/AdminProducts.jsx';
import { AdminCoupons } from './pages/admin/AdminCoupons.jsx';
import { AdminCustomers } from './pages/admin/AdminCustomers.jsx';

function MainLayout({ children }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) {
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
      <CartDrawer />
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
            <MainLayout>
              <Routes>
                {/* Storefront Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/new-arrivals" element={<ListingPage isNewArrivals={true} />} />
                <Route path="/category/:categorySlug" element={<ListingPage />} />
                <Route path="/product/:slug" element={<ProductDetailPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success/:orderNumber" element={<OrderConfirmationPage />} />
                <Route path="/track-order" element={<TrackOrderPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="shiprocket" element={<AdminShiprocket />} />
                  <Route path="delhivery" element={<AdminShiprocket />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="coupons" element={<AdminCoupons />} />
                  <Route path="customers" element={<AdminCustomers />} />
                </Route>

                {/* 404 Fallback */}
                <Route path="*" element={<HomePage />} />
              </Routes>
            </MainLayout>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}
