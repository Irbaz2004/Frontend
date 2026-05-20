// app/user/Map.jsx — Updated: distinct marker colors, live route tracking, full-screen list modal
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getAllNearby } from '../../services/map';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import loadingGif from '../../assets/Radar.gif';

// Material-UI Icons
import StorefrontIcon from '@mui/icons-material/Storefront';
import HomeIcon from '@mui/icons-material/Home';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DirectionsIcon from '@mui/icons-material/Directions';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import MapIcon from '@mui/icons-material/Map';
import ListIcon from '@mui/icons-material/List';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import ClearIcon from '@mui/icons-material/Clear';
import PhoneIcon from '@mui/icons-material/Phone';
import GoogleIcon from '@mui/icons-material/Google';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BedIcon from '@mui/icons-material/Bed';
import KitchenIcon from '@mui/icons-material/Kitchen';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import ApartmentIcon from '@mui/icons-material/Apartment';
import SchoolIcon from '@mui/icons-material/School';
import InfoIcon from '@mui/icons-material/Info';
import NavigationIcon from '@mui/icons-material/Navigation';
import { CircularProgress } from '@mui/material';

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
  // Per-type brand colors
  shopColor:   '#2563EB',   // Orange
  shopLight:   '#DBEAFE',
  shopDark:    '#1D4ED8',
  houseColor:  '#16A34A',   // Green
  houseLight:  '#DCFCE7',
  houseDark:   '#15803D',
  jobColor:    '#D97706',   // Blue
  jobLight:    '#FEF3C7',
  jobDark:     '#B45309',
  // Globals
  accent:      '#325fec',
  accentLight: '#EEF4FF',
  accentMid:   '#BFCFFF',
  accentDark:  '#1A45C2',
  green:       '#16A34A',
  greenLight:  '#DCFCE7',
  amber:       '#D97706',
  red:         '#DC2626',
  redLight:    '#FEE2E2',
  purple:      '#7C3AED',
  purpleLight: '#EDE9FE',
  text:        '#0F172A',
  textSub:     '#475569',
  textMuted:   '#94A3B8',
  shadow:      'rgba(50,95,236,0.12)',
  shadowMd:    'rgba(15,23,42,0.07)',
  shadowLg:    'rgba(15,23,42,0.15)',
};

// TYPE config with individual colors
const TYPE = {
  shop:  { color: C.shopColor,  bg: C.shopLight,  label: 'Shop',  icon: <StorefrontIcon sx={{ fontSize: 20 }} /> },
  house: { color: C.houseColor, bg: C.houseLight, label: 'House', icon: <HomeIcon sx={{ fontSize: 20 }} /> },
  job:   { color: C.jobColor,   bg: C.jobLight,   label: 'Job',   icon: <WorkIcon sx={{ fontSize: 20 }} /> },
};

const BOTTOM_NAV_OFFSET = 150;

// ─── SVG Markers — Each type has its own distinct color ───────────────────
const MARKER_SVG = {
  shop: (color) => `<svg width="40" height="52" viewBox="0 0 40 52" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="ds-shop"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="${color}" flood-opacity="0.45"/></filter>
      <radialGradient id="g-shop" cx="40%" cy="30%">
        <stop offset="0%" stop-color="${color}" stop-opacity="1"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0.82"/>
      </radialGradient>
    </defs>
    <path d="M20 0C8.95 0 0 8.95 0 20c0 14.8 20 32 20 32S40 34.8 40 20C40 8.95 31.05 0 20 0z" fill="url(#g-shop)" filter="url(#ds-shop)"/>
    <circle cx="20" cy="20" r="13" fill="white" opacity="0.97"/>
    <path d="M14 17h12v8H14z" fill="${color}" opacity="0.9" rx="1"/>
    <path d="M11 13l3-4h12l3 4" stroke="${color}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <path d="M14 17l2-4h8l2 4" fill="${color}" opacity="0.3"/>
  </svg>`,

  house: (color) => `<svg width="40" height="52" viewBox="0 0 40 52" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="ds-house"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="${color}" flood-opacity="0.45"/></filter>
      <radialGradient id="g-house" cx="40%" cy="30%">
        <stop offset="0%" stop-color="${color}" stop-opacity="1"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0.82"/>
      </radialGradient>
    </defs>
    <path d="M20 0C8.95 0 0 8.95 0 20c0 14.8 20 32 20 32S40 34.8 40 20C40 8.95 31.05 0 20 0z" fill="url(#g-house)" filter="url(#ds-house)"/>
    <circle cx="20" cy="20" r="13" fill="white" opacity="0.97"/>
    <polygon points="20,11 13,18 13,27 17,27 17,22 23,22 23,27 27,27 27,18" fill="${color}" opacity="0.9"/>
    <rect x="17" y="22" width="6" height="5" fill="${color}" opacity="0.5" rx="1"/>
  </svg>`,

  job: (color) => `<svg width="40" height="52" viewBox="0 0 40 52" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="ds-job"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="${color}" flood-opacity="0.45"/></filter>
      <radialGradient id="g-job" cx="40%" cy="30%">
        <stop offset="0%" stop-color="${color}" stop-opacity="1"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0.82"/>
      </radialGradient>
    </defs>
    <path d="M20 0C8.95 0 0 8.95 0 20c0 14.8 20 32 20 32S40 34.8 40 20C40 8.95 31.05 0 20 0z" fill="url(#g-job)" filter="url(#ds-job)"/>
    <circle cx="20" cy="20" r="13" fill="white" opacity="0.97"/>
    <rect x="13" y="17" width="14" height="9" rx="2" fill="${color}" opacity="0.9"/>
    <path d="M16 17v-3a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v3" stroke="${color}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <rect x="17" y="20" width="6" height="2" rx="1" fill="white" opacity="0.8"/>
  </svg>`,

  user: `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="ds-user"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#325fec" flood-opacity="0.5"/></filter>
    </defs>
    <circle cx="16" cy="16" r="13" fill="#325fec" stroke="white" stroke-width="3.5" filter="url(#ds-user)"/>
    <circle cx="16" cy="16" r="5.5" fill="white"/>
    <circle cx="16" cy="16" r="3" fill="#325fec"/>
  </svg>`,
};

const makeIcon = (type) => L.divIcon({
  className: '',
  html: type === 'user'
    ? MARKER_SVG.user
    : MARKER_SVG[type](TYPE[type].color),
  iconSize:    type === 'user' ? [32, 32] : [40, 52],
  iconAnchor:  type === 'user' ? [16, 16] : [20, 52],
  popupAnchor: type === 'user' ? [0, -16] : [0, -54],
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
      font-family: 'Inter', sans-serif !important;
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
      border-radius: 20px !important;
      box-shadow: 0 20px 60px rgba(15,23,42,0.18) !important;
      color: ${C.text} !important;
      padding: 0 !important;
      overflow: hidden;
      min-width: 230px;
    }
    .leaflet-popup-content { margin: 0 !important; }
    .leaflet-popup-tip-container { display: none !important; }
    .leaflet-popup-close-button {
      color: ${C.textMuted} !important;
      font-size: 18px !important;
      width: 28px !important; height: 28px !important;
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

    @keyframes slideUp   { from { transform:translateY(22px); opacity:0; } to { transform:translateY(0); opacity:1; } }
    @keyframes slideDown { from { transform:translateY(-16px); opacity:0; } to { transform:translateY(0); opacity:1; } }
    @keyframes fadeIn    { from { opacity:0; } to { opacity:1; } }
    @keyframes pulse     { 0%,100% { opacity:1; } 50% { opacity:.35; } }
    @keyframes modalIn   { from { transform:scale(.96) translateY(20px); opacity:0; } to { transform:scale(1) translateY(0); opacity:1; } }

    .su { animation: slideUp .34s cubic-bezier(.16,1,.3,1) both; }
    .sd { animation: slideDown .28s cubic-bezier(.16,1,.3,1) both; }
    .fi { animation: fadeIn .22s ease both; }
    .mi { animation: modalIn .32s cubic-bezier(.16,1,.3,1) both; }

    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }

    .skeleton {
      background: linear-gradient(90deg, ${C.surfaceAlt} 25%, ${C.border} 50%, ${C.surfaceAlt} 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s ease infinite;
      border-radius: 8px;
    }
    @keyframes shimmer { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }

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
      cursor:pointer; transition:all .16s; box-shadow:0 2px 8px ${C.shadowMd}; flex-shrink:0; }
    .fab:hover { border-color:${C.accent}; color:${C.accent}; background:${C.accentLight}; }
    .fab:active { transform:scale(.93); }
    .fab.on { background:${C.accent}; color:#fff; border-color:${C.accent}; box-shadow:0 4px 14px ${C.shadow}; }

    .m-search { width:100%; background:${C.surface}; border:1.5px solid ${C.border};
      border-radius:13px; padding:10px 14px 10px 40px; color:${C.text};
      font-family:'Inter',sans-serif; font-size:13px; outline:none;
      transition:border-color .18s, box-shadow .18s; box-shadow:0 2px 8px ${C.shadowMd}; }
    .m-search:focus { border-color:${C.accent}; box-shadow:0 0 0 3px ${C.accentMid}44; }
    .m-search::placeholder { color:${C.textMuted}; }

    .m-card { background:${C.surface}; border:1.5px solid ${C.borderLight}; border-radius:16px;
      padding:12px; cursor:pointer; transition:all .18s ease; display:flex; gap:11px; align-items:flex-start; }
    .m-card:hover { border-color:${C.accentMid}; transform:translateY(-2px); box-shadow:0 8px 26px ${C.shadow}; }
    .m-card:active { transform:scale(.98); }

    .badge { font-family:'Inter',sans-serif; font-size:10px; font-weight:700; letter-spacing:.04em;
      padding:3px 8px; border-radius:100px; text-transform:uppercase; }

    .m-slider { -webkit-appearance:none; width:100%; height:4px; border-radius:2px;
      background:${C.border}; outline:none; cursor:pointer; }
    .m-slider::-webkit-slider-thumb { -webkit-appearance:none; width:18px; height:18px; border-radius:50%;
      background:${C.accent}; cursor:pointer; box-shadow:0 0 0 3px ${C.accentMid}88; transition:box-shadow .2s; }
    .m-slider::-webkit-slider-thumb:hover { box-shadow:0 0 0 6px ${C.accentMid}55; }

    .tog { position:relative; display:inline-block; width:46px; height:26px; flex-shrink:0; }
    .tog input { opacity:0; width:0; height:0; }
    .tog-track { position:absolute; inset:0; border-radius:13px; background:${C.border};
      cursor:pointer; transition:background .2s; }
    .tog-track::before { content:''; position:absolute; width:20px; height:20px;
      left:3px; top:3px; border-radius:50%; background:${C.textMuted};
      transition:all .2s; box-shadow:0 1px 4px rgba(0,0,0,.18); }
    .tog input:checked + .tog-track { background:${C.accent}; }
    .tog input:checked + .tog-track::before { transform:translateX(20px); background:#fff; }

    .view-pill { display:flex; background:${C.surfaceAlt}; border:1.5px solid ${C.border};
      border-radius:12px; padding:3px; gap:2px; }
    .view-btn { flex:1; padding:7px 14px; border:none; background:transparent; color:${C.textSub};
      font-family:'Inter',sans-serif; font-size:12.5px; font-weight:500; cursor:pointer;
      border-radius:9px; transition:all .16s; display:flex; align-items:center; justify-content:center; gap:5px; }
    .view-btn.on { background:${C.surface}; color:${C.accent}; font-weight:700;
      box-shadow:0 2px 8px ${C.shadowMd}; }

    .fchip { padding:6px 13px; border-radius:100px; font-size:12px; font-weight:600;
      cursor:pointer; border:1.5px solid ${C.border}; background:${C.surface};
      color:${C.textSub}; transition:all .16s; font-family:'Inter',sans-serif; white-space:nowrap; }
    .fchip.on, .fchip:hover { background:${C.accent}; border-color:${C.accent}; color:#fff; }
    .fchip.shop.on  { background:${C.shopColor}; border-color:${C.shopColor}; }
    .fchip.house.on { background:${C.houseColor}; border-color:${C.houseColor}; }
    .fchip.job.on   { background:${C.jobColor}; border-color:${C.jobColor}; }

    .handle { width:36px; height:4px; border-radius:2px; background:${C.border}; margin:10px auto 0; }

    .m-popup { padding:14px 16px 16px; min-width:210px; max-width:270px; }
    .m-popup-title { font-weight:700; font-size:15px; color:${C.text}; margin-bottom:2px; letter-spacing:-.2px; }
    .m-popup-sub { font-size:11.5px; color:${C.textSub}; margin-bottom:8px; }

    /* Full-screen List Modal */
    .list-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15,23,42,0.6);
      backdrop-filter: blur(4px);
      z-index: 800;
      animation: fadeIn .22s ease both;
    }
    .list-modal {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      z-index: 900;
      background: ${C.surface};
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: modalIn .32s cubic-bezier(.16,1,.3,1) both;
    }
    @media (min-width: 600px) {
      .list-modal {
        top: 10vh;
        left: 50%;
        right: auto;
        transform: translateX(-50%);
        width: 480px;
        height: 80vh;
        border-radius: 24px;
        box-shadow: 0 32px 80px rgba(15,23,42,0.3);
      }
    }

    /* Detail Drawer */
    .detail-drawer-mobile {
      position: fixed !important;
      top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
      width: 100% !important; height: 100% !important; max-height: 100% !important;
      border-radius: 0 !important; margin: 0 !important;
      z-index: 1400 !important;
    }
    .detail-backdrop-mobile { display: none !important; }

    /* Route Banner */
    .route-banner {
      position: absolute;
      top: 62px; left: 50%; transform: translateX(-50%);
      z-index: 110;
      background: ${C.accent};
      color: white;
      border-radius: 100px;
      padding: 8px 18px;
      font-size: 12px; font-weight: 700;
      display: flex; align-items: center; gap: 8px;
      box-shadow: 0 4px 16px ${C.shadow};
      animation: slideDown .3s ease both;
      white-space: nowrap;
    }

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
      .detail-drawer-desktop {
        position: fixed !important; bottom: 0 !important; left: 0 !important; right: 0 !important;
        top: auto !important; max-height: 80vh !important;
        border-radius: 24px 24px 0 0 !important; margin: 0 15px !important;
        margin-bottom: 0 !important; z-index: 500 !important;
      }
      .detail-backdrop-desktop { display: block !important; }
      .route-banner { top: 14px; left: 360px; transform: none; }
    }
    @media (max-width: 599px) {
      .m-sidebar { display:none !important; }
      .m-map-zone { position:absolute; inset:0; }
      .detail-backdrop-mobile { display: none !important; }
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

  const [viewMode, setViewMode]       = useState('map');
  const [filterOpen, setFilterOpen]   = useState(false);
  const [detailItem, setDetailItem]   = useState(null);
  const [listModalOpen, setListModalOpen] = useState(false);

  const [radius, setRadius]           = useState(0.2);
  const [search, setSearch]           = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [typeFilter, setTypeFilter]   = useState({ shops:true, houses:true, jobs:true });
  const [routeTarget, setRouteTarget] = useState(null);

  const mapRef         = useRef(null);
  const mapContRef     = useRef(null);
  const markersRef     = useRef([]);
  const userMarkerRef  = useRef(null);
  const userCircleRef  = useRef(null);
  const routingRef     = useRef(null);
  const intervalRef    = useRef(null);
  const watchIdRef     = useRef(null);
  const routeTargetRef = useRef(null); // keep ref in sync for watchPosition callback

  useEffect(() => { injectCSS(); }, []);

  // ── Geolocation with live watching ──────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) {
      setUserLocation({ latitude: 12.9165, longitude: 79.1325 });
      setPhase('ready');
      return;
    }
    // Initial fix
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setUserLocation({ latitude: p.coords.latitude, longitude: p.coords.longitude });
        setPhase('ready');
      },
      () => { setUserLocation({ latitude: 12.9165, longitude: 79.1325 }); setPhase('ready'); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
    // Watch for movement
    watchIdRef.current = navigator.geolocation.watchPosition(
      (p) => {
        const newLoc = { latitude: p.coords.latitude, longitude: p.coords.longitude };
        setUserLocation(newLoc);
        // If route is active, update it
        if (routeTargetRef.current) {
          updateRoute(newLoc, routeTargetRef.current);
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

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

  useEffect(() => {
    if (!userLocation) return;
    fetchData();
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchData, 30000);
    return () => clearInterval(intervalRef.current);
  }, [userLocation, radius, typeFilter, search]);

  useEffect(() => {
    if (!mapRef.current || !userLocation) return;
    renderMarkers();
  }, [shops, houses, jobs, userLocation, radius]);

  useEffect(() => {
    const h = (e) => { setDetailItem(e.detail); };
    window.addEventListener('m:detail', h);
    return () => window.removeEventListener('m:detail', h);
  }, []);

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
    routeTargetRef.current = null;
    setRouteTarget(null);
  }, []);

  // updateRoute: called both from showRoute and watchPosition
  const updateRoute = useCallback((fromLoc, item) => {
    if (!mapRef.current || !fromLoc || !item?.latitude || !item?.longitude) return;
    if (routingRef.current) {
      mapRef.current.removeControl(routingRef.current);
      routingRef.current = null;
    }
    try {
      routingRef.current = L.Routing.control({
        waypoints: [
          L.latLng(fromLoc.latitude, fromLoc.longitude),
          L.latLng(parseFloat(item.latitude), parseFloat(item.longitude)),
        ],
        routeWhileDragging: false,
        showAlternatives: false,
        lineOptions: {
          styles: [{ color: C.accent, weight: 5, opacity: 0.88 }],
          extendToWaypoints: true,
          missingRouteTolerance: 10,
        },
        createMarker: () => null,
        addWaypoints: false,
        fitSelectedRoutes: true,
      }).addTo(mapRef.current);
    } catch (err) {
      // Silent fail; user can use Google Maps button
    }
  }, []);

  const showRoute = useCallback((item) => {
    if (!mapRef.current || !userLocation || !item?.latitude || !item?.longitude) return;
    routeTargetRef.current = item;
    setRouteTarget(item);
    updateRoute(userLocation, item);
  }, [userLocation, updateRoute]);

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
    mapRef.current.flyTo([lat, lng], mapRef.current.getZoom(), { duration: 0.6 });

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
        ? `<div style="color:${m.color};font-weight:700;font-size:13px;margin:6px 0">${fmtINR(item.rent_per_month)}/mo</div>`
        : type === 'job'
        ? `<div style="color:${m.color};font-weight:700;font-size:13px;margin:6px 0">${fmtINR(item.salary)}/${item.salary_type==='month'?'mo':'day'}</div>`
        : '';

      const popup = `
        <div class="m-popup">
          <div style="display:flex;gap:9px;align-items:flex-start;margin-bottom:6px">
            <div style="width:40px;height:40px;border-radius:11px;background:${m.bg};
              display:flex;align-items:center;justify-content:center;flex-shrink:0;
              border:2px solid ${m.color}33;font-size:18px">
              ${type === 'shop' ? '🛒' : type === 'house' ? '🏠' : '💼'}
            </div>
            <div style="flex:1;min-width:0">
              <div class="m-popup-title">${esc(getName(item))}</div>
              <div class="m-popup-sub">${esc(getSub(item))}</div>
              <span class="badge" style="background:${m.bg};color:${m.color};border:1px solid ${m.color}44">${m.label}</span>
            </div>
          </div>
          ${priceHTML}
          <div style="display:flex;align-items:center;gap:4px;margin:6px 0 10px;color:${C.textSub};font-size:11.5px">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="${m.color}"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
            ${fmtDist(item.distance)} away
          </div>
          <div style="display:flex;gap:7px">
            <button class="btn btn-primary" style="flex:1;padding:9px 10px;font-size:12px;border-radius:10px;background:${m.color}"
              onclick="window.dispatchEvent(new CustomEvent('m:route',{detail:${JSON.stringify({...item,_type:type}).replace(/"/g,'&quot;')}}))">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              Route
            </button>
            <button class="btn btn-ghost" style="flex:1;padding:9px 10px;font-size:12px;border-radius:10px;border-color:${m.color}44;color:${m.color}"
              onclick="window.dispatchEvent(new CustomEvent('m:detail',{detail:${JSON.stringify({...item,_type:type}).replace(/"/g,'&quot;')}}))">
              Details
            </button>
          </div>
        </div>`;

      const marker = L.marker(
        [parseFloat(item.latitude), parseFloat(item.longitude)],
        { icon: ICONS[type] }
      )
        .bindPopup(popup, { maxWidth: 290 })
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
          onOpenListModal={() => setListModalOpen(true)}
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
          <div style={{
            background:C.surface, border:`1.5px solid ${C.border}`,
            borderRadius:100, padding:'7px 13px',
            display:'flex', alignItems:'center', gap:6,
            boxShadow:`0 4px 14px ${C.shadowMd}`, flexShrink:0,
          }}>
            <LocationOnIcon sx={{ fontSize: 15, color: C.accent }} />
            <span style={{ fontWeight:800, fontSize:15, color:C.text, letterSpacing:'-.3px' }}>Nearby</span>
          </div>

          <div style={{ flex:1, position:'relative', minWidth:0 }}>
            <span style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)',
              color:C.textMuted, pointerEvents:'none', display:'flex' }}>
              <SearchIcon sx={{ fontSize: 14 }} />
            </span>
            <input className="m-search" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <button className={`fab ${filterOpen ? 'on' : ''}`} onClick={() => setFilterOpen(v => !v)}>
            <FilterListIcon sx={{ fontSize: 15 }} />
          </button>
        </div>

        {/* ROUTE ACTIVE BANNER */}
        {routeTarget && (
          <div className="route-banner">
            <NavigationIcon sx={{ fontSize: 14 }} />
            Routing to {getName(routeTarget)}
            <button
              onClick={clearRoute}
              style={{ background:'rgba(255,255,255,.25)', border:'none', borderRadius:6,
                color:'white', cursor:'pointer', display:'flex', alignItems:'center', padding:'2px 6px', marginLeft:4 }}>
              <CloseIcon sx={{ fontSize: 12 }} />
            </button>
          </div>
        )}

        {/* MOBILE VIEW TOGGLE — only show if no route banner */}
        {!routeTarget && (
          <div className="m-topbar" style={{
            position:'absolute', top:62, left:'50%', transform:'translateX(-50%)',
            zIndex:100,
          }}>
            <div className="view-pill" style={{ boxShadow:`0 4px 14px ${C.shadowMd}` }}>
              <button className={`view-btn ${viewMode==='map'?'on':''}`} onClick={() => setViewMode('map')}>
                <MapIcon sx={{ fontSize: 13 }} /> Map
              </button>
              <button className={`view-btn ${viewMode==='list'?'on':''}`}
                onClick={() => { setViewMode('list'); setListModalOpen(true); }}>
                <ListIcon sx={{ fontSize: 13 }} /> List
              </button>
            </div>
          </div>
        )}

        {/* FILTER PANEL — Mobile */}
        {filterOpen && (
          <>
            <div className="fi" style={{
              position:'absolute', inset:0, zIndex:190,
            }} onClick={() => setFilterOpen(false)} />
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
          </>
        )}

        {/* MAP FABs */}
        <div className="m-fabs" style={{
          position:'absolute', right:10, bottom: BOTTOM_NAV_OFFSET + 16, zIndex:100,
          display:'flex', flexDirection:'column', gap:7,
        }}>
          <button className="fab" title="My location" onClick={() => {
            if (mapRef.current && userLocation)
              mapRef.current.flyTo([userLocation.latitude, userLocation.longitude], 16, { duration:.9 });
          }}>
            <MyLocationIcon sx={{ fontSize: 16 }} />
          </button>
          {routeTarget && (
            <button className="fab on" title="Clear route" onClick={clearRoute}>
              <ClearIcon sx={{ fontSize: 15 }} />
            </button>
          )}
          <button className="fab" title="Refresh" onClick={fetchData}>
            <RefreshIcon sx={{ fontSize: 14 }} />
          </button>
        </div>

        {/* STATUS BAR */}
        <div className="m-statusbar fi" style={{
          position:'absolute', bottom: BOTTOM_NAV_OFFSET + 12, left:'50%', transform:'translateX(-50%)',
          zIndex:100, display:'flex', alignItems:'center', gap:9,
          background:C.surface, border:`1.5px solid ${C.border}`,
          borderRadius:100, padding:'8px 16px',
          boxShadow:`0 4px 14px ${C.shadowMd}`, whiteSpace:'nowrap',
        }}>
          {loading ? (
            <>
              <CircularProgress size={12} sx={{ color: C.accent }} />
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

        {/* LEGEND — distinct colors per type */}
        <div style={{
          position:'absolute', bottom: BOTTOM_NAV_OFFSET + 12, left:10, zIndex:100,
          display:'flex', flexDirection:'column', gap:5,
        }}>
          {[
            { key:'shop',  color: C.shopColor,  label:'Shops',   emoji:'🛒' },
            { key:'house', color: C.houseColor, label:'Houses',  emoji:'🏠' },
            { key:'job',   color: C.jobColor,   label:'Jobs',    emoji:'💼' },
          ].map(t => (
            <div key={t.key} style={{
              display:'flex', alignItems:'center', gap:6,
              background:C.surface, border:`1.5px solid ${t.color}33`,
              borderLeft:`3px solid ${t.color}`,
              borderRadius:8, padding:'4px 10px',
              boxShadow:`0 2px 6px ${C.shadowMd}`,
              opacity: typeFilter[t.key+'s'] ? 1 : 0.4,
            }}>
              <span style={{ fontSize:12 }}>{t.emoji}</span>
              <span style={{ color:t.color, fontSize:10, fontWeight:700 }}>{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FULL SCREEN LIST MODAL */}
      {listModalOpen && (
        <>
          <div className="list-modal-backdrop" onClick={() => { setListModalOpen(false); setViewMode('map'); }} />
          <div className="list-modal">
            {/* Header */}
            <div style={{
              padding:'16px 18px 12px',
              borderBottom:`1.5px solid ${C.borderLight}`,
              background:C.surface, flexShrink:0,
            }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <div>
                  <div style={{ fontWeight:800, fontSize:20, color:C.text, letterSpacing:'-.4px' }}>
                    Nearby Places
                  </div>
                  <div style={{ color:C.textSub, fontSize:12, marginTop:2 }}>
                    {allItems.length} results · {radius < 1 ? `${Math.round(radius*1000)}m` : `${radius} km`} radius
                  </div>
                </div>
                <button
                  style={{ background:C.surfaceAlt, border:`1.5px solid ${C.border}`,
                    borderRadius:'50%', width:38, height:38,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    cursor:'pointer', color:C.textSub }}
                  onClick={() => { setListModalOpen(false); setViewMode('map'); }}>
                  <CloseIcon sx={{ fontSize: 16 }} />
                </button>
              </div>
              {/* Search in modal */}
              <div style={{ position:'relative', marginBottom:10 }}>
                <span style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)',
                  color:C.textMuted, pointerEvents:'none', display:'flex' }}>
                  <SearchIcon sx={{ fontSize: 14 }} />
                </span>
                <input className="m-search" placeholder="Search…" value={search}
                  onChange={e => setSearch(e.target.value)} />
              </div>
              {/* Category chips */}
              <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:2 }}>
                <button className={`fchip ${activeCategory==='All'?'on':''}`} onClick={() => setActiveCategory('All')}>All</button>
                <button className={`fchip shop ${activeCategory==='Shop'?'on':''}`}
                  style={activeCategory==='Shop' ? {} : { borderColor:`${C.shopColor}44`, color:C.shopColor }}
                  onClick={() => setActiveCategory('Shop')}>
                  🛒 Shops
                </button>
                <button className={`fchip house ${activeCategory==='House'?'on':''}`}
                  style={activeCategory==='House' ? {} : { borderColor:`${C.houseColor}44`, color:C.houseColor }}
                  onClick={() => setActiveCategory('House')}>
                  🏠 Houses
                </button>
                <button className={`fchip job ${activeCategory==='Job'?'on':''}`}
                  style={activeCategory==='Job' ? {} : { borderColor:`${C.jobColor}44`, color:C.jobColor }}
                  onClick={() => setActiveCategory('Job')}>
                  💼 Jobs
                </button>
              </div>
            </div>
            {/* Body */}
            <div style={{ flex:1, overflowY:'auto', padding:'8px 0' }}>
              {loading ? <SkeletonList />
                : filteredItems.length === 0 ? <EmptyState />
                : <ListView
                    items={filteredItems}
                    onSelect={(item) => { setDetailItem(item); setListModalOpen(false); setViewMode('map'); }}
                    onRoute={(item) => { showRoute(item); setListModalOpen(false); setViewMode('map'); }}
                    openGoogleMaps={openGoogleMaps}
                  />}
            </div>
          </div>
        </>
      )}

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
          <InfoIcon sx={{ fontSize: 15, color: C.red }} />
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
  onSelect, onRoute, openGoogleMaps, fetchData, clearRoute, onOpenListModal }) {

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      <div style={{ padding:'18px 18px 14px', borderBottom:`1.5px solid ${C.borderLight}` }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:9 }}>
            <div style={{ width:36, height:36, borderRadius:10, display:'flex', alignItems:'center',
              justifyContent:'center', background: C.accentLight }}>
              <LocationOnIcon sx={{ fontSize: 18, color: C.accent }} />
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:17, color:C.text, letterSpacing:'-.3px' }}>Nearby</div>
              <div style={{ fontSize:11, color:C.textMuted, fontWeight:500 }}>Explore around you</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:6 }}>
            <button className="fab" style={{ width:34, height:34 }} onClick={clearRoute} title="Clear route">
              <ClearIcon sx={{ fontSize: 13 }} />
            </button>
            <button className="fab" style={{ width:34, height:34 }} onClick={fetchData} title="Refresh">
              <RefreshIcon sx={{ fontSize: 13 }} />
            </button>
          </div>
        </div>
        <div style={{ position:'relative' }}>
          <span style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)',
            color:C.textMuted, pointerEvents:'none', display:'flex' }}>
            <SearchIcon sx={{ fontSize: 14 }} />
          </span>
          <input className="m-search" placeholder="Search shops, houses, jobs…" value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div style={{ padding:'12px 18px 10px', borderBottom:`1.5px solid ${C.borderLight}` }}>
        <div style={{ display:'flex', gap:6, marginBottom:12, flexWrap:'wrap' }}>
          <button className={`fchip ${activeCategory==='All'?'on':''}`} onClick={() => setActiveCategory('All')}>All</button>
          <button className={`fchip shop ${activeCategory==='Shop'?'on':''}`}
            style={activeCategory==='Shop' ? {} : { borderColor:`${C.shopColor}44`, color:C.shopColor }}
            onClick={() => setActiveCategory('Shop')}>
            🛒 Shops
          </button>
          <button className={`fchip house ${activeCategory==='House'?'on':''}`}
            style={activeCategory==='House' ? {} : { borderColor:`${C.houseColor}44`, color:C.houseColor }}
            onClick={() => setActiveCategory('House')}>
            🏠 Houses
          </button>
          <button className={`fchip job ${activeCategory==='Job'?'on':''}`}
            style={activeCategory==='Job' ? {} : { borderColor:`${C.jobColor}44`, color:C.jobColor }}
            onClick={() => setActiveCategory('Job')}>
            💼 Jobs
          </button>
        </div>

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

        <div style={{ marginTop:12 }}>
          {[
            { key:'shops',  label:'Shops',  color: C.shopColor,  icon: <StorefrontIcon sx={{ fontSize: 16 }} /> },
            { key:'houses', label:'Houses', color: C.houseColor, icon: <HomeIcon sx={{ fontSize: 16 }} /> },
            { key:'jobs',   label:'Jobs',   color: C.jobColor,   icon: <WorkIcon sx={{ fontSize: 16 }} /> },
          ].map(t => (
            <div key={t.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'8px 0', borderBottom:`1px solid ${C.borderLight}` }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:28, height:28, borderRadius:8,
                  background: t.color + '18',
                  border: `1.5px solid ${t.color}33`,
                  display:'flex', alignItems:'center', justifyContent:'center', color: t.color }}>
                  {t.icon}
                </div>
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

      <div style={{ padding:'10px 18px', display:'flex', alignItems:'center', justifyContent:'space-between',
        borderBottom:`1px solid ${C.borderLight}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:loading?C.accent:C.green,
            animation:loading?'pulse 1s ease infinite':'none' }} />
          <span style={{ fontWeight:700, fontSize:13, color:C.text }}>{allItems.length}</span>
          <span style={{ fontSize:12, color:C.textSub }}>results</span>
        </div>
        <button className="btn btn-ghost" style={{ padding:'6px 12px', fontSize:12, gap:5 }}
          onClick={onOpenListModal}>
          <ListIcon sx={{ fontSize: 13 }} /> Full List
        </button>
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
        <div style={{ color:C.textMuted, fontSize:11.5, fontWeight:600, marginBottom:8, textTransform:'uppercase', letterSpacing:'.05em' }}>Show</div>
        {[
          { key:'shops',  label:'Shops',  color: C.shopColor,  icon: <StorefrontIcon sx={{ fontSize: 16 }} /> },
          { key:'houses', label:'Houses', color: C.houseColor, icon: <HomeIcon sx={{ fontSize: 16 }} /> },
          { key:'jobs',   label:'Jobs',   color: C.jobColor,   icon: <WorkIcon sx={{ fontSize: 16 }} /> },
        ].map(t => (
          <div key={t.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'8px 0', borderBottom:`1px solid ${C.borderLight}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, color: t.color }}>
              {t.icon}
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
        Apply Filters
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
        const emoji = item._type === 'shop' ? '🛒' : item._type === 'house' ? '🏠' : '💼';

        return (
          <div key={`${item._type}-${item.id||i}`} className="m-card"
            style={{ borderLeft:`3px solid ${m.color}` }}
            onClick={() => onSelect(item)}>
            <div style={{ width:44, height:44, borderRadius:13, flexShrink:0, background:m.bg,
              display:'flex', alignItems:'center', justifyContent:'center',
              border:`2px solid ${m.color}22`, fontSize:22 }}>
              {emoji}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:14, color:C.text, marginBottom:2,
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{name}</div>
              {sub && <div style={{ color:C.textSub, fontSize:11.5, marginBottom:5,
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{sub}</div>}
              <div style={{ display:'flex', alignItems:'center', gap:7, flexWrap:'wrap' }}>
                <span className="badge" style={{ background:m.bg, color:m.color, border:`1px solid ${m.color}33` }}>
                  {m.label}
                </span>
                <span style={{ color:C.textMuted, fontSize:11, display:'flex', alignItems:'center', gap:3 }}>
                  <LocationOnIcon sx={{ fontSize: 9, color: m.color }} />
                  {fmtDist(item.distance)}
                </span>
                {price && <span style={{ color:m.color, fontWeight:700, fontSize:11 }}>{price}</span>}
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:5, flexShrink:0 }}>
              <button className="btn" style={{ width:32, height:32, borderRadius:9,
                background:m.bg, color:m.color,
                border:`1.5px solid ${m.color}33`, fontSize:13, padding:0 }}
                onClick={e => { e.stopPropagation(); onRoute(item); }} title="Route">
                <DirectionsIcon sx={{ fontSize: 13 }} />
              </button>
              <button className="btn" style={{ width:32, height:32, borderRadius:9,
                background:C.surfaceAlt, color:C.textSub,
                border:`1.5px solid ${C.border}`, fontSize:12, padding:0 }}
                onClick={e => { e.stopPropagation(); onSelect(item); }} title="View">
                <VisibilityIcon sx={{ fontSize: 12 }} />
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const m     = TYPE[item._type] || {};
  const name  = getName(item);
  const sub   = getSub(item);
  const phone = item.owner_phone || item.employer_phone || item.phone;
  const emoji = item._type === 'shop' ? '🛒' : item._type === 'house' ? '🏠' : '💼';

  const drawerClass    = isMobile ? 'detail-drawer-mobile' : 'detail-drawer-desktop';
  const backdropClass  = isMobile ? 'detail-backdrop-mobile' : 'detail-backdrop-desktop';

  return (
    <>
      <div
        className={backdropClass}
        style={{ position:'fixed', top:0, left:0, right:0, bottom:0, zIndex:400,
          background:'rgba(15,23,42,0.4)', backdropFilter:'blur(3px)' }}
        onClick={onClose}
      />
      <div
        className={`su ${drawerClass}`}
        style={{
          position:'fixed',
          background:C.surface, display:'flex', flexDirection:'column',
          boxShadow:`0 -12px 50px ${C.shadowLg}`,
          border: isMobile ? 'none' : `1.5px solid ${C.border}`,
          borderBottom:'none', overflow:'hidden',
          borderTop: isMobile ? `3px solid ${m.color}` : undefined,
        }}
      >
        {!isMobile && <div className="handle" />}
        <button
          style={{ position:'absolute', top:14, right:14, background:C.surfaceAlt,
            border:`1.5px solid ${C.border}`, borderRadius:'50%', width:36, height:36,
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', color:C.textSub, zIndex:10 }}
          onClick={onClose}>
          <CloseIcon sx={{ fontSize: 16 }} />
        </button>

        <div style={{ padding:'20px 20px 16px', borderBottom:`1.5px solid ${C.borderLight}`, flexShrink:0 }}>
          <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
            <div style={{ width:60, height:60, borderRadius:18, background:m.bg,
              border:`2px solid ${m.color}33`, display:'flex', alignItems:'center',
              justifyContent:'center', fontSize:28 }}>
              {emoji}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:800, fontSize:19, color:C.text, lineHeight:1.2,
                marginBottom:4, letterSpacing:'-.3px' }}>{name}</div>
              <div style={{ color:C.textSub, fontSize:13, marginBottom:10 }}>{sub}</div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
                <span className="badge" style={{ background:m.bg, color:m.color,
                  border:`1px solid ${m.color}44`, padding:'4px 10px', fontSize:11 }}>
                  {m.label}
                </span>
                {item.distance != null && (
                  <span style={{ fontSize:12, color:m.color, fontWeight:600,
                    display:'flex', alignItems:'center', gap:4 }}>
                    <LocationOnIcon sx={{ fontSize: 11 }} />
                    {fmtDist(item.distance)} away
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'20px 20px' }}>
          {item._type === 'shop'  && <ShopBody  item={item} />}
          {item._type === 'house' && <HouseBody item={item} type_color={m.color} />}
          {item._type === 'job'   && <JobBody   item={item} type_color={m.color} />}

          <div style={{ marginTop:20, padding:16, background:C.surfaceAlt,
            border:`1.5px solid ${C.borderLight}`, borderRadius:16 }}>
            <div style={{ color:C.textMuted, fontSize:11, fontWeight:700, letterSpacing:'.07em',
              textTransform:'uppercase', marginBottom:12 }}>Contact</div>
            {(item.owner_name || item.employer_name) && (
              <div style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:4 }}>
                {item.owner_name || item.employer_name}
              </div>
            )}
            {phone && (
              <a href={`tel:${phone}`} style={{ color:m.color, fontSize:14, textDecoration:'none',
                fontWeight:600, display:'block', marginBottom:16 }}>{phone}</a>
            )}
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              <button className="btn" style={{ flex:1, borderRadius:12, minWidth:100, padding:'12px',
                background:m.color, color:'white', border:'none' }}
                onClick={() => onRoute(item)}>
                <DirectionsIcon sx={{ fontSize: 14 }} />
                Route
              </button>
              <button className="btn btn-ghost" style={{ flex:1, borderRadius:12, minWidth:100, padding:'12px' }}
                onClick={() => openGoogleMaps(item)}>
                <GoogleIcon sx={{ fontSize: 14 }} />
                Maps
              </button>
              {phone && (
                <button className="btn btn-ghost" style={{ flex:1, borderRadius:12, minWidth:100, padding:'12px' }}
                  onClick={() => window.location.href=`tel:${phone}`}>
                  <PhoneIcon sx={{ fontSize: 14 }} />
                  Call
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function InfoRow({ label, value, icon }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
      padding:'10px 0', borderBottom:`1px solid ${C.borderLight}` }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        {icon}
        <span style={{ color:C.textSub, fontSize:13 }}>{label}</span>
      </div>
      <span style={{ color:C.text, fontWeight:600, fontSize:14 }}>{value||'—'}</span>
    </div>
  );
}

function ShopBody({ item }) {
  return (
    <>
      {item.description && (
        <div style={{ marginBottom:16 }}>
          <div style={{ color:C.textMuted, fontSize:11, fontWeight:700, letterSpacing:'.07em', textTransform:'uppercase', marginBottom:8 }}>About</div>
          <div style={{ color:C.textSub, fontSize:13.5, lineHeight:1.65 }}>{item.description}</div>
        </div>
      )}
      {(item.opening_time && item.closing_time) && (
        <InfoRow label="Hours" value={`${item.opening_time.slice(0,5)} – ${item.closing_time.slice(0,5)}`}
          icon={<AccessTimeIcon sx={{ fontSize: 16, color: C.shopColor }} />} />
      )}
      {item.keywords?.length > 0 && (
        <div style={{ marginTop:16 }}>
          <div style={{ color:C.textMuted, fontSize:11, fontWeight:700, letterSpacing:'.07em', textTransform:'uppercase', marginBottom:10 }}>Tags</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {item.keywords.map((k,i) => (
              <span key={i} style={{ padding:'5px 12px', borderRadius:100, fontSize:12,
                background:C.shopLight, color:C.shopColor, fontWeight:500 }}>#{k}</span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function HouseBody({ item, type_color }) {
  const color = type_color || C.houseColor;
  return (
    <>
      <div style={{ background:`${color}12`, border:`1.5px solid ${color}33`,
        borderRadius:16, padding:16, marginBottom:16, textAlign:'center' }}>
        <div style={{ color:C.textSub, fontSize:12, marginBottom:4 }}>Monthly Rent</div>
        <div style={{ fontWeight:800, fontSize:28, color }}>{fmtINR(item.rent_per_month)}</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
        {[
          { label:'Rooms', value:`${item.rooms} BHK`, icon: <BedIcon sx={{ fontSize:16 }} /> },
          { label:'Halls', value:item.halls, icon: <MeetingRoomIcon sx={{ fontSize:16 }} /> },
          { label:'Kitchens', value:item.kitchens, icon: <KitchenIcon sx={{ fontSize:16 }} /> },
          { label:'Floor', value:item.floor, icon: <ApartmentIcon sx={{ fontSize:16 }} /> },
        ].map(r => (
          <div key={r.label} style={{ background:C.surfaceAlt, border:`1.5px solid ${C.borderLight}`, borderRadius:12, padding:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, color, fontSize:11, marginBottom:4, fontWeight:600 }}>
              {r.icon}
              <span style={{ color:C.textMuted }}>{r.label}</span>
            </div>
            <div style={{ color:C.text, fontWeight:700, fontSize:15 }}>{r.value||'—'}</div>
          </div>
        ))}
      </div>
      {item.description && <div style={{ color:C.textSub, fontSize:13.5, lineHeight:1.65 }}>{item.description}</div>}
    </>
  );
}

function JobBody({ item, type_color }) {
  const color = type_color || C.jobColor;
  return (
    <>
      <div style={{ background:`${color}12`, border:`1.5px solid ${color}33`,
        borderRadius:16, padding:16, marginBottom:16, textAlign:'center' }}>
        <div style={{ color:C.textSub, fontSize:12, marginBottom:4 }}>Salary</div>
        <div style={{ fontWeight:800, fontSize:28, color }}>
          {fmtINR(item.salary)}
          <span style={{ fontSize:14, fontWeight:400 }}>/{item.salary_type==='month'?'month':'day'}</span>
        </div>
      </div>
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        <span style={{ padding:'6px 12px', borderRadius:100, fontSize:12.5,
          background:`${color}15`, color, fontWeight:600, border:`1.5px solid ${color}33` }}>
          {item.job_type === 'full_time' ? 'Full Time' : 'Part Time'}
        </span>
        {item.qualification && (
          <span style={{ padding:'6px 12px', borderRadius:100, fontSize:12.5,
            background:C.purpleLight, color:C.purple, fontWeight:600,
            border:`1.5px solid ${C.purple}22`, display:'flex', alignItems:'center', gap:5 }}>
            <SchoolIcon sx={{ fontSize: 13 }} />
            {item.qualification}
          </span>
        )}
      </div>
      {item.description && <div style={{ color:C.textSub, fontSize:13.5, lineHeight:1.65 }}>{item.description}</div>}
    </>
  );
}

// ─── SKELETON + EMPTY ──────────────────────────────────────────────────────
function SkeletonList() {
  return (
    <div style={{ padding:'4px 12px', display:'flex', flexDirection:'column', gap:8 }}>
      {[...Array(5)].map((_,i) => (
        <div key={i} style={{ display:'flex', gap:11, alignItems:'center', background:C.surface,
          border:`1.5px solid ${C.borderLight}`, borderRadius:16, padding:12 }}>
          <div className="skeleton" style={{ width:44, height:44, borderRadius:13, flexShrink:0 }} />
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
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      padding:'60px 20px', textAlign:'center', gap:12 }}>
      <div style={{ width:72, height:72, borderRadius:22, background:C.accentLight,
        border:`2px solid ${C.accentMid}`,
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:32 }}>
        🔍
      </div>
      <div style={{ fontWeight:800, fontSize:18, color:C.text }}>Nothing nearby</div>
      <div style={{ color:C.textSub, fontSize:13.5, maxWidth:230 }}>
        Try increasing the search radius or clearing your filters
      </div>
    </div>
  );
}

// ─── LOADING SCREEN ────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{ height:'100dvh', display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', gap:20, background:C.bg, fontFamily:'Inter, sans-serif' }}>
      <img src={loadingGif} alt="Loading..." style={{ width:250, height:'auto',
        objectFit:'contain', marginBottom:70 }} />
    </div>
  );
}