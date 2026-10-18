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
  Boxes,
  Mail,
  Database,
  Compass,
  Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export function AdminLayout() {
  const { user, isAdmin, loading: authLoading, logout, siteMode, updateSiteMode } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4 space-y-3 font-sans">
        <div className="w-8 h-8 border-2 border-neutral-400 border-t-white rounded-full animate-spin" />
        <p className="text-xs text-neutral-400">Verifying administrator session...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4 space-y-4 font-sans">
        <ShieldCheck className="w-12 h-12 text-red-500" />
        <h1 className="font-sans text-2xl font-bold">Admin Access Required</h1>
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
    { label: 'SEO & GEO Command Center', path: '/admin/seo', icon: Globe },
    { label: 'Inventory Management', path: '/admin/inventory', icon: Boxes },
    { label: 'Customer Inquiries', path: '/admin/inquiries', icon: Mail },
    { label: 'Header Navigation', path: '/admin/navigation', icon: Compass },
    { label: 'Site Content & Policies', path: '/admin/content', icon: Palette },
    { label: 'Analytics & Ratings', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Orders & Fulfillment', path: '/admin/orders', icon: Package },
    { label: 'Returns & Exchanges', path: '/admin/returns', icon: RotateCcw },
    { label: 'Shiprocket Logistics', path: '/admin/shiprocket', icon: Truck },
    { label: 'Product Catalog', path: '/admin/products', icon: ShoppingBag },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Database & Reset', path: '/admin/database', icon: Database },
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
        {/* Store Live / Under Development Global Status Indicator */}
        <div className="mb-6 bg-white border border-neutral-200 rounded-md p-3 px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                siteMode === 'live' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'
              }`}
            />
            <div>
              <div className="text-xs font-bold text-neutral-900 tracking-wide uppercase flex items-center gap-1.5">
                <span>Store Status:</span>
                <span
                  className={
                    siteMode === 'live'
                      ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200'
                      : 'text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200'
                  }
                >
                  {siteMode === 'live' ? 'LIVE (Open to Public)' : 'UNDER DEVELOPMENT (Launch Page Active)'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {siteMode === 'live'
                  ? 'All customers can browse collections, add to cart, and checkout.'
                  : 'Visitors see the launch countdown announcement. Only logged-in administrators can preview.'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {siteMode === 'live' ? (
              <button
                onClick={async () => {
                  if (window.confirm('Set store back to Under Development mode? Public visitors will see the launch page.')) {
                    await updateSiteMode('under_development');
                  }
                }}
                className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
              >
                Set Under Development
              </button>
            ) : (
              <button
                onClick={async () => {
                  if (window.confirm('Set store to LIVE? All customers will immediately see the full storefront.')) {
                    await updateSiteMode('live');
                  }
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
              >
                Publish Store as Live
              </button>
            )}
            <Link
              to="/admin/content"
              className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-300 rounded text-xs font-medium transition-colors"
            >
              Page Statuses
            </Link>
          </div>
        </div>

        <React.Suspense
          fallback={
            <div className="flex-1 flex flex-col items-center justify-center p-16 text-neutral-500">
              <div className="w-7 h-7 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin mb-3"></div>
              <span className="text-xs font-mono tracking-wider uppercase">Loading Module...</span>
            </div>
          }
        >
          <Outlet />
        </React.Suspense>
      </main>
    </div>
  );
}
