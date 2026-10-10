import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  RotateCcw,
  Truck,
  Users,
  BarChart3,
  ArrowLeft,
  ShieldCheck,
  LogOut,
  Palette,
  Boxes
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export function AdminLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4 space-y-4 font-sans">
        <ShieldCheck className="w-12 h-12 text-red-500" />
        <h1 className="font-serif text-2xl font-bold">Admin Access Required</h1>
        <p className="text-xs text-neutral-400">Please sign in with administrator credentials (admin@oct9.com).</p>
        <div className="flex space-x-3 pt-2">
          <Link to="/login" className="px-4 py-2 bg-neutral-100 text-neutral-900 text-xs font-semibold rounded-md hover:bg-white">
            Sign In as Admin
          </Link>
          <Link to="/" className="px-4 py-2 bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-semibold rounded-md hover:bg-neutral-800">
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Inventory Management', path: '/admin/inventory', icon: Boxes },
    { label: 'Site Content & Policies', path: '/admin/content', icon: Palette },
    { label: 'Analytics & Ratings', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Orders & Fulfillment', path: '/admin/orders', icon: Package },
    { label: 'Returns & Exchanges', path: '/admin/returns', icon: RotateCcw },
    { label: 'Shiprocket Logistics', path: '/admin/shiprocket', icon: Truck },
    { label: 'Product Catalog', path: '/admin/products', icon: ShoppingBag },
    { label: 'Customers', path: '/admin/customers', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Navigation Bar */}
      <div className="md:hidden bg-neutral-950 text-white border-b border-neutral-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="flex items-center space-x-2">
          <img src="/oct9-logo.jpg" alt="OCT9" className="h-6 w-auto rounded object-contain" />
          <span className="font-bold text-sm tracking-wide">OCT9 Admin</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-300 text-xs font-medium border border-neutral-800 flex items-center gap-1.5"
          aria-label="Toggle menu"
        >
          <span>{mobileOpen ? 'Close Menu' : 'Admin Menu'}</span>
        </button>
      </div>

      {/* Admin Sidebar - Responsive Drawer for Mobile / Static for Desktop */}
      <aside
        className={`${
          mobileOpen ? 'block' : 'hidden'
        } md:flex w-full md:w-60 bg-neutral-950 text-white flex-col justify-between shrink-0 border-r border-neutral-800 fixed md:sticky top-[49px] md:top-0 h-[calc(100vh-49px)] md:h-screen z-30 overflow-y-auto`}
      >
        <div>
          {/* Desktop Header */}
          <div className="hidden md:flex p-4 border-b border-neutral-800 items-center justify-between">
            <Link to="/" className="flex items-center space-x-2.5">
              <img src="/oct9-logo.jpg" alt="OCT9" className="h-7 w-auto rounded object-contain" />
              <div>
                <span className="font-bold text-sm text-white block leading-tight tracking-wide">OCT9</span>
                <span className="text-[10px] text-neutral-400 font-medium">Administration</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-2 space-y-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-neutral-800 text-white font-semibold'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                  }`
                }
              >
                <item.icon className="w-4 h-4 shrink-0 text-neutral-400" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-neutral-800 space-y-1">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="w-full flex items-center space-x-2 px-3 py-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-900 text-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </Link>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center space-x-2 px-3 py-1.5 text-red-400 hover:bg-neutral-900 rounded-md text-xs transition-colors text-left cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-3.5 sm:p-6 md:p-8 overflow-y-auto max-w-7xl w-full">
        <Outlet />
      </main>
    </div>
  );
}
