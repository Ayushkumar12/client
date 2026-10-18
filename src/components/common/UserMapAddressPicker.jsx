import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Search,
  Check,
  Loader2,
  LocateFixed,
  X
} from 'lucide-react';

// Indian state mappings for clean text standardization
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry'
];

function cleanIndianState(rawState) {
  if (!rawState) return 'Delhi';
  const match = INDIAN_STATES.find(s => s.toLowerCase() === rawState.toLowerCase());
  return match || rawState;
}

// Extract customer-friendly address components (pure text, no coordinates)
function extractCustomerAddress(data) {
  if (!data || !data.address) return null;
  const addr = data.address;

  // 1. House / Flat / Building
  const building = [
    addr.house_number ? (addr.house_number.toLowerCase().includes('flat') || addr.house_number.toLowerCase().includes('plot') ? addr.house_number : `Flat / Plot ${addr.house_number}`) : '',
    addr.building,
    addr.house_name,
    addr.residential,
    addr.amenity
  ].filter(Boolean)[0] || '';

  // 2. Road / Street / Main Avenue
  const road = [
    addr.road,
    addr.street,
    addr.pedestrian,
    addr.commercial
  ].filter(Boolean)[0] || '';

  // 3. Locality / Sector / Colony / Suburb
  const locality = [
    addr.suburb,
    addr.neighbourhood,
    addr.quarter,
    addr.city_district
  ].filter(Boolean)[0] || '';

  // 4. City / Town
  const city = addr.city || addr.town || addr.municipality || addr.village || addr.suburb || 'New Delhi';

  // 5. State
  const state = cleanIndianState(addr.state || 'Delhi');

  // 6. PIN Code (6 digits)
  let pincode = String(addr.postcode || '').trim();
  const pinMatch = pincode.match(/\b\d{6}\b/);
  if (pinMatch) pincode = pinMatch[0];

  // Address Line 1: Building + Road
  const line1Parts = [building, road].filter(Boolean);
  const address_line1 = line1Parts.length > 0
    ? Array.from(new Set(line1Parts)).join(', ')
    : (road || locality || city);

  // Address Line 2: Locality / Colony / Sector
  const address_line2 = locality && locality !== road && locality !== city ? locality : '';

  return {
    address_line1,
    address_line2,
    city,
    state,
    pincode,
    full_text: data.display_name || [address_line1, address_line2, city, state, pincode].filter(Boolean).join(', ')
  };
}

export function UserMapAddressPicker({
  initialPincode = '',
  initialCity = '',
  onSelectAddress,
  onClose
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [lat, setLat] = useState(28.5535);
  const [lng, setLng] = useState(77.2066);
  const [mapReady, setMapReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [geolocating, setGeolocating] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState(null);

  // Load Leaflet CSS and JS dynamically if not already on the page
  useEffect(() => {
    let isMounted = true;

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const initMap = () => {
      if (!isMounted || !mapContainerRef.current || mapInstanceRef.current) return;
      try {
        const L = window.L;
        const initialZoom = 15;
        const map = L.map(mapContainerRef.current, {
          center: [lat, lng],
          zoom: initialZoom,
          zoomControl: true,
          attributionControl: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);

        const customIcon = L.divIcon({
          className: 'custom-map-pin',
          html: `
            <div style="background-color: #5A1827; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid #ffffff;">
              <div style="width: 10px; height: 10px; background-color: #ffffff; border-radius: 50%; transform: rotate(45deg);"></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -28]
        });

        const marker = L.marker([lat, lng], { draggable: true, icon: customIcon }).addTo(map);
        marker.bindPopup('<strong>Delivery Location</strong><br>Drag pin or tap map to update your address.').openPopup();

        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          reverseGeocode(pos.lat, pos.lng);
        });

        map.on('click', (e) => {
          marker.setLatLng(e.latlng);
          reverseGeocode(e.latlng.lat, e.latlng.lng);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
        setMapReady(true);

        // Initial reverse geocode
        reverseGeocode(lat, lng);

        setTimeout(() => {
          map.invalidateSize();
        }, 300);
      } catch (err) {
        console.error('Leaflet user map init error:', err);
      }
    };

    if (window.L) {
      initMap();
    } else {
      let script = document.getElementById('leaflet-js');
      if (script) {
        script.addEventListener('load', initMap);
      } else {
        script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.onload = () => initMap();
        document.body.appendChild(script);
      }
    }

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Reverse Geocoding helper (pure text, no coordinates shown to user)
  const reverseGeocode = async (targetLat, targetLng) => {
    setResolving(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${targetLat}&lon=${targetLng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        const extracted = extractCustomerAddress(data);
        if (extracted) {
          setResolvedAddress(extracted);
        }
      }
    } catch (e) {
      console.warn('Reverse geocoding error:', e);
    } finally {
      setResolving(false);
    }
  };

  // Search by text query (e.g. colony name, landmark, road)
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const q = `${searchQuery.trim()}, India`;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const item = data[0];
          const newLat = parseFloat(item.lat);
          const newLng = parseFloat(item.lon);
          setLat(newLat);
          setLng(newLng);

          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setView([newLat, newLng], 16);
            markerRef.current.setLatLng([newLat, newLng]);
            markerRef.current.bindPopup(`<strong>${item.display_name.split(',')[0]}</strong>`).openPopup();
          }
          const extracted = extractCustomerAddress(item);
          if (extracted) {
            setResolvedAddress(extracted);
          } else {
            reverseGeocode(newLat, newLng);
          }
        } else {
          alert('Location not found. Please try searching with a landmark, area name, or city.');
        }
      }
    } catch (err) {
      console.warn('Search geocode failed:', err);
    } finally {
      setSearching(false);
    }
  };

  // Detect current GPS location
  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeolocating(false);
        const newLat = pos.coords.latitude;
        const newLng = pos.coords.longitude;
        setLat(newLat);
        setLng(newLng);

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([newLat, newLng], 17);
          markerRef.current.setLatLng([newLat, newLng]);
          markerRef.current.bindPopup('<strong>Your Current Device Location</strong>').openPopup();
        }
        reverseGeocode(newLat, newLng);
      },
      (err) => {
        setGeolocating(false);
        alert(`Could not detect location: ${err.message}. Please search your area manually.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleApplyAddress = () => {
    if (!resolvedAddress) return;
    if (onSelectAddress) {
      onSelectAddress({
        address_line1: resolvedAddress.address_line1 || '',
        address_line2: resolvedAddress.address_line2 || '',
        city: resolvedAddress.city || '',
        state: resolvedAddress.state || '',
        pincode: resolvedAddress.pincode || ''
      });
    }
    if (onClose) onClose();
  };

  return (
    <div className="bg-white border border-neutral-300 rounded-sm shadow-sm overflow-hidden font-sans space-y-3 p-4">
      {/* Top Header: Title & Close Button */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-2.5">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-[#5A1827]" />
          <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-neutral-900">
            Pick Delivery Address on Map
          </h3>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
            title="Close Map"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <p className="text-xs text-neutral-600 leading-relaxed">
        Tap the map, drag the pin, or search your landmark. Your address text will be auto-filled into the form and remains <strong>fully changeable</strong>.
      </p>

      {/* Search Bar & GPS Trigger */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search apartment, road, landmark, or sector..."
              className="w-full text-xs p-2 pl-7 border border-neutral-300 rounded-sm bg-white focus:outline-none focus:border-neutral-900 font-sans"
            />
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 top-2.5 pointer-events-none" />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-3 py-2 text-xs font-semibold bg-neutral-900 text-white rounded-sm hover:bg-neutral-800 disabled:opacity-50 cursor-pointer flex items-center gap-1 shrink-0 transition-colors"
          >
            {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Find</span>
          </button>
        </form>

        <button
          type="button"
          onClick={handleUseGPS}
          disabled={geolocating}
          className="px-3 py-2 text-xs font-medium border border-neutral-300 bg-white hover:bg-neutral-100 rounded-sm text-neutral-800 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer transition-colors"
          title="Detect Current GPS Location"
        >
          {geolocating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-600" />
          ) : (
            <LocateFixed className="w-3.5 h-3.5 text-emerald-700" />
          )}
          <span>Use Current Location</span>
        </button>
      </div>

      {/* Map Canvas Container */}
      <div className="relative border border-neutral-300 rounded-sm overflow-hidden bg-neutral-100">
        <div ref={mapContainerRef} style={{ height: '260px', width: '100%', zIndex: 10 }} />
        {!mapReady && (
          <div className="absolute inset-0 bg-neutral-100 flex flex-col items-center justify-center z-20 space-y-2">
            <Loader2 className="w-5 h-5 animate-spin text-neutral-600" />
            <p className="text-xs text-neutral-500">Loading map...</p>
          </div>
        )}
        {resolving && (
          <div className="absolute top-2 right-2 z-20 bg-white/95 px-2.5 py-1 rounded border border-neutral-300 text-[11px] font-medium text-neutral-700 flex items-center gap-1.5 shadow-2xs">
            <Loader2 className="w-3 h-3 animate-spin text-[#5A1827]" />
            <span>Resolving address...</span>
          </div>
        )}
      </div>

      {/* Resolved Address Text Card (Pure Text, NO Lat/Lng Coordinates) */}
      {resolvedAddress && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-sm p-3 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600" />
              Resolved Address Text (Changeable)
            </span>
            {resolvedAddress.pincode && (
              <span className="bg-neutral-200 text-neutral-800 font-mono text-[11px] px-2 py-0.5 rounded-sm font-semibold">
                PIN: {resolvedAddress.pincode}
              </span>
            )}
          </div>

          <div className="space-y-1 text-neutral-800 bg-white p-2.5 border border-neutral-200 rounded-sm">
            <p className="font-semibold text-neutral-900">
              {resolvedAddress.address_line1 || 'Street Address detected'}
            </p>
            {resolvedAddress.address_line2 && (
              <p className="text-neutral-600">{resolvedAddress.address_line2}</p>
            )}
            <p className="text-neutral-700 font-medium">
              {resolvedAddress.city}, {resolvedAddress.state} {resolvedAddress.pincode ? `- ${resolvedAddress.pincode}` : ''}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
            <p className="text-[11px] text-neutral-500">
              Click apply to transfer this address to your form. You can modify any field (e.g. add flat or floor number).
            </p>
            <button
              type="button"
              onClick={handleApplyAddress}
              className="px-4 py-2 bg-[#5A1827] hover:bg-[#43121D] text-white text-xs font-bold uppercase tracking-wider rounded-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Address to Form</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMapAddressPicker;
