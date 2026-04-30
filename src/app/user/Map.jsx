// app/user/Map.jsx — Redesigned (mobile-first, Inter font, map+list toggle, routing)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getAllNearby } from '../../services/map';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';

// ─── Fix default Leaflet icons ─────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ─── Design Tokens ─────────────────────────────────────────────────────────
const C = {
  bg:          '#F4F6FB',
  surface:     '#FFFFFF',
  surfaceAlt:  '#F0F3FA',
  border:      '#E2E8F5',
  borderLight: '#EBF0F9',
  accent:      '#2563EB',
  accentLight: '#EEF4FF',
  accentMid:   '#BFCFFF',
  accentDark:  '#1A45C2',
  green:       '#16A34A',
  greenLight:  '#DCFCE7',
  amber:       '#D97706',
  amberLight:  '#FEF3C7',
  red:         '#DC2626',
  redLight:    '#FEE2E2',
  purple:      '#7C3AED',
  purpleLight: '#EDE9FE',
  text:        '#0F172A',
  textSub:     '#475569',
  textMuted:   '#94A3B8',
  shadow:      'rgba(37,99,235,0.12)',
  shadowMd:    'rgba(15,23,42,0.07)',
  shadowLg:    'rgba(15,23,42,0.15)',
};

const TYPE = {
  shop:  { color: C.accent,  bg: C.accentLight, emoji: '🛒', label: 'Shop'  },
  house: { color: C.green,   bg: C.greenLight,  emoji: '🏠', label: 'House' },
  job:   { color: C.amber,   bg: C.amberLight,  emoji: '💼', label: 'Job'   },
};

// ─── SVG Markers ───────────────────────────────────────────────────────────
const MARKER_SVG = {
  shop:  (color) => `<svg width="36" height="46" viewBox="0 0 36 46" xmlns="http://www.w3.org/2000/svg"><defs><filter id="ds"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="${color}" flood-opacity="0.4"/></filter></defs><path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 28 18 28S36 31.5 36 18C36 8.06 27.94 0 18 0z" fill="${color}" filter="url(#ds)"/><circle cx="18" cy="18" r="11" fill="white" opacity="0.96"/><text x="18" y="23" text-anchor="middle" font-size="13">🛒</text></svg>`,
  house: (color) => `<svg width="36" height="46" viewBox="0 0 36 46" xmlns="http://www.w3.org/2000/svg"><defs><filter id="ds"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="${color}" flood-opacity="0.4"/></filter></defs><path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 28 18 28S36 31.5 36 18C36 8.06 27.94 0 18 0z" fill="${color}" filter="url(#ds)"/><circle cx="18" cy="18" r="11" fill="white" opacity="0.96"/><text x="18" y="23" text-anchor="middle" font-size="13">🏠</text></svg>`,
  job:   (color) => `<svg width="36" height="46" viewBox="0 0 36 46" xmlns="http://www.w3.org/2000/svg"><defs><filter id="ds"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="${color}" flood-opacity="0.4"/></filter></defs><path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 28 18 28S36 31.5 36 18C36 8.06 27.94 0 18 0z" fill="${color}" filter="url(#ds)"/><circle cx="18" cy="18" r="11" fill="white" opacity="0.96"/><text x="18" y="23" text-anchor="middle" font-size="13">💼</text></svg>`,
  user:  `<svg width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg"><circle cx="13" cy="13" r="11" fill="#2563EB" stroke="white" stroke-width="3"/><circle cx="13" cy="13" r="4.5" fill="white"/></svg>`,
};

const makeIcon = (type) => L.divIcon({
  className: '',
  html: type === 'user' ? MARKER_SVG.user : MARKER_SVG[type](TYPE[type].color),
  iconSize:    type === 'user' ? [26, 26] : [36, 46],
  iconAnchor:  type === 'user' ? [13, 13] : [18, 46],
  popupAnchor: type === 'user' ? [0, -13] : [0, -48],
});

const ICONS = {
  shop: makeIcon('shop'), house: makeIcon('house'),
  job: makeIcon('job'),   user: makeIcon('user'),
};

// ─── Helpers ───────────────────────────────────────────────────────────────
const fmtINR  = (n) => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n||0);
const fmtDist = (d) => d != null ? (d < 1 ? `${Math.round(d*1000)}m` : `${d.toFixed(1)} km`) : '—';
const getName = (item) => item.title || item.business_name || item.job_title || 'Untitled';
const getSub  = (item) => item.subtitle || item.category || item.company_name || '';
const esc     = (s) => s?.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])) || '';

// ─── CSS ───────────────────────────────────────────────────────────────────
const injectCSS = () => {
  if (document.getElementById('map-css')) return;
  const s = document.createElement('style');
  s.id = 'map-css';
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }

    .m-root {
      font-family: 'Inter', sans-serif;
      background: ${C.bg};
      color: ${C.text};
      height: 100dvh;
      overflow: hidden;
      position: relative;
      min-width: 250px;
    }

    /* Leaflet */
    .leaflet-container { font-family: 'Inter', sans-serif !important; background: #E8EDF8 !important; }
    .leaflet-popup-content-wrapper {
      background: ${C.surface} !important;
      border: 1.5px solid ${C.border} !important;
      border-radius: 18px !important;
      box-shadow: 0 16px 48px ${C.shadowLg} !important;
      color: ${C.text} !important;
      padding: 0 !important;
      overflow: hidden;
      min-width: 220px;
    }
    .leaflet-popup-content { margin: 0 !important; }
    .leaflet-popup-tip-container { display: none !important; }
    .leaflet-popup-close-button {
      color: ${C.textMuted} !important;
      font-size: 18px !important;
      width: 26px !important; height: 26px !important;
      top: 10px !important; right: 10px !important;
      border-radius: 50% !important;
      background: ${C.surfaceAlt} !important;
      display: flex !important; align-items: center !important; justify-content: center !important;
      line-height: 1 !important; z-index: 10 !important;
    }
    .leaflet-control-attribution { display: none !important; }
    .leaflet-bar { border: none !important; box-shadow: 0 4px 16px ${C.shadowMd} !important; }
    .leaflet-bar a {
      background: ${C.surface} !important; color: ${C.accent} !important;
      border: 1.5px solid ${C.border} !important;
      border-radius: 12px !important; margin: 4px !important;
      width: 36px !important; height: 36px !important;
      line-height: 34px !important; font-size: 18px !important; font-weight: 600 !important;
    }
    .leaflet-bar a:hover { background: ${C.accentLight} !important; color: ${C.accentDark} !important; }
    .leaflet-routing-container { display: none !important; }

    /* Animations */
    @keyframes slideUp   { from { transform:translateY(22px); opacity:0; } to { transform:translateY(0); opacity:1; } }
    @keyframes slideDown { from { transform:translateY(-16px); opacity:0; } to { transform:translateY(0); opacity:1; } }
    @keyframes fadeIn    { from { opacity:0; } to { opacity:1; } }
    @keyframes pulse     { 0%,100% { opacity:1; } 50% { opacity:.35; } }
    @keyframes ripple    { 0% { transform:scale(1); opacity:.5; } 100% { transform:scale(2.6); opacity:0; } }
    @keyframes shimmer   { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
    @keyframes bounce    { 0%,80%,100% { transform:translateY(0); } 40% { transform:translateY(-5px); } }
    @keyframes spin      { to { transform: rotate(360deg); } }

    .su { animation: slideUp .34s cubic-bezier(.16,1,.3,1) both; }
    .sd { animation: slideDown .28s cubic-bezier(.16,1,.3,1) both; }
    .fi { animation: fadeIn .22s ease both; }

    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }

    .skeleton {
      background: linear-gradient(90deg, ${C.surfaceAlt} 25%, ${C.border} 50%, ${C.surfaceAlt} 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s ease infinite;
      border-radius: 8px;
    }

    /* Buttons */
    .btn { display:inline-flex; align-items:center; justify-content:center; gap:5px;
      border:none; cursor:pointer; font-family:'Inter',sans-serif; font-weight:600;
      transition:all .16s ease; outline:none; white-space:nowrap; }
    .btn-primary { background:${C.accent}; color:#fff; border-radius:12px; padding:10px 16px; font-size:13px; }
    .btn-primary:hover { background:${C.accentDark}; transform:translateY(-1px); box-shadow:0 5px 16px ${C.shadow}; }
    .btn-primary:active { transform:scale(.97); }
    .btn-ghost { background:${C.surface}; color:${C.text}; border:1.5px solid ${C.border}; border-radius:12px; padding:10px 16px; font-size:13px; }
    .btn-ghost:hover { border-color:${C.accent}; color:${C.accent}; background:${C.accentLight}; }

    .fab { width:40px; height:40px; border-radius:12px; border:1.5px solid ${C.border};
      background:${C.surface}; color:${C.textSub}; display:flex; align-items:center; justify-content:center;
      cursor:pointer; font-size:16px; transition:all .16s; box-shadow:0 2px 8px ${C.shadowMd}; flex-shrink:0; }
    .fab:hover { border-color:${C.accent}; color:${C.accent}; background:${C.accentLight}; }
    .fab:active { transform:scale(.93); }
    .fab.on { background:${C.accent}; color:#fff; border-color:${C.accent}; box-shadow:0 4px 14px ${C.shadow}; }

    /* Search */
    .m-search { width:100%; background:${C.surface}; border:1.5px solid ${C.border};
      border-radius:13px; padding:10px 14px 10px 40px; color:${C.text};
      font-family:'Inter',sans-serif; font-size:13px; outline:none;
      transition:border-color .18s, box-shadow .18s; box-shadow:0 2px 8px ${C.shadowMd}; }
    .m-search:focus { border-color:${C.accent}; box-shadow:0 0 0 3px ${C.accentMid}44; }
    .m-search::placeholder { color:${C.textMuted}; }

    /* Card */
    .m-card { background:${C.surface}; border:1.5px solid ${C.borderLight}; border-radius:16px;
      padding:12px; cursor:pointer; transition:all .18s ease; display:flex; gap:11px; align-items:flex-start; }
    .m-card:hover { border-color:${C.accentMid}; transform:translateY(-2px); box-shadow:0 8px 26px ${C.shadow}; }
    .m-card:active { transform:scale(.98); }

    /* Badge */
    .badge { font-family:'Inter',sans-serif; font-size:10px; font-weight:700; letter-spacing:.04em;
      padding:3px 8px; border-radius:100px; text-transform:uppercase; }

    /* Slider */
    .m-slider { -webkit-appearance:none; width:100%; height:4px; border-radius:2px;
      background:${C.border}; outline:none; cursor:pointer; }
    .m-slider::-webkit-slider-thumb { -webkit-appearance:none; width:18px; height:18px; border-radius:50%;
      background:${C.accent}; cursor:pointer; box-shadow:0 0 0 3px ${C.accentMid}88; transition:box-shadow .2s; }
    .m-slider::-webkit-slider-thumb:hover { box-shadow:0 0 0 6px ${C.accentMid}55; }

    /* Toggle switch */
    .tog { position:relative; display:inline-block; width:46px; height:26px; flex-shrink:0; }
    .tog input { opacity:0; width:0; height:0; }
    .tog-track { position:absolute; inset:0; border-radius:13px; background:${C.border};
      cursor:pointer; transition:background .2s; }
    .tog-track::before { content:''; position:absolute; width:20px; height:20px;
      left:3px; top:3px; border-radius:50%; background:${C.textMuted};
      transition:all .2s; box-shadow:0 1px 4px rgba(0,0,0,.18); }
    .tog input:checked + .tog-track { background:${C.accent}; }
    .tog input:checked + .tog-track::before { transform:translateX(20px); background:#fff; }

    /* View toggle pill */
    .view-pill { display:flex; background:${C.surfaceAlt}; border:1.5px solid ${C.border};
      border-radius:12px; padding:3px; gap:2px; }
    .view-btn { flex:1; padding:7px 14px; border:none; background:transparent; color:${C.textSub};
      font-family:'Inter',sans-serif; font-size:12.5px; font-weight:500; cursor:pointer;
      border-radius:9px; transition:all .16s; display:flex; align-items:center; justify-content:center; gap:5px; }
    .view-btn.on { background:${C.surface}; color:${C.accent}; font-weight:700;
      box-shadow:0 2px 8px ${C.shadowMd}; }

    /* Filter chip */
    .fchip { padding:6px 13px; border-radius:100px; font-size:12px; font-weight:600;
      cursor:pointer; border:1.5px solid ${C.border}; background:${C.surface};
      color:${C.textSub}; transition:all .16s; font-family:'Inter',sans-serif; }
    .fchip.on, .fchip:hover { background:${C.accent}; border-color:${C.accent}; color:#fff; }

    /* Handle */
    .handle { width:36px; height:4px; border-radius:2px; background:${C.border}; margin:10px auto 0; }

    /* Loading dots */
    .d1 { animation:bounce 1.1s infinite 0s; }
    .d2 { animation:bounce 1.1s infinite .14s; }
    .d3 { animation:bounce 1.1s infinite .28s; }

    /* Popup */
    .m-popup { padding:14px 16px 16px; min-width:200px; max-width:260px; }
    .m-popup-title { font-weight:700; font-size:15px; color:${C.text}; margin-bottom:2px; letter-spacing:-.2px; }
    .m-popup-sub { font-size:11.5px; color:${C.textSub}; margin-bottom:8px; }

    /* Responsive */
    @media (min-width: 600px) {
      .m-sidebar { position:absolute; left:0; top:0; bottom:0; width:340px; z-index:200;
        background:${C.surface}; border-right:1.5px solid ${C.border};
        display:flex !important; flex-direction:column;
        box-shadow:4px 0 24px ${C.shadowMd}; }
      .m-map-zone { position:absolute; left:340px; right:0; top:0; bottom:0; }
      .m-topbar { display:none !important; }
      .m-sheet { display:none !important; }
      .m-fabs { left:356px !important; bottom:20px !important; }
      .m-statusbar { left:356px !important; }
    }
    @media (max-width: 599px) {
      .m-sidebar { display:none !important; }
      .m-map-zone { position:absolute; inset:0; }
    }
    @media (max-width: 320px) {
      .m-popup { padding:10px 12px 12px; min-width:170px; }
      .m-popup-title { font-size:13.5px; }
      .btn-primary, .btn-ghost { padding:9px 12px; font-size:12px; }
    }
    @media (max-width: 280px) {
      .m-popup { min-width:150px; }
    }
  `;
  document.head.appendChild(s);
};

// ─── MAIN ──────────────────────────────────────────────────────────────────
export default function Map() {
  const [phase, setPhase]             = useState('locating');
  const [userLocation, setUserLocation] = useState(null);
  const [shops, setShops]             = useState([]);
  const [houses, setHouses]           = useState([]);
  const [jobs, setJobs]               = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  const [viewMode, setViewMode]       = useState('map'); // map | list
  const [filterOpen, setFilterOpen]   = useState(false);
  const [detailItem, setDetailItem]   = useState(null);

  const [radius, setRadius]           = useState(0.2); // default 200m
  const [search, setSearch]           = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [typeFilter, setTypeFilter]   = useState({ shops:true, houses:true, jobs:true });

  const mapRef         = useRef(null);
  const mapContRef     = useRef(null);
  const markersRef     = useRef([]);
  const userMarkerRef  = useRef(null);
  const userCircleRef  = useRef(null);
  const routingRef     = useRef(null);
  const intervalRef    = useRef(null);

  useEffect(() => { injectCSS(); }, []);

  // Geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      setUserLocation({ latitude: 12.9165, longitude: 79.1325 });
      setPhase('ready');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => { setUserLocation({ latitude: p.coords.latitude, longitude: p.coords.longitude }); setPhase('ready'); },
      ()  => { setUserLocation({ latitude: 12.9165, longitude: 79.1325 }); setPhase('ready'); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Init map
  useEffect(() => {
    if (phase !== 'ready' || !mapContRef.current || mapRef.current) return;
    mapRef.current = L.map(mapContRef.current, {
      zoomControl: false, attributionControl: false,
      zoomAnimation: true, fadeAnimation: true,
    }).setView([userLocation.latitude, userLocation.longitude], 16);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 })
      .addTo(mapRef.current);
    L.control.zoom({ position: 'topright' }).addTo(mapRef.current);

    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, [phase]);

  // Fetch
  useEffect(() => {
    if (!userLocation) return;
    fetchData();
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchData, 30000);
    return () => clearInterval(intervalRef.current);
  }, [userLocation, radius, typeFilter, search]);

  // Markers
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;
    renderMarkers();
  }, [shops, houses, jobs, userLocation, radius]);

  // Detail event from popup button
  useEffect(() => {
    const h = (e) => { setDetailItem(e.detail); };
    window.addEventListener('m:detail', h);
    return () => window.removeEventListener('m:detail', h);
  }, []);

  // Route event from popup
  useEffect(() => {
    const h = (e) => { showRoute(e.detail); };
    window.addEventListener('m:route', h);
    return () => window.removeEventListener('m:route', h);
  }, [userLocation]);

  const fetchData = async () => {
    if (!userLocation) return;
    setLoading(true);
    try {
      const types = Object.entries(typeFilter).filter(([,v]) => v).map(([k]) => k).join(',');
      const res = await getAllNearby(userLocation.latitude, userLocation.longitude, radius, types, search);
      setShops(res.shops || []);
      setHouses(res.houses || []);
      setJobs(res.jobs || []);
      setError('');
    } catch (e) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const clearRoute = useCallback(() => {
    if (routingRef.current && mapRef.current) {
      mapRef.current.removeControl(routingRef.current);
      routingRef.current = null;
    }
  }, []);

  const showRoute = useCallback((item) => {
    if (!mapRef.current || !userLocation || !item.latitude || !item.longitude) return;
    clearRoute();
    try {
      routingRef.current = L.Routing.control({
        waypoints: [
          L.latLng(userLocation.latitude, userLocation.longitude),
          L.latLng(parseFloat(item.latitude), parseFloat(item.longitude)),
        ],
        routeWhileDragging: false,
        showAlternatives: false,
        lineOptions: {
          styles: [{ color: C.accent, weight: 5, opacity: 0.85 }],
          extendToWaypoints: true,
          missingRouteTolerance: 10,
        },
        createMarker: () => null,
        addWaypoints: false,
        fitSelectedRoutes: true,
      }).addTo(mapRef.current);
    } catch (err) {
      // LRM not available, fallback to Google Maps
      window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${item.latitude},${item.longitude}&travelmode=walking`,
        '_blank'
      );
    }
  }, [userLocation, clearRoute]);

  const openGoogleMaps = (item) => {
    if (!userLocation) return;
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${item.latitude},${item.longitude}&travelmode=walking`,
      '_blank'
    );
  };

  const renderMarkers = useCallback(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    if (userMarkerRef.current) userMarkerRef.current.remove();
    if (userCircleRef.current) userCircleRef.current.remove();

    const { latitude: lat, longitude: lng } = userLocation;
    mapRef.current.flyTo([lat, lng], mapRef.current.getZoom(), { duration: 0.7 });

    userMarkerRef.current = L.marker([lat, lng], { icon: ICONS.user, zIndexOffset: 1000 })
      .bindPopup(`<div class="m-popup" style="text-align:center;padding:14px">
        <div style="font-size:22px;margin-bottom:6px">📍</div>
        <div class="m-popup-title">You are here</div>
      </div>`)
      .addTo(mapRef.current);

    userCircleRef.current = L.circle([lat, lng], {
      radius: radius * 1000,
      color: C.accent, fillColor: C.accent,
      fillOpacity: 0.05, weight: 1.5, dashArray: '7 10',
    }).addTo(mapRef.current);

    const addMarkers = (list, type) => list.forEach(item => {
      if (!item.latitude || !item.longitude) return;
      const m = TYPE[type];
      const priceHTML = type === 'house'
        ? `<div style="color:${C.green};font-weight:700;font-size:13px;margin:6px 0">${fmtINR(item.rent_per_month)}/mo</div>`
        : type === 'job'
        ? `<div style="color:${C.amber};font-weight:700;font-size:13px;margin:6px 0">${fmtINR(item.salary)}/${item.salary_type==='month'?'mo':'day'}</div>`
        : '';

      const itemEncoded = encodeURIComponent(JSON.stringify({ ...item, _type: type }));
      const popup = `
        <div class="m-popup">
          <div style="display:flex;gap:9px;align-items:flex-start;margin-bottom:4px">
            <div style="width:36px;height:36px;border-radius:10px;background:${m.bg};
              display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;
              border:1.5px solid ${m.color}28">${m.emoji}</div>
            <div style="flex:1;min-width:0">
              <div class="m-popup-title">${esc(getName(item))}</div>
              <div class="m-popup-sub">${esc(getSub(item))}</div>
              <span class="badge" style="background:${m.bg};color:${m.color}">${m.label}</span>
            </div>
          </div>
          ${priceHTML}
          <div style="display:flex;align-items:center;gap:4px;margin:6px 0 10px;color:${C.textSub};font-size:11.5px">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="${C.accent}"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            ${fmtDist(item.distance)} away
          </div>
          <div style="display:flex;gap:7px">
            <button class="btn btn-primary" style="flex:1;padding:9px 10px;font-size:12px;border-radius:10px"
              onclick="window.dispatchEvent(new CustomEvent('m:route',{detail:${JSON.stringify({...item,_type:type}).replace(/"/g,'&quot;')}}))">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              Route
            </button>
            <button class="btn btn-ghost" style="flex:1;padding:9px 10px;font-size:12px;border-radius:10px"
              onclick="window.dispatchEvent(new CustomEvent('m:detail',{detail:${JSON.stringify({...item,_type:type}).replace(/"/g,'&quot;')}}))">
              Details
            </button>
          </div>
        </div>`;

      const marker = L.marker([parseFloat(item.latitude), parseFloat(item.longitude)], { icon: ICONS[type] })
        .bindPopup(popup, { maxWidth: 280 })
        .addTo(mapRef.current);
      markersRef.current.push(marker);
    });

    addMarkers(shops, 'shop');
    addMarkers(houses, 'house');
    addMarkers(jobs, 'job');
  }, [shops, houses, jobs, userLocation, radius]);

  const allItems = [
    ...shops.map(s  => ({ ...s, _type:'shop'  })),
    ...houses.map(h => ({ ...h, _type:'house' })),
    ...jobs.map(j   => ({ ...j, _type:'job'   })),
  ].sort((a,b) => (a.distance||0)-(b.distance||0));

  const filteredItems = activeCategory === 'All'
    ? allItems
    : allItems.filter(i => i._type === activeCategory.toLowerCase());

  if (phase === 'locating') return <LoadingScreen />;

  return (
    <div className="m-root">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="m-sidebar">
        <SidebarContent
          allItems={allItems}
          filteredItems={filteredItems}
          loading={loading}
          radius={radius}
          setRadius={setRadius}
          search={search}
          setSearch={setSearch}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onSelect={setDetailItem}
          onRoute={showRoute}
          openGoogleMaps={openGoogleMaps}
          fetchData={fetchData}
          clearRoute={clearRoute}
        />
      </aside>

      {/* ── MAP AREA ── */}
      <div className="m-map-zone">
        <div ref={mapContRef} style={{ position:'absolute', inset:0, zIndex:0 }} />

        {/* MOBILE TOPBAR */}
        <div className="m-topbar sd" style={{
          position:'absolute', top:0, left:0, right:0, zIndex:100,
          padding:'10px 10px 0',
          display:'flex', alignItems:'center', gap:8,
        }}>
          {/* Brand */}
          <div style={{
            background:C.surface, border:`1.5px solid ${C.border}`,
            borderRadius:100, padding:'7px 13px',
            display:'flex', alignItems:'center', gap:6,
            boxShadow:`0 4px 14px ${C.shadowMd}`, flexShrink:0,
          }}>
            <span style={{ fontSize:15 }}>📍</span>
            <span style={{ fontWeight:800, fontSize:15, color:C.text, letterSpacing:'-.3px' }}>
              Nearby
            </span>
          </div>

          {/* Search */}
          <div style={{ flex:1, position:'relative', minWidth:0 }}>
            <span style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)',
              color:C.textMuted, pointerEvents:'none', display:'flex' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </span>
            <input className="m-search" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <button className={`fab ${filterOpen ? 'on' : ''}`} onClick={() => setFilterOpen(v => !v)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
          </button>
        </div>

        {/* MOBILE VIEW TOGGLE */}
        <div className="m-topbar" style={{
          position:'absolute', top:62, left:'50%', transform:'translateX(-50%)',
          zIndex:100,
        }}>
          <div className="view-pill" style={{ boxShadow:`0 4px 14px ${C.shadowMd}` }}>
            <button className={`view-btn ${viewMode==='map'?'on':''}`} onClick={() => setViewMode('map')}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
              </svg>
              Map
            </button>
            <button className={`view-btn ${viewMode==='list'?'on':''}`} onClick={() => setViewMode('list')}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
              List
            </button>
          </div>
        </div>

        {/* FILTER PANEL — Mobile */}
        {filterOpen && (
          <div className="m-topbar fi" style={{
            position:'absolute', top:60, right:10, zIndex:200,
            background:C.surface, border:`1.5px solid ${C.border}`,
            borderRadius:20, padding:18, width:260,
            boxShadow:`0 20px 50px ${C.shadowLg}`,
          }}>
            <FilterPanel
              radius={radius} setRadius={setRadius}
              typeFilter={typeFilter} setTypeFilter={setTypeFilter}
              onApply={() => { fetchData(); setFilterOpen(false); }}
            />
          </div>
        )}

        {/* MAP FABs */}
        <div className="m-fabs" style={{
          position:'absolute', right:10, bottom:86, zIndex:100,
          display:'flex', flexDirection:'column', gap:7,
        }}>
          <button className="fab" title="My location" onClick={() => {
            if (mapRef.current && userLocation)
              mapRef.current.flyTo([userLocation.latitude, userLocation.longitude], 16, { duration:.9 });
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
              <circle cx="12" cy="12" r="3"/><path d="M12 1v4m0 14v4M1 12h4m14 0h4"/>
            </svg>
          </button>
          <button className="fab" title="Clear route" onClick={clearRoute}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <button className="fab" title="Refresh" onClick={fetchData}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
              <path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
            </svg>
          </button>
        </div>

        {/* STATUS BAR */}
        {viewMode === 'map' && (
          <div className="m-statusbar fi" style={{
            position:'absolute', bottom:16, left:'50%', transform:'translateX(-50%)',
            zIndex:100, display:'flex', alignItems:'center', gap:9,
            background:C.surface, border:`1.5px solid ${C.border}`,
            borderRadius:100, padding:'8px 16px',
            boxShadow:`0 4px 14px ${C.shadowMd}`, whiteSpace:'nowrap',
          }}>
            {loading ? (
              <>
                <div style={{ width:7, height:7, borderRadius:'50%', background:C.accent, animation:'pulse 1s ease infinite' }} />
                <span style={{ color:C.textSub, fontSize:12, fontWeight:500 }}>Updating…</span>
              </>
            ) : (
              <>
                <div style={{ width:7, height:7, borderRadius:'50%', background:C.green }} />
                <span style={{ color:C.text, fontWeight:700, fontSize:12 }}>{allItems.length} places</span>
                <span style={{ color:C.border, fontSize:10 }}>|</span>
                <span style={{ color:C.textSub, fontSize:12 }}>
                  {radius < 1 ? `${Math.round(radius*1000)}m` : `${radius}km`} radius
                </span>
              </>
            )}
          </div>
        )}

        {/* Legend */}
        {viewMode === 'map' && (
          <div style={{ position:'absolute', bottom:54, left:10, zIndex:100, display:'flex', flexDirection:'column', gap:4 }}>
            {Object.entries(TYPE).map(([k, m]) => (
              <div key={k} style={{
                display:'flex', alignItems:'center', gap:5,
                background:C.surface, border:`1.5px solid ${C.border}`,
                borderRadius:100, padding:'3px 9px',
                boxShadow:`0 2px 6px ${C.shadowMd}`,
                opacity: typeFilter[k+'s'] !== false ? 1 : 0.4,
              }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:m.color }} />
                <span style={{ color:C.textSub, fontSize:10, fontWeight:600 }}>{m.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* MOBILE LIST SHEET */}
        {viewMode === 'list' && (
          <div className="m-sheet su" style={{
            position:'absolute', bottom:0, left:0, right:0, zIndex:300,
            background:C.surface, borderRadius:'22px 22px 0 0',
            height:'70vh', display:'flex', flexDirection:'column',
            boxShadow:`0 -8px 32px ${C.shadowLg}`,
            border:`1.5px solid ${C.border}`,
          }}>
            <div className="handle" />
            {/* Sheet header */}
            <div style={{ padding:'6px 14px 12px', borderBottom:`1.5px solid ${C.borderLight}` }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <div>
                  <div style={{ fontWeight:800, fontSize:17, color:C.text }}>{allItems.length} Results</div>
                  <div style={{ color:C.textSub, fontSize:11 }}>
                    within {radius < 1 ? `${Math.round(radius*1000)}m` : `${radius} km`}
                  </div>
                </div>
                <button className="fab" style={{ width:32, height:32, fontSize:14 }}
                  onClick={() => setViewMode('map')}>✕</button>
              </div>
              {/* Category chips */}
              <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:2 }}>
                {['All','Shop','House','Job'].map(cat => (
                  <button key={cat} className={`fchip ${activeCategory===cat?'on':''}`}
                    onClick={() => setActiveCategory(cat)}>
                    {cat==='Shop'?'🛒 ':cat==='House'?'🏠 ':cat==='Job'?'💼 ':''}{cat}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'6px 0' }}>
              {loading ? <SkeletonList />
                : filteredItems.length === 0 ? <EmptyState />
                : <ListView items={filteredItems} onSelect={setDetailItem} onRoute={showRoute} openGoogleMaps={openGoogleMaps} />}
            </div>
          </div>
        )}
      </div>

      {/* DETAIL DRAWER */}
      {detailItem && (
        <DetailDrawer
          item={detailItem}
          onClose={() => setDetailItem(null)}
          onRoute={showRoute}
          openGoogleMaps={openGoogleMaps}
        />
      )}

      {/* ERROR TOAST */}
      {error && (
        <div className="sd" style={{
          position:'absolute', top:14, left:'50%', transform:'translateX(-50%)',
          zIndex:600, background:'#FEF2F2', border:'1.5px solid #FECACA',
          borderRadius:14, padding:'10px 14px',
          display:'flex', gap:9, alignItems:'center',
          boxShadow:`0 8px 28px ${C.shadowLg}`, minWidth:220,
        }}>
          <span style={{ fontSize:15 }}>⚠️</span>
          <span style={{ color:C.red, fontSize:12.5, flex:1 }}>{error}</span>
          <button style={{ background:'transparent', border:'none', color:C.textMuted, cursor:'pointer', fontSize:15 }}
            onClick={() => setError('')}>✕</button>
        </div>
      )}
    </div>
  );
}

// ─── SIDEBAR ───────────────────────────────────────────────────────────────
function SidebarContent({ allItems, filteredItems, loading, radius, setRadius, search, setSearch,
  typeFilter, setTypeFilter, activeCategory, setActiveCategory, viewMode, setViewMode,
  onSelect, onRoute, openGoogleMaps, fetchData, clearRoute }) {

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      {/* Header */}
      <div style={{ padding:'18px 18px 14px', borderBottom:`1.5px solid ${C.borderLight}` }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:9 }}>
            <div style={{
              width:36, height:36, borderRadius:10,
              background:`linear-gradient(135deg,${C.accent},${C.accentDark})`,
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
            }}>📍</div>
            <div>
              <div style={{ fontWeight:800, fontSize:17, color:C.text, letterSpacing:'-.3px' }}>Nearby</div>
              <div style={{ fontSize:11, color:C.textMuted, fontWeight:500 }}>Explore around you</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:6 }}>
            <button className="fab" style={{ width:34, height:34 }} onClick={clearRoute} title="Clear route">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <button className="fab" style={{ width:34, height:34 }} onClick={fetchData} title="Refresh">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
                <path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
              </svg>
            </button>
          </div>
        </div>
        <div style={{ position:'relative' }}>
          <span style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:C.textMuted, pointerEvents:'none', display:'flex' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </span>
          <input className="m-search" placeholder="Search shops, houses, jobs…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding:'12px 18px 10px', borderBottom:`1.5px solid ${C.borderLight}` }}>
        <div style={{ display:'flex', gap:6, marginBottom:12, flexWrap:'wrap' }}>
          {[
            { id:'All', label:'All', emoji:'' },
            { id:'Shop', label:'Shops', emoji:'🛒' },
            { id:'House', label:'Houses', emoji:'🏠' },
            { id:'Job', label:'Jobs', emoji:'💼' },
          ].map(c => (
            <button key={c.id} className={`fchip ${activeCategory===c.id?'on':''}`}
              onClick={() => setActiveCategory(c.id)}>
              {c.emoji && `${c.emoji} `}{c.label}
            </button>
          ))}
        </div>

        {/* Radius slider */}
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
            <span style={{ color:C.textSub, fontSize:12, fontWeight:500 }}>Search Radius</span>
            <span style={{ background:C.accentLight, color:C.accent, borderRadius:100, padding:'2px 9px', fontSize:11, fontWeight:700 }}>
              {radius < 1 ? `${Math.round(radius*1000)}m` : `${radius}km`}
            </span>
          </div>
          <input type="range" className="m-slider" min={0.1} max={10} step={0.1}
            value={radius} onChange={e => setRadius(Number(e.target.value))} />
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
            <span style={{ color:C.textMuted, fontSize:10 }}>100m</span>
            <span style={{ color:C.textMuted, fontSize:10 }}>10 km</span>
          </div>
        </div>

        {/* Type toggles */}
        <div style={{ marginTop:12 }}>
          {[
            { key:'shops',  label:'Shops',  emoji:'🛒', color:C.accent },
            { key:'houses', label:'Houses', emoji:'🏠', color:C.green  },
            { key:'jobs',   label:'Jobs',   emoji:'💼', color:C.amber  },
          ].map(t => (
            <div key={t.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:`1px solid ${C.borderLight}` }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:TYPE[t.key.slice(0,-1)]?.bg||C.accentLight,
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>{t.emoji}</div>
                <span style={{ color:C.text, fontSize:13, fontWeight:500 }}>{t.label}</span>
              </div>
              <label className="tog">
                <input type="checkbox" checked={typeFilter[t.key]}
                  onChange={e => setTypeFilter(p => ({ ...p, [t.key]: e.target.checked }))} />
                <div className="tog-track" />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Count + View toggle */}
      <div style={{ padding:'10px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${C.borderLight}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:loading?C.accent:C.green, animation:loading?'pulse 1s ease infinite':'none' }} />
          <span style={{ fontWeight:700, fontSize:13, color:C.text }}>{allItems.length}</span>
          <span style={{ fontSize:12, color:C.textSub }}>results</span>
        </div>
        <div className="view-pill">
          <button className={`view-btn ${viewMode==='map'?'on':''}`} style={{ padding:'5px 12px', fontSize:11.5 }} onClick={() => setViewMode('map')}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
            </svg>
            Map
          </button>
          <button className={`view-btn ${viewMode==='list'?'on':''}`} style={{ padding:'5px 12px', fontSize:11.5 }} onClick={() => setViewMode('list')}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
            </svg>
            List
          </button>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'6px 0' }}>
        {loading ? <SkeletonList />
          : filteredItems.length === 0 ? <EmptyState />
          : <ListView items={filteredItems} onSelect={onSelect} onRoute={onRoute} openGoogleMaps={openGoogleMaps} />}
      </div>
    </div>
  );
}

// ─── FILTER PANEL (mobile) ─────────────────────────────────────────────────
function FilterPanel({ radius, setRadius, typeFilter, setTypeFilter, onApply }) {
  return (
    <>
      <div style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:14 }}>Filters</div>
      <div style={{ marginBottom:14 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
          <span style={{ color:C.textSub, fontSize:12, fontWeight:500 }}>Radius</span>
          <span style={{ color:C.accent, fontWeight:700, fontSize:12 }}>
            {radius < 1 ? `${Math.round(radius*1000)}m` : `${radius}km`}
          </span>
        </div>
        <input type="range" className="m-slider" min={0.1} max={10} step={0.1}
          value={radius} onChange={e => setRadius(Number(e.target.value))} />
      </div>
      <div style={{ marginBottom:14 }}>
        <div style={{ color:C.textSub, fontSize:11.5, fontWeight:600, marginBottom:8, textTransform:'uppercase', letterSpacing:'.05em' }}>Show</div>
        {[
          { key:'shops', label:'Shops', emoji:'🛒' },
          { key:'houses', label:'Houses', emoji:'🏠' },
          { key:'jobs', label:'Jobs', emoji:'💼' },
        ].map(t => (
          <div key={t.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:`1px solid ${C.borderLight}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
              <span style={{ fontSize:14 }}>{t.emoji}</span>
              <span style={{ color:C.text, fontSize:13 }}>{t.label}</span>
            </div>
            <label className="tog">
              <input type="checkbox" checked={typeFilter[t.key]}
                onChange={e => setTypeFilter(p => ({ ...p, [t.key]: e.target.checked }))} />
              <div className="tog-track" />
            </label>
          </div>
        ))}
      </div>
      <button className="btn btn-primary" style={{ width:'100%', borderRadius:11, padding:'11px' }} onClick={onApply}>
        Apply
      </button>
    </>
  );
}

// ─── LIST VIEW ─────────────────────────────────────────────────────────────
function ListView({ items, onSelect, onRoute, openGoogleMaps }) {
  return (
    <div style={{ padding:'4px 12px', display:'flex', flexDirection:'column', gap:7 }}>
      {items.map((item, i) => {
        const m     = TYPE[item._type];
        const name  = getName(item);
        const sub   = getSub(item);
        const price = item._type === 'house' ? fmtINR(item.rent_per_month)+'/mo'
          : item._type === 'job' ? fmtINR(item.salary)+'/'+(item.salary_type==='month'?'mo':'day') : null;

        return (
          <div key={`${item._type}-${item.id||i}`} className="m-card" onClick={() => onSelect(item)}>
            <div style={{ width:42, height:42, borderRadius:12, flexShrink:0, background:m.bg,
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:19, border:`1.5px solid ${m.color}22` }}>
              {m.emoji}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:14, color:C.text, marginBottom:1,
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{name}</div>
              {sub && <div style={{ color:C.textSub, fontSize:11.5, marginBottom:5,
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{sub}</div>}
              <div style={{ display:'flex', alignItems:'center', gap:7, flexWrap:'wrap' }}>
                <span className="badge" style={{ background:m.bg, color:m.color }}>{m.label}</span>
                <span style={{ color:C.textMuted, fontSize:11, display:'flex', alignItems:'center', gap:3 }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill={C.accent}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
                  {fmtDist(item.distance)}
                </span>
                {price && <span style={{ color:m.color, fontWeight:700, fontSize:11 }}>{price}</span>}
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:5, flexShrink:0 }}>
              <button className="btn" style={{ width:30, height:30, borderRadius:9, background:C.accentLight,
                color:C.accent, border:`1.5px solid ${C.accentMid}`, fontSize:13, padding:0 }}
                onClick={e => { e.stopPropagation(); onRoute(item); }} title="Route">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <button className="btn" style={{ width:30, height:30, borderRadius:9, background:C.surfaceAlt,
                color:C.textSub, border:`1.5px solid ${C.border}`, fontSize:12, padding:0 }}
                onClick={e => { e.stopPropagation(); onSelect(item); }} title="View">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── DETAIL DRAWER ─────────────────────────────────────────────────────────
function DetailDrawer({ item, onClose, onRoute, openGoogleMaps }) {
  const m     = TYPE[item._type] || {};
  const name  = getName(item);
  const sub   = getSub(item);
  const phone = item.owner_phone || item.employer_phone || item.phone;

  return (
    <>
      <div style={{ position:'fixed', inset:0, zIndex:400, background:'rgba(15,23,42,0.4)', backdropFilter:'blur(3px)' }}
        onClick={onClose} />
      <div className="su" style={{
        position:'fixed', bottom:0, left:0, right:0, zIndex:500,
        background:C.surface, borderRadius:'24px 24px 0 0',
        maxHeight:'84vh', display:'flex', flexDirection:'column',
        boxShadow:`0 -12px 50px ${C.shadowLg}`, border:`1.5px solid ${C.border}`,
      }}>
        <div className="handle" />
        <button style={{ position:'absolute', top:14, right:14, background:C.surfaceAlt,
          border:`1.5px solid ${C.border}`, borderRadius:'50%', width:30, height:30,
          display:'flex', alignItems:'center', justifyContent:'center',
          cursor:'pointer', color:C.textSub, fontSize:15, zIndex:10 }}
          onClick={onClose}>✕</button>

        {/* Banner */}
        <div style={{ padding:'12px 18px 16px', background:`linear-gradient(135deg,${m.bg},transparent)`, borderBottom:`1.5px solid ${C.borderLight}` }}>
          <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
            <div style={{ width:52, height:52, borderRadius:16, background:m.bg, border:`2px solid ${m.color}28`,
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>
              {m.emoji}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:800, fontSize:18, color:C.text, lineHeight:1.2, marginBottom:2, letterSpacing:'-.3px' }}>{name}</div>
              <div style={{ color:C.textSub, fontSize:12.5, marginBottom:8 }}>{sub}</div>
              <div style={{ display:'flex', gap:7, flexWrap:'wrap', alignItems:'center' }}>
                <span className="badge" style={{ background:m.bg, color:m.color }}>{m.label}</span>
                {item.distance != null && (
                  <span style={{ fontSize:12, color:C.accent, fontWeight:600, display:'flex', alignItems:'center', gap:3 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill={C.accent}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
                    {fmtDist(item.distance)} away
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:'auto', padding:'16px 18px' }}>
          {item._type === 'shop'  && <ShopBody  item={item} />}
          {item._type === 'house' && <HouseBody item={item} />}
          {item._type === 'job'   && <JobBody   item={item} />}

          {/* Contact + Actions */}
          <div style={{ marginTop:18, padding:14, background:C.surfaceAlt, border:`1.5px solid ${C.borderLight}`, borderRadius:16 }}>
            <div style={{ color:C.textMuted, fontSize:10, fontWeight:700, letterSpacing:'.07em', textTransform:'uppercase', marginBottom:10 }}>Contact</div>
            {(item.owner_name || item.employer_name) && (
              <div style={{ fontWeight:700, fontSize:14, color:C.text, marginBottom:2 }}>
                {item.owner_name || item.employer_name}
              </div>
            )}
            {phone && (
              <a href={`tel:${phone}`} style={{ color:C.accent, fontSize:13.5, textDecoration:'none', fontWeight:600, display:'block', marginBottom:12 }}>
                {phone}
              </a>
            )}
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <button className="btn btn-primary" style={{ flex:1, borderRadius:11, minWidth:100 }}
                onClick={() => onRoute(item)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                Route
              </button>
              <button className="btn btn-ghost" style={{ flex:1, borderRadius:11, minWidth:100 }}
                onClick={() => openGoogleMaps(item)}>
                🗺 Maps
              </button>
              {phone && (
                <button className="btn btn-ghost" style={{ flex:1, borderRadius:11, minWidth:100 }}
                  onClick={() => window.location.href=`tel:${phone}`}>
                  📞 Call
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function InfoRow({ label, value, accent }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:`1px solid ${C.borderLight}` }}>
      <span style={{ color:C.textSub, fontSize:12.5 }}>{label}</span>
      <span style={{ color:accent||C.text, fontWeight:600, fontSize:13 }}>{value||'—'}</span>
    </div>
  );
}

function ShopBody({ item }) {
  return (
    <>
      {item.description && (
        <div style={{ marginBottom:14 }}>
          <div style={{ color:C.textMuted, fontSize:10, fontWeight:700, letterSpacing:'.07em', textTransform:'uppercase', marginBottom:5 }}>About</div>
          <div style={{ color:C.textSub, fontSize:13, lineHeight:1.65 }}>{item.description}</div>
        </div>
      )}
      {item.opening_time && item.closing_time && (
        <InfoRow label="Hours" value={`${item.opening_time.slice(0,5)} – ${item.closing_time.slice(0,5)}`} accent={C.accent} />
      )}
      {item.keywords?.length > 0 && (
        <div style={{ marginTop:12 }}>
          <div style={{ color:C.textMuted, fontSize:10, fontWeight:700, letterSpacing:'.07em', textTransform:'uppercase', marginBottom:7 }}>Tags</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
            {item.keywords.map((k,i) => (
              <span key={i} style={{ padding:'4px 9px', borderRadius:100, fontSize:11.5, background:C.accentLight, color:C.accent, fontWeight:500 }}>#{k}</span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function HouseBody({ item }) {
  return (
    <>
      <div style={{ background:C.greenLight, border:`1.5px solid ${C.green}22`, borderRadius:14, padding:13, marginBottom:14, textAlign:'center' }}>
        <div style={{ color:C.textSub, fontSize:11, marginBottom:2 }}>Monthly Rent</div>
        <div style={{ fontWeight:800, fontSize:24, color:C.green }}>{fmtINR(item.rent_per_month)}</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
        {[
          { label:'Rooms', value:`${item.rooms} BHK` },
          { label:'Halls', value:item.halls },
          { label:'Kitchens', value:item.kitchens },
          { label:'Floor', value:item.floor },
        ].map(r => (
          <div key={r.label} style={{ background:C.surfaceAlt, border:`1.5px solid ${C.borderLight}`, borderRadius:11, padding:10 }}>
            <div style={{ color:C.textMuted, fontSize:10, marginBottom:3, fontWeight:600 }}>{r.label}</div>
            <div style={{ color:C.text, fontWeight:700, fontSize:14 }}>{r.value||'—'}</div>
          </div>
        ))}
      </div>
      {item.description && <div style={{ color:C.textSub, fontSize:13, lineHeight:1.65 }}>{item.description}</div>}
    </>
  );
}

function JobBody({ item }) {
  return (
    <>
      <div style={{ background:C.amberLight, border:`1.5px solid ${C.amber}22`, borderRadius:14, padding:13, marginBottom:14, textAlign:'center' }}>
        <div style={{ color:C.textSub, fontSize:11, marginBottom:2 }}>Salary</div>
        <div style={{ fontWeight:800, fontSize:24, color:C.amber }}>
          {fmtINR(item.salary)}
          <span style={{ fontSize:13, fontWeight:400 }}>/{item.salary_type==='month'?'month':'day'}</span>
        </div>
      </div>
      <div style={{ display:'flex', gap:7, marginBottom:12, flexWrap:'wrap' }}>
        <span style={{ padding:'5px 11px', borderRadius:100, fontSize:12, background:C.accentLight, color:C.accent, fontWeight:600, border:`1.5px solid ${C.accentMid}` }}>
          {item.job_type === 'full_time' ? '⏱ Full Time' : '⏰ Part Time'}
        </span>
        {item.qualification && (
          <span style={{ padding:'5px 11px', borderRadius:100, fontSize:12, background:C.purpleLight, color:C.purple, fontWeight:600, border:`1.5px solid ${C.purple}22` }}>
            🎓 {item.qualification}
          </span>
        )}
      </div>
      {item.description && <div style={{ color:C.textSub, fontSize:13, lineHeight:1.65 }}>{item.description}</div>}
    </>
  );
}

// ─── SKELETON + EMPTY ──────────────────────────────────────────────────────
function SkeletonList() {
  return (
    <div style={{ padding:'4px 12px', display:'flex', flexDirection:'column', gap:8 }}>
      {[...Array(4)].map((_,i) => (
        <div key={i} style={{ display:'flex', gap:11, alignItems:'center', background:C.surface, border:`1.5px solid ${C.borderLight}`, borderRadius:16, padding:12 }}>
          <div className="skeleton" style={{ width:42, height:42, borderRadius:12, flexShrink:0 }} />
          <div style={{ flex:1 }}>
            <div className="skeleton" style={{ height:13, width:'52%', marginBottom:7 }} />
            <div className="skeleton" style={{ height:10, width:'35%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'48px 20px', textAlign:'center', gap:11 }}>
      <div style={{ width:60, height:60, borderRadius:18, background:C.accentLight, border:`2px solid ${C.accentMid}`,
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>🔍</div>
      <div style={{ fontWeight:700, fontSize:16, color:C.text }}>Nothing nearby</div>
      <div style={{ color:C.textSub, fontSize:13, maxWidth:210 }}>Try increasing the radius or clearing filters</div>
    </div>
  );
}

// ─── LOADING SCREEN ────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{ height:'100dvh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      gap:20, background:C.bg, fontFamily:'Inter, sans-serif' }}>
      <div style={{ position:'relative', width:68, height:68 }}>
        <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:`2px solid ${C.accent}`, opacity:.2, animation:'ripple 2s ease-out infinite' }} />
        <div style={{ position:'absolute', inset:8, borderRadius:'50%', background:C.accentLight, border:`2px solid ${C.accentMid}`,
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>📍</div>
      </div>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontWeight:800, fontSize:18, color:C.text, marginBottom:8, letterSpacing:'-.3px' }}>Finding your location</div>
        <div style={{ color:C.textSub, fontSize:12.5, display:'flex', gap:5, justifyContent:'center', alignItems:'center' }}>
          Please wait
          <span style={{ display:'flex', gap:3 }}>
            <span className="d1" style={{ display:'inline-block', width:4, height:4, borderRadius:'50%', background:C.accent }} />
            <span className="d2" style={{ display:'inline-block', width:4, height:4, borderRadius:'50%', background:C.accent }} />
            <span className="d3" style={{ display:'inline-block', width:4, height:4, borderRadius:'50%', background:C.accent }} />
          </span>
        </div>
      </div>
    </div>
  );
}