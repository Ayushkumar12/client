import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Package,
  Heart,
  Truck,
  Sparkles,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { SEO } from '../components/common/SEO.jsx';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = (() => {
    const params = new URLSearchParams(location.search);
    const p = params.get('redirect');
    return p || '/account';
  })();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!agreeTerms) {
      setError('Please agree to the Terms & Privacy Policy to continue.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // Optional phone validation if filled
    if (formData.phone && !/^\d{10}$/.test(formData.phone.trim())) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password
      });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#FDFBF7] text-neutral-800 font-sans selection:bg-[#5A1827] selection:text-white">
      <SEO
        title="Create Account | OCT9 Fashion & Ethnic Wear"
        description="Create your OCT9 account for seamless shopping, live order tracking, and exclusive festive drop access."
      />

      {/* LEFT COLUMN: Editorial Fashion Lookbook Showcase (Desktop 50%) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-10 xl:p-14 overflow-hidden bg-[#181315] text-white">
        {/* Full-Height High-Fashion Visual */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1600&q=90"
            alt="OCT9 Royal Bridal & Festive Ethnic Wear"
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
            Bridal & Festive Edit
          </span>
        </div>

        {/* Bottom Editorial Content */}
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-[#E8CA85] font-semibold uppercase tracking-wider text-[11px]">
                Member Benefits
              </span>
              <span className="text-white/40">•</span>
              <span className="text-neutral-300 text-xs">OCT9 Customer Account</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white font-normal leading-snug">
              Curated ethnic wear, delivered straight to your doorstep.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-light">
              Create an account for one-click checkout, instant order tracking via SMS, and early notifications on new festive drops.
            </p>
          </div>

          {/* Genuine Retail Reassurance */}
          <div className="grid grid-cols-3 gap-3 border-t border-white/20 pt-4 text-xs">
            <div className="space-y-1">
              <p className="font-semibold text-white text-xs">Fast Shipping</p>
              <p className="text-[11px] text-neutral-300">Direct Courier Tracking</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-white text-xs">Hassle-Free</p>
              <p className="text-[11px] text-neutral-300">Easy Returns & Exchanges</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-white text-xs">Authentic</p>
              <p className="text-[11px] text-neutral-300">Direct from Artisans</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Auth Form Panel (50%) */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-6 sm:p-10 xl:p-14 bg-[#FAF8F5] overflow-y-auto">
        <div className="max-w-md w-full mx-auto flex flex-col justify-between flex-1">
          {/* Top Bar: Return to Store & Switch to Login */}
          <div className="flex items-center justify-between w-full pb-6">
            <Link
              to="/"
              className="inline-flex items-center space-x-2 text-xs font-medium text-neutral-600 hover:text-[#5A1827] px-3 py-1.5 rounded-sm bg-white border border-neutral-200 shadow-2xs hover:border-neutral-300 transition-all group"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-neutral-500 group-hover:-translate-x-0.5 group-hover:text-[#5A1827] transition-all" />
              <span>Return to Store</span>
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#5A1827] hover:text-[#43121D] px-3 py-1.5 rounded-sm bg-[#5A1827]/5 hover:bg-[#5A1827]/10 border border-[#5A1827]/20 transition-all group"
            >
              <span>Already have an account? Sign In</span>
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
                Create Your Account
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600">
                Join OCT9 to experience curated ethnic collections and seamless shopping.
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm flex items-start space-x-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Main Register Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    required
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Priya Sharma"
                    className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 bg-white border border-neutral-300 rounded-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#5A1827] focus:ring-1 focus:ring-[#5A1827] transition-all shadow-2xs"
                  />
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 bg-white border border-neutral-300 rounded-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#5A1827] focus:ring-1 focus:ring-[#5A1827] transition-all shadow-2xs"
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                  Mobile Number <span className="text-neutral-400 font-normal normal-case">(For order updates)</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-medium text-neutral-500 border-r border-neutral-200 pr-2 pointer-events-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    maxLength={10}
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="w-full text-xs sm:text-sm pl-14 pr-4 py-3 bg-white border border-neutral-300 rounded-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#5A1827] focus:ring-1 focus:ring-[#5A1827] transition-all shadow-2xs font-mono"
                  />
                  <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                  Password <span className="text-red-500">*</span> <span className="text-neutral-400 font-normal normal-case">(min. 6 characters)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
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

              <div className="py-1">
                <label className="flex items-start space-x-2.5 text-xs text-neutral-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="rounded-xs border-neutral-300 text-[#5A1827] focus:ring-[#5A1827] w-4 h-4 mt-0.5 cursor-pointer"
                  />
                  <span className="leading-snug">
                    I agree to OCT9's{' '}
                    <Link to="/" className="text-[#5A1827] font-medium hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/" className="text-[#5A1827] font-medium hover:underline">
                      Privacy Policy
                    </Link>
                  </span>
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
                    <span>Creating your account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4 text-white/90" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Navigation & Trust */}
          <div className="text-center space-y-2 pt-4 border-t border-neutral-200/80 text-xs text-neutral-500">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="text-[#5A1827] font-semibold hover:underline">
                Sign in instead
              </Link>
            </p>
            <p className="text-[11px] text-neutral-400">
              Your personal data is encrypted and never shared with third parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
