import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Search,
  ExternalLink,
  Check,
  Loader2,
  LocateFixed
} from 'lucide-react';

// ISO 3166-2 State & Union Territory mapping for India (Required for standard GEO meta tags)
const INDIAN_STATE_CODES = {
  'delhi': 'IN-DL',
  'national capital territory of delhi': 'IN-DL',
  'nct of delhi': 'IN-DL',
  'maharashtra': 'IN-MH',
  'karnataka': 'IN-KA',
  'tamil nadu': 'IN-TN',
  'uttar pradesh': 'IN-UP',
  'gujarat': 'IN-GJ',
  'rajasthan': 'IN-RJ',
  'west bengal': 'IN-WB',
  'haryana': 'IN-HR',
  'punjab': 'IN-PB',
  'telangana': 'IN-TG',
  'andhra pradesh': 'IN-AP',
  'kerala': 'IN-KL',
  'madhya pradesh': 'IN-MP',
  'bihar': 'IN-BR',
  'odisha': 'IN-OR',
  'assam': 'IN-AS',
  'jharkhand': 'IN-JH',
  'chhattisgarh': 'IN-CT',
  'uttarakhand': 'IN-UT',
  'himachal pradesh': 'IN-HP',
  'goa': 'IN-GA',
  'jammu and kashmir': 'IN-JK',
  'ladakh': 'IN-LA',
  'chandigarh': 'IN-CH',
  'puducherry': 'IN-PY',
  'goa': 'IN-GA'
};

// Helper to extract clean and structured address components from OpenStreetMap Nominatim
function extractAddressComponents(data, lat, lng) {
  if (!data || !data.address) return null;
  const addr = data.address;

  // 1. Specific building, house number, office, shop, or landmark
  const building = [
    addr.building,
    addr.house_name,
    addr.house_number ? (addr.house_number.toLowerCase().includes('plot') ? addr.house_number : `Plot ${addr.house_number}`) : '',
    addr.shop,
    addr.amenity,
    addr.office
  ].filter(Boolean)[0] || '';

  // 2. Road, Street, Industrial Area, Commercial Hub
  const road = [
    addr.road,
    addr.street,
    addr.industrial,
    addr.commercial,
    addr.pedestrian
  ].filter(Boolean)[0] || '';

  // 3. Locality, Suburb, Neighbourhood, Sector
  const locality = [
    addr.neighbourhood,
    addr.suburb,
    addr.quarter,
    addr.residential,
    addr.city_district
  ].filter(Boolean)[0] || '';

  // 4. City / Town
  const city = addr.city || addr.town || addr.municipality || addr.village || addr.suburb || addr.district || 'New Delhi';

  // 5. State & ISO Region (e.g. IN-DL)
  const state = addr.state || 'Delhi';
  const stateKey = state.trim().toLowerCase();
  const countryCode = (addr.country_code || 'in').toUpperCase();
  const geoRegion = countryCode === 'IN'
    ? (INDIAN_STATE_CODES[stateKey] || `IN-${state.substring(0, 2).toUpperCase()}`)
    : state;

  // 6. Postal PIN Code
  const postalCode = addr.postcode || '';

  // 7. Country
  const country = addr.country || 'India';

  // 8. Clean Editorial Street Address (Building + Road + Locality)
  const streetParts = [building, road, locality].filter(Boolean);
  const cleanStreetAddress = streetParts.length > 0
    ? Array.from(new Set(streetParts)).join(', ')
    : [locality, city].filter(Boolean).join(', ');

  // 9. Full Display Address (from OpenStreetMap)
  const fullAddress = data.display_name || [cleanStreetAddress, city, state, postalCode, country].filter(Boolean).join(', ');

  const cleanLat = Number(lat.toFixed(6));
  const cleanLng = Number(lng.toFixed(6));

  return {
    latitude: String(cleanLat),
    longitude: String(cleanLng),
    geo_position: `${cleanLat};${cleanLng}`,
    icbm: `${cleanLat}, ${cleanLng}`,
    street_address: cleanStreetAddress,
    full_address: fullAddress,
    city: city,
    geo_placename: city,
    state: state,
    geo_region: geoRegion,
    postal_code: postalCode,
    country: country,
    country_code: countryCode,
    raw_osm: data
  };
}

export function GeoMapPicker({
  latitude = 28.5535,
  longitude = 77.2066,
  onLocationSelect,
  storeName = 'OCT9 Flagship Studio',
  autoSync = true
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [currentLat, setCurrentLat] = useState(Number(latitude) || 28.5535);
  const [currentLng, setCurrentLng] = useState(Number(longitude) || 77.2066);
  const [inputLat, setInputLat] = useState(String(latitude || 28.5535));
  const [inputLng, setInputLng] = useState(String(longitude || 77.2066));
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [locatingGps, setLocatingGps] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [reverseAddress, setReverseAddress] = useState(null);
  const [reverseLoading, setReverseLoading] = useState(false);
  const [autoSyncAddress, setAutoSyncAddress] = useState(autoSync);
  const [copiedField, setCopiedField] = useState(null);

  // Sync internal state if prop coordinates change from outside
  useEffect(() => {
    const latNum = Number(latitude);
    const lngNum = Number(longitude);
    if (!isNaN(latNum) && !isNaN(lngNum) && (latNum !== currentLat || lngNum !== currentLng)) {
      setCurrentLat(latNum);
      setCurrentLng(lngNum);
      setInputLat(String(latNum));
      setInputLng(String(lngNum));
      if (mapInstanceRef.current && markerRef.current) {
        markerRef.current.setLatLng([latNum, lngNum]);
        mapInstanceRef.current.setView([latNum, lngNum], mapInstanceRef.current.getZoom());
      }
    }
  }, [latitude, longitude]);

  // Load Leaflet dynamically if not already in document
  useEffect(() => {
    let isMounted = true;

    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const initLeaflet = () => {
      if (!isMounted || !mapContainerRef.current || mapInstanceRef.current) return;
      const L = window.L;
      if (!L) return;

      try {
        const initialLat = Number(currentLat) || 28.5535;
        const initialLng = Number(currentLng) || 77.2066;

        // Initialize Map
        const map = L.map(mapContainerRef.current, {
          center: [initialLat, initialLng],
          zoom: 15,
          scrollWheelZoom: true
        });

        // Add OpenStreetMap tile layer
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Custom styled marker
        const customIcon = L.divIcon({
          className: 'custom-geo-pin',
          html: `
            <div style="
              background-color: #5A1827;
              width: 36px;
              height: 36px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid #FFFFFF;
              box-shadow: 0 4px 12px rgba(0,0,0,0.35);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: grab;
            ">
              <div style="
                width: 10px;
                height: 10px;
                background-color: #FAF7F2;
                border-radius: 50%;
                transform: rotate(45deg);
              "></div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -32]
        });

        // Add Draggable Marker
        const marker = L.marker([initialLat, initialLng], {
          draggable: true,
          icon: customIcon
        }).addTo(map);

        marker.bindPopup(`<strong>${storeName || 'OCT9 Studio'}</strong><br/>Drag pin or click map to auto-sync address & coordinates.`).openPopup();

        // Listen for Drag
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          handlePositionChange(pos.lat, pos.lng);
        });

        // Listen for Map Clicks
        map.on('click', (e) => {
          marker.setLatLng(e.latlng);
          handlePositionChange(e.latlng.lat, e.latlng.lng);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
        setMapLoaded(true);

        // Trigger initial reverse geocode for full address
        handlePositionChange(initialLat, initialLng);

        // Trigger size adjustment after render
        setTimeout(() => {
          map.invalidateSize();
        }, 300);
      } catch (err) {
        console.error('Leaflet initialization error:', err);
      }
    };

    if (window.L) {
      initLeaflet();
    } else {
      let script = document.getElementById('leaflet-js');
      if (!script) {
        script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.onload = () => initLeaflet();
        document.body.appendChild(script);
      } else {
        script.addEventListener('load', initLeaflet);
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

  // Handle position change, real-time coordinate synchronization & reverse geocode
  const handlePositionChange = async (lat, lng) => {
    const cleanLat = Number(lat.toFixed(6));
    const cleanLng = Number(lng.toFixed(6));
    setCurrentLat(cleanLat);
    setCurrentLng(cleanLng);
    setInputLat(String(cleanLat));
    setInputLng(String(cleanLng));

    // 1. Immediately synchronize real-time coordinates
    const immediateCoords = {
      latitude: String(cleanLat),
      longitude: String(cleanLng),
      geo_position: `${cleanLat};${cleanLng}`,
      icbm: `${cleanLat}, ${cleanLng}`
    };

    if (onLocationSelect) {
      onLocationSelect(immediateCoords);
    }

    // 2. Reverse geocode to get full street address, city, state, postal code
    setReverseLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${cleanLat}&lon=${cleanLng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        const extracted = extractAddressComponents(data, cleanLat, cleanLng);
        if (extracted) {
          setReverseAddress(extracted);

          // 3. Automatically synchronize full address into parent if autoSync is active
          if (autoSyncAddress && onLocationSelect) {
            onLocationSelect(extracted);
          }
        }
      }
    } catch (e) {
      console.warn('Reverse geocoding error:', e);
    } finally {
      setReverseLoading(false);
    }
  };

  // Search Address / Landmark via Nominatim
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery.trim()
        )}&limit=1&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const results = await res.json();
        if (results && results.length > 0) {
          const item = results[0];
          const newLat = Number(parseFloat(item.lat).toFixed(6));
          const newLng = Number(parseFloat(item.lon).toFixed(6));

          setCurrentLat(newLat);
          setCurrentLng(newLng);
          setInputLat(String(newLat));
          setInputLng(String(newLng));

          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setView([newLat, newLng], 16);
            markerRef.current.setLatLng([newLat, newLng]);
            markerRef.current.bindPopup(`<strong>${item.display_name}</strong>`).openPopup();
          }

          handlePositionChange(newLat, newLng);
        } else {
          alert('Location not found. Try searching with city or landmark name (e.g. "Okhla Phase 3 New Delhi").');
        }
      }
    } catch (err) {
      console.warn('Geocoding search failed:', err);
    } finally {
      setSearching(false);
    }
  };

  // Jump to exact coordinates entered manually
  const handleManualCoordJump = (e) => {
    if (e) e.preventDefault();
    const latNum = parseFloat(inputLat);
    const lngNum = parseFloat(inputLng);

    if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      alert('Please enter valid latitude (-90 to 90) and longitude (-180 to 180).');
      return;
    }

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([latNum, lngNum], 16);
      markerRef.current.setLatLng([latNum, lngNum]);
      markerRef.current.bindPopup(`<strong>Lat: ${latNum}, Lng: ${lngNum}</strong>`).openPopup();
    }

    handlePositionChange(latNum, lngNum);
  };

  // Detect Current Device Location via GPS
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocatingGps(false);
        const newLat = Number(pos.coords.latitude.toFixed(6));
        const newLng = Number(pos.coords.longitude.toFixed(6));

        setCurrentLat(newLat);
        setCurrentLng(newLng);
        setInputLat(String(newLat));
        setInputLng(String(newLng));

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([newLat, newLng], 17);
          markerRef.current.setLatLng([newLat, newLng]);
          markerRef.current.bindPopup('<strong>Your Current Device Location (GPS)</strong>').openPopup();
        }

        handlePositionChange(newLat, newLng);
      },
      (err) => {
        setLocatingGps(false);
        alert(`Could not retrieve location: ${err.message}`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Manual trigger to force re-apply full address
  const handleApplyFullAddress = () => {
    if (!reverseAddress || !onLocationSelect) return;
    onLocationSelect({
      ...reverseAddress,
      street_address: reverseAddress.full_address || reverseAddress.street_address
    });
  };

  // Manual trigger to apply clean street address
  const handleApplyStreetOnly = () => {
    if (!reverseAddress || !onLocationSelect) return;
    onLocationSelect(reverseAddress);
  };

  const copyToClipboard = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-3 font-sans">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search studio address or landmark (e.g. Okhla Phase 3, New Delhi)..."
              className="w-full text-xs p-2.5 pl-8 border border-neutral-300 rounded font-sans focus:outline-neutral-800 bg-white"
            />
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-3 pointer-events-none" />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-3.5 py-2 text-xs font-semibold bg-neutral-900 text-white rounded hover:bg-neutral-800 disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors"
          >
            {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Find on Map</span>
          </button>
        </form>

        <button
          type="button"
          onClick={handleDetectGps}
          disabled={locatingGps}
          className="px-3 py-2 text-xs font-medium border border-neutral-300 bg-white hover:bg-neutral-100 rounded text-neutral-700 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer transition-colors"
          title="Detect Current GPS Location"
        >
          {locatingGps ? <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-600" /> : <LocateFixed className="w-3.5 h-3.5 text-emerald-600" />}
          <span>Use My GPS</span>
        </button>

        <a
          href={`https://www.google.com/maps?q=${currentLat},${currentLng}`}
          target="_blank"
          rel="noreferrer"
          className="px-3 py-2 text-xs font-medium border border-neutral-300 bg-white hover:bg-neutral-100 rounded text-neutral-700 flex items-center justify-center gap-1.5 shrink-0 transition-colors"
          title="Open pin in Google Maps"
        >
          <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
          <span>Google Maps</span>
        </a>
      </div>

      {/* Interactive Map Container */}
      <div className="relative border border-neutral-300 rounded overflow-hidden shadow-2xs">
        <div
          ref={mapContainerRef}
          style={{ height: '370px', width: '100%', zIndex: 10 }}
          className="bg-neutral-100"
        />

        {!mapLoaded && (
          <div className="absolute inset-0 bg-neutral-100 flex flex-col items-center justify-center z-20 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-600" />
            <p className="text-xs text-neutral-500">Loading interactive map...</p>
          </div>
        )}

        {/* Live Coordinate Badge Overlay on Top-Right */}
        <div className="absolute top-2 right-2 z-20 bg-white/95 backdrop-blur-xs border border-neutral-300 px-3 py-2 rounded shadow-sm text-xs font-mono space-y-1 pointer-events-none">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-emerald-700 font-sans font-bold flex items-center gap-1 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Real-Time Synchronized
            </span>
            {reverseLoading && <Loader2 className="w-3 h-3 animate-spin text-neutral-500" />}
          </div>
          <div className="text-neutral-900 font-bold text-[11px]">
            Lat: {currentLat.toFixed(6)}, Lng: {currentLng.toFixed(6)}
          </div>
          <div className="text-[10px] text-neutral-500 font-mono">
            geo.position: <span className="text-neutral-800">{currentLat.toFixed(6)};{currentLng.toFixed(6)}</span>
          </div>
          <div className="text-[10px] text-neutral-500 font-mono">
            ICBM: <span className="text-neutral-800">{currentLat.toFixed(6)}, {currentLng.toFixed(6)}</span>
          </div>
        </div>

        {/* Instructions Banner Overlay on Bottom-Left */}
        <div className="absolute bottom-2 left-2 z-20 bg-neutral-900/90 text-white px-2.5 py-1 rounded text-[10px] tracking-wide pointer-events-none font-medium flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-brand-gold" />
          <span>Click anywhere or drag pin to auto-sync studio address & coordinates</span>
        </div>
      </div>

      {/* Real-Time Coordinate Quick Jump & Auto-Sync Controls */}
      <div className="bg-white p-3 border border-neutral-200 rounded flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <form onSubmit={handleManualCoordJump} className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-neutral-600">Manual Jump:</span>
          <div className="flex items-center gap-1">
            <label className="text-[11px] text-neutral-500">Lat:</label>
            <input
              type="text"
              value={inputLat}
              onChange={(e) => setInputLat(e.target.value)}
              className="w-24 p-1 text-xs border border-neutral-300 rounded font-mono"
            />
          </div>
          <div className="flex items-center gap-1">
            <label className="text-[11px] text-neutral-500">Lng:</label>
            <input
              type="text"
              value={inputLng}
              onChange={(e) => setInputLng(e.target.value)}
              className="w-24 p-1 text-xs border border-neutral-300 rounded font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 rounded font-medium cursor-pointer transition-colors"
          >
            Update Pin
          </button>
        </form>

        <label className="flex items-center gap-2 cursor-pointer text-[11px] text-neutral-700 font-medium shrink-0">
          <input
            type="checkbox"
            checked={autoSyncAddress}
            onChange={(e) => setAutoSyncAddress(e.target.checked)}
            className="accent-neutral-900 h-3.5 w-3.5"
          />
          <span>Auto-synchronize full address into SEO / GEO settings on pin move</span>
        </label>
      </div>

      {/* Reverse Geocoding Address Card */}
      {reverseAddress && (
        <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded text-xs space-y-2 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 pb-2">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-neutral-700" />
              <span className="text-[11px] uppercase font-bold text-neutral-700 tracking-wider">
                Full Address Resolved from Map
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.2 rounded">
                Synced in Real Time
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleApplyFullAddress}
                className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-700 rounded text-[11px] font-medium cursor-pointer transition-colors flex items-center gap-1"
                title="Fill complete OSM formatted address into street address field"
              >
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Use Complete Full Address</span>
              </button>
              <button
                type="button"
                onClick={handleApplyStreetOnly}
                className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded text-[11px] font-medium cursor-pointer transition-colors flex items-center gap-1"
                title="Use clean street & area address"
              >
                <Check className="w-3 h-3" />
                <span>Use Clean Street & Area</span>
              </button>
            </div>
          </div>

          <div className="space-y-1 text-neutral-800">
            <p className="font-semibold text-neutral-900">
              {reverseAddress.full_address}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-neutral-600 font-mono">
              <div>
                <span className="text-neutral-400 block font-sans">City:</span>
                <span className="font-semibold text-neutral-800">{reverseAddress.city}</span>
              </div>
              <div>
                <span className="text-neutral-400 block font-sans">State & Region:</span>
                <span className="font-semibold text-neutral-800">{reverseAddress.state} ({reverseAddress.geo_region})</span>
              </div>
              <div>
                <span className="text-neutral-400 block font-sans">Postal / PIN:</span>
                <span className="font-semibold text-neutral-800">{reverseAddress.postal_code || 'N/A'}</span>
              </div>
              <div>
                <span className="text-neutral-400 block font-sans">Country:</span>
                <span className="font-semibold text-neutral-800">{reverseAddress.country} ({reverseAddress.country_code})</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GeoMapPicker;
