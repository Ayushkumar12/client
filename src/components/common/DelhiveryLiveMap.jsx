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

export function DelhiveryLiveMap({
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
        console.warn('Delhivery tracking fetch:', e);
      }
    }
    loadWaybillData();
  }, [waybill]);

  const activeWaybill = waybill || apiData?.waybill || '';
  const courierPartner = apiData?.courier || 'Delhivery Express';
  const serviceType = apiData?.service_type || 'Delhivery Surface & Air Express (Door-to-Door)';
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
          <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
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
                  <span>AWB: <strong className="font-mono text-neutral-900">{activeWaybill}</strong></span>
                  <button
                    onClick={copyAWB}
                    className="text-neutral-400 hover:text-neutral-700 p-0.5 transition-colors cursor-pointer"
                    title="Copy AWB"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {copiedAWB && <span className="text-[10px] text-emerald-600 font-semibold">Copied</span>}
                  <span>•</span>
                </>
              ) : (
                <span className="text-amber-700 font-medium">Manifesting Waybill...</span>
              )}
              <span className="text-neutral-500">{serviceType}</span>
            </div>
          </div>
        </div>

        {/* Expected Delivery Date & Refresh */}
        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <div className="text-left sm:text-right">
            <span className="text-[11px] text-neutral-500 block">Expected Delivery</span>
            <span className="text-sm font-bold text-neutral-900">{estDeliveryDate}</span>
          </div>

          {activeWaybill && (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 border border-neutral-300 hover:bg-neutral-100 rounded-xl text-neutral-600 transition-colors cursor-pointer"
              title="Refresh Delhivery tracking"
            >
              <RotateCcw className={`w-4 h-4 ${refreshing ? 'animate-spin text-brand-maroon' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Shipment Status Stepper with Milestone Scan Locations & Timestamps */}
      <div className="px-5 sm:px-6 py-4.5 bg-white border-b border-neutral-100">
        <OrderMilestoneTracker order={trackerOrder} customStatus={currentStatus} />
      </div>





      {/* Transit Route Details */}
      <div className="p-4 sm:p-5 bg-neutral-50 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-neutral-700">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
            Origin Facility
          </span>
          <p className="font-semibold text-neutral-900 mt-0.5">{originLocation}</p>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
            Destination Address
          </span>
          <p className="font-semibold text-neutral-900 mt-0.5">{destinationCity} - {destinationPincode}</p>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
            Official Delhivery Portal
          </span>
          {activeWaybill ? (
            <div className="flex flex-col space-y-1 mt-0.5">
              <a
                href={`https://www.delhivery.com/track/package/${activeWaybill}`}
                target="_blank"
                rel="noreferrer"
                className="text-brand-maroon hover:underline font-semibold text-xs inline-flex items-center space-x-1"
              >
                <span>Track on Delhivery.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : (
            <span className="text-neutral-400 text-xs">Awaiting Waybill Generation</span>
          )}
        </div>
      </div>
    </div>
  );
}
