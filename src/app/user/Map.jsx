// app/user/Map.jsx — v3: no carousel, map/list toggle, MUI icons, darker colors, smaller pins
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getAllNearby } from '../../services/map';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import loadingGif from '../../assets/Radar.gif';

import StorefrontIcon  from '@mui/icons-material/Storefront';
import HomeIcon        from '@mui/icons-material/Home';
import WorkIcon        from '@mui/icons-material/Work';
import LocationOnIcon  from '@mui/icons-material/LocationOn';
import NavigationIcon  from '@mui/icons-material/Navigation';
import VisibilityIcon  from '@mui/icons-material/Visibility';
import SearchIcon      from '@mui/icons-material/Search';
import FilterListIcon  from '@mui/icons-material/FilterList';
import MapIcon         from '@mui/icons-material/Map';
import ListIcon        from '@mui/icons-material/List';
import CloseIcon       from '@mui/icons-material/Close';
import RefreshIcon     from '@mui/icons-material/Refresh';
import MyLocationIcon  from '@mui/icons-material/MyLocation';
import ClearIcon       from '@mui/icons-material/Clear';
import PhoneIcon       from '@mui/icons-material/Phone';
import GoogleIcon      from '@mui/icons-material/Google';
import AccessTimeIcon  from '@mui/icons-material/AccessTime';
import BedIcon         from '@mui/icons-material/Bed';
import KitchenIcon     from '@mui/icons-material/Kitchen';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import ApartmentIcon   from '@mui/icons-material/Apartment';
import SchoolIcon      from '@mui/icons-material/School';
import InfoIcon        from '@mui/icons-material/Info';
import ShareIcon       from '@mui/icons-material/Share';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { CircularProgress } from '@mui/material';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg:          '#F0F4FF',
  surface:     '#FFFFFF',
  surfaceAlt:  '#F5F7FE',
  border:      '#E0E7FF',
  borderLight: '#EEF2FF',

  // Shop — original brand blue
  shop:        '#325fec',
  shopLight:   '#EEF4FF',
  shopMid:     '#BFCFFF',
  shopDark:    '#1A45C2',

  // House — dark green
  house:       '#057A55',
  houseLight:  '#DEF7EC',
  houseMid:    '#31C48D',
  houseDark:   '#03543F',

  // Job — dark amber/orange
  job:         '#B45309',
  jobLight:    '#FEF3C7',
  jobMid:      '#FBBF24',
  jobDark:     '#92400E',

  accent:      '#325fec',
  accentLight: '#EEF4FF',
  accentMid:   '#BFCFFF',
  accentDark:  '#1A45C2',

  green:       '#057A55',
  greenLight:  '#DEF7EC',
  red:         '#E02424',
  redLight:    '#FDE8E8',
  purple:      '#6C2BD9',
  purpleLight: '#EDEBFE',

  text:        '#0A1628',
  textSub:     '#374151',
  textMuted:   '#9CA3AF',
  shadow:      'rgba(50,95,236,0.15)',
  shadowMd:    'rgba(10,22,40,0.08)',
  shadowLg:    'rgba(10,22,40,0.20)',
};

// Match AppLayout.jsx floating pill nav footprint
const BOTTOM_NAV_H = 98;

const TYPE = {
  shop:  { color: C.shop,  bg: C.shopLight,  mid: C.shopMid,  dark: C.shopDark,  label: 'Shop',  Icon: StorefrontIcon },
  house: { color: C.house, bg: C.houseLight, mid: C.houseMid, dark: C.houseDark, label: 'House', Icon: HomeIcon },
  job:   { color: C.job,   bg: C.jobLight,   mid: C.jobMid,   dark: C.jobDark,   label: 'Job',   Icon: WorkIcon },
};

// ─── SVG Map Pins — compact 32×42, clear MUI-style icons ────────────────────
// Smaller pin body so the icon is fully visible and crisp
const PIN_SVG = {
  // Shop: storefront — awning + two uprights
  shop: (c) => `<svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 1C8.27 1 2 7.27 2 15c0 11.25 14 26 14 26S30 26.25 30 15C30 7.27 23.73 1 16 1z"
      fill="${c}" stroke="white" stroke-width="1.8"/>
    <circle cx="16" cy="15" r="10" fill="white"/>
    <rect x="10" y="14" width="12" height="7" rx="1" fill="${c}"/>
    <path d="M8.5 12.5l2.5-4h10l2.5 4" stroke="${c}" stroke-width="1.6" fill="none"
      stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="16" y1="14" x2="16" y2="21" stroke="${c}" stroke-width="1.2" opacity="0.5"/>
  </svg>`,

  // House: simple roof + door
  house: (c) => `<svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 1C8.27 1 2 7.27 2 15c0 11.25 14 26 14 26S30 26.25 30 15C30 7.27 23.73 1 16 1z"
      fill="${c}" stroke="white" stroke-width="1.8"/>
    <circle cx="16" cy="15" r="10" fill="white"/>
    <polygon points="16,8 9,14 9,22 13,22 13,17 19,17 19,22 23,22 23,14" fill="${c}"/>
    <rect x="13.5" y="17" width="5" height="5" fill="${c}" opacity="0.55"/>
  </svg>`,

  // Job: briefcase outline + handle
  job: (c) => `<svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 1C8.27 1 2 7.27 2 15c0 11.25 14 26 14 26S30 26.25 30 15C30 7.27 23.73 1 16 1z"
      fill="${c}" stroke="white" stroke-width="1.8"/>
    <circle cx="16" cy="15" r="10" fill="white"/>
    <rect x="10" y="14" width="12" height="8" rx="1.5" fill="${c}"/>
    <path d="M13 14v-2.5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2V14"
      stroke="${c}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <line x1="10" y1="18" x2="22" y2="18" stroke="white" stroke-width="1.3" opacity="0.7"/>
  </svg>`,

  // User dot — compact pulsing circle
  user: `<svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
    <circle cx="14" cy="14" r="12" fill="#1A56DB" stroke="white" stroke-width="3"/>
    <circle cx="14" cy="14" r="5" fill="white"/>
    <circle cx="14" cy="14" r="2.5" fill="#1A56DB"/>
  </svg>`,
};

const makeIcon = (type) => L.divIcon({
  className: '',
  html: type === 'user' ? PIN_SVG.user : PIN_SVG[type](TYPE[type]?.color || C.accent),
  iconSize:    type === 'user' ? [28, 28] : [32, 42],
  iconAnchor:  type === 'user' ? [14, 14] : [16, 42],
  popupAnchor: type === 'user' ? [0, -14] : [0, -44],
});
const ICONS = {
  shop:  makeIcon('shop'),
  house: makeIcon('house'),
  job:   makeIcon('job'),
  user:  makeIcon('user'),
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtINR  = (n) => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n||0);
const fmtDist = (d) => d != null ? (d < 1 ? `${Math.round(d*1000)} m` : `${d.toFixed(1)} km`) : '—';
const getName = (item) => item.title || item.business_name || item.job_title || 'Untitled';
const getSub  = (item) => item.subtitle || item.category || item.company_name || '';
const esc     = (s) => s?.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])) || '';

// ─── CSS ─────────────────────────────────────────────────────────────────────
const injectCSS = () => {
  if (document.getElementById('map-v3-css')) return;
  const s = document.createElement('style');
  s.id = 'map-v3-css';
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }

    .mv3-root {
      font-family: 'DM Sans', sans-serif !important;
      background: ${C.bg};
      color: ${C.text};
      /* Mobile: subtract floating bottom nav height */
      height: calc(100dvh - ${BOTTOM_NAV_H}px);
      overflow: hidden;
      position: relative;
    }

    /* ── Desktop: sidebar visible, no bottom nav offset ── */
    @media (min-width: 600px) {
      .mv3-root {
        height: 100dvh; /* desktop has no floating bottom nav */
      }
    }

    /* ── Leaflet overrides ── */
    .leaflet-container { font-family: 'DM Sans', sans-serif !important; background: #E8EDF8 !important; }
    .leaflet-popup-content-wrapper {
      background: ${C.surface} !important;
      border: 1.5px solid ${C.border} !important;
      border-radius: 18px !important;
      box-shadow: 0 16px 48px rgba(10,22,40,0.18) !important;
      color: ${C.text} !important;
      padding: 0 !important;
      overflow: hidden;
      min-width: 215px;
    }
    .leaflet-popup-content { margin: 0 !important; }
    .leaflet-popup-tip-container { display: none !important; }
    .leaflet-popup-close-button {
      color: ${C.textMuted} !important; font-size: 14px !important;
      width: 26px !important; height: 26px !important;
      top: 10px !important; right: 10px !important;
      border-radius: 50% !important; background: ${C.surfaceAlt} !important;
      display: flex !important; align-items: center !important;
      justify-content: center !important; z-index: 10 !important; line-height: 1 !important;
    }
    .leaflet-control-attribution { display: none !important; }
    .leaflet-bar { border: none !important; box-shadow: 0 4px 20px ${C.shadowMd} !important; }
    .leaflet-bar a {
      background: ${C.surface} !important; color: ${C.accent} !important;
      border: 1.5px solid ${C.border} !important; border-radius: 11px !important;
      margin: 4px !important; width: 36px !important; height: 36px !important;
      line-height: 34px !important; font-size: 17px !important; font-weight: 700 !important;
    }
    .leaflet-bar a:hover { background: ${C.accentLight} !important; }
    .leaflet-routing-container { display: none !important; }

    /* ── Animations ── */
    @keyframes slideUp   { from { transform:translateY(28px); opacity:0; } to { transform:translateY(0); opacity:1; } }
    @keyframes slideDown { from { transform:translateY(-16px); opacity:0; } to { transform:translateY(0); opacity:1; } }
    @keyframes fadeIn    { from { opacity:0; } to { opacity:1; } }
    @keyframes pulse     { 0%,100% { opacity:1; } 50% { opacity:.3; } }
    @keyframes shimmer   { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }

    .su { animation: slideUp  .36s cubic-bezier(.16,1,.3,1) both; }
    .sd { animation: slideDown .26s cubic-bezier(.16,1,.3,1) both; }
    .fi { animation: fadeIn .2s ease both; }

    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }

    .skeleton {
      background: linear-gradient(90deg, ${C.surfaceAlt} 25%, ${C.border} 50%, ${C.surfaceAlt} 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s ease infinite;
      border-radius: 10px;
    }

    /* ── Buttons ── */
    .btn { display:inline-flex; align-items:center; justify-content:center; gap:5px;
      border:none; cursor:pointer; font-family:'DM Sans',sans-serif; font-weight:600;
      transition:all .15s ease; outline:none; white-space:nowrap; }
    .btn-primary { background:${C.accent}; color:#fff; border-radius:12px; padding:10px 16px; font-size:13px; }
    .btn-primary:hover { background:${C.accentDark}; transform:translateY(-1px); box-shadow:0 6px 18px ${C.shadow}; }
    .btn-primary:active { transform:scale(.97); }
    .btn-ghost { background:${C.surface}; color:${C.text}; border:1.5px solid ${C.border};
      border-radius:12px; padding:10px 16px; font-size:13px; }
    .btn-ghost:hover { border-color:${C.accent}; color:${C.accent}; background:${C.accentLight}; }
    .btn-icon { width:40px; height:40px; border-radius:11px; border:1.5px solid ${C.border};
      background:${C.surface}; color:${C.textSub}; display:flex; align-items:center; justify-content:center;
      cursor:pointer; transition:all .15s; box-shadow:0 2px 8px ${C.shadowMd}; flex-shrink:0; }
    .btn-icon:hover { border-color:${C.accent}; color:${C.accent}; background:${C.accentLight}; }
    .btn-icon:active { transform:scale(.93); }
    .btn-icon.active { background:${C.accent}; color:#fff; border-color:${C.accent}; }

    /* ── Search input ── */
    .mv3-search { width:100%; background:${C.surface}; border:1.5px solid ${C.border};
      border-radius:13px; padding:10px 13px 10px 40px; color:${C.text};
      font-family:'DM Sans',sans-serif; font-size:13.5px; outline:none; font-weight:500;
      transition:border-color .18s, box-shadow .18s; box-shadow:0 2px 8px ${C.shadowMd}; }
    .mv3-search:focus { border-color:${C.accent}; box-shadow:0 0 0 3px ${C.accentMid}44; }
    .mv3-search::placeholder { color:${C.textMuted}; font-weight:400; }

    /* ── List card ── */
    .mv3-card { background:${C.surface}; border:1.5px solid ${C.borderLight}; border-radius:18px;
      padding:13px; cursor:pointer; transition:all .18s ease;
      display:flex; gap:11px; align-items:flex-start; }
    .mv3-card:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(10,22,40,0.09); }
    .mv3-card:active { transform:scale(.98); }

    /* ── Badge ── */
    .badge { font-family:'DM Sans',sans-serif; font-size:10.5px; font-weight:700;
      letter-spacing:.04em; padding:3px 9px; border-radius:100px; text-transform:uppercase; }

    /* ── Range slider ── */
    .mv3-slider { -webkit-appearance:none; width:100%; height:4px; border-radius:2px;
      background:${C.border}; outline:none; cursor:pointer; }
    .mv3-slider::-webkit-slider-thumb { -webkit-appearance:none; width:18px; height:18px;
      border-radius:50%; background:${C.accent}; cursor:pointer;
      border:2.5px solid white; box-shadow:0 0 0 3px ${C.accentMid}66; }

    /* ── Toggle ── */
    .tog { position:relative; display:inline-block; width:46px; height:26px; flex-shrink:0; }
    .tog input { opacity:0; width:0; height:0; }
    .tog-track { position:absolute; inset:0; border-radius:13px; background:${C.border};
      cursor:pointer; transition:background .2s; }
    .tog-track::before { content:''; position:absolute; width:20px; height:20px;
      left:3px; top:3px; border-radius:50%; background:#fff;
      transition:all .2s; box-shadow:0 1px 4px rgba(0,0,0,.18); }
    .tog input:checked + .tog-track { background:${C.accent}; }
    .tog input:checked + .tog-track::before { transform:translateX(20px); }

    /* ── View pill toggle ── */
    .view-pill { display:flex; background:${C.surfaceAlt}; border:1.5px solid ${C.border};
      border-radius:12px; padding:3px; gap:2px; }
    .view-btn { flex:1; padding:7px 14px; border:none; background:transparent; color:${C.textSub};
      font-family:'DM Sans',sans-serif; font-size:12.5px; font-weight:500; cursor:pointer;
      border-radius:9px; transition:all .15s; display:flex; align-items:center;
      justify-content:center; gap:5px; }
    .view-btn.on { background:${C.surface}; color:${C.accent}; font-weight:700;
      box-shadow:0 2px 8px ${C.shadowMd}; }

    /* ── Filter chip ── */
    .fchip { padding:6px 13px; border-radius:100px; font-size:12.5px; font-weight:600;
      cursor:pointer; border:1.5px solid ${C.border}; background:${C.surface};
      color:${C.textSub}; transition:all .15s; font-family:'DM Sans',sans-serif;
      white-space:nowrap; display:inline-flex; align-items:center; gap:5px; }
    .fchip:hover { background:${C.accentLight}; border-color:${C.accentMid}; color:${C.accent}; }
    .fchip-shop.on  { background:${C.shopLight};  border-color:${C.shopMid};  color:${C.shopDark};  }
    .fchip-house.on { background:${C.houseLight}; border-color:${C.houseMid}; color:${C.houseDark}; }
    .fchip-job.on   { background:${C.jobLight};   border-color:${C.jobMid};   color:${C.jobDark};   }
    .fchip-all.on   { background:${C.accent}; border-color:${C.accent}; color:#fff; }

    /* ── Handle bar ── */
    .handle { width:40px; height:4px; border-radius:2px; background:${C.border}; margin:12px auto 0; }

    /* ── Popup ── */
    .mv3-popup { padding:14px 16px 16px; min-width:205px; max-width:260px; }
    .mv3-popup-title { font-weight:800; font-size:14.5px; color:${C.text}; margin-bottom:2px; letter-spacing:-.2px; }
    .mv3-popup-sub   { font-size:11.5px; color:${C.textSub}; margin-bottom:7px; }

    /* ── List bottom sheet (mobile) ── */
    .mv3-list-overlay {
      position: fixed; inset: 0; z-index: 200;
      background: rgba(10,22,40,0.46);
      backdrop-filter: blur(4px);
      animation: fadeIn .2s ease;
    }
    .mv3-list-modal {
      position: fixed;
      bottom: ${BOTTOM_NAV_H}px;
      left: 0; right: 0;
      z-index: 210;
      background: ${C.surface};
      border-radius: 24px 24px 0 0;
      height: calc(100dvh - 64px - ${BOTTOM_NAV_H}px);
      display: flex; flex-direction: column;
      box-shadow: 0 -14px 50px ${C.shadowLg};
      border: 1.5px solid ${C.border}; border-bottom: none;
      animation: slideUp .36s cubic-bezier(.16,1,.3,1) both;
      overflow: hidden;
    }

    /* ── Detail panel (full height between topbar & bottom nav) ── */
    .mv3-detail-backdrop {
      position: fixed; inset: 0; bottom: ${BOTTOM_NAV_H}px;
      z-index: 300; background: rgba(10,22,40,0.48);
      backdrop-filter: blur(5px); animation: fadeIn .2s ease;
    }
    .mv3-detail-panel {
      position: fixed;
      top: 64px; /* below AppLayout topbar on mobile */
      bottom: ${BOTTOM_NAV_H}px;
      left: 0; right: 0; z-index: 310;
      background: ${C.surface};
      display: flex; flex-direction: column;
      overflow: hidden;
      animation: slideUp .38s cubic-bezier(.16,1,.3,1) both;
    }
    /* Desktop overrides applied in the desktop media query below */

    /* ── Action buttons in detail ── */
    .action-row { display:flex; gap:9px; }
    .action-btn {
      flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center;
      gap:5px; padding:11px 6px; border-radius:14px; cursor:pointer;
      border:1.5px solid ${C.border}; background:${C.surfaceAlt}; color:${C.textSub};
      transition:all .15s; font-family:'DM Sans',sans-serif;
      font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em;
    }
    .action-btn:hover { transform:translateY(-1px); }
    .action-btn:active { transform:scale(.96); }
    .action-btn.primary { background:${C.accent}; color:#fff; border-color:${C.accent}; }
    .action-btn.primary:hover { background:${C.accentDark}; box-shadow:0 8px 22px ${C.shadow}; }

    /* ── Info row in detail ── */
    .info-row { display:flex; justify-content:space-between; align-items:center;
      padding:10px 0; border-bottom:1px solid ${C.borderLight}; gap:8px; }
    .info-row:last-child { border-bottom: none; }

    /* ── Stat grid ── */
    .stat-grid { display:grid; grid-template-columns:1fr 1fr; gap:9px; margin-bottom:14px; }
    .stat-card { background:${C.surfaceAlt}; border:1.5px solid ${C.borderLight};
      border-radius:14px; padding:12px 11px; }

    /* ── Radius pills ── */
    .rad-pill { padding:6px 13px; border-radius:100px; font-size:12px; font-weight:700;
      border:1.5px solid ${C.border}; background:${C.surface}; color:${C.textSub};
      cursor:pointer; transition:all .14s; font-family:'DM Sans',sans-serif; }
    .rad-pill.on { background:${C.accent}; color:#fff; border-color:${C.accent}; }

    /* ── Status bar ── */
    .mv3-statusbar {
      position: absolute;
      bottom: 16px;
      left: 50%; transform: translateX(-50%);
      z-index: 100;
      display: flex; align-items: center; gap:8px;
      background: ${C.surface}; border: 1.5px solid ${C.border};
      border-radius: 100px; padding: 8px 16px;
      box-shadow: 0 4px 14px ${C.shadowMd}; white-space: nowrap;
    }

    /* ── Desktop sidebar layout ── */
    @media (min-width: 600px) {
      .mv3-sidebar {
        position: absolute; left: 0; top: 0; bottom: 0; width: 340px;
        z-index: 200; background: ${C.surface};
        border-right: 1.5px solid ${C.border};
        display: flex !important; flex-direction: column;
        box-shadow: 4px 0 20px ${C.shadowMd};
      }
      .mv3-map-zone { position: absolute; left: 340px; right: 0; top: 0; bottom: 0; }
      .mv3-topbar   { display: none !important; }
      .mv3-list-overlay, .mv3-list-modal { display: none !important; }
      .mv3-fabs { left: 356px !important; bottom: 16px !important; }
      .mv3-statusbar {
        left: calc(340px + 50%) !important;
        transform: translateX(-50%) !important;
        bottom: 16px !important;
      }
      .mv3-detail-panel {
        left: 340px !important;
        top: 0 !important;
        bottom: 0 !important;
      }
      .mv3-detail-backdrop {
        left: 340px !important;
        bottom: 0 !important;
        top: 0 !important;
      }
      .mv3-legend { left: 356px !important; bottom: 16px !important; }
    }

    /* ── Mobile: hide sidebar, full-width map ── */
    @media (max-width: 599px) {
      .mv3-sidebar  { display: none !important; }
      .mv3-map-zone { position: absolute; inset: 0; }
    }
  `;
  document.head.appendChild(s);
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Map() {
  const [phase, setPhase]             = useState('locating');
  const [userLocation, setUserLocation] = useState(null);
  const [shops, setShops]             = useState([]);
  const [houses, setHouses]           = useState([]);
  const [jobs, setJobs]               = useState([]);
  const [loading, setLoading]         = useState(false);
  const [loadingVisible, setLoadingVisible] = useState(false);
  const [error, setError]             = useState('');

  const [viewMode, setViewMode]       = useState('map');   // 'map' | 'list'
  const [filterOpen, setFilterOpen]   = useState(false);
  const [detailItem, setDetailItem]   = useState(null);
  const [listModalOpen, setListModalOpen] = useState(false);

  const [radius, setRadius]           = useState(0.2);
  const [search, setSearch]           = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [typeFilter, setTypeFilter]   = useState({ shops:true, houses:true, jobs:true });

  const mapRef        = useRef(null);
  const mapContRef    = useRef(null);
  const markersRef    = useRef([]);
  const userMarkerRef = useRef(null);
  const userCircleRef = useRef(null);
  const routingRef    = useRef(null);
  const intervalRef   = useRef(null);
  const loadingTimer  = useRef(null);
  const searchTimer   = useRef(null);

  // Debounce search
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

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
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19 })
      .addTo(mapRef.current);
    L.control.zoom({ position: 'topright' }).addTo(mapRef.current);
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, [phase]);

  // Auto-fetch
  useEffect(() => {
    if (!userLocation) return;
    fetchData();
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchData, 30000);
    return () => clearInterval(intervalRef.current);
  }, [userLocation, radius, typeFilter, debouncedSearch]);

  // Re-render markers when data changes
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;
    renderMarkers();
  }, [shops, houses, jobs, userLocation, radius]);

  // Custom events from popup buttons
  useEffect(() => {
    const h = (e) => setDetailItem(e.detail);
    window.addEventListener('mv3:detail', h);
    return () => window.removeEventListener('mv3:detail', h);
  }, []);
  useEffect(() => {
    const h = (e) => showRoute(e.detail);
    window.addEventListener('mv3:route', h);
    return () => window.removeEventListener('mv3:route', h);
  }, [userLocation]);

  // Sync list modal ↔ viewMode
  useEffect(() => {
    if (!listModalOpen && viewMode === 'list') setViewMode('map');
  }, [listModalOpen]);
  useEffect(() => {
    if (viewMode === 'list') setListModalOpen(true);
    else setListModalOpen(false);
  }, [viewMode]);

  const fetchData = async () => {
    if (!userLocation) return;
    clearTimeout(loadingTimer.current);
    loadingTimer.current = setTimeout(() => setLoadingVisible(true), 600);
    setLoading(true);
    try {
      const types = Object.entries(typeFilter).filter(([,v]) => v).map(([k]) => k).join(',');
      const res = await getAllNearby(userLocation.latitude, userLocation.longitude, radius, types, debouncedSearch);
      setShops(res.shops   || []);
      setHouses(res.houses || []);
      setJobs(res.jobs     || []);
      setError('');
    } catch (e) {
      setError(e.message || 'Failed to load');
    } finally {
      clearTimeout(loadingTimer.current);
      setLoading(false);
      setLoadingVisible(false);
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
    setListModalOpen(false);
    setViewMode('map');
    setDetailItem(null);
    try {
      routingRef.current = L.Routing.control({
        waypoints: [
          L.latLng(userLocation.latitude, userLocation.longitude),
          L.latLng(parseFloat(item.latitude), parseFloat(item.longitude)),
        ],
        routeWhileDragging: true,
        showAlternatives: false,
        lineOptions: {
          styles: [{ color: TYPE[item._type]?.color || C.accent, weight: 6, opacity: 0.9, lineCap: 'round' }],
          extendToWaypoints: true,
          missingRouteTolerance: 10,
        },
        createMarker: () => null,
        addWaypoints: false,
        fitSelectedRoutes: true,
      }).addTo(mapRef.current);
    } catch {
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
    mapRef.current.flyTo([lat, lng], mapRef.current.getZoom(), { duration: 0.6 });

    // User marker
    userMarkerRef.current = L.marker([lat, lng], { icon: ICONS.user, zIndexOffset: 1000 })
      .bindPopup(`<div class="mv3-popup" style="text-align:center;padding:14px">
        <div style="width:36px;height:36px;border-radius:50%;background:${C.accentLight};
          display:flex;align-items:center;justify-content:center;margin:0 auto 8px">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="${C.accent}">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        <div class="mv3-popup-title">You are here</div>
        <div class="mv3-popup-sub" style="margin-bottom:0">Your current location</div>
      </div>`)
      .addTo(mapRef.current);

    // Radius circle
    userCircleRef.current = L.circle([lat, lng], {
      radius: radius * 1000,
      color: C.accent, fillColor: C.accent,
      fillOpacity: 0.05, weight: 1.5, dashArray: '6 8',
    }).addTo(mapRef.current);

    // Item markers
    const addMarkers = (list, type) => list.forEach(item => {
      if (!item.latitude || !item.longitude) return;
      const m = TYPE[type];
      const itemJson = JSON.stringify({...item, _type: type}).replace(/"/g, '&quot;');

      const priceHTML = type === 'house'
        ? `<div style="color:${m.color};font-weight:800;font-size:14px;margin:5px 0 9px;letter-spacing:-.3px">
            ${fmtINR(item.rent_per_month)}<span style="font-weight:400;font-size:11px;color:${C.textSub}">/mo</span>
           </div>`
        : type === 'job'
        ? `<div style="color:${m.color};font-weight:800;font-size:14px;margin:5px 0 9px;letter-spacing:-.3px">
            ${fmtINR(item.salary)}<span style="font-weight:400;font-size:11px;color:${C.textSub}">/${item.salary_type==='month'?'mo':'day'}</span>
           </div>`
        : '';

      // MUI-style icon SVGs inline in popup
      const iconSVG = {
        shop:  `<svg viewBox="0 0 24 24" width="20" height="20" fill="${m.color}">
                  <path d="M20 4H4v2l16 .01V4zM4 10v10h16V10H4zm10 7h-4v-2h4v2zM2 8l1-4h18l1 4v2h-2v8h-4v-8H8v8H4v-8H2V8z"/>
                </svg>`,
        house: `<svg viewBox="0 0 24 24" width="20" height="20" fill="${m.color}">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>`,
        job:   `<svg viewBox="0 0 24 24" width="20" height="20" fill="${m.color}">
                  <path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-8 0h-4V4h4v2z"/>
                </svg>`,
      };

      const popup = `
        <div>
          <div style="height:4px;background:${m.color}"></div>
          <div class="mv3-popup" style="padding-top:12px">
            <div style="display:flex;gap:9px;align-items:flex-start;margin-bottom:5px">
              <div style="width:38px;height:38px;border-radius:12px;background:${m.bg};
                display:flex;align-items:center;justify-content:center;flex-shrink:0;
                border:1.5px solid ${m.color}22">
                ${iconSVG[type]}
              </div>
              <div style="flex:1;min-width:0;padding-top:2px">
                <div class="mv3-popup-title">${esc(getName(item))}</div>
                <div class="mv3-popup-sub">${esc(getSub(item))}</div>
                <span class="badge" style="background:${m.bg};color:${m.dark}">${m.label}</span>
              </div>
            </div>
            ${priceHTML}
            <div style="display:flex;align-items:center;gap:5px;margin:0 0 11px;font-size:12px;color:${C.textSub}">
              <svg viewBox="0 0 24 24" width="11" height="11" fill="${m.color}">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              </svg>
              <span style="font-weight:700;color:${m.color}">${fmtDist(item.distance)}</span>
              <span>away</span>
            </div>
            <div style="display:flex;gap:7px">
              <button style="flex:1;padding:9px;font-size:12.5px;font-weight:700;
                font-family:DM Sans,sans-serif;border:none;border-radius:11px;
                background:${m.color};color:#fff;cursor:pointer"
                onclick="window.dispatchEvent(new CustomEvent('mv3:route',{detail:${itemJson}}))">
                Route
              </button>
              <button style="flex:1;padding:9px;font-size:12.5px;font-weight:700;
                font-family:DM Sans,sans-serif;border:1.5px solid ${C.border};
                border-radius:11px;background:white;color:${C.text};cursor:pointer"
                onclick="window.dispatchEvent(new CustomEvent('mv3:detail',{detail:${itemJson}}))">
                Details
              </button>
            </div>
          </div>
        </div>`;

      const marker = L.marker(
        [parseFloat(item.latitude), parseFloat(item.longitude)],
        { icon: ICONS[type] }
      ).bindPopup(popup, { maxWidth: 280 }).addTo(mapRef.current);
      markersRef.current.push(marker);
    });

    if (typeFilter.shops)  addMarkers(shops,  'shop');
    if (typeFilter.houses) addMarkers(houses, 'house');
    if (typeFilter.jobs)   addMarkers(jobs,   'job');
  }, [shops, houses, jobs, userLocation, radius, typeFilter]);

  // Computed lists
  const allItems = [
    ...shops.map(s  => ({ ...s, _type: 'shop'  })),
    ...houses.map(h => ({ ...h, _type: 'house' })),
    ...jobs.map(j   => ({ ...j, _type: 'job'   })),
  ].sort((a, b) => (a.distance || 0) - (b.distance || 0));

  const filteredItems = activeCategory === 'All'
    ? allItems
    : allItems.filter(i => i._type === activeCategory.toLowerCase());

  if (phase === 'locating') return <LoadingScreen />;

  return (
    <div className="mv3-root">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="mv3-sidebar">
        <SidebarContent
          allItems={allItems} filteredItems={filteredItems}
          loading={loading} radius={radius} setRadius={setRadius}
          search={search} setSearch={setSearch}
          typeFilter={typeFilter} setTypeFilter={setTypeFilter}
          activeCategory={activeCategory} setActiveCategory={setActiveCategory}
          viewMode={viewMode} setViewMode={setViewMode}
          onSelect={setDetailItem} onRoute={showRoute}
          openGoogleMaps={openGoogleMaps} fetchData={fetchData} clearRoute={clearRoute}
        />
      </aside>

      {/* ── MAP ZONE ── */}
      <div className="mv3-map-zone">
        <div ref={mapContRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

        {/* MOBILE TOPBAR */}
        <div className="mv3-topbar sd" style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
          padding: '10px 12px',
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'linear-gradient(to bottom, rgba(240,244,255,0.97) 72%, transparent)',
          backdropFilter: 'blur(2px)',
        }}>
          {/* Logo pill */}
          <div style={{
            background: C.accent, borderRadius: 12, padding: '9px 13px',
            display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
            boxShadow: `0 4px 14px ${C.shadow}`,
          }}>
            <LocationOnIcon sx={{ fontSize: 15, color: '#fff' }} />
            <span style={{ fontWeight: 800, fontSize: 14, color: '#fff', letterSpacing: '-.2px' }}>Nearby</span>
          </div>

          {/* Search */}
          <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
            <span style={{
              position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
              color: C.textMuted, pointerEvents: 'none', display: 'flex',
            }}>
              <SearchIcon sx={{ fontSize: 15 }} />
            </span>
            <input className="mv3-search" placeholder="Search shops, houses, jobs…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* Filter */}
          <button className={`btn-icon ${filterOpen ? 'active' : ''}`}
            onClick={() => setFilterOpen(v => !v)}>
            <FilterListIcon sx={{ fontSize: 17 }} />
          </button>
        </div>

        {/* CATEGORY + VIEW TOGGLE ROW */}
        <div className="mv3-topbar" style={{
          position: 'absolute', top: 62, left: 12, right: 12, zIndex: 99,
          display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', scrollbarWidth: 'none',
        }}>
          {[
            { id: 'All',   cls: 'fchip-all' },
            { id: 'Shop',  cls: 'fchip-shop',  icon: <StorefrontIcon sx={{ fontSize: 13 }} /> },
            { id: 'House', cls: 'fchip-house', icon: <HomeIcon sx={{ fontSize: 13 }} /> },
            { id: 'Job',   cls: 'fchip-job',   icon: <WorkIcon sx={{ fontSize: 13 }} /> },
          ].map(c => (
            <button key={c.id} className={`fchip ${c.cls} ${activeCategory === c.id ? 'on' : ''}`}
              onClick={() => setActiveCategory(c.id)}
              style={{ boxShadow: `0 2px 8px ${C.shadowMd}` }}>
              {c.icon}
              {c.id}
              {c.id !== 'All' && (
                <span style={{ fontSize: 10, opacity: .75 }}>
                  ({allItems.filter(i => i._type === c.id.toLowerCase()).length})
                </span>
              )}
            </button>
          ))}

          {/* Map / List toggle */}
          <div className="view-pill" style={{ marginLeft: 'auto', flexShrink: 0, boxShadow: `0 2px 8px ${C.shadowMd}` }}>
            <button className={`view-btn ${viewMode === 'map' ? 'on' : ''}`} onClick={() => setViewMode('map')}>
              <MapIcon sx={{ fontSize: 13 }} /> Map
            </button>
            <button className={`view-btn ${viewMode === 'list' ? 'on' : ''}`} onClick={() => setViewMode('list')}>
              <ListIcon sx={{ fontSize: 13 }} />
              List
              {allItems.length > 0 && (
                <span style={{
                  background: C.accent, color: '#fff', borderRadius: 100,
                  fontSize: 9, fontWeight: 800, padding: '1px 5px', lineHeight: '14px', marginLeft: 2,
                }}>
                  {allItems.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* FILTER PANEL */}
        {filterOpen && (
          <div className="mv3-topbar fi" style={{
            position: 'absolute', top: 60, right: 12, zIndex: 200,
            background: C.surface, border: `1.5px solid ${C.border}`,
            borderRadius: 20, padding: 18, width: 260,
            boxShadow: `0 20px 50px ${C.shadowLg}`,
          }}>
            <FilterPanel
              radius={radius} setRadius={setRadius}
              typeFilter={typeFilter} setTypeFilter={setTypeFilter}
              onApply={() => { fetchData(); setFilterOpen(false); }}
            />
          </div>
        )}

        {/* MAP FABs */}
        <div className="mv3-fabs" style={{
          position: 'absolute', right: 12, bottom: 16, zIndex: 100,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <button className="btn-icon" title="My location" onClick={() => {
            if (mapRef.current && userLocation)
              mapRef.current.flyTo([userLocation.latitude, userLocation.longitude], 16, { duration: 1 });
          }}>
            <MyLocationIcon sx={{ fontSize: 17 }} />
          </button>
          <button className="btn-icon" title="Clear route" onClick={clearRoute}>
            <ClearIcon sx={{ fontSize: 16 }} />
          </button>
          <button className="btn-icon" title="Refresh" onClick={fetchData}>
            <RefreshIcon sx={{ fontSize: 16 }} />
          </button>
        </div>

        {/* STATUS BAR */}
        {viewMode === 'map' && !detailItem && (
          <div className="mv3-statusbar fi">
            {loadingVisible ? (
              <>
                <CircularProgress size={11} sx={{ color: C.accent }} />
                <span style={{ color: C.textSub, fontSize: 12.5, fontWeight: 500 }}>Updating…</span>
              </>
            ) : (
              <>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, flexShrink: 0 }} />
                <span style={{ color: C.text, fontWeight: 700, fontSize: 12.5 }}>{allItems.length} places</span>
                <span style={{ color: C.border, fontSize: 10 }}>|</span>
                <span style={{ color: C.textSub, fontSize: 12.5 }}>
                  {radius < 1 ? `${Math.round(radius * 1000)}m` : `${radius}km`}
                </span>
              </>
            )}
          </div>
        )}

        {/* TYPE LEGEND */}
        {viewMode === 'map' && !detailItem && (
          <div className="mv3-legend" style={{
            position: 'absolute', bottom: 16, left: 12, zIndex: 100,
            display: 'flex', flexDirection: 'column', gap: 5,
          }}>
            {Object.entries(TYPE).map(([k, m]) => (
              <div key={k} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: C.surface, borderRadius: 100, padding: '4px 11px',
                border: `1.5px solid ${typeFilter[k + 's'] ? m.color + '55' : C.border}`,
                boxShadow: `0 2px 8px ${C.shadowMd}`,
                opacity: typeFilter[k + 's'] ? 1 : 0.4,
                transition: 'all .2s',
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                <span style={{ color: m.dark, fontSize: 11.5, fontWeight: 700 }}>{m.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── LIST BOTTOM SHEET (mobile) ── */}
      {listModalOpen && (
        <>
          <div className="mv3-list-overlay" onClick={() => setViewMode('map')} />
          <div className="mv3-list-modal">
            <div className="handle" />
            {/* Header */}
            <div style={{ padding: '10px 16px 13px', borderBottom: `1.5px solid ${C.borderLight}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 19, color: C.text, letterSpacing: '-.3px' }}>
                    {filteredItems.length} Results
                  </div>
                  <div style={{ color: C.textSub, fontSize: 12, marginTop: 1 }}>
                    within {radius < 1 ? `${Math.round(radius * 1000)}m` : `${radius} km`}
                    {loading && <span style={{ marginLeft: 7, color: C.accent }}> · refreshing</span>}
                  </div>
                </div>
                <button className="btn-icon" onClick={() => setViewMode('map')}>
                  <CloseIcon sx={{ fontSize: 17 }} />
                </button>
              </div>
              {/* Search */}
              <div style={{ position: 'relative', marginBottom: 11 }}>
                <span style={{
                  position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
                  color: C.textMuted, pointerEvents: 'none', display: 'flex',
                }}>
                  <SearchIcon sx={{ fontSize: 15 }} />
                </span>
                <input className="mv3-search" placeholder="Search results…" value={search}
                  onChange={e => setSearch(e.target.value)} />
              </div>
              {/* Category chips */}
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2 }}>
                {[
                  { id: 'All',   cls: 'fchip-all',   count: allItems.length },
                  { id: 'Shop',  cls: 'fchip-shop',  count: allItems.filter(i => i._type === 'shop').length },
                  { id: 'House', cls: 'fchip-house', count: allItems.filter(i => i._type === 'house').length },
                  { id: 'Job',   cls: 'fchip-job',   count: allItems.filter(i => i._type === 'job').length },
                ].map(c => (
                  <button key={c.id} className={`fchip ${c.cls} ${activeCategory === c.id ? 'on' : ''}`}
                    onClick={() => setActiveCategory(c.id)}>
                    {c.id} ({c.count})
                  </button>
                ))}
              </div>
            </div>
            {/* Items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0 14px' }}>
              {loading && filteredItems.length === 0 ? <SkeletonList />
                : filteredItems.length === 0 ? <EmptyState />
                : <ListView items={filteredItems} onSelect={setDetailItem} onRoute={showRoute} />}
            </div>
          </div>
        </>
      )}

      {/* ── DETAIL PANEL ── */}
      {detailItem && (
        <DetailPanel
          item={detailItem}
          onClose={() => setDetailItem(null)}
          onRoute={showRoute}
          openGoogleMaps={openGoogleMaps}
        />
      )}

      {/* ERROR TOAST */}
      {error && (
        <div className="sd" style={{
          position: 'fixed', top: 14, left: '50%', transform: 'translateX(-50%)',
          zIndex: 600, background: C.redLight, border: `1.5px solid #FCA5A5`,
          borderRadius: 14, padding: '10px 15px',
          display: 'flex', gap: 9, alignItems: 'center',
          boxShadow: `0 8px 28px ${C.shadowLg}`, minWidth: 220,
        }}>
          <InfoIcon sx={{ fontSize: 15, color: C.red }} />
          <span style={{ color: C.red, fontSize: 13, flex: 1, fontWeight: 500 }}>{error}</span>
          <button style={{ background: 'transparent', border: 'none', color: C.textMuted, cursor: 'pointer' }}
            onClick={() => setError('')}>
            <CloseIcon sx={{ fontSize: 15 }} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── SIDEBAR (desktop) ────────────────────────────────────────────────────────
function SidebarContent({ allItems, filteredItems, loading, radius, setRadius, search, setSearch,
  typeFilter, setTypeFilter, activeCategory, setActiveCategory, viewMode, setViewMode,
  onSelect, onRoute, openGoogleMaps, fetchData, clearRoute }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '16px 16px 13px', borderBottom: `1.5px solid ${C.borderLight}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12, background: C.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 12px ${C.shadow}`,
            }}>
              <LocationOnIcon sx={{ fontSize: 19, color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: C.text, letterSpacing: '-.3px' }}>Nearby</div>
              <div style={{ fontSize: 11.5, color: C.textMuted, fontWeight: 500 }}>Explore around you</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            <button className="btn-icon" style={{ width: 34, height: 34, borderRadius: 9 }}
              onClick={clearRoute} title="Clear route">
              <ClearIcon sx={{ fontSize: 14 }} />
            </button>
            <button className="btn-icon" style={{ width: 34, height: 34, borderRadius: 9 }}
              onClick={fetchData} title="Refresh">
              <RefreshIcon sx={{ fontSize: 14 }} />
            </button>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
            color: C.textMuted, pointerEvents: 'none', display: 'flex',
          }}>
            <SearchIcon sx={{ fontSize: 15 }} />
          </span>
          <input className="mv3-search" placeholder="Search shops, houses, jobs…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: '12px 16px 11px', borderBottom: `1.5px solid ${C.borderLight}` }}>
        {/* Category chips */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 13, flexWrap: 'wrap' }}>
          <button className={`fchip fchip-all ${activeCategory === 'All' ? 'on' : ''}`}
            onClick={() => setActiveCategory('All')}>All</button>
          {[
            { id: 'Shop',  cls: 'fchip-shop',  Icon: StorefrontIcon },
            { id: 'House', cls: 'fchip-house', Icon: HomeIcon },
            { id: 'Job',   cls: 'fchip-job',   Icon: WorkIcon },
          ].map(c => (
            <button key={c.id} className={`fchip ${c.cls} ${activeCategory === c.id ? 'on' : ''}`}
              onClick={() => setActiveCategory(c.id)}>
              <c.Icon sx={{ fontSize: 13 }} /> {c.id}s
            </button>
          ))}
        </div>

        {/* Radius */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
            <span style={{ color: C.textSub, fontSize: 12.5, fontWeight: 500 }}>Search Radius</span>
            <span style={{
              background: C.accentLight, color: C.accent, borderRadius: 100,
              padding: '2px 9px', fontSize: 11.5, fontWeight: 700,
            }}>
              {radius < 1 ? `${Math.round(radius * 1000)}m` : `${radius}km`}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 9 }}>
            {[0.2, 0.4, 1, 2].map(r => (
              <button key={r} className={`rad-pill ${radius === r ? 'on' : ''}`}
                onClick={() => setRadius(r)}>
                {r < 1 ? `${r * 1000}m` : `${r}km`}
              </button>
            ))}
          </div>
          <input type="range" className="mv3-slider" min={0.1} max={10} step={0.1}
            value={radius} onChange={e => setRadius(Number(e.target.value))} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ color: C.textMuted, fontSize: 10.5 }}>100m</span>
            <span style={{ color: C.textMuted, fontSize: 10.5 }}>10 km</span>
          </div>
        </div>

        {/* Type toggles */}
        <div style={{ marginTop: 12 }}>
          {[
            { key: 'shops',  label: 'Shops',  color: C.shop,  bg: C.shopLight,  Icon: StorefrontIcon },
            { key: 'houses', label: 'Houses', color: C.house, bg: C.houseLight, Icon: HomeIcon },
            { key: 'jobs',   label: 'Jobs',   color: C.job,   bg: C.jobLight,   Icon: WorkIcon },
          ].map(t => (
            <div key={t.key} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 0', borderBottom: `1px solid ${C.borderLight}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 9, background: t.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.color,
                }}>
                  <t.Icon sx={{ fontSize: 16 }} />
                </div>
                <span style={{ color: C.text, fontSize: 13.5, fontWeight: 500 }}>{t.label}</span>
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

      {/* Results count + view toggle */}
      <div style={{
        padding: '9px 16px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', borderBottom: `1px solid ${C.borderLight}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: loading ? C.accent : C.green,
            animation: loading ? 'pulse 1s ease infinite' : 'none',
          }} />
          <span style={{ fontWeight: 700, fontSize: 13.5, color: C.text }}>{allItems.length}</span>
          <span style={{ fontSize: 12.5, color: C.textSub }}>results</span>
        </div>
        <div className="view-pill">
          <button className={`view-btn ${viewMode === 'map' ? 'on' : ''}`}
            style={{ padding: '6px 13px', fontSize: 12 }} onClick={() => setViewMode('map')}>
            <MapIcon sx={{ fontSize: 12 }} /> Map
          </button>
          <button className={`view-btn ${viewMode === 'list' ? 'on' : ''}`}
            style={{ padding: '6px 13px', fontSize: 12 }} onClick={() => setViewMode('list')}>
            <ListIcon sx={{ fontSize: 12 }} /> List
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '5px 0' }}>
        {loading ? <SkeletonList />
          : filteredItems.length === 0 ? <EmptyState />
          : <ListView items={filteredItems} onSelect={onSelect} onRoute={onRoute} />}
      </div>
    </div>
  );
}

// ─── FILTER PANEL ─────────────────────────────────────────────────────────────
function FilterPanel({ radius, setRadius, typeFilter, setTypeFilter, onApply }) {
  return (
    <>
      <div style={{ fontWeight: 800, fontSize: 15.5, color: C.text, marginBottom: 14, letterSpacing: '-.2px' }}>
        Filters
      </div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
          <span style={{ color: C.textSub, fontSize: 12.5, fontWeight: 500 }}>Radius</span>
          <span style={{ color: C.accent, fontWeight: 700, fontSize: 12.5 }}>
            {radius < 1 ? `${Math.round(radius * 1000)}m` : `${radius}km`}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 9 }}>
          {[0.2, 0.4, 1, 2].map(r => (
            <button key={r} className={`rad-pill ${radius === r ? 'on' : ''}`} onClick={() => setRadius(r)}>
              {r < 1 ? `${r * 1000}m` : `${r}km`}
            </button>
          ))}
        </div>
        <input type="range" className="mv3-slider" min={0.1} max={10} step={0.1}
          value={radius} onChange={e => setRadius(Number(e.target.value))} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ color: C.textMuted, fontSize: 11, fontWeight: 700, marginBottom: 9,
          textTransform: 'uppercase', letterSpacing: '.06em' }}>Show Types</div>
        {[
          { key: 'shops',  label: 'Shops',  color: C.shop,  bg: C.shopLight,  Icon: StorefrontIcon },
          { key: 'houses', label: 'Houses', color: C.house, bg: C.houseLight, Icon: HomeIcon },
          { key: 'jobs',   label: 'Jobs',   color: C.job,   bg: C.jobLight,   Icon: WorkIcon },
        ].map(t => (
          <div key={t.key} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 0', borderBottom: `1px solid ${C.borderLight}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, background: t.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.color,
              }}>
                <t.Icon sx={{ fontSize: 15 }} />
              </div>
              <span style={{ color: C.text, fontSize: 13.5 }}>{t.label}</span>
            </div>
            <label className="tog">
              <input type="checkbox" checked={typeFilter[t.key]}
                onChange={e => setTypeFilter(p => ({ ...p, [t.key]: e.target.checked }))} />
              <div className="tog-track" />
            </label>
          </div>
        ))}
      </div>
      <button className="btn btn-primary" style={{ width: '100%', borderRadius: 12, padding: 11, fontSize: 13.5 }}
        onClick={onApply}>
        Apply Filters
      </button>
    </>
  );
}

// ─── LIST VIEW ────────────────────────────────────────────────────────────────
function ListView({ items, onSelect, onRoute }) {
  return (
    <div style={{ padding: '4px 13px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => {
        const m     = TYPE[item._type];
        const IconC = m.Icon;
        const name  = getName(item);
        const sub   = getSub(item);
        const price = item._type === 'house'
          ? fmtINR(item.rent_per_month) + '/mo'
          : item._type === 'job'
          ? fmtINR(item.salary) + (item.salary_type === 'month' ? '/mo' : '/day')
          : null;

        return (
          <div key={`${item._type}-${item.id || i}`} className="mv3-card" onClick={() => onSelect(item)}>
            {/* Type icon box */}
            <div style={{
              width: 46, height: 46, borderRadius: 14, flexShrink: 0,
              background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1.5px solid ${m.color}22`,
            }}>
              <IconC sx={{ fontSize: 22, color: m.color }} />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 2,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{name}</div>
              {sub && (
                <div style={{
                  color: C.textSub, fontSize: 12.5, marginBottom: 5,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{sub}</div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                <span className="badge" style={{ background: m.bg, color: m.dark }}>{m.label}</span>
                <span style={{ color: m.color, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <LocationOnIcon sx={{ fontSize: 10 }} />
                  {fmtDist(item.distance)}
                </span>
                {price && <span style={{ color: m.dark, fontWeight: 700, fontSize: 12 }}>{price}</span>}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
              <button className="btn" style={{
                width: 32, height: 32, borderRadius: 10, background: m.bg,
                color: m.color, border: `1.5px solid ${m.mid}`, padding: 0,
              }} onClick={e => { e.stopPropagation(); onRoute(item); }} title="Route">
                <NavigationIcon sx={{ fontSize: 14 }} />
              </button>
              <button className="btn" style={{
                width: 32, height: 32, borderRadius: 10, background: C.surfaceAlt,
                color: C.textSub, border: `1.5px solid ${C.border}`, padding: 0,
              }} onClick={e => { e.stopPropagation(); onSelect(item); }} title="Details">
                <VisibilityIcon sx={{ fontSize: 13 }} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── DETAIL PANEL ─────────────────────────────────────────────────────────────
function DetailPanel({ item, onClose, onRoute, openGoogleMaps }) {
  const m     = TYPE[item._type] || {};
  const IconC = m.Icon || LocationOnIcon;
  const name  = getName(item);
  const sub   = getSub(item);
  const phone = item.owner_phone || item.employer_phone || item.phone;

  return (
    <>
      <div className="mv3-detail-backdrop" onClick={onClose} />
      <div className="mv3-detail-panel">
        {/* Color accent bar */}
        <div style={{ height: 4, background: m.color, flexShrink: 0 }} />

        {/* Panel header */}
        <div style={{
          padding: '12px 16px 14px',
          borderBottom: `1.5px solid ${C.borderLight}`,
          flexShrink: 0, background: C.surface,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <button className="btn-icon" style={{ flexShrink: 0, marginTop: 2 }} onClick={onClose}>
              <ChevronLeftIcon sx={{ fontSize: 22 }} />
            </button>

            {/* Icon */}
            <div style={{
              width: 54, height: 54, borderRadius: 16, background: m.bg,
              border: `2px solid ${m.color}28`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <IconC sx={{ fontSize: 28, color: m.color }} />
            </div>

            {/* Title */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span className="badge" style={{ background: m.bg, color: m.dark }}>{m.label}</span>
                {item._type === 'shop' && item.opening_time && (
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 3,
                    background: C.greenLight, color: C.houseDark,
                    padding: '3px 8px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                  }}>
                    <CheckCircleIcon sx={{ fontSize: 11 }} /> Open
                  </span>
                )}
              </div>
              <div style={{
                fontWeight: 800, fontSize: 18, color: C.text, lineHeight: 1.2,
                marginBottom: 3, letterSpacing: '-.35px',
              }}>{name}</div>
              {sub && <div style={{ fontSize: 13, color: C.textSub }}>{sub}</div>}
              {item.distance != null && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5 }}>
                  <LocationOnIcon sx={{ fontSize: 13, color: m.color }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: m.color }}>
                    {fmtDist(item.distance)} away
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', background: C.bg }}>

          {/* Price hero */}
          {item._type === 'house' && (
            <div style={{
              margin: '14px 14px 0', background: m.bg,
              border: `1.5px solid ${m.color}20`, borderRadius: 18,
              padding: 18, textAlign: 'center',
            }}>
              <div style={{ color: C.textSub, fontSize: 12, marginBottom: 4 }}>Monthly Rent</div>
              <div style={{ fontWeight: 800, fontSize: 30, color: m.color, letterSpacing: '-.6px' }}>
                {fmtINR(item.rent_per_month)}
              </div>
            </div>
          )}
          {item._type === 'job' && (
            <div style={{
              margin: '14px 14px 0', background: m.bg,
              border: `1.5px solid ${m.color}20`, borderRadius: 18,
              padding: 18, textAlign: 'center',
            }}>
              <div style={{ color: C.textSub, fontSize: 12, marginBottom: 4 }}>Salary</div>
              <div style={{ fontWeight: 800, fontSize: 30, color: m.color, letterSpacing: '-.6px' }}>
                {fmtINR(item.salary)}
                <span style={{ fontSize: 14, fontWeight: 400, color: C.textSub }}>
                  /{item.salary_type === 'month' ? 'month' : 'day'}
                </span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ padding: '14px 14px 10px' }}>
            <div className="action-row">
              <button className="action-btn primary" style={{ background: m.color, borderColor: m.color }}
                onClick={() => onRoute(item)}>
                <NavigationIcon sx={{ fontSize: 20 }} />
                Route
              </button>
              <button className="action-btn" onClick={() => openGoogleMaps(item)}>
                <GoogleIcon sx={{ fontSize: 20, color: C.accent }} />
                Maps
              </button>
              {phone && (
                <button className="action-btn" onClick={() => window.location.href = `tel:${phone}`}>
                  <PhoneIcon sx={{ fontSize: 20, color: C.green }} />
                  Call
                </button>
              )}
              <button className="action-btn"
                onClick={() => navigator.share?.({ title: name, text: sub || name })}>
                <ShareIcon sx={{ fontSize: 20, color: C.purple }} />
                Share
              </button>
            </div>
          </div>

          {/* Type-specific content */}
          <div style={{ padding: '0 14px 14px' }}>
            {item._type === 'shop'  && <ShopBody  item={item} m={m} />}
            {item._type === 'house' && <HouseBody item={item} m={m} />}
            {item._type === 'job'   && <JobBody   item={item} m={m} />}

            {/* Contact */}
            {(phone || item.owner_name || item.employer_name) && (
              <div style={{
                background: C.surface, border: `1.5px solid ${C.borderLight}`,
                borderRadius: 18, padding: 16, marginTop: 10,
              }}>
                <div style={{
                  fontWeight: 700, fontSize: 12, color: C.textMuted,
                  textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10,
                }}>Contact</div>
                {(item.owner_name || item.employer_name) && (
                  <div style={{ fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 4 }}>
                    {item.owner_name || item.employer_name}
                  </div>
                )}
                {phone && (
                  <a href={`tel:${phone}`} style={{
                    color: m.color, fontSize: 14.5, textDecoration: 'none',
                    fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7,
                  }}>
                    <PhoneIcon sx={{ fontSize: 17 }} />
                    {phone}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── DETAIL BODY SECTIONS ──────────────────────────────────────────────────────
function InfoRow({ label, value, icon, color }) {
  return (
    <div className="info-row">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: color || C.accent, display: 'flex' }}>{icon}</span>
        <span style={{ color: C.textSub, fontSize: 13 }}>{label}</span>
      </div>
      <span style={{ color: color || C.accent, fontWeight: 700, fontSize: 13.5 }}>{value || '—'}</span>
    </div>
  );
}

function ShopBody({ item, m }) {
  return (
    <div style={{
      background: C.surface, border: `1.5px solid ${C.borderLight}`,
      borderRadius: 18, padding: 16, marginBottom: 10,
    }}>
      {item.description && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ color: C.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: '.07em',
            textTransform: 'uppercase', marginBottom: 6 }}>About</div>
          <div style={{ color: C.textSub, fontSize: 13.5, lineHeight: 1.7 }}>{item.description}</div>
        </div>
      )}
      {item.opening_time && item.closing_time && (
        <InfoRow label="Hours"
          value={`${item.opening_time.slice(0, 5)} – ${item.closing_time.slice(0, 5)}`}
          icon={<AccessTimeIcon sx={{ fontSize: 16 }} />} color={m.color} />
      )}
      {item.keywords?.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ color: C.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: '.07em',
            textTransform: 'uppercase', marginBottom: 7 }}>Tags</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {item.keywords.map((k, i) => (
              <span key={i} style={{
                padding: '4px 11px', borderRadius: 100, fontSize: 12.5,
                background: m.bg, color: m.dark, fontWeight: 600, border: `1.5px solid ${m.mid}`,
              }}>#{k}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function HouseBody({ item, m }) {
  return (
    <div style={{
      background: C.surface, border: `1.5px solid ${C.borderLight}`,
      borderRadius: 18, padding: 16, marginBottom: 10,
    }}>
      <div className="stat-grid">
        {[
          { label: 'Bedrooms', value: `${item.rooms} BHK`, Icon: BedIcon },
          { label: 'Halls',    value: item.halls,           Icon: MeetingRoomIcon },
          { label: 'Kitchens', value: item.kitchens,        Icon: KitchenIcon },
          { label: 'Floor',    value: item.floor,           Icon: ApartmentIcon },
        ].map(r => (
          <div key={r.label} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5,
              color: C.textMuted, fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>
              <r.Icon sx={{ fontSize: 13, color: m.color }} />
              {r.label}
            </div>
            <div style={{ color: m.color, fontWeight: 800, fontSize: 16 }}>{r.value || '—'}</div>
          </div>
        ))}
      </div>
      {item.description && (
        <div style={{ color: C.textSub, fontSize: 13.5, lineHeight: 1.7 }}>{item.description}</div>
      )}
    </div>
  );
}

function JobBody({ item, m }) {
  return (
    <div style={{
      background: C.surface, border: `1.5px solid ${C.borderLight}`,
      borderRadius: 18, padding: 16, marginBottom: 10,
    }}>
      <div style={{ display: 'flex', gap: 7, marginBottom: 14, flexWrap: 'wrap' }}>
        <span style={{
          padding: '6px 14px', borderRadius: 100, fontSize: 13,
          background: m.bg, color: m.dark, fontWeight: 700, border: `1.5px solid ${m.mid}`,
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <WorkIcon sx={{ fontSize: 14 }} />
          {item.job_type === 'full_time' ? 'Full Time' : 'Part Time'}
        </span>
        {item.qualification && (
          <span style={{
            padding: '6px 14px', borderRadius: 100, fontSize: 13, background: C.purpleLight,
            color: C.purple, fontWeight: 700, border: `1.5px solid ${C.purple}22`,
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <SchoolIcon sx={{ fontSize: 14 }} />
            {item.qualification}
          </span>
        )}
      </div>
      {item.description && (
        <div style={{ color: C.textSub, fontSize: 13.5, lineHeight: 1.7 }}>{item.description}</div>
      )}
    </div>
  );
}

// ─── SKELETON + EMPTY ─────────────────────────────────────────────────────────
function SkeletonList() {
  return (
    <div style={{ padding: '4px 13px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{
          display: 'flex', gap: 11, alignItems: 'center',
          background: C.surface, border: `1.5px solid ${C.borderLight}`,
          borderRadius: 18, padding: 13,
        }}>
          <div className="skeleton" style={{ width: 46, height: 46, borderRadius: 14, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 13, width: '55%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 10, width: '35%', marginBottom: 8 }} />
            <div style={{ display: 'flex', gap: 6 }}>
              <div className="skeleton" style={{ height: 18, width: 44, borderRadius: 100 }} />
              <div className="skeleton" style={{ height: 18, width: 34 }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '60px 20px', textAlign: 'center', gap: 13,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 20, background: C.accentLight,
        border: `2px solid ${C.accentMid}`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: C.accent,
      }}>
        <SearchIcon sx={{ fontSize: 28 }} />
      </div>
      <div style={{ fontWeight: 800, fontSize: 17, color: C.text, letterSpacing: '-.3px' }}>
        Nothing nearby
      </div>
      <div style={{ color: C.textSub, fontSize: 13.5, maxWidth: 230, lineHeight: 1.65 }}>
        Try increasing the search radius or clearing your filters
      </div>
    </div>
  );
}

// ─── LOADING SCREEN ───────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{
      height: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 20, background: C.bg, fontFamily: 'DM Sans, sans-serif',
    }}>
      <img src={loadingGif} alt="Loading…"
        style={{ width: 240, height: 'auto', objectFit: 'contain', marginBottom: 60 }} />
    </div>
  );
}