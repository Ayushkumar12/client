import React, { useState, useEffect } from 'react';
import {
  Truck,
  MapPin,
  Clock,
  RotateCcw,
  Package,
  Copy,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { api } from '../../services/api.js';
import { OrderMilestoneTracker } from './OrderMilestoneTracker.jsx';

export function ShiprocketLiveMap({
  waybill,
  destinationCity = 'New Delhi',
  destinationPincode = '110001',
  currentStatus = 'manifested',
  expectedDelivery = 'In 2-3 Days'
}) {
  const [copiedAWB, setCopiedAWB] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [apiData, setApiData] = useState(null);

  useEffect(() => {
    async function loadWaybillData() {
      if (!waybill) return;
      try {
        const res = await api.trackWaybill(waybill);
        if (res && res.success) {
          setApiData(res);
        }
      } catch (e) {
        console.warn('Shiprocket tracking fetch:', e);
      }
    }
    loadWaybillData();
  }, [waybill]);

  const activeWaybill = waybill || apiData?.waybill || '';
  const courierPartner = apiData?.courier || 'Shiprocket Express Multi-Carrier';
  const serviceType = apiData?.service_type || 'Shiprocket Multi-Carrier Surface & Air Express';
  const originLocation = apiData?.origin || 'OCT9 Central Hub, New Delhi (110020)';
  const deliveryStatusText = apiData?.current_status || (currentStatus === 'manifested' ? 'Manifested & Assigned' : 'In Transit');
  const estDeliveryDate = apiData?.expected_delivery || expectedDelivery || 'Within 2-3 Days';

  const copyAWB = () => {
    if (!activeWaybill) return;
    navigator.clipboard.writeText(activeWaybill);
    setCopiedAWB(true);
    setTimeout(() => setCopiedAWB(false), 2000);
  };

  const handleRefresh = async () => {
    if (!activeWaybill) return;
    setRefreshing(true);
    try {
      const res = await api.trackWaybill(activeWaybill);
      if (res && res.success) {
        setApiData(res);
      }
    } catch (e) {
      console.warn('Refresh error:', e);
    } finally {
      setRefreshing(false);
    }
  };

  const trackerOrder = {
    delhivery_waybill: activeWaybill,
    order_status: currentStatus,
    delhivery_status: apiData?.current_status || currentStatus,
    shipping_address: {
      city: destinationCity,
      pincode: destinationPincode
    },
    delhivery_expected_date: estDeliveryDate
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
      {/* Top Header */}
      <div className="p-5 sm:p-6 bg-[#FCFBF9] border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-serif font-bold text-neutral-900 text-base">
                {courierPartner}
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
                {deliveryStatusText}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-600 mt-1">
              {activeWaybill ? (
                <>
                  <span className="font-medium">Shiprocket AWB:</span>
                  <span className="font-mono font-bold text-neutral-900">{activeWaybill}</span>
                  <button
                    onClick={copyAWB}
                    className="p-1 hover:bg-neutral-100 rounded text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                    title="Copy AWB Number"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {copiedAWB && (
                    <span className="text-[10px] text-emerald-600 font-bold animate-fadeIn">Copied!</span>
                  )}
                </>
              ) : (
                <span className="text-neutral-500 italic">AWB Allocation in progress</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Status Badges */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="text-right">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-semibold">Expected By</span>
            <span className="text-xs sm:text-sm font-bold text-neutral-900">{estDeliveryDate}</span>
          </div>
          {activeWaybill && (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh Shiprocket tracking"
            >
              <RotateCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Origin -> Destination Route Strip */}
      <div className="px-5 sm:px-6 py-3.5 bg-neutral-50/70 border-b border-neutral-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-neutral-700">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
          <span><strong>Origin Hub:</strong> {originLocation}</span>
        </div>
        <div className="flex items-center space-x-2 text-neutral-700">
          <MapPin className="w-4 h-4 text-brand-maroon shrink-0" />
          <span><strong>Destination:</strong> {destinationCity} ({destinationPincode})</span>
        </div>
      </div>

      {/* Visual Milestone Tracker */}
      <div className="p-5 sm:p-6">
        <OrderMilestoneTracker order={trackerOrder} />
      </div>

      {/* Footer Info Strip */}
      <div className="px-5 sm:px-6 py-3 bg-[#FAF7F2] border-t border-neutral-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-500">
        <div className="flex items-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Verified Shiprocket Logistics & OTP Verified Handover</span>
        </div>
        {activeWaybill && (
          <a
            href={`https://shiprocket.co/tracking/${activeWaybill}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-maroon font-semibold hover:underline inline-flex items-center space-x-1"
          >
            <span>Track on Shiprocket Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}

// Backward compatibility alias
export const DelhiveryLiveMap = ShiprocketLiveMap;
