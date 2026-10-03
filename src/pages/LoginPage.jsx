import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Lock, Mail, User, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { SEO } from '../components/common/SEO.jsx';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="bg-[#FAF7F2] min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <SEO title="Sign In | OCT9 Luxury Ethnic Wear" />

      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-brand-border shadow-luxury space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block">
            <img src="/oct9-logo.jpg" alt="OCT9 - Luxury Without Noise" className="h-14 w-auto mx-auto rounded-xl object-contain shadow-xs border border-neutral-200" />
          </Link>
          <h1 className="font-serif text-2xl font-bold text-neutral-900">Welcome to OCT9</h1>
          <p className="text-xs text-neutral-500">Sign in to manage your orders, wishlist, and shipping addresses</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="priya.sharma@gmail.com"
                className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:border-brand-maroon"
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:border-brand-maroon"
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#5A1827] hover:bg-[#43121D] disabled:bg-neutral-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-2xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In</span>}
          </button>
        </form>

        {/* Quick Access Portals */}
        <div className="bg-[#FAF7F2] border border-neutral-200/90 rounded-2xl p-4 text-xs space-y-2">
          <p className="font-bold text-neutral-800 text-[11px] uppercase tracking-wider">Quick Sign-In Accounts:</p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@oct9.com', 'admin123')}
              className="w-full text-left p-3 bg-white rounded-xl border border-neutral-200 hover:border-brand-maroon flex items-center justify-between shadow-2xs cursor-pointer transition-colors"
            >
              <div>
                <strong className="text-neutral-900 block text-xs">Admin Management Console</strong>
                <span className="text-[11px] text-neutral-500">admin@oct9.com (Shiprocket Logistics & Razorpay Admin)</span>
              </div>
              <span className="text-[11px] text-brand-maroon font-bold bg-[#FBF1F3] px-2 py-0.5 rounded">Autofill</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('customer@example.com', 'customer123')}
              className="w-full text-left p-3 bg-white rounded-xl border border-neutral-200 hover:border-brand-maroon flex items-center justify-between shadow-2xs cursor-pointer transition-colors"
            >
              <div>
                <strong className="text-neutral-900 block text-xs">Customer Account</strong>
                <span className="text-[11px] text-neutral-500">customer@example.com (Priya Sharma)</span>
              </div>
              <span className="text-[11px] text-brand-maroon font-bold bg-[#FBF1F3] px-2 py-0.5 rounded">Autofill</span>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-neutral-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-maroon font-bold hover:underline">
            Register for OCT9
          </Link>
        </div>
      </div>
    </div>
  );
}
