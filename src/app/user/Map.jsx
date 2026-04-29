// app/user/Map.jsx  — Redesigned UI (mobile-first + desktop responsive)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getAllNearby } from '../../services/map';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// ─── Fix default Leaflet icons ────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg:          '#F5F7FF',
  surface:     '#FFFFFF',
  surfaceAlt:  '#F0F3FF',
  border:      '#E4E9F7',
  borderLight: '#EEF1FA',
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
  shadow:      'rgba(37,99,235,0.10)',
  shadowMd:    'rgba(15,23,42,0.08)',
  shadowLg:    'rgba(15,23,42,0.14)',
};

const TYPE = {
  shop:  { color: C.accent,  bg: C.accentLight, emoji: '🛒', label: 'Shop',  icon: 'shop'  },
  house: { color: C.green,   bg: C.greenLight,  emoji: '🏠', label: 'House', icon: 'house' },
  job:   { color: C.amber,   bg: C.amberLight,  emoji: '💼', label: 'Job',   icon: 'job'   },
};

// ─── Custom SVG Map Markers ───────────────────────────────────────────────────
const MARKER_SVG = {
  shop: (color) => `
    <svg width="38" height="48" viewBox="0 0 38 48" xmlns="http://www.w3.org/2000/svg">
      <filter id="s"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="${color}" flood-opacity="0.35"/></filter>
      <path d="M19 0C8.51 0 0 8.51 0 19c0 14.25 19 29 19 29S38 33.25 38 19C38 8.51 29.49 0 19 0z"
        fill="${color}" filter="url(#s)"/>
      <circle cx="19" cy="19" r="11" fill="white" opacity="0.97"/>
      <text x="19" y="24" text-anchor="middle" font-size="13" font-family="sans-serif">🛒</text>
    </svg>`,
  house: (color) => `
    <svg width="38" height="48" viewBox="0 0 38 48" xmlns="http://www.w3.org/2000/svg">
      <filter id="s"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="${color}" flood-opacity="0.35"/></filter>
      <path d="M19 0C8.51 0 0 8.51 0 19c0 14.25 19 29 19 29S38 33.25 38 19C38 8.51 29.49 0 19 0z"
        fill="${color}" filter="url(#s)"/>
      <circle cx="19" cy="19" r="11" fill="white" opacity="0.97"/>
      <text x="19" y="24" text-anchor="middle" font-size="13" font-family="sans-serif">🏠</text>
    </svg>`,
  job: (color) => `
    <svg width="38" height="48" viewBox="0 0 38 48" xmlns="http://www.w3.org/2000/svg">
      <filter id="s"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="${color}" flood-opacity="0.35"/></filter>
      <path d="M19 0C8.51 0 0 8.51 0 19c0 14.25 19 29 19 29S38 33.25 38 19C38 8.51 29.49 0 19 0z"
        fill="${color}" filter="url(#s)"/>
      <circle cx="19" cy="19" r="11" fill="white" opacity="0.97"/>
      <text x="19" y="24" text-anchor="middle" font-size="13" font-family="sans-serif">💼</text>
    </svg>`,
  user: `
    <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="12" fill="#2563EB" stroke="white" stroke-width="3"/>
      <circle cx="14" cy="14" r="5" fill="white"/>
    </svg>`,
};

const makeIcon = (type) => L.divIcon({
  className: '',
  html: type === 'user'
    ? MARKER_SVG.user
    : MARKER_SVG[type](TYPE[type].color),
  iconSize:    type === 'user' ? [28, 28] : [38, 48],
  iconAnchor:  type === 'user' ? [14, 14] : [19, 48],
  popupAnchor: type === 'user' ? [0, -14] : [0, -50],
});

const ICONS = { shop: makeIcon('shop'), house: makeIcon('house'), job: makeIcon('job'), user: makeIcon('user') };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtINR  = (n) => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n||0);
const fmtDist = (d) => d != null ? (d < 1 ? `${Math.round(d*1000)}m` : `${d.toFixed(1)} km`) : '—';
const getName = (item) => item.title || item.business_name || item.job_title || 'Untitled';
const getSub  = (item) => item.subtitle || item.category || item.company_name || '';
const esc     = (s) => s?.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])) || '';

// ─── CSS Injection ────────────────────────────────────────────────────────────
const injectCSS = () => {
  if (document.getElementById('nz-map-css')) return;
  const s = document.createElement('style');
  s.id = 'nz-map-css';
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }

    .nz-root {
      font-family: 'DM Sans', sans-serif;
      background: ${C.bg};
      color: ${C.text};
      height: 100dvh;
      overflow: hidden;
      position: relative;
    }

    /* ── Leaflet overrides ── */
    .leaflet-container {
      background: #E8EDF8 !important;
      font-family: 'DM Sans', sans-serif !important;
    }
    .leaflet-popup-content-wrapper {
      background: ${C.surface} !important;
      border: 1.5px solid ${C.border} !important;
      border-radius: 18px !important;
      box-shadow: 0 12px 40px ${C.shadowLg} !important;
      color: ${C.text} !important;
      padding: 0 !important;
      overflow: hidden;
    }
    .leaflet-popup-tip-container { display: none; }
    .leaflet-popup-close-button {
      color: ${C.textMuted} !important;
      font-size: 20px !important;
      width: 28px !important;
      height: 28px !important;
      top: 10px !important;
      right: 10px !important;
      border-radius: 50% !important;
      background: ${C.surfaceAlt} !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      line-height: 1 !important;
    }
    .leaflet-control-attribution { display: none !important; }
    .leaflet-bar {
      border: none !important;
      box-shadow: 0 4px 16px ${C.shadowMd} !important;
    }
    .leaflet-bar a {
      background: ${C.surface} !important;
      color: ${C.accent} !important;
      border: 1.5px solid ${C.border} !important;
      border-radius: 12px !important;
      margin: 4px !important;
      width: 36px !important;
      height: 36px !important;
      line-height: 34px !important;
      font-size: 18px !important;
      font-weight: 600 !important;
    }
    .leaflet-bar a:hover {
      background: ${C.accentLight} !important;
      color: ${C.accentDark} !important;
    }

    /* ── Animations ── */
    @keyframes slideUp   { from { transform:translateY(100%); opacity:0; } to { transform:translateY(0); opacity:1; } }
    @keyframes slideDown { from { transform:translateY(-20px); opacity:0; } to { transform:translateY(0); opacity:1; } }
    @keyframes fadeIn    { from { opacity:0; transform:scale(0.97); } to { opacity:1; transform:scale(1); } }
    @keyframes pulse     { 0%,100% { opacity:1; } 50% { opacity:.4; } }
    @keyframes spin      { to { transform:rotate(360deg); } }
    @keyframes ripple    { 0% { transform:scale(1); opacity:.6; } 100% { transform:scale(2.8); opacity:0; } }
    @keyframes shimmer   { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }

    .anim-slide-up   { animation: slideUp   .38s cubic-bezier(.16,1,.3,1) both; }
    .anim-slide-down { animation: slideDown .32s cubic-bezier(.16,1,.3,1) both; }
    .anim-fade-in    { animation: fadeIn    .26s ease both; }

    /* ── Scrollbar ── */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }

    /* ── Skeleton ── */
    .skeleton {
      background: linear-gradient(90deg, ${C.surfaceAlt} 25%, ${C.border} 50%, ${C.surfaceAlt} 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s ease infinite;
      border-radius: 8px;
    }

    /* ── Button base ── */
    .nz-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border: none;
      cursor: pointer;
      font-family: 'DM Sans', sans-serif;
      font-weight: 600;
      transition: all .18s ease;
      outline: none;
      white-space: nowrap;
    }
    .nz-btn-primary {
      background: ${C.accent};
      color: #fff;
      border-radius: 12px;
      padding: 10px 18px;
      font-size: 13px;
    }
    .nz-btn-primary:hover  { background: ${C.accentDark}; transform:translateY(-1px); box-shadow:0 6px 18px ${C.shadow}; }
    .nz-btn-primary:active { transform:scale(.97); }
    .nz-btn-ghost {
      background: ${C.surface};
      color: ${C.text};
      border: 1.5px solid ${C.border};
      border-radius: 12px;
      padding: 10px 18px;
      font-size: 13px;
    }
    .nz-btn-ghost:hover { border-color:${C.accent}; color:${C.accent}; background:${C.accentLight}; }

    /* ── Pill tabs ── */
    .nz-tab {
      flex: 1;
      padding: 7px 12px;
      border: none;
      background: transparent;
      color: ${C.textSub};
      font-family: 'DM Sans', sans-serif;
      font-size: 12.5px;
      font-weight: 500;
      cursor: pointer;
      border-radius: 10px;
      transition: all .18s;
    }
    .nz-tab.active {
      background: ${C.accent};
      color: #fff;
      font-weight: 600;
      box-shadow: 0 3px 10px ${C.shadow};
    }

    /* ── Icon button ── */
    .nz-fab {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      border: 1.5px solid ${C.border};
      background: ${C.surface};
      color: ${C.textSub};
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 16px;
      transition: all .18s;
      box-shadow: 0 2px 8px ${C.shadowMd};
      flex-shrink: 0;
    }
    .nz-fab:hover  { border-color:${C.accent}; color:${C.accent}; background:${C.accentLight}; transform:scale(1.06); }
    .nz-fab:active { transform:scale(.94); }
    .nz-fab.active { background:${C.accent}; color:#fff; border-color:${C.accent}; box-shadow:0 4px 14px ${C.shadow}; }

    /* ── Search Input ── */
    .nz-search {
      width: 100%;
      background: ${C.surface};
      border: 1.5px solid ${C.border};
      border-radius: 14px;
      padding: 11px 16px 11px 42px;
      color: ${C.text};
      font-family: 'DM Sans', sans-serif;
      font-size: 13.5px;
      outline: none;
      transition: border-color .2s, box-shadow .2s;
      box-shadow: 0 2px 8px ${C.shadowMd};
    }
    .nz-search:focus { border-color:${C.accent}; box-shadow:0 0 0 3px ${C.accentMid}44; }
    .nz-search::placeholder { color:${C.textMuted}; }

    /* ── Card ── */
    .nz-card {
      background: ${C.surface};
      border: 1.5px solid ${C.borderLight};
      border-radius: 16px;
      padding: 13px;
      cursor: pointer;
      transition: all .2s ease;
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }
    .nz-card:hover {
      border-color: ${C.accentMid};
      transform: translateY(-2px);
      box-shadow: 0 8px 28px ${C.shadow};
    }

    /* ── Badge ── */
    .nz-badge {
      font-family: 'DM Sans', sans-serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .04em;
      padding: 3px 9px;
      border-radius: 100px;
      text-transform: uppercase;
    }

    /* ── Chip ── */
    .nz-chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 12px;
      border-radius: 100px;
      border: 1.5px solid;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all .18s;
      font-family: 'DM Sans', sans-serif;
    }

    /* ── Range slider ── */
    .nz-slider {
      -webkit-appearance: none;
      width: 100%;
      height: 5px;
      border-radius: 3px;
      background: ${C.border};
      outline: none;
      cursor: pointer;
    }
    .nz-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: ${C.accent};
      cursor: pointer;
      box-shadow: 0 0 0 3px ${C.accentMid}88;
      transition: box-shadow .2s;
    }
    .nz-slider::-webkit-slider-thumb:hover { box-shadow: 0 0 0 6px ${C.accentMid}55; }

    /* ── Toggle ── */
    .nz-toggle { position:relative; width:42px; height:24px; flex-shrink:0; }
    .nz-toggle input { opacity:0; width:0; height:0; }
    .nz-toggle-track {
      position:absolute; inset:0; border-radius:12px;
      background: ${C.border}; cursor:pointer; transition:background .2s;
    }
    .nz-toggle-track::before {
      content:''; position:absolute;
      width:18px; height:18px; left:3px; top:3px;
      border-radius:50%; background: ${C.textMuted};
      transition:all .2s; box-shadow:0 1px 4px rgba(0,0,0,.2);
    }
    .nz-toggle input:checked + .nz-toggle-track { background:${C.accent}; }
    .nz-toggle input:checked + .nz-toggle-track::before { transform:translateX(18px); background:#fff; }

    /* ── Table ── */
    .nz-table { width:100%; border-collapse:collapse; font-size:12.5px; }
    .nz-table th {
      background: ${C.surfaceAlt};
      color: ${C.textSub};
      font-size:11px; font-weight:700; letter-spacing:.06em; text-transform:uppercase;
      padding:11px 14px; text-align:left;
      border-bottom:1.5px solid ${C.border};
      white-space:nowrap; position:sticky; top:0; z-index:2;
    }
    .nz-table td {
      padding:12px 14px;
      border-bottom:1px solid ${C.borderLight};
      font-size:12.5px; color:${C.text}; vertical-align:middle;
    }
    .nz-table tbody tr:hover td { background:${C.surfaceAlt}; }

    /* ── Popup ── */
    .nz-popup { padding:16px; min-width:210px; }
    .nz-popup-title {
      font-family:'Sora',sans-serif; font-weight:700; font-size:16px;
      color:${C.text}; margin-bottom:3px; letter-spacing:-.2px;
    }
    .nz-popup-sub { font-size:12px; color:${C.textSub}; margin-bottom:10px; }

    /* ── Bottom sheet handle ── */
    .nz-handle { width:38px; height:4px; border-radius:2px; background:${C.border}; margin:10px auto 0; }

    /* ── Loading dots ── */
    @keyframes bounce { 0%,80%,100% { transform:translateY(0); } 40% { transform:translateY(-5px); } }
    .d1 { animation:bounce 1.1s infinite 0s; }
    .d2 { animation:bounce 1.1s infinite .15s; }
    .d3 { animation:bounce 1.1s infinite .3s; }

    /* ── Category distance chips ── */
    .dist-chip {
      padding: 6px 14px;
      border-radius: 100px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      border: 1.5px solid ${C.border};
      background: ${C.surface};
      color: ${C.textSub};
      transition: all .18s;
      font-family: 'DM Sans', sans-serif;
    }
    .dist-chip.active, .dist-chip:hover {
      background: ${C.accent};
      border-color: ${C.accent};
      color: #fff;
    }

    /* ── Desktop sidebar ── */
    @media (min-width: 768px) {
      .nz-sidebar {
        position:absolute; left:0; top:0; bottom:0;
        width:360px; z-index:200;
        background:${C.surface};
        border-right:1.5px solid ${C.border};
        display:flex; flex-direction:column;
        box-shadow:4px 0 24px ${C.shadowMd};
      }
      .nz-map-area { position:absolute; left:360px; right:0; top:0; bottom:0; }
      .nz-topbar { display:none !important; }
      .nz-bottom-sheet { display:none !important; }
      .nz-fab-group { left:376px !important; bottom:24px !important; }
      .nz-status-bar { left:376px !important; }
      .nz-legend { left:376px !important; }
    }
    @media (max-width: 767px) {
      .nz-sidebar { display:none !important; }
      .nz-map-area { position:absolute; inset:0; }
    }
  `;
  document.head.appendChild(s);
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Map() {
  const [phase, setPhase]               = useState('locating');
  const [userLocation, setUserLocation] = useState(null);
  const [shops, setShops]               = useState([]);
  const [houses, setHouses]             = useState([]);
  const [jobs, setJobs]                 = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  const [viewMode, setViewMode]       = useState('map');   // map | list | table
  const [filterOpen, setFilterOpen]   = useState(false);
  const [detailItem, setDetailItem]   = useState(null);
  const [sheetOpen, setSheetOpen]     = useState(false);

  const [radius, setRadius]           = useState(2);
  const [search, setSearch]           = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [typeFilter, setTypeFilter]   = useState({ shops:true, houses:true, jobs:true });
  const [ratingFilter, setRatingFilter] = useState(null);

  const mapRef        = useRef(null);
  const mapContRef    = useRef(null);
  const markersRef    = useRef([]);
  const userMarkerRef = useRef(null);
  const userCircleRef = useRef(null);
  const intervalRef   = useRef(null);

  // inject CSS
  useEffect(() => { injectCSS(); }, []);

  // get location
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

  // init map
  useEffect(() => {
    if (phase !== 'ready' || !mapContRef.current || mapRef.current) return;
    mapRef.current = L.map(mapContRef.current, {
      zoomControl: false,
      attributionControl: false,
      zoomAnimation: true,
      fadeAnimation: true,
    }).setView([userLocation.latitude, userLocation.longitude], 15);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom:19 })
      .addTo(mapRef.current);
    L.control.zoom({ position: 'topright' }).addTo(mapRef.current);

    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, [phase]);

  // fetch data
  useEffect(() => {
    if (!userLocation) return;
    fetchData();
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchData, 30000);
    return () => clearInterval(intervalRef.current);
  }, [userLocation, radius, typeFilter, search]);

  // render markers
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;
    renderMarkers();
  }, [shops, houses, jobs, userLocation, radius]);

  // detail popup event from map
  useEffect(() => {
    const h = (e) => setDetailItem(e.detail);
    window.addEventListener('nz:detail', h);
    return () => window.removeEventListener('nz:detail', h);
  }, []);

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

  const renderMarkers = useCallback(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    if (userMarkerRef.current) userMarkerRef.current.remove();
    if (userCircleRef.current) userCircleRef.current.remove();

    const { latitude: lat, longitude: lng } = userLocation;
    mapRef.current.flyTo([lat, lng], mapRef.current.getZoom(), { duration: 0.8 });

    userMarkerRef.current = L.marker([lat, lng], { icon: ICONS.user, zIndexOffset: 1000 })
      .bindPopup('<div class="nz-popup" style="text-align:center;padding:12px"><div style="font-size:24px">📍</div><div class="nz-popup-title" style="margin-top:6px">You are here</div></div>')
      .addTo(mapRef.current);

    userCircleRef.current = L.circle([lat, lng], {
      radius: radius * 1000,
      color: C.accent, fillColor: C.accent,
      fillOpacity: 0.04, weight: 1.5, dashArray: '8 12',
    }).addTo(mapRef.current);

    const addMarkers = (list, type) => list.forEach(item => {
      if (!item.latitude || !item.longitude) return;
      const m = TYPE[type];
      const price = type === 'house' ? `<div style="margin-top:6px;font-weight:700;color:${C.green};font-size:13px">${fmtINR(item.rent_per_month)}/mo</div>`
        : type === 'job' ? `<div style="margin-top:6px;font-weight:700;color:${C.amber};font-size:13px">${fmtINR(item.salary)}/${item.salary_type==='month'?'mo':'day'}</div>`
        : '';
      const popup = `
        <div class="nz-popup">
          <div style="display:flex;gap:10px;align-items:flex-start">
            <div style="width:38px;height:38px;border-radius:10px;background:${m.bg};
              display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;
              border:1.5px solid ${m.color}30">${m.emoji}</div>
            <div style="flex:1;min-width:0">
              <div class="nz-popup-title">${esc(getName(item))}</div>
              <div class="nz-popup-sub">${esc(getSub(item))}</div>
              <span class="nz-badge" style="background:${m.bg};color:${m.color}">${m.label}</span>
            </div>
          </div>
          ${price}
          <div style="display:flex;align-items:center;gap:5px;margin:8px 0 10px;color:${C.textSub};font-size:12px">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="${C.accent}"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            ${fmtDist(item.distance)} away
          </div>
          <button class="nz-btn nz-btn-primary" style="width:100%;border-radius:10px;font-size:12.5px"
            onclick="window.dispatchEvent(new CustomEvent('nz:detail',{detail:${JSON.stringify({...item,_type:type}).replace(/"/g,'&quot;')}}))">
            View Details →
          </button>
        </div>`;

      const marker = L.marker([parseFloat(item.latitude), parseFloat(item.longitude)], { icon: ICONS[type] })
        .bindPopup(popup, { maxWidth: 270 })
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

  const filteredItems = activeCategory === 'All' ? allItems
    : allItems.filter(i => i._type === activeCategory.toLowerCase());

  const openDirections = (item) => {
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${item.latitude},${item.longitude}&travelmode=driving`, '_blank');
  };

  if (phase === 'locating') return <LoadingScreen />;

  return (
    <div className="nz-root">
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="nz-sidebar">
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
          openDirections={openDirections}
          fetchData={fetchData}
        />
      </aside>

      {/* ── MAP AREA ── */}
      <div className="nz-map-area">
        <div ref={mapContRef} style={{ position:'absolute', inset:0, zIndex:0 }} />

        {/* MOBILE TOP BAR */}
        <div className="nz-topbar anim-slide-down" style={{
          position:'absolute', top:0, left:0, right:0, zIndex:100,
          padding:'10px 12px',
          display:'flex', alignItems:'center', gap:10,
        }}>
          {/* Logo pill */}
          <div style={{
            background:C.surface, border:`1.5px solid ${C.border}`,
            borderRadius:100, padding:'7px 14px',
            display:'flex', alignItems:'center', gap:7,
            boxShadow:`0 4px 14px ${C.shadowMd}`,
            flexShrink:0,
          }}>
            <span style={{ fontSize:16 }}>🗺</span>
            <span style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:16, color:C.text, letterSpacing:'-0.3px' }}>
              Near<span style={{ color:C.accent }}>Zo</span>
            </span>
          </div>

          {/* Search */}
          <div style={{ flex:1, position:'relative', minWidth:0 }}>
            <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:C.textMuted, fontSize:15, pointerEvents:'none' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </span>
            <input className="nz-search" placeholder="Search shops, houses, jobs…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* Filter button */}
          <button className={`nz-fab ${filterOpen ? 'active' : ''}`} onClick={() => setFilterOpen(v => !v)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
          </button>
        </div>

        {/* MOBILE VIEW TABS */}
        <div style={{
          position:'absolute', top:68, left:'50%', transform:'translateX(-50%)',
          zIndex:100,
          background:C.surface, border:`1.5px solid ${C.border}`,
          borderRadius:14, padding:3,
          display:'flex', gap:2,
          boxShadow:`0 4px 14px ${C.shadowMd}`,
        }} className="nz-topbar">
          {[
            { id:'map',   icon:'🗺', label:'Map'   },
            { id:'list',  icon:'☰',  label:'List'  },
            { id:'table', icon:'▦',  label:'Table' },
          ].map(v => (
            <button key={v.id} className={`nz-tab ${viewMode===v.id?'active':''}`}
              style={{ padding:'6px 14px' }}
              onClick={() => { setViewMode(v.id); if(v.id!=='map') setSheetOpen(true); }}>
              {v.icon} {v.label}
            </button>
          ))}
        </div>

        {/* RIGHT FABs */}
        <div className="nz-fab-group" style={{
          position:'absolute', right:12, bottom:90, zIndex:100,
          display:'flex', flexDirection:'column', gap:8
        }}>
          <button className="nz-fab" title="My Location" onClick={() => {
            if (mapRef.current && userLocation)
              mapRef.current.flyTo([userLocation.latitude, userLocation.longitude], 15, { duration:1 });
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4m0 14v4M1 12h4m14 0h4"/><circle cx="12" cy="12" r="9" strokeDasharray="3 2"/></svg>
          </button>
          <button className="nz-fab" title="Refresh" onClick={fetchData}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
          </button>
        </div>

        {/* STATUS BAR */}
        {viewMode === 'map' && (
          <div className="nz-status-bar anim-fade-in" style={{
            position:'absolute', bottom:18, left:'50%', transform:'translateX(-50%)',
            zIndex:100,
            display:'flex', alignItems:'center', gap:10,
            background:C.surface, border:`1.5px solid ${C.border}`,
            borderRadius:100, padding:'8px 18px',
            boxShadow:`0 4px 14px ${C.shadowMd}`,
            whiteSpace:'nowrap',
          }}>
            {loading ? (
              <>
                <div style={{ width:8, height:8, borderRadius:'50%', background:C.accent, animation:'pulse 1s ease infinite' }} />
                <span style={{ color:C.textSub, fontSize:12.5 }}>Updating…</span>
              </>
            ) : (
              <>
                <div style={{ width:8, height:8, borderRadius:'50%', background:C.green }} />
                <span style={{ color:C.text, fontWeight:700, fontSize:12.5 }}>{allItems.length} places</span>
                <span style={{ color:C.border, fontSize:10 }}>|</span>
                <span style={{ color:C.textSub, fontSize:12.5 }}>{radius} km radius</span>
              </>
            )}
          </div>
        )}

        {/* LEGEND */}
        {viewMode === 'map' && (
          <div className="nz-legend" style={{
            position:'absolute', bottom:56, left:12, zIndex:100,
            display:'flex', flexDirection:'column', gap:5
          }}>
            {Object.entries(TYPE).map(([k, m]) => (
              <div key={k} style={{
                display:'flex', alignItems:'center', gap:6,
                background:C.surface, border:`1.5px solid ${C.border}`,
                borderRadius:100, padding:'4px 10px',
                boxShadow:`0 2px 8px ${C.shadowMd}`,
                opacity: typeFilter[k+'s'] !== false ? 1 : 0.4,
              }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:m.color }} />
                <span style={{ color:C.textSub, fontSize:10.5, fontWeight:500 }}>{m.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* FILTER PANEL */}
        {filterOpen && (
          <div className="nz-topbar anim-fade-in" style={{
            position:'absolute', top:66, right:12, zIndex:200,
            background:C.surface, border:`1.5px solid ${C.border}`,
            borderRadius:20, padding:20, width:270,
            boxShadow:`0 20px 50px ${C.shadowLg}`,
          }}>
            <FilterPanel
              radius={radius} setRadius={setRadius}
              typeFilter={typeFilter} setTypeFilter={setTypeFilter}
              onApply={() => { fetchData(); setFilterOpen(false); }}
            />
          </div>
        )}

        {/* MOBILE BOTTOM SHEET */}
        {viewMode !== 'map' && (
          <div className="nz-bottom-sheet anim-slide-up" style={{
            position:'absolute', bottom:0, left:0, right:0,
            zIndex:300, background:C.surface,
            borderRadius:'22px 22px 0 0',
            height:'72vh',
            display:'flex', flexDirection:'column',
            boxShadow:`0 -8px 32px ${C.shadowLg}`,
            border:`1.5px solid ${C.border}`,
          }}>
            <div className="nz-handle" />
            <div style={{
              padding:'8px 16px 14px',
              display:'flex', alignItems:'center', justifyContent:'space-between',
              borderBottom:`1.5px solid ${C.borderLight}`,
            }}>
              <div>
                <div style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:18, color:C.text }}>
                  {allItems.length} Results
                </div>
                <div style={{ color:C.textSub, fontSize:11.5 }}>within {radius} km</div>
              </div>
              <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                <div style={{ display:'flex', gap:2, background:C.bg, borderRadius:12, padding:3, border:`1.5px solid ${C.border}` }}>
                  {['list','table'].map(v => (
                    <button key={v} className={`nz-tab ${viewMode===v?'active':''}`}
                      style={{ padding:'4px 12px', fontSize:11 }}
                      onClick={() => setViewMode(v)}>
                      {v==='list' ? '☰ List' : '▦ Table'}
                    </button>
                  ))}
                </div>
                <button className="nz-fab" style={{ width:32, height:32, fontSize:13 }}
                  onClick={() => setViewMode('map')}>✕</button>
              </div>
            </div>

            {/* Category filter row */}
            <div style={{
              padding:'10px 14px 6px',
              display:'flex', gap:7, overflowX:'auto',
              borderBottom:`1px solid ${C.borderLight}`,
            }}>
              {['All','Shop','House','Job'].map(cat => (
                <button key={cat}
                  className={`dist-chip ${activeCategory===cat?'active':''}`}
                  onClick={() => setActiveCategory(cat)}>
                  {cat === 'Shop' ? '🛒 ' : cat === 'House' ? '🏠 ' : cat === 'Job' ? '💼 ' : ''}{cat}
                </button>
              ))}
            </div>

            <div style={{ flex:1, overflowY:'auto', padding:'8px 0' }}>
              {loading ? <SkeletonList />
                : filteredItems.length === 0 ? <EmptyState />
                : viewMode === 'list'
                  ? <ListView items={filteredItems} onSelect={setDetailItem} openDirections={openDirections} />
                  : <TableView items={filteredItems} onSelect={setDetailItem} />
              }
            </div>
          </div>
        )}
      </div>

      {/* DETAIL DRAWER */}
      {detailItem && (
        <DetailDrawer item={detailItem} onClose={() => setDetailItem(null)} onDirections={openDirections} />
      )}

      {/* ERROR TOAST */}
      {error && (
        <div className="anim-slide-down" style={{
          position:'absolute', top:14, left:'50%', transform:'translateX(-50%)',
          zIndex:600, background:'#FEF2F2', border:'1.5px solid #FECACA',
          borderRadius:14, padding:'10px 16px',
          display:'flex', gap:10, alignItems:'center',
          boxShadow:`0 8px 28px ${C.shadowLg}`,
          minWidth:240,
        }}>
          <span style={{ fontSize:16 }}>⚠️</span>
          <span style={{ color:C.red, fontSize:12.5, flex:1 }}>{error}</span>
          <button style={{ background:'transparent', border:'none', color:C.textMuted, cursor:'pointer', fontSize:16 }}
            onClick={() => setError('')}>✕</button>
        </div>
      )}
    </div>
  );
}

// ─── SIDEBAR CONTENT (Desktop) ────────────────────────────────────────────────
function SidebarContent({ allItems, filteredItems, loading, radius, setRadius, search, setSearch, typeFilter, setTypeFilter,
  activeCategory, setActiveCategory, viewMode, setViewMode, onSelect, openDirections, fetchData }) {

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      {/* Sidebar header */}
      <div style={{ padding:'20px 20px 14px', borderBottom:`1.5px solid ${C.borderLight}` }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{
              width:36, height:36, borderRadius:10,
              background:`linear-gradient(135deg,${C.accent},${C.accentDark})`,
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:18
            }}>🗺</div>
            <div>
              <div style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:18, color:C.text, letterSpacing:'-0.3px' }}>
                Near<span style={{ color:C.accent }}>Zo</span>
              </div>
              <div style={{ fontSize:11, color:C.textMuted, fontWeight:500 }}>Explore nearby</div>
            </div>
          </div>
          <button className="nz-fab" style={{ width:36, height:36 }} onClick={fetchData} title="Refresh">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
              <path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
            </svg>
          </button>
        </div>

        {/* Search */}
        <div style={{ position:'relative' }}>
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:C.textMuted, fontSize:15, pointerEvents:'none' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </span>
          <input className="nz-search" placeholder="Search shops, houses, jobs…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Filter section */}
      <div style={{ padding:'14px 20px 10px', borderBottom:`1.5px solid ${C.borderLight}` }}>
        {/* Category chips */}
        <div style={{ display:'flex', gap:6, marginBottom:12, flexWrap:'wrap' }}>
          {[
            { id:'All',   label:'All',    emoji:'' },
            { id:'Shop',  label:'Shops',  emoji:'🛒' },
            { id:'House', label:'Houses', emoji:'🏠' },
            { id:'Job',   label:'Jobs',   emoji:'💼' },
          ].map(c => (
            <button key={c.id} className={`dist-chip ${activeCategory===c.id?'active':''}`}
              onClick={() => setActiveCategory(c.id)}>
              {c.emoji && <span>{c.emoji} </span>}{c.label}
            </button>
          ))}
        </div>

        {/* Radius slider */}
        <div style={{ marginBottom:4 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
            <span style={{ color:C.textSub, fontSize:12, fontWeight:500 }}>Search Radius</span>
            <span style={{
              background:C.accentLight, color:C.accent,
              borderRadius:100, padding:'2px 9px', fontSize:11.5, fontWeight:700
            }}>{radius} km</span>
          </div>
          <input type="range" className="nz-slider" min={0.5} max={10} step={0.5}
            value={radius} onChange={e => setRadius(Number(e.target.value))} />
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:3 }}>
            <span style={{ color:C.textMuted, fontSize:10.5 }}>0.5 km</span>
            <span style={{ color:C.textMuted, fontSize:10.5 }}>10 km</span>
          </div>
        </div>
      </div>

      {/* View toggle */}
      <div style={{ padding:'10px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${C.borderLight}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          {loading ? (
            <div style={{ width:7, height:7, borderRadius:'50%', background:C.accent, animation:'pulse 1s ease infinite' }} />
          ) : (
            <div style={{ width:7, height:7, borderRadius:'50%', background:C.green }} />
          )}
          <span style={{ color:C.text, fontWeight:700, fontSize:13 }}>{allItems.length}</span>
          <span style={{ color:C.textSub, fontSize:12.5 }}>results nearby</span>
        </div>
        <div style={{ display:'flex', gap:2, background:C.bg, borderRadius:12, padding:3, border:`1.5px solid ${C.border}` }}>
          {[{ id:'list', icon:'☰' }, { id:'table', icon:'▦' }].map(v => (
            <button key={v.id} className={`nz-tab ${viewMode===v.id?'active':''}`}
              style={{ padding:'5px 11px', fontSize:12 }}
              onClick={() => setViewMode(v.id)}>
              {v.icon}
            </button>
          ))}
        </div>
      </div>

      {/* List / Table */}
      <div style={{ flex:1, overflowY:'auto', padding:'8px 0' }}>
        {loading ? <SkeletonList />
          : filteredItems.length === 0 ? <EmptyState />
          : viewMode === 'list'
            ? <ListView items={filteredItems} onSelect={onSelect} openDirections={openDirections} />
            : <TableView items={filteredItems} onSelect={onSelect} />
        }
      </div>
    </div>
  );
}

// ─── FILTER PANEL ─────────────────────────────────────────────────────────────
function FilterPanel({ radius, setRadius, typeFilter, setTypeFilter, onApply }) {
  return (
    <>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <div style={{ fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:17, color:C.text }}>Filters</div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textSub} strokeWidth="2.5" strokeLinecap="round">
          <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
        </svg>
      </div>

      <div style={{ marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
          <span style={{ color:C.textSub, fontSize:12, fontWeight:500 }}>Search Radius</span>
          <span style={{ color:C.accent, fontWeight:700, fontSize:12 }}>{radius} km</span>
        </div>
        <input type="range" className="nz-slider" min={0.5} max={10} step={0.5}
          value={radius} onChange={e => setRadius(Number(e.target.value))} />
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
          <span style={{ color:C.textMuted, fontSize:10.5 }}>0.5 km</span>
          <span style={{ color:C.textMuted, fontSize:10.5 }}>10 km</span>
        </div>
      </div>

      <div style={{ marginBottom:16 }}>
        <div style={{ color:C.textSub, fontSize:12, fontWeight:500, marginBottom:8 }}>Show Types</div>
        {[
          { key:'shops',  label:'Shops',  emoji:'🛒', color:C.accent },
          { key:'houses', label:'Houses', emoji:'🏠', color:C.green  },
          { key:'jobs',   label:'Jobs',   emoji:'💼', color:C.amber  },
        ].map(t => (
          <div key={t.key} style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'9px 0', borderBottom:`1px solid ${C.borderLight}`
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{
                width:30, height:30, borderRadius:9,
                background:TYPE[t.key.slice(0,-1)]?.bg || C.accentLight,
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:15,
                border:`1.5px solid ${t.color}25`
              }}>{t.emoji}</div>
              <span style={{ color:C.text, fontSize:13 }}>{t.label}</span>
            </div>
            <label className="nz-toggle">
              <input type="checkbox" checked={typeFilter[t.key]}
                onChange={e => setTypeFilter(p => ({ ...p, [t.key]: e.target.checked }))} />
              <div className="nz-toggle-track" />
            </label>
          </div>
        ))}
      </div>

      <button className="nz-btn nz-btn-primary" style={{ width:'100%', borderRadius:12, padding:'11px' }} onClick={onApply}>
        Apply Filters
      </button>
    </>
  );
}

// ─── LIST VIEW ────────────────────────────────────────────────────────────────
function ListView({ items, onSelect, openDirections }) {
  return (
    <div style={{ padding:'4px 14px', display:'flex', flexDirection:'column', gap:8 }}>
      {items.map((item, i) => {
        const m    = TYPE[item._type];
        const name = getName(item);
        const sub  = getSub(item);
        const price = item._type === 'house' ? fmtINR(item.rent_per_month)+'/mo'
          : item._type === 'job' ? fmtINR(item.salary)+'/'+(item.salary_type==='month'?'mo':'day')
          : null;
        return (
          <div key={`${item._type}-${item.id||i}`} className="nz-card" onClick={() => onSelect(item)}>
            {/* Icon */}
            <div style={{
              width:44, height:44, borderRadius:12, flexShrink:0,
              background:m.bg,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:20, border:`1.5px solid ${m.color}25`
            }}>{m.emoji}</div>

            {/* Content */}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{
                fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:14.5,
                color:C.text, marginBottom:1,
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'
              }}>{name}</div>
              {sub && (
                <div style={{
                  color:C.textSub, fontSize:11.5, marginBottom:5,
                  whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'
                }}>{sub}</div>
              )}
              <div style={{ display:'flex', alignItems:'center', gap:7, flexWrap:'wrap' }}>
                <span className="nz-badge" style={{ background:m.bg, color:m.color }}>{m.label}</span>
                <span style={{ color:C.textMuted, fontSize:11, display:'flex', alignItems:'center', gap:3 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill={C.accent}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
                  {fmtDist(item.distance)}
                </span>
                {price && <span style={{ color:m.color, fontWeight:700, fontSize:11 }}>{price}</span>}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display:'flex', flexDirection:'column', gap:5, flexShrink:0 }}>
              <button className="nz-btn" style={{
                width:32, height:32, borderRadius:9,
                background:C.accentLight, color:C.accent,
                border:`1.5px solid ${C.accentMid}`, fontSize:14,
                padding:0
              }} onClick={e => { e.stopPropagation(); openDirections(item); }} title="Directions">↗</button>
              <button className="nz-btn" style={{
                width:32, height:32, borderRadius:9,
                background:C.bg, color:C.textSub,
                border:`1.5px solid ${C.border}`, fontSize:13,
                padding:0
              }} onClick={e => { e.stopPropagation(); onSelect(item); }} title="View">👁</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── TABLE VIEW ───────────────────────────────────────────────────────────────
function TableView({ items, onSelect }) {
  return (
    <div style={{ overflowX:'auto' }}>
      <table className="nz-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Name</th>
            <th>Category</th>
            <th>Distance</th>
            <th>Price / Salary</th>
            <th>Contact</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => {
            const m     = TYPE[item._type];
            const price = item._type === 'house' ? fmtINR(item.rent_per_month)+'/mo'
              : item._type === 'job' ? fmtINR(item.salary)+'/'+(item.salary_type==='month'?'mo':'day') : '—';
            const contact = item.owner_phone || item.employer_phone || item.phone || '—';
            return (
              <tr key={`${item._type}-${item.id||i}`} style={{ cursor:'pointer' }} onClick={() => onSelect(item)}>
                <td>
                  <span className="nz-badge" style={{ background:m.bg, color:m.color }}>{m.emoji} {m.label}</span>
                </td>
                <td style={{ fontWeight:600, maxWidth:140, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {getName(item)}
                </td>
                <td style={{ color:C.textSub }}>{getSub(item) || '—'}</td>
                <td style={{ color:C.accent, fontWeight:700 }}>{fmtDist(item.distance)}</td>
                <td style={{ color:m.color, fontWeight:700 }}>{price}</td>
                <td>
                  {contact !== '—'
                    ? <a href={`tel:${contact}`} style={{ color:C.accent, textDecoration:'none', fontWeight:500 }}
                        onClick={e => e.stopPropagation()}>{contact}</a>
                    : <span style={{ color:C.textMuted }}>—</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── DETAIL DRAWER ────────────────────────────────────────────────────────────
function DetailDrawer({ item, onClose, onDirections }) {
  const m     = TYPE[item._type] || {};
  const name  = getName(item);
  const sub   = getSub(item);
  const phone = item.owner_phone || item.employer_phone || item.phone;

  return (
    <>
      <div style={{
        position:'fixed', inset:0, zIndex:400,
        background:'rgba(15,23,42,0.45)', backdropFilter:'blur(3px)'
      }} onClick={onClose} />

      <div className="anim-slide-up" style={{
        position:'fixed', bottom:0, left:0, right:0, zIndex:500,
        background:C.surface,
        borderRadius:'24px 24px 0 0',
        maxHeight:'82vh',
        display:'flex', flexDirection:'column',
        boxShadow:`0 -12px 50px ${C.shadowLg}`,
        border:`1.5px solid ${C.border}`,
      }}>
        <div className="nz-handle" />

        <button style={{
          position:'absolute', top:14, right:14,
          background:C.surfaceAlt, border:`1.5px solid ${C.border}`,
          borderRadius:'50%', width:32, height:32,
          display:'flex', alignItems:'center', justifyContent:'center',
          cursor:'pointer', color:C.textSub, fontSize:16, zIndex:10
        }} onClick={onClose}>✕</button>

        {/* Banner */}
        <div style={{
          padding:'12px 20px 18px',
          background:`linear-gradient(135deg, ${m.bg}, transparent)`,
          borderBottom:`1.5px solid ${C.borderLight}`,
        }}>
          <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
            <div style={{
              width:54, height:54, borderRadius:16,
              background:m.bg, border:`2px solid ${m.color}30`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:26, flexShrink:0
            }}>{m.emoji}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{
                fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:19,
                color:C.text, lineHeight:1.2, marginBottom:3, letterSpacing:'-0.3px'
              }}>{name}</div>
              <div style={{ color:C.textSub, fontSize:13, marginBottom:9 }}>{sub}</div>
              <div style={{ display:'flex', gap:7, flexWrap:'wrap', alignItems:'center' }}>
                <span className="nz-badge" style={{ background:m.bg, color:m.color }}>{m.label}</span>
                {item.distance != null && (
                  <span style={{ fontSize:12, color:C.accent, fontWeight:700, display:'flex', alignItems:'center', gap:3 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill={C.accent}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
                    {fmtDist(item.distance)} away
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:'auto', padding:20 }}>
          {item._type === 'shop'  && <ShopBody  item={item} />}
          {item._type === 'house' && <HouseBody item={item} />}
          {item._type === 'job'   && <JobBody   item={item} />}

          {/* Contact */}
          <div style={{
            marginTop:20, padding:16,
            background:C.surfaceAlt, border:`1.5px solid ${C.borderLight}`,
            borderRadius:16
          }}>
            <div style={{
              color:C.textMuted, fontSize:10.5, fontWeight:700,
              letterSpacing:'.06em', textTransform:'uppercase', marginBottom:10
            }}>Contact</div>
            {(item.owner_name || item.employer_name) && (
              <div style={{ color:C.text, fontWeight:700, fontSize:14, marginBottom:3 }}>
                {item.owner_name || item.employer_name}
              </div>
            )}
            {phone && (
              <a href={`tel:${phone}`} style={{
                color:C.accent, fontSize:13.5, textDecoration:'none',
                fontWeight:600, display:'block', marginBottom:14
              }}>{phone}</a>
            )}
            <div style={{ display:'flex', gap:9 }}>
              <button className="nz-btn nz-btn-primary" style={{ flex:1, borderRadius:12 }}
                onClick={() => onDirections(item)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                Directions
              </button>
              {phone && (
                <button className="nz-btn nz-btn-ghost" style={{ flex:1, borderRadius:12 }}
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
    <div style={{
      display:'flex', justifyContent:'space-between', alignItems:'center',
      padding:'9px 0', borderBottom:`1px solid ${C.borderLight}`
    }}>
      <span style={{ color:C.textSub, fontSize:12.5 }}>{label}</span>
      <span style={{ color: accent || C.text, fontWeight:600, fontSize:13 }}>{value || '—'}</span>
    </div>
  );
}

function ShopBody({ item }) {
  return (
    <>
      {item.description && (
        <div style={{ marginBottom:16 }}>
          <div style={{ color:C.textMuted, fontSize:10.5, fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', marginBottom:6 }}>About</div>
          <div style={{ color:C.textSub, fontSize:13.5, lineHeight:1.65 }}>{item.description}</div>
        </div>
      )}
      {item.opening_time && item.closing_time && (
        <InfoRow label="Business Hours" value={`${item.opening_time.slice(0,5)} – ${item.closing_time.slice(0,5)}`} accent={C.accent} />
      )}
      {item.keywords?.length > 0 && (
        <div style={{ marginTop:12 }}>
          <div style={{ color:C.textMuted, fontSize:10.5, fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', marginBottom:8 }}>Tags</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {item.keywords.map((k, i) => (
              <span key={i} style={{
                padding:'4px 10px', borderRadius:100, fontSize:11.5,
                background:C.accentLight, color:C.accent, fontWeight:500
              }}>#{k}</span>
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
      <div style={{
        background:C.greenLight, border:`1.5px solid ${C.green}25`,
        borderRadius:14, padding:14, marginBottom:16, textAlign:'center'
      }}>
        <div style={{ color:C.textSub, fontSize:11, marginBottom:3 }}>Monthly Rent</div>
        <div style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:26, color:C.green }}>
          {fmtINR(item.rent_per_month)}
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:9, marginBottom:14 }}>
        {[
          { label:'Rooms',    value:`${item.rooms} BHK` },
          { label:'Halls',    value:item.halls },
          { label:'Kitchens', value:item.kitchens },
          { label:'Floor',    value:item.floor },
        ].map(r => (
          <div key={r.label} style={{
            background:C.surfaceAlt, border:`1.5px solid ${C.borderLight}`,
            borderRadius:12, padding:11
          }}>
            <div style={{ color:C.textMuted, fontSize:10.5, marginBottom:3, fontWeight:600, letterSpacing:'.03em' }}>{r.label}</div>
            <div style={{ color:C.text, fontWeight:700, fontSize:15 }}>{r.value || '—'}</div>
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
      <div style={{
        background:C.amberLight, border:`1.5px solid ${C.amber}25`,
        borderRadius:14, padding:14, marginBottom:16, textAlign:'center'
      }}>
        <div style={{ color:C.textSub, fontSize:11, marginBottom:3 }}>Salary</div>
        <div style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:26, color:C.amber }}>
          {fmtINR(item.salary)}
          <span style={{ fontSize:13, fontWeight:400 }}>/{item.salary_type==='month'?'month':'day'}</span>
        </div>
      </div>
      <div style={{ display:'flex', gap:7, marginBottom:14, flexWrap:'wrap' }}>
        <span style={{
          padding:'5px 12px', borderRadius:100, fontSize:12,
          background:C.accentLight, color:C.accent, fontWeight:600, border:`1.5px solid ${C.accentMid}`
        }}>
          {item.job_type === 'full_time' ? '⏱ Full Time' : '⏰ Part Time'}
        </span>
        {item.qualification && (
          <span style={{
            padding:'5px 12px', borderRadius:100, fontSize:12,
            background:C.purpleLight, color:C.purple, fontWeight:600, border:`1.5px solid ${C.purple}25`
          }}>🎓 {item.qualification}</span>
        )}
      </div>
      {item.description && <div style={{ color:C.textSub, fontSize:13, lineHeight:1.65 }}>{item.description}</div>}
    </>
  );
}

// ─── SKELETON & EMPTY ─────────────────────────────────────────────────────────
function SkeletonList() {
  return (
    <div style={{ padding:'4px 14px', display:'flex', flexDirection:'column', gap:9 }}>
      {[...Array(4)].map((_,i) => (
        <div key={i} style={{
          display:'flex', gap:12, alignItems:'center',
          background:C.surface, border:`1.5px solid ${C.borderLight}`,
          borderRadius:16, padding:13
        }}>
          <div className="skeleton" style={{ width:44, height:44, borderRadius:12, flexShrink:0 }} />
          <div style={{ flex:1 }}>
            <div className="skeleton" style={{ height:13, width:'55%', marginBottom:7 }} />
            <div className="skeleton" style={{ height:10, width:'38%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      padding:'52px 20px', textAlign:'center', gap:12
    }}>
      <div style={{
        width:64, height:64, borderRadius:20,
        background:C.accentLight, border:`2px solid ${C.accentMid}`,
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:28
      }}>🔍</div>
      <div style={{ fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:17, color:C.text }}>Nothing nearby</div>
      <div style={{ color:C.textSub, fontSize:13, maxWidth:220 }}>
        Try increasing the search radius or clearing your filters
      </div>
    </div>
  );
}

// ─── LOADING SCREEN ───────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{
      height:'100dvh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:22,
      background:C.bg, fontFamily:'DM Sans, sans-serif'
    }}>
      <div style={{ position:'relative', width:72, height:72 }}>
        <div style={{
          position:'absolute', inset:0, borderRadius:'50%',
          border:`2px solid ${C.accent}`, opacity:0.2,
          animation:'ripple 2s ease-out infinite'
        }} />
        <div style={{
          position:'absolute', inset:8, borderRadius:'50%',
          background:C.accentLight, border:`2px solid ${C.accentMid}`,
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:28
        }}>📍</div>
      </div>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:20, color:C.text, marginBottom:10, letterSpacing:'-0.3px' }}>
          Near<span style={{ color:C.accent }}>Zo</span>
        </div>
        <div style={{ color:C.textSub, fontSize:13, display:'flex', gap:5, justifyContent:'center', alignItems:'center' }}>
          Finding your location
          <span style={{ display:'flex', gap:3 }}>
            <span className="d1" style={{ display:'inline-block', width:5, height:5, borderRadius:'50%', background:C.accent }} />
            <span className="d2" style={{ display:'inline-block', width:5, height:5, borderRadius:'50%', background:C.accent }} />
            <span className="d3" style={{ display:'inline-block', width:5, height:5, borderRadius:'50%', background:C.accent }} />
          </span>
        </div>
      </div>
    </div>
  );
}