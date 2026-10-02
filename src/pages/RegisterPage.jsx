import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { SEO } from '../components/common/SEO.jsx';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/account');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF7F2] min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <SEO title="Create Account | OCT9 Luxury Ethnic Wear" />

      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-brand-border shadow-luxury space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block">
            <img src="/oct9-logo.jpg" alt="OCT9 - Luxury Without Noise" className="h-14 w-auto mx-auto rounded-xl object-contain shadow-xs border border-neutral-200" />
          </Link>
          <h1 className="font-serif text-2xl font-bold text-neutral-900">Join the OCT9 Circle</h1>
          <p className="text-xs text-neutral-500">Create an account for personalized styling, order tracking, and fast checkout</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Full Name *</label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ananya Mehra"
                className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:border-brand-maroon"
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Email Address *</label>
            <div className="relative">
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ananya@example.com"
                className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:border-brand-maroon"
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Mobile Number (for Delhivery updates)</label>
            <div className="relative">
              <input
                type="tel"
                maxLength={10}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="9876543210"
                className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:border-brand-maroon"
              />
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Password *</label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 6 characters"
                className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:border-brand-maroon"
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-maroon hover:bg-brand-maroon-hover disabled:bg-neutral-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create OCT9 Account</span>}
          </button>
        </form>

        <div className="text-center text-xs text-neutral-600">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-maroon font-bold hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
