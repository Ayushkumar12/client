import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Package,
  Heart,
  Truck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { SEO } from '../components/common/SEO.jsx';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const from = (() => {
    // Support ?redirect=... query param (from checkout/orders gate)
    const params = new URLSearchParams(location.search);
    const redirectParam = params.get('redirect');
    if (redirectParam) return redirectParam;
    // Fall back to router state (e.g. PrivateRoute)
    return location.state?.from?.pathname || '/';
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSubmitted(true);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#FDFBF7] text-neutral-800 font-sans selection:bg-[#5A1827] selection:text-white">
      <SEO
        title="Sign In | OCT9 Fashion & Ethnic Wear"
        description="Sign in to your OCT9 account to track orders, manage saved addresses, and access your wishlist."
      />

      {/* LEFT COLUMN: Editorial Fashion Lookbook Showcase (Desktop 50%) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-10 xl:p-14 overflow-hidden bg-[#181315] text-white">
        {/* Full-Height High-Fashion Visual */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1600&q=90"
            alt="OCT9 Festive Ethnic Wear Collection"
            className="w-full h-full object-cover object-center scale-102"
          />
          {/* Subtle natural vignette & gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />
        </div>

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <img
              src="/oct9-logo.jpg"
              alt="OCT9"
              className="h-10 w-auto rounded-lg object-contain shadow-md border border-white/20 transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-widest text-white leading-tight">
                OCT9
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#E8CA85] font-medium">
                Ethnic & Designer Wear
              </span>
            </div>
          </Link>

          <span className="text-xs uppercase tracking-widest text-[#E8CA85] font-medium">
            Spring / Festive Collection
          </span>
        </div>

        {/* Bottom Editorial Content */}
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-[#E8CA85] font-semibold uppercase tracking-wider text-[11px]">
                Featured Collection
              </span>
              <span className="text-white/40">•</span>
              <span className="text-neutral-300 text-xs">Suit Sets & Sarees</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white font-normal leading-snug">
              Handcrafted ethnic wear for every festive occasion.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-light">
              Sign in to manage your orders, access your saved wishlist, and enjoy express checkout across India.
            </p>
          </div>

          {/* Genuine Retail Reassurance */}
          <div className="grid grid-cols-3 gap-3 border-t border-white/20 pt-4 text-xs">
            <div className="space-y-1">
              <p className="font-semibold text-white text-xs">Express Delivery</p>
              <p className="text-[11px] text-neutral-300">Live Shiprocket Tracking</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-white text-xs">Easy Exchanges</p>
              <p className="text-[11px] text-neutral-300">7-Day Doorstep Pickup</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-white text-xs">100% Genuine</p>
              <p className="text-[11px] text-neutral-300">Artisan Crafted Fabrics</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Auth Form Panel (50%) */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-6 sm:p-10 xl:p-14 bg-[#FAF8F5] overflow-y-auto">
        <div className="max-w-md w-full mx-auto flex flex-col justify-between flex-1">
          {/* Top Bar: Return to Store & Switch to Register */}
          <div className="flex items-center justify-between w-full pb-6">
            <Link
              to="/"
              className="inline-flex items-center space-x-2 text-xs font-medium text-neutral-600 hover:text-[#5A1827] px-3 py-1.5 rounded-sm bg-white border border-neutral-200 shadow-2xs hover:border-neutral-300 transition-all group"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-neutral-500 group-hover:-translate-x-0.5 group-hover:text-[#5A1827] transition-all" />
              <span>Return to Store</span>
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#5A1827] hover:text-[#43121D] px-3 py-1.5 rounded-sm bg-[#5A1827]/5 hover:bg-[#5A1827]/10 border border-[#5A1827]/20 transition-all group"
            >
              <span>Create Account</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#5A1827] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Form Container Card */}
          <div className="w-full my-auto py-4 space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <div className="lg:hidden flex items-center space-x-2.5 mb-3">
                <img src="/oct9-logo.jpg" alt="OCT9" className="h-9 w-auto rounded-lg object-contain border border-neutral-200" />
                <span className="font-serif text-xl font-bold tracking-widest text-neutral-900">OCT9</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-neutral-900 tracking-tight">
                Welcome Back
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600">
                Sign in with your email and password to access your account.
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm flex items-start space-x-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Main Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 bg-white border border-neutral-300 rounded-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#5A1827] focus:ring-1 focus:ring-[#5A1827] transition-all shadow-2xs"
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setForgotSubmitted(false);
                      setShowForgotModal(true);
                    }}
                    className="text-xs text-[#5A1827] hover:underline font-medium cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs sm:text-sm pl-10 pr-11 py-3 bg-white border border-neutral-300 rounded-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#5A1827] focus:ring-1 focus:ring-[#5A1827] transition-all shadow-2xs"
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <label className="flex items-center space-x-2 text-xs text-neutral-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded-xs border-neutral-300 text-[#5A1827] focus:ring-[#5A1827] w-4 h-4 cursor-pointer"
                  />
                  <span>Keep me signed in</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#5A1827] hover:bg-[#43121D] disabled:opacity-60 text-white font-medium text-xs sm:text-sm rounded-sm shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 text-white/90" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Navigation & Trust */}
          <div className="text-center space-y-2 pt-4 border-t border-neutral-200/80 text-xs text-neutral-500">
            <p>
              Don't have an account yet?{' '}
              <Link to="/register" className="text-[#5A1827] font-semibold hover:underline">
                Create an account
              </Link>
            </p>
            <p className="text-[11px] text-neutral-400">
              By signing in, you agree to our Terms of Service & Privacy Policy.
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-sm max-w-md w-full p-6 shadow-2xl border border-neutral-200 relative animate-scaleUp">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="w-9 h-9 rounded-sm bg-[#5A1827]/10 flex items-center justify-center text-[#5A1827]">
                <Mail className="w-5 h-5" />
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold text-neutral-900">Reset Your Password</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Enter your registered email address. We'll send instructions to reset your password.
                </p>
              </div>

              {forgotSubmitted ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-sm space-y-2 text-xs">
                  <div className="flex items-center space-x-2 font-semibold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Reset Link Dispatched</span>
                  </div>
                  <p>
                    If an account exists for <strong>{forgotEmail}</strong>, password reset instructions have been sent to your inbox.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="mt-2 w-full py-2 bg-emerald-700 text-white rounded-sm font-medium hover:bg-emerald-800 transition-colors"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-white border border-neutral-300 rounded-sm text-neutral-900 focus:outline-none focus:border-[#5A1827] focus:ring-1 focus:ring-[#5A1827]"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="flex-1 py-2.5 border border-neutral-300 text-neutral-700 font-medium text-xs rounded-sm hover:bg-neutral-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-[#5A1827] hover:bg-[#43121D] text-white font-medium text-xs rounded-sm transition-colors cursor-pointer"
                    >
                      Send Reset Link
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
