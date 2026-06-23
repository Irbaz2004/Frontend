// app/user/Map.jsx — v7: minimal detail panel, fixed full-height cover
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
import AccessTimeIcon  from '@mui/icons-material/AccessTime';
import BedIcon         from '@mui/icons-material/Bed';
import KitchenIcon     from '@mui/icons-material/Kitchen';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import ApartmentIcon   from '@mui/icons-material/Apartment';
import SchoolIcon      from '@mui/icons-material/School';
import InfoIcon        from '@mui/icons-material/Info';
import ArrowBackIcon   from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon      from '@mui/icons-material/Cancel';
import DirectionsIcon  from '@mui/icons-material/Directions';
import OpenInNewIcon   from '@mui/icons-material/OpenInNew';
import TagIcon         from '@mui/icons-material/Tag';
import { CircularProgress } from '@mui/material';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const TOP_BAR_H    = 64;
const BOTTOM_NAV_H = 86;
const SIDEBAR_W    = 340;

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:          '#F0F4FF',
  surface:     '#FFFFFF',
  surfaceAlt:  '#F5F7FE',
  surfaceHover:'#EEF2FF',
  border:      '#E0E7FF',
  borderLight: '#EEF2FF',

  shop:        '#325fec',
  shopLight:   '#EEF4FF',
  shopMid:     '#BFCFFF',
  shopDark:    '#1A45C2',

  house:       '#6C2BD9',
  houseLight:  '#EDEBFE',
  houseMid:    '#A78BFA',
  houseDark:   '#4C1D95',

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
  greenMid:    '#6EE7B7',
  red:         '#E02424',
  redLight:    '#FDE8E8',

  text:        '#0A1628',
  textSub:     '#374151',
  textMuted:   '#9CA3AF',
  shadow:      'rgba(50,95,236,0.18)',
  shadowSm:    'rgba(10,22,40,0.05)',
  shadowMd:    'rgba(10,22,40,0.08)',
  shadowLg:    'rgba(10,22,40,0.18)',
};

const TYPE = {
  shop:  { color: C.shop,  bg: C.shopLight,  mid: C.shopMid,  dark: C.shopDark,  label: 'Shop',  Icon: StorefrontIcon },
  house: { color: C.house, bg: C.houseLight, mid: C.houseMid, dark: C.houseDark, label: 'House', Icon: HomeIcon },
  job:   { color: C.job,   bg: C.jobLight,   mid: C.jobMid,   dark: C.jobDark,   label: 'Job',   Icon: WorkIcon },
};

// ─── Time Utilities ────────────────────────────────────────────────────────────
function timeToMinutes(timeStr) {
  if (!timeStr) return null;
  let str = timeStr.trim().replace(/^(\d{1,2}:\d{2}):\d{2}$/, '$1');
  const match12 = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let h = parseInt(match12[1], 10);
    const m = parseInt(match12[2], 10);
    const period = match12[3].toUpperCase();
    if (period === 'AM') { if (h === 12) h = 0; }
    else { if (h !== 12) h += 12; }
    return h * 60 + m;
  }
  const match24 = str.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) return parseInt(match24[1], 10) * 60 + parseInt(match24[2], 10);
  return null;
}

function formatTimeTo12h(timeStr) {
  const mins = timeToMinutes(timeStr);
  if (mins === null) return timeStr;
  const h24 = Math.floor(mins / 60);
  const m   = mins % 60;
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

function computeIsOpen(item) {
  const openMins  = timeToMinutes(item.opening_time);
  const closeMins = timeToMinutes(item.closing_time);
  if (openMins === null || closeMins === null) return item.is_open ?? null;
  const now  = new Date();
  const curr = now.getHours() * 60 + now.getMinutes();
  if (closeMins > openMins) return curr >= openMins && curr < closeMins;
  return curr >= openMins || curr < closeMins;
}

// ─── SVG Map Pins ──────────────────────────────────────────────────────────────
const PIN_SVG = {
  shop: (c) => `<svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 1C8.27 1 2 7.27 2 15c0 11.25 14 26 14 26S30 26.25 30 15C30 7.27 23.73 1 16 1z"
      fill="${c}" stroke="white" stroke-width="1.8"/>
    <circle cx="16" cy="15" r="10" fill="${c}"/>
    <rect x="10" y="14" width="12" height="7" rx="1" fill="white"/>
    <path d="M8.5 12.5l2.5-4h10l2.5 4" stroke="white" stroke-width="1.6" fill="none"
      stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="16" y1="14" x2="16" y2="21" stroke="${c}" stroke-width="1.2" opacity="0.5"/>
  </svg>`,
  house: (c) => `<svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 1C8.27 1 2 7.27 2 15c0 11.25 14 26 14 26S30 26.25 30 15C30 7.27 23.73 1 16 1z"
      fill="${c}" stroke="white" stroke-width="1.8"/>
    <circle cx="16" cy="15" r="10" fill="${c}"/>
    <polygon points="16,8 9,14 9,22 13,22 13,17 19,17 19,22 23,22 23,14" fill="white"/>
    <rect x="13.5" y="17" width="5" height="5" fill="white" opacity="0.55"/>
  </svg>`,
  job: (c) => `<svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 1C8.27 1 2 7.27 2 15c0 11.25 14 26 14 26S30 26.25 30 15C30 7.27 23.73 1 16 1z"
      fill="${c}" stroke="white" stroke-width="1.8"/>
    <circle cx="16" cy="15" r="10" fill="${c}"/>
    <rect x="10" y="14" width="12" height="8" rx="1.5" fill="white"/>
    <path d="M13 14v-2.5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2V14"
      stroke="white" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <line x1="10" y1="18" x2="22" y2="18" stroke="${c}" stroke-width="1.3" opacity="0.7"/>
  </svg>`,
  user: `<svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
    <circle cx="14" cy="14" r="12" fill="#325fec" stroke="white" stroke-width="3"/>
    <circle cx="14" cy="14" r="5" fill="white"/>
    <circle cx="14" cy="14" r="2.5" fill="#325fec"/>
  </svg>`,
};

const makeIcon = (type) => L.divIcon({
  className: '',
  html: type === 'user' ? PIN_SVG.user : PIN_SVG[type](TYPE[type]?.color || C.accent),
  iconSize:    type === 'user' ? [28, 28] : [32, 42],
  iconAnchor:  type === 'user' ? [14, 14] : [16, 42],
  popupAnchor: type === 'user' ? [0, -14] : [0, -44],
});
const ICONS = { shop: makeIcon('shop'), house: makeIcon('house'), job: makeIcon('job'), user: makeIcon('user') };

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmtINR  = (n) => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n||0);
const fmtDist = (d) => d != null ? (d < 1 ? `${Math.round(d*1000)} m` : `${d.toFixed(1)} km`) : '—';
const getName = (item) => item.title || item.business_name || item.job_title || 'Untitled';
const getSub  = (item) => item.subtitle || item.category || item.company_name || '';
const esc     = (s) => s?.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])) || '';

// ─── CSS ───────────────────────────────────────────────────────────────────────
const injectCSS = () => {
  if (document.getElementById('map-v6-css')) return;
  const el = document.createElement('style');
  el.id = 'map-v6-css';
  el.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    .mv5-root {
      position: fixed;
      top: ${TOP_BAR_H}px;
      bottom: ${BOTTOM_NAV_H}px;
      left: 0; right: 0;
      font-family: 'Inter', sans-serif;
      background: ${C.bg};
      color: ${C.text};
      overflow: hidden;
      z-index: 10;
    }

    @media (min-width: 900px) {
      .mv5-root { top: 0; bottom: 0; }
      .mv5-sidebar {
        position: absolute;
        left: 0; top: 0; bottom: 0;
        width: ${SIDEBAR_W}px;
        display: flex !important;
        flex-direction: column;
        background: ${C.surface};
        border-right: 1px solid ${C.border};
        box-shadow: 2px 0 16px ${C.shadowSm};
        z-index: 20;
        overflow: hidden;
      }
      .mv5-map-zone { position: absolute; left: ${SIDEBAR_W}px; top: 0; right: 0; bottom: 0; }
      .mv5-topbar   { display: none !important; }
      .mv5-list-overlay, .mv5-list-modal { display: none !important; }
      .mv5-fabs     { bottom: 20px !important; }
    }

    @media (max-width: 899px) {
      .mv5-sidebar  { display: none !important; }
      .mv5-map-zone { position: absolute; inset: 0; }
    }

    /* Leaflet */
    .leaflet-container { font-family: 'Inter', sans-serif !important; background: #E8EEF8 !important; }
    .leaflet-popup-content-wrapper {
      background: ${C.surface} !important;
      border: 1px solid ${C.border} !important;
      border-radius: 20px !important;
      box-shadow: 0 20px 60px rgba(10,22,40,0.15) !important;
      color: ${C.text} !important;
      padding: 0 !important;
      overflow: hidden;
      min-width: 220px;
    }
    .leaflet-popup-content { margin: 0 !important; }
    .leaflet-popup-tip-container { display: none !important; }
    .leaflet-popup-close-button {
      color: ${C.textMuted} !important; font-size: 14px !important;
      width: 28px !important; height: 28px !important;
      top: 10px !important; right: 10px !important;
      border-radius: 50% !important; background: ${C.surfaceAlt} !important;
      display: flex !important; align-items: center !important;
      justify-content: center !important; z-index: 10 !important; line-height: 1 !important;
    }
    .leaflet-control-attribution { display: none !important; }
    .leaflet-bar { border: none !important; box-shadow: 0 4px 16px ${C.shadowMd} !important; }
    .leaflet-bar a {
      background: ${C.surface} !important; color: ${C.accent} !important;
      border: 1px solid ${C.border} !important; border-radius: 12px !important;
      margin: 4px !important; width: 38px !important; height: 38px !important;
      line-height: 36px !important; font-size: 18px !important; font-weight: 700 !important;
    }
    .leaflet-bar a:hover  { background: ${C.accentLight} !important; }
    .leaflet-routing-container { display: none !important; }

    /* Animations */
    @keyframes slideUp   { from { transform:translateY(32px); opacity:0 } to { transform:translateY(0); opacity:1 } }
    @keyframes slideDown { from { transform:translateY(-16px);opacity:0 } to { transform:translateY(0); opacity:1 } }
    @keyframes fadeIn    { from { opacity:0 } to { opacity:1 } }
    @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:.3} }
    @keyframes shimmer   { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

    .su { animation: slideUp   .38s cubic-bezier(.16,1,.3,1) both; }
    .sd { animation: slideDown .26s cubic-bezier(.16,1,.3,1) both; }
    .fi { animation: fadeIn    .2s ease both; }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }

    .skeleton {
      background: linear-gradient(90deg, ${C.surfaceAlt} 25%, ${C.border} 50%, ${C.surfaceAlt} 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s ease infinite;
      border-radius: 10px;
    }

    /* Buttons */
    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 5px;
      border: none; cursor: pointer; font-family: 'Inter', sans-serif; font-weight: 600;
      transition: all .15s ease; outline: none; white-space: nowrap;
    }
    .btn-primary {
      background: ${C.accent}; color: #fff; border-radius: 12px;
      padding: 10px 18px; font-size: 13.5px;
    }
    .btn-primary:hover  { background: ${C.accentDark}; transform: translateY(-1px); box-shadow: 0 8px 20px ${C.shadow}; }
    .btn-primary:active { transform: scale(.97); }
    .btn-ghost {
      background: ${C.surface}; color: ${C.text}; border: 1px solid ${C.border};
      border-radius: 12px; padding: 10px 18px; font-size: 13.5px;
    }
    .btn-ghost:hover { border-color: ${C.accent}; color: ${C.accent}; background: ${C.accentLight}; }

    .btn-icon {
      width: 40px; height: 40px; border-radius: 12px; border: 1px solid ${C.border};
      background: ${C.surface}; color: ${C.textSub};
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all .15s; box-shadow: 0 2px 8px ${C.shadowMd}; flex-shrink: 0;
    }
    .btn-icon:hover  { border-color: ${C.accent}; color: ${C.accent}; background: ${C.accentLight}; }
    .btn-icon:active { transform: scale(.93); }
    .btn-icon.active { background: ${C.accent}; color: #fff; border-color: ${C.accent}; }

    /* Search */
    .mv5-search {
      width: 100%; background: ${C.surface}; border: 1px solid ${C.border};
      border-radius: 12px; padding: 10px 13px 10px 38px; color: ${C.text};
      font-family: 'Inter', sans-serif; font-size: 13.5px; outline: none; font-weight: 500;
      transition: border-color .18s, box-shadow .18s; box-shadow: 0 2px 8px ${C.shadowSm};
      box-sizing: border-box;
    }
    .mv5-search:focus       { border-color: ${C.accent}; box-shadow: 0 0 0 3px ${C.accentMid}44; }
    .mv5-search::placeholder { color: ${C.textMuted}; font-weight: 400; }

    /* List card */
    .mv5-card {
      background: ${C.surface}; border: 1px solid ${C.borderLight};
      border-radius: 16px; padding: 14px; cursor: pointer;
      transition: all .18s ease; display: flex; gap: 12px; align-items: flex-start;
    }
    .mv5-card:hover  { transform: translateY(-2px); box-shadow: 0 12px 32px ${C.shadowMd}; border-color: ${C.border}; }
    .mv5-card:active { transform: scale(.98); }

    /* Badge */
    .badge {
      font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 700;
      letter-spacing: .05em; padding: 3px 8px; border-radius: 100px; text-transform: uppercase;
    }

    /* Slider */
    .mv5-slider {
      -webkit-appearance: none; width: 100%; height: 4px;
      border-radius: 2px; background: ${C.border}; outline: none; cursor: pointer;
    }
    .mv5-slider::-webkit-slider-thumb {
      -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%;
      background: ${C.accent}; cursor: pointer;
      border: 2.5px solid white; box-shadow: 0 0 0 3px ${C.accentMid}66;
    }

    /* Toggle */
    .tog { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; }
    .tog input { opacity: 0; width: 0; height: 0; }
    .tog-track {
      position: absolute; inset: 0; border-radius: 12px;
      background: ${C.border}; cursor: pointer; transition: background .2s;
    }
    .tog-track::before {
      content: ''; position: absolute; width: 18px; height: 18px;
      left: 3px; top: 3px; border-radius: 50%; background: #fff;
      transition: all .2s; box-shadow: 0 1px 4px rgba(0,0,0,.18);
    }
    .tog input:checked + .tog-track { background: ${C.accent}; }
    .tog input:checked + .tog-track::before { transform: translateX(20px); }

    /* View pill */
    .view-pill {
      display: flex; background: ${C.surfaceAlt};
      border: 1px solid ${C.border}; border-radius: 12px; padding: 3px; gap: 2px;
    }
    .view-btn {
      flex: 1; padding: 7px 14px; border: none; background: transparent; color: ${C.textSub};
      font-family: 'Inter', sans-serif; font-size: 12.5px; font-weight: 500;
      cursor: pointer; border-radius: 9px; transition: all .15s;
      display: flex; align-items: center; justify-content: center; gap: 5px;
    }
    .view-btn.on { background: ${C.surface}; color: ${C.accent}; font-weight: 700; box-shadow: 0 2px 8px ${C.shadowMd}; }

    /* Filter chips */
    .fchip {
      padding: 6px 14px; border-radius: 100px; font-size: 12.5px; font-weight: 600;
      cursor: pointer; border: 1px solid ${C.border}; background: ${C.surface}; color: ${C.textSub};
      transition: all .15s; font-family: 'Inter', sans-serif;
      white-space: nowrap; display: inline-flex; align-items: center; gap: 5px;
    }
    .fchip:hover        { background: ${C.accentLight}; border-color: ${C.accentMid}; color: ${C.accent}; }
    .fchip-shop.on  { background: ${C.shopLight};  border-color: ${C.shopMid};  color: ${C.shopDark};  }
    .fchip-house.on { background: ${C.houseLight}; border-color: ${C.houseMid}; color: ${C.houseDark}; }
    .fchip-job.on   { background: ${C.jobLight};   border-color: ${C.jobMid};   color: ${C.jobDark};   }
    .fchip-all.on   { background: ${C.accent}; border-color: ${C.accent}; color: #fff; }

    /* Popup */
    .mv5-popup { padding: 16px 18px 18px; min-width: 210px; max-width: 265px; }
    .mv5-popup-title { font-weight: 700; font-size: 15px; color: ${C.text}; margin-bottom: 2px; letter-spacing: -.2px; }
    .mv5-popup-sub   { font-size: 12px; color: ${C.textSub}; margin-bottom: 8px; }

    /* Status bar */
    .mv5-statusbar {
      position: absolute; bottom: 20px;
      left: 50%; transform: translateX(-50%);
      z-index: 100; display: flex; align-items: center; gap: 8px;
      background: ${C.surface}; border: 1px solid ${C.border};
      border-radius: 100px; padding: 9px 18px;
      box-shadow: 0 4px 16px ${C.shadowMd}; white-space: nowrap;
    }

    /* List bottom sheet */
    .mv5-list-overlay {
      position: fixed; inset: 0; z-index: 500;
      background: rgba(10,22,40,.5); backdrop-filter: blur(6px);
      animation: fadeIn .2s ease;
    }
    .mv5-list-modal {
      position: fixed;
      top: ${TOP_BAR_H}px; bottom: 0; left: 0; right: 0;
      z-index: 510; background: ${C.surface};
      display: flex; flex-direction: column;
      box-shadow: 0 -16px 60px ${C.shadowLg};
      animation: slideUp .38s cubic-bezier(.16,1,.3,1) both;
      overflow: hidden;
      border-radius: 24px 24px 0 0;
    }

    /* ── Detail panel — TRUE full screen, always above everything ── */
    .mv5-detail-panel {
      position: fixed;
      top: 0; bottom: 0; left: 0; right: 0;
      z-index: 600;
      
      background: ${C.surface};
      display: flex; flex-direction: column;
      overflow: hidden;
      animation: slideUp .32s cubic-bezier(.16,1,.3,1) both;
    }
    @media (min-width: 900px) {
      .mv5-detail-panel { left: ${SIDEBAR_W}px; }
      .mv5-list-modal   { left: ${SIDEBAR_W}px; top: 0; border-radius: 0; }
    }

    /* Detail hero — minimal, sits flush at the very top of the panel */
    .detail-hero {
      position: relative;
      flex-shrink: 0;
      width: 100%;
      padding-top: env(safe-area-inset-top, 0px);
      background: ${C.surfaceAlt};
      border-bottom: 1px solid ${C.borderLight};
    }
    .detail-hero-topbar {
      display: flex; align-items: center; 
      padding: 14px 14px 0;
    }
    .detail-hero-btn {
      width: 40px; height: 40px;
      border-radius: 50%;
      background: ${C.surface};
      border: 1px solid ${C.border};
      box-shadow: 0 2px 10px ${C.shadowSm};
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all .15s; flex-shrink: 0;
    }
    .detail-hero-btn:hover { background: ${C.accentLight}; border-color: ${C.accentMid}; }
    .detail-hero-body {
      padding: 18px 20px 24px;
      display: flex; align-items: flex-start; gap: 14px;
    }

    /* Card sections */
    .detail-card {
      background: ${C.surface};
      border: 1px solid ${C.borderLight};
      border-radius: 20px;
      overflow: hidden;
    }

    /* Action buttons row */
    .detail-actions {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    .detail-action-btn {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 7px; padding: 16px 8px;
      border-radius: 16px; cursor: pointer;
      border: 1px solid ${C.border};
      background: ${C.surface};
      color: ${C.textSub};
      transition: all .15s;
      font-family: 'Inter', sans-serif;
      font-size: 11.5px; font-weight: 700;
      text-transform: uppercase; letter-spacing: .04em;
    }
    .detail-action-btn:hover  { border-color: ${C.accentMid}; background: ${C.accentLight}; color: ${C.accent}; }
    .detail-action-btn:active { transform: scale(.96); }
    .detail-action-btn.primary {
      background: ${C.accent}; color: #fff; border-color: ${C.accent};
    }
    .detail-action-btn.primary:hover { background: ${C.accentDark}; }

    /* Info rows */
    .info-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 13px 18px; gap: 8px;
      border-bottom: 1px solid ${C.borderLight};
    }
    .info-row:last-child { border-bottom: none; }

    /* Stat grid for house */
    .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .stat-card {
      background: ${C.surfaceAlt}; border: 1px solid ${C.borderLight};
      border-radius: 14px; padding: 14px 12px;
    }

    /* Radius pills */
    .rad-pill {
      padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 600;
      border: 1px solid ${C.border}; background: ${C.surface}; color: ${C.textSub};
      cursor: pointer; transition: all .14s; font-family: 'Inter', sans-serif;
    }
    .rad-pill.on { background: ${C.accent}; color: #fff; border-color: ${C.accent}; }

    /* Section label */
    .sec-label {
      font-size: 10px; font-weight: 700; color: ${C.textMuted};
      text-transform: uppercase; letter-spacing: .08em; margin-bottom: 10px;
    }
  `;
  document.head.appendChild(el);
};

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function Map() {
  const [phase, setPhase]                   = useState('locating');
  const [userLocation, setUserLocation]     = useState(null);
  const [shops, setShops]                   = useState([]);
  const [houses, setHouses]                 = useState([]);
  const [jobs, setJobs]                     = useState([]);
  const [loading, setLoading]               = useState(false);
  const [loadingVisible, setLoadingVisible] = useState(false);
  const [error, setError]                   = useState('');

  const [viewMode, setViewMode]             = useState('map');
  const [filterOpen, setFilterOpen]         = useState(false);
  const [detailItem, setDetailItem]         = useState(null);
  const [listModalOpen, setListModalOpen]   = useState(false);

  const [radius, setRadius]                 = useState(0.2);
  const [search, setSearch]                 = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [typeFilter, setTypeFilter]         = useState({ shops: true, houses: true, jobs: true });

  const mapRef        = useRef(null);
  const mapContRef    = useRef(null);
  const markersRef    = useRef([]);
  const userMarkerRef = useRef(null);
  const userCircleRef = useRef(null);
  const routingRef    = useRef(null);
  const intervalRef   = useRef(null);
  const loadingTimer  = useRef(null);
  const searchTimer   = useRef(null);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  useEffect(() => { injectCSS(); }, []);

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

  useEffect(() => {
    if (!userLocation) return;
    fetchData();
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchData, 30000);
    return () => clearInterval(intervalRef.current);
  }, [userLocation, radius, typeFilter, debouncedSearch]);

  useEffect(() => {
    if (!mapRef.current || !userLocation) return;
    renderMarkers();
  }, [shops, houses, jobs, userLocation, radius]);

  useEffect(() => {
    const h = (e) => setDetailItem(e.detail);
    window.addEventListener('mv5:detail', h);
    return () => window.removeEventListener('mv5:detail', h);
  }, []);
  useEffect(() => {
    const h = (e) => showRoute(e.detail);
    window.addEventListener('mv5:route', h);
    return () => window.removeEventListener('mv5:route', h);
  }, [userLocation]);

  useEffect(() => { if (!listModalOpen && viewMode === 'list') setViewMode('map'); }, [listModalOpen]);
  useEffect(() => { if (viewMode === 'list') setListModalOpen(true); else setListModalOpen(false); }, [viewMode]);

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
          extendToWaypoints: true, missingRouteTolerance: 10,
        },
        createMarker: () => null, addWaypoints: false, fitSelectedRoutes: true,
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

    userMarkerRef.current = L.marker([lat, lng], { icon: ICONS.user, zIndexOffset: 1000 })
      .bindPopup(`<div class="mv5-popup" style="text-align:center;padding:16px">
        <div style="width:40px;height:40px;border-radius:50%;background:${C.accentLight};
          display:flex;align-items:center;justify-content:center;margin:0 auto 10px">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="${C.accent}">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        <div class="mv5-popup-title">You are here</div>
        <div class="mv5-popup-sub" style="margin-bottom:0">Your current location</div>
      </div>`)
      .addTo(mapRef.current);

    userCircleRef.current = L.circle([lat, lng], {
      radius: radius * 1000,
      color: C.accent, fillColor: C.accent,
      fillOpacity: 0.04, weight: 1.5, dashArray: '6 8',
    }).addTo(mapRef.current);

    const iconSVG = {
      shop:  () => `<svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M20 4H4v2l16 .01V4zM4 10v10h16V10H4zm10 7h-4v-2h4v2zM2 8l1-4h18l1 4v2h-2v8h-4v-8H8v8H4v-8H2V8z"/></svg>`,
      house: () => `<svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`,
      job:   () => `<svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-8 0h-4V4h4v2z"/></svg>`,
    };

    const addMarkers = (list, type) => list.forEach(item => {
      if (!item.latitude || !item.longitude) return;
      const m = TYPE[type];
      const itemJson = JSON.stringify({ ...item, _type: type }).replace(/"/g, '&quot;');
      const priceHTML = type === 'house'
        ? `<div style="color:${m.color};font-weight:800;font-size:15px;margin:6px 0 10px">
            ${fmtINR(item.rent_per_month)}<span style="font-weight:400;font-size:11px;color:${C.textSub}">/mo</span></div>`
        : type === 'job'
        ? `<div style="color:${m.color};font-weight:800;font-size:15px;margin:6px 0 10px">
            ${fmtINR(item.salary)}<span style="font-weight:400;font-size:11px;color:${C.textSub}">/${item.salary_type === 'month' ? 'mo' : 'day'}</span></div>`
        : '';

      const popup = `
        <div>
          <div style="height:4px;background:${m.color}"></div>
          <div class="mv5-popup" style="padding-top:14px">
            <div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:8px">
              <div style="width:42px;height:42px;border-radius:13px;background:${m.color};
                display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                ${iconSVG[type]()}
              </div>
              <div style="flex:1;min-width:0;padding-top:2px">
                <div class="mv5-popup-title">${esc(getName(item))}</div>
                <div class="mv5-popup-sub">${esc(getSub(item))}</div>
                <span class="badge" style="background:${m.bg};color:${m.dark}">${m.label}</span>
              </div>
            </div>
            ${priceHTML}
            <div style="display:flex;align-items:center;gap:5px;margin:0 0 12px;font-size:12px;color:${C.textSub}">
              <svg viewBox="0 0 24 24" width="11" height="11" fill="${m.color}">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              </svg>
              <span style="font-weight:700;color:${m.color}">${fmtDist(item.distance)}</span>
              <span>away</span>
            </div>
            <div style="display:flex;gap:8px">
              <button style="flex:1;padding:10px;font-size:13px;font-weight:700;
                font-family:Inter,sans-serif;border:none;border-radius:12px;
                background:${m.color};color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px"
                onclick="window.dispatchEvent(new CustomEvent('mv5:route',{detail:${itemJson}}))">
                Route
              </button>
              <button style="flex:1;padding:10px;font-size:13px;font-weight:700;
                font-family:Inter,sans-serif;border:1px solid ${C.border};
                border-radius:12px;background:white;color:${C.text};cursor:pointer"
                onclick="window.dispatchEvent(new CustomEvent('mv5:detail',{detail:${itemJson}}))">
                Details
              </button>
            </div>
          </div>
        </div>`;

      const marker = L.marker(
        [parseFloat(item.latitude), parseFloat(item.longitude)],
        { icon: ICONS[type] }
      ).bindPopup(popup, { maxWidth: 285 }).addTo(mapRef.current);
      markersRef.current.push(marker);
    });

    if (typeFilter.shops)  addMarkers(shops,  'shop');
    if (typeFilter.houses) addMarkers(houses, 'house');
    if (typeFilter.jobs)   addMarkers(jobs,   'job');
  }, [shops, houses, jobs, userLocation, radius, typeFilter]);

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
    <div className="mv5-root">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="mv5-sidebar">
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
      <div className="mv5-map-zone">
        <div ref={mapContRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

        {/* ── MOBILE TOPBAR ── */}
        <div className="mv5-topbar sd" style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
          padding: '12px 12px 0',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{
            background: C.accent, borderRadius: 13, padding: '9px 14px',
            display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
            boxShadow: `0 4px 14px ${C.shadow}`,
          }}>
            <MapIcon sx={{ fontSize: 15, color: '#fff' }} />
            <span style={{ fontWeight: 700, fontSize: 13.5, color: '#fff', letterSpacing: '-.1px' }}>Nearby</span>
          </div>
          <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
            <span style={{
              position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
              color: C.textMuted, pointerEvents: 'none', display: 'flex',
            }}>
              <SearchIcon sx={{ fontSize: 15 }} />
            </span>
            <input className="mv5-search" placeholder="Search shops, houses, jobs…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className={`btn-icon ${filterOpen ? 'active' : ''}`}
            onClick={() => setFilterOpen(v => !v)}>
            <FilterListIcon sx={{ fontSize: 17 }} />
          </button>
        </div>

        {/* ── CATEGORY CHIPS + VIEW TOGGLE ── */}
        <div className="mv5-topbar" style={{
          position: 'absolute', top: 66, left: 12, right: 12, zIndex: 99,
          display: 'flex', alignItems: 'center', gap: 7,
          overflowX: 'auto', scrollbarWidth: 'none',
        }}>
          {[
            { id: 'All',   cls: 'fchip-all' },
            { id: 'Shop',  cls: 'fchip-shop',  icon: <StorefrontIcon sx={{ fontSize: 12 }} /> },
            { id: 'House', cls: 'fchip-house', icon: <HomeIcon sx={{ fontSize: 12 }} /> },
            { id: 'Job',   cls: 'fchip-job',   icon: <WorkIcon sx={{ fontSize: 12 }} /> },
          ].map(c => (
            <button key={c.id}
              className={`fchip ${c.cls} ${activeCategory === c.id ? 'on' : ''}`}
              onClick={() => setActiveCategory(c.id)}
              style={{ boxShadow: `0 2px 8px ${C.shadowSm}` }}>
              {c.icon}{c.id}
              {c.id !== 'All' && (
                <span style={{ fontSize: 9, opacity: .7 }}>
                  ({allItems.filter(i => i._type === c.id.toLowerCase()).length})
                </span>
              )}
            </button>
          ))}
          <div className="view-pill" style={{ marginLeft: 'auto', flexShrink: 0, boxShadow: `0 2px 8px ${C.shadowSm}` }}>
            <button className={`view-btn ${viewMode === 'map' ? 'on' : ''}`} onClick={() => setViewMode('map')}>
              <MapIcon sx={{ fontSize: 12 }} /> Map
            </button>
            <button className={`view-btn ${viewMode === 'list' ? 'on' : ''}`} onClick={() => setViewMode('list')}>
              <ListIcon sx={{ fontSize: 12 }} />
              List
              {allItems.length > 0 && (
                <span style={{
                  background: C.accent, color: '#fff', borderRadius: 100,
                  fontSize: 9, fontWeight: 800, padding: '1px 5px', lineHeight: '14px', marginLeft: 2,
                }}>{allItems.length}</span>
              )}
            </button>
          </div>
        </div>

        {/* ── FILTER PANEL ── */}
        {filterOpen && (
          <div className="fi" style={{
            position: 'absolute', top: 64, right: 12, zIndex: 200,
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 20, padding: 18, width: 265,
            boxShadow: `0 20px 60px ${C.shadowLg}`,
          }}>
            <FilterPanel
              radius={radius} setRadius={setRadius}
              typeFilter={typeFilter} setTypeFilter={setTypeFilter}
              onApply={() => { fetchData(); setFilterOpen(false); }}
            />
          </div>
        )}

        {/* ── FABs ── */}
        <div className="mv5-fabs" style={{
          position: 'absolute', right: 12, bottom: 20, zIndex: 100,
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

        {/* ── STATUS BAR ── */}
        {viewMode === 'map' && !detailItem && (
          <div className="mv5-statusbar fi">
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

        {/* ── LEGEND ── */}
        {viewMode === 'map' && !detailItem && (
          <div style={{
            position: 'absolute', bottom: 20, left: 12, zIndex: 100,
            display: 'flex', flexDirection: 'column', gap: 5,
          }}>
            {Object.entries(TYPE).map(([k, m]) => (
              <div key={k} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: C.surface, borderRadius: 100, padding: '5px 12px',
                border: `1px solid ${typeFilter[k + 's'] ? m.color + '44' : C.border}`,
                boxShadow: `0 2px 8px ${C.shadowSm}`,
                opacity: typeFilter[k + 's'] ? 1 : 0.4,
                transition: 'all .2s',
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                <span style={{ color: m.dark, fontSize: 11.5, fontWeight: 600 }}>{m.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── LIST BOTTOM SHEET (mobile) ── */}
      {listModalOpen && (
        <>
          <div className="mv5-list-overlay" onClick={() => setViewMode('map')} />
          <div className="mv5-list-modal">
            <div style={{ width: 40, height: 4, borderRadius: 2, background: C.border, margin: '12px auto 0', flexShrink: 0 }} />
            <div style={{ padding: '12px 16px 13px', borderBottom: `1px solid ${C.borderLight}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 20, color: C.text, letterSpacing: '-.4px' }}>
                    {filteredItems.length} Results
                  </div>
                  <div style={{ color: C.textSub, fontSize: 12, marginTop: 2 }}>
                    within {radius < 1 ? `${Math.round(radius * 1000)}m` : `${radius} km`}
                    {loading && <span style={{ marginLeft: 7, color: C.accent }}> · refreshing</span>}
                  </div>
                </div>
                <button className="btn-icon" onClick={() => setViewMode('map')}>
                  <CloseIcon sx={{ fontSize: 17 }} />
                </button>
              </div>
              <div style={{ position: 'relative', marginBottom: 11 }}>
                <span style={{
                  position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
                  color: C.textMuted, pointerEvents: 'none', display: 'flex',
                }}>
                  <SearchIcon sx={{ fontSize: 15 }} />
                </span>
                <input className="mv5-search" placeholder="Search results…"
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
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
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0 16px' }}>
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

      {/* ── ERROR TOAST ── */}
      {error && (
        <div className="sd" style={{
          position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
          zIndex: 900, background: C.redLight, border: `1px solid #FCA5A5`,
          borderRadius: 14, padding: '10px 16px',
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

// ─── DESKTOP SIDEBAR ───────────────────────────────────────────────────────────
function SidebarContent({ allItems, filteredItems, loading, radius, setRadius, search, setSearch,
  typeFilter, setTypeFilter, activeCategory, setActiveCategory, viewMode, setViewMode,
  onSelect, onRoute, openGoogleMaps, fetchData, clearRoute }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '20px 18px 16px', borderBottom: `1px solid ${C.borderLight}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 13, background: C.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 14px ${C.shadow}`,
            }}>
              <MapIcon sx={{ fontSize: 20, color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, color: C.text, letterSpacing: '-.4px' }}>Nearby</div>
              <div style={{ fontSize: 11.5, color: C.textMuted, fontWeight: 400, marginTop: 1 }}>Explore around you</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn-icon" style={{ width: 34, height: 34, borderRadius: 10 }}
              onClick={clearRoute} title="Clear route">
              <ClearIcon sx={{ fontSize: 14 }} />
            </button>
            <button className="btn-icon" style={{ width: 34, height: 34, borderRadius: 10 }}
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
          <input className="mv5-search" placeholder="Search shops, houses, jobs…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div style={{ padding: '14px 18px 13px', borderBottom: `1px solid ${C.borderLight}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          <button className={`fchip fchip-all ${activeCategory === 'All' ? 'on' : ''}`}
            onClick={() => setActiveCategory('All')}>All</button>
          {[
            { id: 'Shop',  cls: 'fchip-shop',  Icon: StorefrontIcon },
            { id: 'House', cls: 'fchip-house', Icon: HomeIcon },
            { id: 'Job',   cls: 'fchip-job',   Icon: WorkIcon },
          ].map(c => (
            <button key={c.id} className={`fchip ${c.cls} ${activeCategory === c.id ? 'on' : ''}`}
              onClick={() => setActiveCategory(c.id)}>
              <c.Icon sx={{ fontSize: 12 }} />{c.id}s
            </button>
          ))}
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
            <span style={{ color: C.textSub, fontSize: 12.5, fontWeight: 500 }}>Search Radius</span>
            <span style={{
              background: C.accentLight, color: C.accent, borderRadius: 100,
              padding: '3px 10px', fontSize: 11.5, fontWeight: 700,
            }}>
              {radius < 1 ? `${Math.round(radius * 1000)}m` : `${radius}km`}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
            {[0.2, 0.4, 1, 2].map(r => (
              <button key={r} className={`rad-pill ${radius === r ? 'on' : ''}`} onClick={() => setRadius(r)}>
                {r < 1 ? `${r * 1000}m` : `${r}km`}
              </button>
            ))}
          </div>
          <input type="range" className="mv5-slider" min={0.1} max={10} step={0.1}
            value={radius} onChange={e => setRadius(Number(e.target.value))} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
            <span style={{ color: C.textMuted, fontSize: 10.5 }}>100m</span>
            <span style={{ color: C.textMuted, fontSize: 10.5 }}>10 km</span>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          {[
            { key: 'shops',  label: 'Shops',  color: C.shop,  bg: C.shopLight,  Icon: StorefrontIcon },
            { key: 'houses', label: 'Houses', color: C.house, bg: C.houseLight, Icon: HomeIcon },
            { key: 'jobs',   label: 'Jobs',   color: C.job,   bg: C.jobLight,   Icon: WorkIcon },
          ].map(t => (
            <div key={t.key} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '9px 0', borderBottom: `1px solid ${C.borderLight}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10, background: t.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.color,
                }}>
                  <t.Icon sx={{ fontSize: 17 }} />
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

      <div style={{
        padding: '10px 18px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', borderBottom: `1px solid ${C.borderLight}`, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: loading ? C.accent : C.green,
            animation: loading ? 'pulse 1s ease infinite' : 'none',
          }} />
          <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{allItems.length}</span>
          <span style={{ fontSize: 13, color: C.textSub }}>results</span>
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

      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
        {loading ? <SkeletonList />
          : filteredItems.length === 0 ? <EmptyState />
          : <ListView items={filteredItems} onSelect={onSelect} onRoute={onRoute} />}
      </div>
    </div>
  );
}

// ─── FILTER PANEL ──────────────────────────────────────────────────────────────
function FilterPanel({ radius, setRadius, typeFilter, setTypeFilter, onApply }) {
  return (
    <>
      <div style={{ fontWeight: 700, fontSize: 15.5, color: C.text, marginBottom: 14, letterSpacing: '-.2px' }}>Filters</div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ color: C.textSub, fontSize: 12.5, fontWeight: 500 }}>Radius</span>
          <span style={{ color: C.accent, fontWeight: 700, fontSize: 12.5 }}>
            {radius < 1 ? `${Math.round(radius * 1000)}m` : `${radius}km`}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          {[0.2, 0.4, 1, 2].map(r => (
            <button key={r} className={`rad-pill ${radius === r ? 'on' : ''}`} onClick={() => setRadius(r)}>
              {r < 1 ? `${r * 1000}m` : `${r}km`}
            </button>
          ))}
        </div>
        <input type="range" className="mv5-slider" min={0.1} max={10} step={0.1}
          value={radius} onChange={e => setRadius(Number(e.target.value))} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <div className="sec-label">Show Types</div>
        {[
          { key: 'shops',  label: 'Shops',  color: C.shop,  bg: C.shopLight,  Icon: StorefrontIcon },
          { key: 'houses', label: 'Houses', color: C.house, bg: C.houseLight, Icon: HomeIcon },
          { key: 'jobs',   label: 'Jobs',   color: C.job,   bg: C.jobLight,   Icon: WorkIcon },
        ].map(t => (
          <div key={t.key} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '9px 0', borderBottom: `1px solid ${C.borderLight}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: t.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.color }}>
                <t.Icon sx={{ fontSize: 16 }} />
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
      <button className="btn btn-primary" style={{ width: '100%', borderRadius: 12, padding: '11px 0', fontSize: 13.5 }}
        onClick={onApply}>
        Apply Filters
      </button>
    </>
  );
}

// ─── LIST VIEW ─────────────────────────────────────────────────────────────────
function ListView({ items, onSelect, onRoute }) {
  return (
    <div style={{ padding: '4px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
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
          <div key={`${item._type}-${item.id || i}`} className="mv5-card" onClick={() => onSelect(item)}>
            <div style={{
              width: 48, height: 48, borderRadius: 15, flexShrink: 0,
              background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <IconC sx={{ fontSize: 22, color: '#fff' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 2,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
              {sub && <div style={{ color: C.textSub, fontSize: 12.5, marginBottom: 6,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                <span className="badge" style={{ background: m.bg, color: m.dark }}>{m.label}</span>
                <span style={{ color: m.color, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <LocationOnIcon sx={{ fontSize: 10 }} />{fmtDist(item.distance)}
                </span>
                {price && <span style={{ color: m.dark, fontWeight: 700, fontSize: 12 }}>{price}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
              <button className="btn" style={{ width: 34, height: 34, borderRadius: 10,
                background: m.color, color: '#fff', border: 'none', padding: 0 }}
                onClick={e => { e.stopPropagation(); onRoute(item); }}>
                <NavigationIcon sx={{ fontSize: 15 }} />
              </button>
              <button className="btn" style={{ width: 34, height: 34, borderRadius: 10,
                background: C.surfaceAlt, color: C.textSub, border: `1px solid ${C.border}`, padding: 0 }}
                onClick={e => { e.stopPropagation(); onSelect(item); }}>
                <VisibilityIcon sx={{ fontSize: 14 }} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── DETAIL PANEL (minimal theme) ─────────────────────────────────────────────
function DetailPanel({ item, onClose, onRoute, openGoogleMaps }) {
  const m     = TYPE[item._type] || {};
  const IconC = m.Icon || LocationOnIcon;
  const name  = getName(item);
  const sub   = getSub(item);
  const phone = item.owner_phone || item.employer_phone || item.phone;

  // Open/closed for shops
  const isOpen = item._type === 'shop' ? computeIsOpen(item) : null;

  // Price shown inline in body
  const price = item._type === 'house'
    ? { value: fmtINR(item.rent_per_month), unit: '/ month' }
    : item._type === 'job'
    ? { value: fmtINR(item.salary), unit: `/ ${item.salary_type === 'month' ? 'month' : 'day'}` }
    : null;

  return (
    <div className="mv5-detail-panel"style={{            marginTop: 60, marginRight: 12,
}}>

      {/* ── HERO — minimal, flush to the very top, back button always visible ── */}
      <div className="detail-hero">
        <div className="detail-hero-topbar">
          <button className="detail-hero-btn" onClick={onClose} aria-label="Back">
            <ArrowBackIcon sx={{ fontSize: 19, color: C.text }} />
          </button>
      
        </div>

        <div className="detail-hero-body">
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: m.bg, border: `1px solid ${m.mid}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            marginTop: 18, marginRight: 12,
          }}>
            <IconC sx={{ fontSize: 26, color: m.color }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              <span className="badge" style={{ background: m.bg, color: m.dark }}>{m.label}</span>
              {isOpen !== null && (
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: isOpen ? C.greenLight : C.redLight,
                  color: isOpen ? C.green : C.red,
                  padding: '3px 9px', borderRadius: 100,
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em',
                }}>
                  <span style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: isOpen ? C.green : C.red, display: 'inline-block',
                  }} />
                  {isOpen ? 'Open now' : 'Closed'}
                </span>
              )}
            </div>

            <div style={{
              fontWeight: 800, fontSize: 19, color: C.text,
              lineHeight: 1.2, letterSpacing: '-.3px', marginBottom: 4,
              wordBreak: 'break-word',
            }}>{name}</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
              {sub && <span style={{ color: C.textSub, fontSize: 13, fontWeight: 500 }}>{sub}</span>}
              {item.distance != null && (
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 3,
                  color: C.textMuted, fontSize: 12, fontWeight: 600,
                }}>
                  <LocationOnIcon sx={{ fontSize: 12, color: C.textMuted }} />
                  {fmtDist(item.distance)} away
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── SCROLLABLE BODY ── */}
      <div style={{ flex: 1, overflowY: 'auto', background: C.surface, WebkitOverflowScrolling: 'touch' }}>

        {/* Price */}
        {price && (
          <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontWeight: 800, fontSize: 28, color: C.text, letterSpacing: '-.5px' }}>
              {price.value}
            </span>
            <span style={{ fontSize: 13.5, color: C.textMuted, fontWeight: 500 }}>{price.unit}</span>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ padding: price ? '14px 20px 20px' : '20px 20px 20px' }}>
          <div className="detail-actions" style={{
            gridTemplateColumns: phone ? 'repeat(3,1fr)' : 'repeat(2,1fr)',
          }}>
            <button className="detail-action-btn primary" onClick={() => onRoute(item)}>
              <DirectionsIcon sx={{ fontSize: 22 }} />
              Route
            </button>
            <button className="detail-action-btn" onClick={() => openGoogleMaps(item)}>
              <OpenInNewIcon sx={{ fontSize: 22, color: C.textSub }} />
              Google Maps
            </button>
            {phone && (
              <button className="detail-action-btn" onClick={() => window.location.href = `tel:${phone}`}>
                <PhoneIcon sx={{ fontSize: 22, color: C.textSub }} />
                Call
              </button>
            )}
          </div>
        </div>

        <div style={{ height: 1, background: C.borderLight }} />

        {/* Body content */}
        <div style={{ padding: '0 20px' }}>
          {item._type === 'shop'  && <ShopBody  item={item} />}
          {item._type === 'house' && <HouseBody item={item} />}
          {item._type === 'job'   && <JobBody   item={item} />}
        </div>

        {/* Contact */}
        {(phone || item.owner_name || item.employer_name) && (
          <>
            <div style={{ height: 8, background: C.surfaceAlt, marginTop: 8 }} />
            <div style={{ padding: '20px 20px' }}>
              <div className="sec-label">Contact</div>
              {(item.owner_name || item.employer_name) && (
                <div style={{ fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 12 }}>
                  {item.owner_name || item.employer_name}
                </div>
              )}
              {phone && (
                <a href={`tel:${phone}`} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 15px',
                  background: C.surfaceAlt, borderRadius: 14,
                  border: `1px solid ${C.borderLight}`,
                  textDecoration: 'none',
                  transition: 'all .15s',
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 11,
                    background: C.surface, border: `1px solid ${C.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <PhoneIcon sx={{ fontSize: 18, color: C.accent }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>Tap to call</div>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: C.text }}>{phone}</div>
                  </div>
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── DETAIL BODY SECTIONS ───────────────────────────────────────────────────────
function InfoRow({ label, value, icon, highlight }) {
  return (
    <div className="info-row">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9, background: C.surfaceAlt,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <span style={{ color: C.textSub, display: 'flex', fontSize: 0 }}>{icon}</span>
        </div>
        <span style={{ color: C.textSub, fontSize: 13.5 }}>{label}</span>
      </div>
      <span style={{
        color: highlight || C.text,
        fontWeight: 700, fontSize: 13.5,
        textAlign: 'right', maxWidth: '55%',
      }}>{value || '—'}</span>
    </div>
  );
}

function ShopBody({ item }) {
  const openT  = item.opening_time  ? formatTimeTo12h(item.opening_time)  : null;
  const closeT = item.closing_time  ? formatTimeTo12h(item.closing_time)  : null;
  const isOpen = computeIsOpen(item);

  return (
    <div style={{ paddingTop: 4 }}>
      {item.description && (
        <div style={{ padding: '20px 0 4px' }}>
          <div className="sec-label">About</div>
          <div style={{ color: C.textSub, fontSize: 14, lineHeight: 1.75 }}>{item.description}</div>
        </div>
      )}

      {(openT || closeT) && (
        <>
          {item.description && <div style={{ height: 1, background: C.borderLight, margin: '16px 0 0' }} />}
          <div style={{ paddingTop: item.description ? 0 : 16 }}>
            <InfoRow
              label="Hours"
              value={openT && closeT ? `${openT} – ${closeT}` : openT || closeT}
              icon={<AccessTimeIcon sx={{ fontSize: 16 }} />}
              highlight={isOpen ? C.green : C.red}
            />
          </div>
        </>
      )}

      {item.keywords?.length > 0 && (
        <div style={{ padding: '16px 0' }}>
          <div style={{ height: 1, background: C.borderLight, marginBottom: 16 }} />
          <div className="sec-label">Key Items</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {item.keywords.map((k, i) => (
              <span key={i} style={{
                padding: '6px 14px', borderRadius: 100, fontSize: 13,
                background: C.surfaceAlt, color: C.textSub, fontWeight: 600,
                border: `1px solid ${C.borderLight}`,
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <TagIcon sx={{ fontSize: 11, color: C.textMuted }} />{k}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function HouseBody({ item }) {
  return (
    <div style={{ paddingTop: 20 }}>
      <div className="sec-label">Property Details</div>
      <div className="stat-grid" style={{ marginBottom: 16 }}>
        {[
          { label: 'Bedrooms', value: item.rooms ? `${item.rooms} BHK` : '—', Icon: BedIcon },
          { label: 'Halls',    value: item.halls    || '—',                    Icon: MeetingRoomIcon },
          { label: 'Kitchens', value: item.kitchens || '—',                    Icon: KitchenIcon },
          { label: 'Floor',    value: item.floor    || '—',                    Icon: ApartmentIcon },
        ].map(r => (
          <div key={r.label} className="stat-card">
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8,
              color: C.textMuted, fontSize: 10.5, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '.05em',
            }}>
              <r.Icon sx={{ fontSize: 13, color: C.textMuted }} />{r.label}
            </div>
            <div style={{ color: C.text, fontWeight: 800, fontSize: 18 }}>{r.value}</div>
          </div>
        ))}
      </div>
      {item.description && (
        <div style={{ color: C.textSub, fontSize: 14, lineHeight: 1.75 }}>{item.description}</div>
      )}
    </div>
  );
}

function JobBody({ item }) {
  return (
    <div style={{ paddingTop: 20 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{
          padding: '8px 16px', borderRadius: 100, fontSize: 13,
          background: C.surfaceAlt, color: C.textSub, fontWeight: 700,
          border: `1px solid ${C.borderLight}`,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <WorkIcon sx={{ fontSize: 14, color: C.textMuted }} />
          {item.job_type === 'full_time' ? 'Full Time' : 'Part Time'}
        </span>
        {item.qualification && (
          <span style={{
            padding: '8px 16px', borderRadius: 100, fontSize: 13,
            background: C.surfaceAlt, color: C.textSub, fontWeight: 700,
            border: `1px solid ${C.borderLight}`,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <SchoolIcon sx={{ fontSize: 14, color: C.textMuted }} />{item.qualification}
          </span>
        )}
      </div>
      {item.description && (
        <div style={{ color: C.textSub, fontSize: 14, lineHeight: 1.75 }}>{item.description}</div>
      )}
    </div>
  );
}

// ─── SKELETON + EMPTY ──────────────────────────────────────────────────────────
function SkeletonList() {
  return (
    <div style={{ padding: '4px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{
          display: 'flex', gap: 12, alignItems: 'center',
          background: C.surface, border: `1px solid ${C.borderLight}`, borderRadius: 16, padding: 14,
        }}>
          <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 15, flexShrink: 0 }} />
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
      justifyContent: 'center', padding: '60px 24px', textAlign: 'center', gap: 14,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 20, background: C.accentLight,
        border: `1.5px solid ${C.accentMid}`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: C.accent,
      }}>
        <SearchIcon sx={{ fontSize: 28 }} />
      </div>
      <div style={{ fontWeight: 800, fontSize: 17, color: C.text, letterSpacing: '-.3px' }}>Nothing nearby</div>
      <div style={{ color: C.textSub, fontSize: 13.5, maxWidth: 230, lineHeight: 1.65 }}>
        Try increasing the search radius or clearing your filters
      </div>
    </div>
  );
}

// ─── LOADING SCREEN ────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{
      height: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 20, background: C.bg, fontFamily: 'Inter, sans-serif',
    }}>
      <img src={loadingGif} alt="Loading…"
        style={{ width: 240, height: 'auto', objectFit: 'contain', marginBottom: 60 }} />
    </div>
  );
}