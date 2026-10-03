import React, { useState } from 'react';
import { Truck, CheckCircle2, AlertCircle, Clock, MapPin, Loader2, ShieldCheck, Zap } from 'lucide-react';
import { api } from '../../services/api.js';

export function ShiprocketPincodeChecker({ onCheckSuccess = null }) {
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleCheck = async (e) => {
    e.preventDefault();
    const clean = pincode.trim();
    if (!/^\d{6}$/.test(clean)) {
      setError('Please enter a valid 6-digit PIN code.');
      setResult(null);
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await api.checkPincode(clean);
      if (data.serviceable) {
        setResult(data);
        if (onCheckSuccess) onCheckSuccess(data);
      } else {
        setError(data.message || 'Sorry, this pincode is currently not serviceable.');
      }
    } catch (err) {
      setError('Could not verify serviceability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF7F2] border border-brand-border rounded-xl p-4 my-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Truck className="w-4 h-4 text-brand-maroon" />
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-800">
            Shiprocket Express Delivery Check
          </span>
        </div>
        <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded uppercase">
          LIVE API
        </span>
      </div>

      <form onSubmit={handleCheck} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            maxLength={6}
            value={pincode}
            onChange={(e) => {
              setPincode(e.target.value.replace(/\D/g, ''));
              setError('');
            }}
            placeholder="Enter Delivery Pincode (e.g. 110001)"
            className="w-full text-xs sm:text-sm pl-8 pr-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-brand-maroon"
          />
          <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
        </div>

        <button
          type="submit"
          disabled={loading || pincode.length < 6}
          className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-400 text-white text-xs font-semibold rounded-lg flex items-center space-x-1 transition-colors cursor-pointer"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Check'}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mt-2.5 flex items-center space-x-1.5 text-xs text-red-600">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Result */}
      {result && (
        <div className="mt-3 pt-3 border-t border-brand-border/60 text-xs space-y-1.5 animate-fadeIn">
          <div className="flex items-center text-emerald-800 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600 shrink-0" />
            <span>Serviceable in {result.city}, {result.state} ({result.pincode})</span>
          </div>
          
          <div className="flex items-center text-neutral-700 text-[11px] pl-5">
            <Clock className="w-3 h-3 mr-1.5 text-brand-gold-dark shrink-0" />
            <span>Estimated Delivery by <strong>{result.delivery_date || '2-3 Business Days'}</strong></span>
          </div>

          <div className="text-[11px] text-neutral-600 pl-5 flex flex-wrap gap-x-3 gap-y-1">
            <span>• Cash on Delivery: <strong className="text-neutral-900">{result.cod_available ? 'Available' : 'Prepaid Only'}</strong></span>
            <span>• Courier Partner: <strong className="text-neutral-900">{result.courier_partner || 'Shiprocket Multi-Carrier'}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}

// Backward compatibility alias
export const DelhiveryPincodeChecker = ShiprocketPincodeChecker;
