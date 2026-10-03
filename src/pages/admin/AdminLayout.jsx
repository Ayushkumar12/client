import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Truck,
  Tag,
  Users,
  ArrowLeft,
  ShieldCheck,
  LogOut,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export function AdminLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-4 space-y-4">
        <ShieldCheck className="w-16 h-16 text-red-500" />
        <h1 className="font-serif text-2xl font-bold">Admin Access Required</h1>
        <p className="text-xs text-neutral-400">Please sign in with administrator credentials (admin@oct9.com).</p>
        <div className="flex space-x-3">
          <Link to="/login" className="px-5 py-2 bg-brand-maroon text-white text-xs font-bold rounded-lg">
            Sign In as Admin
          </Link>
          <Link to="/" className="px-5 py-2 bg-neutral-800 text-neutral-300 text-xs font-bold rounded-lg">
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Orders & Fulfillment', path: '/admin/orders', icon: Package },
    { label: 'Shiprocket Logistics', path: '/admin/shiprocket', icon: Truck, badge: 'SANDBOX' },
    { label: 'Product Catalog', path: '/admin/products', icon: ShoppingBag },
    { label: 'Coupons & Promos', path: '/admin/coupons', icon: Tag },
    { label: 'Customers', path: '/admin/customers', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#F4EFEA] flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-[#141414] text-white flex flex-col justify-between shrink-0 border-r border-neutral-800">
        <div>
          {/* Logo & Header */}
          <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2.5">
              <img src="/oct9-logo.jpg" alt="OCT9" className="h-8 w-auto rounded object-contain" />
              <div>
                <span className="font-serif text-lg font-bold tracking-widest text-white block leading-tight">OCT9</span>
                <span className="text-[8px] uppercase tracking-widest text-brand-gold font-bold">Admin Panel</span>
              </div>
            </Link>
            <span className="bg-brand-maroon text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
              v1.0
            </span>
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-maroon text-white shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                  }`
                }
              >
                <div className="flex items-center space-x-2.5">
                  <item.icon className="w-4 h-4 text-brand-gold" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] bg-red-600 text-white font-bold px-1.5 py-0.2 rounded uppercase">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-800 space-y-2">
          <Link
            to="/"
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg bg-neutral-900 text-neutral-300 hover:text-white text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4 text-brand-gold" />
            <span>View Public Boutique</span>
          </Link>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center space-x-2 px-3 py-2 text-red-400 hover:bg-neutral-900 rounded-lg text-xs font-semibold text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl">
        <Outlet />
      </main>
    </div>
  );
}
