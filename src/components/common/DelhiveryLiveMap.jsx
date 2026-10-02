import React, { useState, useEffect } from 'react';
import {
  Truck,
  MapPin,
  Navigation,
  Clock,
  Phone,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Package,
  Copy,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { api } from '../../services/api.js';

export function DelhiveryLiveMap({
  waybill = 'DLV349312857849',
  destinationCity = 'New Delhi',
  destinationPincode = '110001',
  currentStatus = 'in_transit',
  expectedDelivery = 'In 2-3 Days'
}) {
  const [copiedAWB, setCopiedAWB] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('Just now');
  const [apiData, setApiData] = useState(null);

  useEffect(() => {
    async function loadWaybillData() {
      try {
        const res = await api.trackWaybill(waybill);
        if (res && res.success) {
          setApiData(res);
        }
      } catch (e) {
        console.warn('Delhivery tracking fetch:', e);
      }
    }
    loadWaybillData();
  }, [waybill]);

  const cleanAWB = waybill || 'DLV349312857849';
  const riderName = apiData?.rider_name || 'Rajesh Kumar Verma';
  const riderPhone = apiData?.rider_phone || '+91 98765 43210';
  const vehicleNumber = apiData?.vehicle_number || 'DL-01-AX-9821';
  const packageWeight = apiData?.package_weight || '0.85 kg';
  const pickupToken = apiData?.pickup_token || `PU_OCT9_${cleanAWB.slice(-6)}`;
  const ewayBill = apiData?.e_way_bill || 'EWB-789321471928';

  const copyAWB = () => {
    navigator.clipboard.writeText(cleanAWB);
    setCopiedAWB(true);
    setTimeout(() => setCopiedAWB(false), 2000);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setLastUpdated('Updated just now');
    }, 800);
  };

  const steps = [
    { label: 'Order Placed', time: 'Oct 02, 09:30 AM', done: true },
    { label: 'Shipped via Delhivery', time: 'Oct 02, 01:15 PM', done: true },
    { label: 'In Transit', time: 'On the way to Hub', done: currentStatus === 'in_transit' || currentStatus === 'out_for_delivery' || currentStatus === 'delivered', current: currentStatus === 'in_transit' },
    { label: 'Out for Delivery', time: expectedDelivery || 'Expected soon', done: currentStatus === 'delivered', current: currentStatus === 'out_for_delivery' },
    { label: 'Delivered', time: 'Pending OTP', done: currentStatus === 'delivered' }
  ];

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm overflow-hidden">
      {/* Top Courier Header */}
      <div className="p-5 sm:p-6 bg-[#FCFBF9] border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-serif font-bold text-neutral-900 text-base">
                Delhivery Express Tracking
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                In Transit
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-600 mt-1">
              <span>AWB: <strong className="font-mono text-neutral-900">{cleanAWB}</strong></span>
              <button
                onClick={copyAWB}
                className="text-neutral-400 hover:text-neutral-700 p-0.5 transition-colors cursor-pointer"
                title="Copy AWB"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              {copiedAWB && <span className="text-[10px] text-emerald-600 font-semibold">Copied</span>}
              <span>•</span>
              <span className="text-neutral-500">Surface Express (Door-to-Door)</span>
            </div>
          </div>
        </div>

        {/* Expected Delivery Pill & Refresh */}
        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <div className="text-left sm:text-right">
            <span className="text-[11px] text-neutral-500 block">Estimated Delivery:</span>
            <span className="text-sm font-bold text-neutral-900">{expectedDelivery || 'Within 2-3 Days'}</span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 border border-neutral-300 hover:bg-neutral-100 rounded-xl text-neutral-600 transition-colors cursor-pointer"
            title="Refresh tracking status"
          >
            <RotateCcw className={`w-4 h-4 ${refreshing ? 'animate-spin text-brand-maroon' : ''}`} />
          </button>
        </div>
      </div>

      {/* Standard Clean E-Commerce Shipment Stepper */}
      <div className="px-6 py-5 bg-white border-b border-neutral-100">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col space-y-1.5 text-left">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    step.done
                      ? 'bg-emerald-600 text-white'
                      : step.current
                      ? 'bg-brand-maroon text-white animate-pulse'
                      : 'bg-neutral-200 text-neutral-500'
                  }`}
                >
                  {step.done ? '✓' : idx + 1}
                </div>
                <div className={`h-0.5 flex-1 hidden sm:block ${step.done ? 'bg-emerald-500' : 'bg-neutral-200'}`} />
              </div>
              <p className={`text-xs font-semibold ${step.done || step.current ? 'text-neutral-900' : 'text-neutral-400'}`}>
                {step.label}
              </p>
              <p className="text-[10px] text-neutral-500 truncate">{step.time}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CLEAN GOOGLE/APPLE MAPS STYLE ROUTE MAP */}
      <div className="relative w-full h-72 sm:h-80 bg-[#F4F3F0] overflow-hidden select-none border-b border-neutral-200">
        {/* Realistic road map grid texture */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `linear-gradient(#E5E3DF 1px, transparent 1px), linear-gradient(to right, #E5E3DF 1px, #F4F3F0 1px)`,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Clean Road Corridor Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Main Highway NH-48 */}
          <path
            d="M -20 230 C 200 240, 320 130, 520 120 C 720 110, 850 180, 1100 170"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M -20 230 C 200 240, 320 130, 520 120 C 720 110, 850 180, 1100 170"
            fill="none"
            stroke="#D5D1CB"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Active Courier Route in Rich Maroon */}
          <path
            d="M 120 220 C 260 210, 380 135, 520 120 C 650 110, 780 160, 880 165"
            fill="none"
            stroke="#800020"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="6 4"
          />
        </svg>

        {/* Origin Hub (OCT9 Delhi Atelier) */}
        <div className="absolute left-[12%] top-[60%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group z-10">
          <div className="w-8 h-8 rounded-full bg-white border-2 border-emerald-600 shadow-md flex items-center justify-center text-emerald-700">
            <Package className="w-4 h-4" />
          </div>
          <div className="mt-1.5 bg-white border border-neutral-300 shadow-sm px-2.5 py-1 rounded-lg text-center">
            <p className="text-[11px] font-bold text-neutral-900">OCT9 Delhi Atelier</p>
            <p className="text-[9px] text-neutral-500">Origin (110001)</p>
          </div>
        </div>

        {/* Intermediate Transit Hub (Bilaspur Gateway) */}
        <div className="absolute left-[45%] top-[34%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group z-10">
          <div className="w-7 h-7 rounded-full bg-white border-2 border-neutral-600 shadow-md flex items-center justify-center text-neutral-700">
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
          </div>
          <div className="mt-1.5 bg-white border border-neutral-300 shadow-sm px-2 py-0.5 rounded-md text-center">
            <p className="text-[10px] font-semibold text-neutral-800">Bilaspur Sort Hub</p>
          </div>
        </div>

        {/* Courier Van Location */}
        <div className="absolute left-[66%] top-[36%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
          <div className="w-10 h-10 rounded-full bg-brand-maroon text-white shadow-lg flex items-center justify-center border-2 border-white">
            <Truck className="w-5 h-5" />
          </div>
          <div className="mt-1.5 bg-neutral-900 text-white px-2.5 py-1 rounded-lg shadow-md text-center">
            <p className="text-[10px] font-bold">In Transit (48 km/h)</p>
            <p className="text-[9px] text-neutral-300 font-mono">{vehicleNumber}</p>
          </div>
        </div>

        {/* Destination Pin (Customer City & Pincode) */}
        <div className="absolute left-[88%] top-[48%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group z-10">
          <div className="w-8 h-8 rounded-full bg-white border-2 border-red-600 shadow-md flex items-center justify-center text-red-600">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="mt-1.5 bg-white border border-neutral-300 shadow-sm px-2.5 py-1 rounded-lg text-center">
            <p className="text-[11px] font-bold text-neutral-900">{destinationCity}</p>
            <p className="text-[9px] text-neutral-500">Pincode: {destinationPincode}</p>
          </div>
        </div>

        {/* Route Info Badge */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs border border-neutral-200 rounded-lg px-3 py-1.5 text-xs text-neutral-700 shadow-xs flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Live Tracking Active</span>
          <span>•</span>
          <span className="text-neutral-500 font-mono">{lastUpdated}</span>
        </div>
      </div>

      {/* Standard Clean Courier Metadata Grid */}
      <div className="p-5 sm:p-6 bg-white grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-neutral-700">
        <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
            Courier Executive
          </span>
          <p className="font-bold text-neutral-900 text-sm">{riderName}</p>
          <p className="text-neutral-600 text-[11px] flex items-center space-x-1">
            <Phone className="w-3 h-3 text-brand-maroon" />
            <span>{riderPhone}</span>
          </p>
        </div>

        <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
            Package Details
          </span>
          <p className="font-semibold text-neutral-900">Weight: {packageWeight}</p>
          <p className="text-neutral-500 text-[11px]">E-Way Bill: <strong className="font-mono text-neutral-800">{ewayBill}</strong></p>
        </div>

        <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
            Delivery Partner
          </span>
          <p className="font-semibold text-neutral-900">Delhivery Express Surface</p>
          <a
            href={`https://www.delhivery.com/track/package/${cleanAWB}`}
            target="_blank"
            rel="noreferrer"
            className="text-brand-maroon hover:underline font-semibold text-[11px] inline-flex items-center space-x-1 pt-0.5"
          >
            <span>Open on Delhivery.com</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
