// app/user/Profile.jsx - Mobile UI matching the provided design
import React, { useState, useEffect } from 'react';
import {
    getProfile,
    updateProfile,
    changePassword,
    deleteAccount,
    createShop,
    createHouse,
    createJob,
    getUserShopsForJob,
    updateHouse,
    updateJob
} from '../../services/profile';
import { getAllCities, getAreasByCity, verifyLocation, getShopCategories } from '../../services/location';
import { useAuth } from '../context/AuthContext';

/* ─────────────────────────────────────────────
   GLOBAL STYLES  (injected once)
───────────────────────────────────────────── */
const GLOBAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --blue: #325fec;
    --blue-soft: #e8f0fe;
    --green: #16a34a;
    --green-soft: #dcfce7;
    --red: #dc2626;
    --red-soft: #fee2e2;
    --purple: #8b5cf6;
    --purple-soft: #ede9fe;
    --emerald: #059669;
    --border: #e5e7eb;
    --text: #111827;
    --text-2: #6b7280;
    --text-3: #9ca3af;
    --bg: #f3f4f6;
    --card: #ffffff;
    --radius: 14px;
    --font: 'Inter', sans-serif;
  }

  body { font-family: var(--font); background: var(--bg); color: var(--text); }

  input, select, textarea, button { font-family: var(--font); }

  /* scrollbar */
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 99px; }

  /* animations */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

/* ─────────────────────────────────────────────
   INJECT STYLES
───────────────────────────────────────────── */
if (!document.getElementById('profile-styles')) {
    const s = document.createElement('style');
    s.id = 'profile-styles';
    s.textContent = GLOBAL_STYLE;
    document.head.appendChild(s);
}

/* ─────────────────────────────────────────────
   LOCATION SERVICE
───────────────────────────────────────────── */
class LocationService {
    async reverseGeocode(lat, lng) {
        try {
            const r = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=en`,
                { headers: { 'User-Agent': 'NearZO-App/1.0' } }
            );
            const d = await r.json();
            if (d?.address) {
                const a = d.address;
                return {
                    city: a.city || a.town || a.village || null,
                    area: a.suburb || a.neighbourhood || a.hamlet || a.city_district || null,
                    state: a.state || null,
                };
            }
        } catch (e) { /* fallback */ }
        try {
            const r2 = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
            const d2 = await r2.json();
            return { city: d2.city || d2.locality || null, area: d2.locality || null, state: d2.principalSubdivision || null };
        } catch (e) { return null; }
    }
}
const locationService = new LocationService();

/* ─────────────────────────────────────────────
   PRIMITIVE COMPONENTS
───────────────────────────────────────────── */

const Card = ({ children, style = {} }) => (
    <div style={{
        background: '#fff',
        borderRadius: var_radius(),
        border: '1px solid var(--border)',
        overflow: 'hidden',
        ...style
    }}>{children}</div>
);

function var_radius() { return '14px'; }

const Spinner = ({ size = 18, color = '#fff' }) => (
    <span style={{
        display: 'inline-block',
        width: size, height: size,
        border: `2px solid ${color}30`,
        borderTop: `2px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin .7s linear infinite',
        flexShrink: 0
    }} />
);

const Badge = ({ label, color = '#325fec', bg = '#e8f0fe' }) => (
    <span style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 600,
        color,
        background: bg,
        whiteSpace: 'nowrap'
    }}>{label}</span>
);

const FieldLabel = ({ children }) => (
    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.4px' }}>
        {children}
    </label>
);

const Input = ({ label, style = {}, wrapStyle = {}, ...props }) => (
    <div style={{ minWidth: 200, ...wrapStyle }}>
        {label && <FieldLabel>{label}</FieldLabel>}
        <input
            {...props}
            style={{
                width: '100%',
                minWidth: 200,
                padding: '10px 14px',
                border: '1.5px solid #e5e7eb',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 400,
                color: '#111827',
                background: '#fafafa',
                outline: 'none',
                transition: 'border-color .15s',
                ...style
            }}
            onFocus={e => e.target.style.borderColor = '#325fec'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
        />
    </div>
);

const Textarea = ({ label, wrapStyle = {}, ...props }) => (
    <div style={{ minWidth: 200, ...wrapStyle }}>
        {label && <FieldLabel>{label}</FieldLabel>}
        <textarea
            {...props}
            rows={3}
            style={{
                width: '100%',
                minWidth: 200,
                padding: '10px 14px',
                border: '1.5px solid #e5e7eb',
                borderRadius: 10,
                fontSize: 14,
                color: '#111827',
                background: '#fafafa',
                outline: 'none',
                resize: 'vertical',
                transition: 'border-color .15s'
            }}
            onFocus={e => e.target.style.borderColor = '#325fec'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
        />
    </div>
);

const SelectField = ({ label, options = [], wrapStyle = {}, ...props }) => (
    <div style={{ minWidth: 200, ...wrapStyle }}>
        {label && <FieldLabel>{label}</FieldLabel>}
        <select
            {...props}
            style={{
                width: '100%',
                minWidth: 200,
                padding: '10px 14px',
                border: '1.5px solid #e5e7eb',
                borderRadius: 10,
                fontSize: 14,
                color: '#111827',
                background: '#fafafa',
                outline: 'none',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'calc(100% - 12px) center',
                paddingRight: 36
            }}
        >
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
    </div>
);

const Btn = ({ children, onClick, variant = 'primary', size = 'md', loading, disabled, style = {}, icon, fullWidth }) => {
    const base = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        borderRadius: 10,
        border: 'none',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        fontWeight: 600,
        fontFamily: 'var(--font)',
        transition: 'all .15s',
        opacity: disabled ? .55 : 1,
        width: fullWidth ? '100%' : undefined,
        whiteSpace: 'nowrap',
    };
    const sizes = {
        sm: { padding: '7px 14px', fontSize: 13 },
        md: { padding: '11px 20px', fontSize: 14 },
        lg: { padding: '14px 24px', fontSize: 15 },
    };
    const variants = {
        primary:   { background: '#325fec', color: '#fff' },
        secondary: { background: '#f3f4f6', color: '#374151', border: '1.5px solid #e5e7eb' },
        danger:    { background: '#fee2e2', color: '#dc2626' },
        ghost:     { background: 'transparent', color: '#325fec', border: '1.5px solid #325fec' },
        success:   { background: '#dcfce7', color: '#16a34a' },
        green:     { background: '#059669', color: '#fff' },
        purple:    { background: '#8b5cf6', color: '#fff' },
    };
    return (
        <button
            onClick={!disabled && !loading ? onClick : undefined}
            style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
        >
            {loading ? <Spinner size={15} color={variant === 'secondary' ? '#374151' : '#fff'} /> : icon}
            {children}
        </button>
    );
};

const Toggle = ({ checked, onChange, label }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
        <div
            onClick={() => onChange(!checked)}
            style={{
                width: 44, height: 24,
                borderRadius: 99,
                background: checked ? '#325fec' : '#d1d5db',
                position: 'relative',
                transition: 'background .2s',
                flexShrink: 0
            }}
        >
            <div style={{
                position: 'absolute',
                top: 3, left: checked ? 23 : 3,
                width: 18, height: 18,
                borderRadius: '50%',
                background: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,.2)',
                transition: 'left .2s'
            }} />
        </div>
        {label && <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>{label}</span>}
    </label>
);

/* ─────────────────────────────────────────────
   MODAL
───────────────────────────────────────────── */
const Modal = ({ open, onClose, title, children, footer }) => {
    if (!open) return null;
    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(0,0,0,.45)',
                display: 'flex', alignItems: 'flex-end',
                backdropFilter: 'blur(2px)'
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    width: '100%',
                    maxHeight: '92vh',
                    background: '#fff',
                    borderRadius: '20px 20px 0 0',
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'fadeUp .25s ease'
                }}
            >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 14px', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ fontSize: 16, fontWeight: 700 }}>{title}</span>
                    <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✕</button>
                </div>
                {/* Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>
                    {children}
                </div>
                {/* Footer */}
                {footer && (
                    <div style={{ padding: '14px 20px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   TOAST
───────────────────────────────────────────── */
const Toast = ({ msg, type = 'success', onClose }) => {
    if (!msg) return null;
    const colors = { success: { bg: '#dcfce7', color: '#16a34a' }, error: { bg: '#fee2e2', color: '#dc2626' } };
    return (
        <div style={{
            position: 'fixed', top: 16, left: 0, right: 0, zIndex: 2000,
            display: 'flex', justifyContent: 'center',
            padding: '0 16px',
            animation: 'fadeUp .25s ease',
            pointerEvents: 'none'
        }}>
            <div style={{
                background: colors[type].bg,
                color: colors[type].color,
                padding: '12px 20px',
                borderRadius: 12,
                fontWeight: 600,
                fontSize: 14,
                boxShadow: '0 4px 20px rgba(0,0,0,.12)',
                maxWidth: 380
            }}>
                {msg}
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   SETTINGS ROW
───────────────────────────────────────────── */
const SettingsRow = ({ icon, label, onClick, danger }) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '15px 0',
            background: 'none', border: 'none', cursor: 'pointer',
            width: '100%', textAlign: 'left',
            borderBottom: '1px solid #f3f4f6',
            color: danger ? '#dc2626' : '#111827',
        }}
    >
        <span style={{ fontSize: 18, flexShrink: 0, color: danger ? '#dc2626' : '#374151' }}>{icon}</span>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>{label}</span>
        {!danger && <span style={{ color: '#9ca3af', fontSize: 18 }}>›</span>}
    </button>
);

/* ─────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────── */
const StatCard = ({ icon, count, label, bg = '#e8f0fe', color = '#325fec' }) => (
    <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 14,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flex: '1 1 0',
        minWidth: 100
    }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, color }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{count}</div>
            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{label}</div>
        </div>
    </div>
);

/* ─────────────────────────────────────────────
   FORM GRID
───────────────────────────────────────────── */
const FormGrid = ({ children }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
        {children}
    </div>
);

const FormItem = ({ half, full, children }) => (
    <div style={{ flex: full ? '1 1 100%' : '1 1 calc(50% - 7px)', minWidth: 200 }}>
        {children}
    </div>
);

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function Profile() {
    const { user: authUser, updateUser, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [locating, setLocating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState(null);
    const [shops, setShops] = useState([]);
    const [houses, setHouses] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [userShopsForJob, setUserShopsForJob] = useState([]);
    const [activeTab, setActiveTab] = useState('shops');
    const [toast, setToast] = useState({ msg: '', type: 'success' });
    const [cities, setCities] = useState([]);
    const [shopAreas, setShopAreas] = useState([]);
    const [houseAreas, setHouseAreas] = useState([]);
    const [jobAreas, setJobAreas] = useState([]);
    const [shopCategories, setShopCategories] = useState([]);
    const [selectedCategoryItems, setSelectedCategoryItems] = useState([]);

    // Modal states
    const [modal, setModal] = useState('');   // 'shop'|'house'|'job'|'password'|'delete'|'editHouse'|'editJob'|'editProfile'
    const [editingHouse, setEditingHouse] = useState(null);
    const [editingJob, setEditingJob] = useState(null);

    // location verify
    const [shopLocationVerified, setShopLocationVerified] = useState(false);
    const [houseLocationVerified, setHouseLocationVerified] = useState(false);
    const [shopVerifying, setShopVerifying] = useState(false);
    const [houseVerifying, setHouseVerifying] = useState(false);

    const [passwordData, setPasswordData] = useState({ current_password: '', new_password: '', confirm_password: '' });
    const [deletePassword, setDeletePassword] = useState('');

    const emptyShop = { business_name: '', category: '', additional_phone: '', keywords: [], custom_keyword: '', latitude: '', longitude: '', area: '', city: '', state: '', description: '', opening_time: '', closing_time: '', shop_image_base64: null, shop_image_preview: '' };
    const emptyHouse = { rooms: '', halls: '', kitchens: '', floor: '', rent_per_month: '', advance_amount: '', latitude: '', longitude: '', area: '', city: '', state: '', description: '', is_available: true, house_image_base64: null, house_image_preview: '' };
    const emptyJob = { shop_id: '', company_name: '', job_title: '', salary: '', salary_type: 'month', qualification: '', job_type: 'full_time', area: '', city: '', state: '', is_open: true };
    const emptyProfile = { full_name: '', area: '', city: '', state: '' };

    const [shopForm, setShopForm] = useState(emptyShop);
    const [houseForm, setHouseForm] = useState(emptyHouse);
    const [jobForm, setJobForm] = useState(emptyJob);
    const [formData, setFormData] = useState(emptyProfile);

    /* ── helpers ── */
    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: '', type: 'success' }), 3500);
    };
    const closeModal = () => setModal('');
    const formatPrice = p => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);
    const formatTime = t => t ? t.slice(0, 5) : '';
    const b64 = file => new Promise((res, rej) => { const r = new FileReader(); r.readAsDataURL(file); r.onload = () => res(r.result); r.onerror = rej; });

    /* ── load ── */
    useEffect(() => { loadProfile(); loadCities(); loadCategories(); loadUserShopsForJob(); }, []);
    useEffect(() => { if (shopForm.city) loadAreasFor(shopForm.city, setShopAreas); else setShopAreas([]); }, [shopForm.city]);
    useEffect(() => { if (houseForm.city) loadAreasFor(houseForm.city, setHouseAreas); else setHouseAreas([]); }, [houseForm.city]);
    useEffect(() => { if (jobForm.city) loadAreasFor(jobForm.city, setJobAreas); else setJobAreas([]); }, [jobForm.city]);
    useEffect(() => {
        if (shopForm.category) {
            const cat = shopCategories.find(c => c.name === shopForm.category);
            setSelectedCategoryItems(cat?.key_items || []);
        } else setSelectedCategoryItems([]);
    }, [shopForm.category, shopCategories]);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const r = await getProfile();
            setProfile(r.user); setShops(r.shops || []); setHouses(r.houses || []); setJobs(r.jobs || []);
            setFormData({ full_name: r.user.full_name || '', area: r.user.area || '', city: r.user.city || '', state: r.user.state || '' });
        } catch { showToast('Failed to load profile', 'error'); }
        finally { setLoading(false); }
    };
    const loadCities = async () => { try { const r = await getAllCities(); setCities(r.cities || []); } catch { } };
    const loadAreasFor = async (city, setter) => { try { const r = await getAreasByCity(city); setter(r.areas || []); } catch { setter([]); } };
    const loadCategories = async () => { try { const r = await getShopCategories(); setShopCategories(r?.categories?.length ? r.categories : []); } catch { } };
    const loadUserShopsForJob = async () => { try { const r = await getUserShopsForJob(); setUserShopsForJob(r.shops || []); } catch { } };

    /* ── get location ── */
    const getCurrentLocation = (setter) => {
        if (!navigator.geolocation) { showToast('Geolocation not supported', 'error'); return; }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const lat = pos.coords.latitude, lng = pos.coords.longitude;
            try {
                const info = await locationService.reverseGeocode(lat, lng);
                const matched = cities.find(c => c.name.toLowerCase() === (info?.city || '').toLowerCase());
                setter(p => ({ ...p, latitude: lat, longitude: lng, city: matched ? matched.name : (info?.city || ''), area: info?.area || '', state: info?.state || p.state || '' }));
                showToast(`Location: ${info?.area ? info.area + ', ' : ''}${info?.city || 'Found'}`);
            } catch { setter(p => ({ ...p, latitude: lat, longitude: lng })); }
            finally { setLocating(false); }
        }, () => { setLocating(false); showToast('Location access denied', 'error'); }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
    };

    /* ── verify ── */
    const verifyShopLoc = async () => {
        if (!shopForm.city || !shopForm.area || !shopForm.latitude) { showToast('Get location first then select city/area', 'error'); return false; }
        setShopVerifying(true);
        try {
            const v = await verifyLocation(shopForm.latitude, shopForm.longitude, shopForm.city, shopForm.area);
            if (v.verified) { setShopLocationVerified(true); return true; }
            showToast(v.message || 'Verification failed', 'error'); return false;
        } catch { showToast('Verification error', 'error'); return false; }
        finally { setShopVerifying(false); }
    };
    const verifyHouseLoc = async () => {
        if (!houseForm.city || !houseForm.area || !houseForm.latitude) { showToast('Get location first then select city/area', 'error'); return false; }
        setHouseVerifying(true);
        try {
            const v = await verifyLocation(houseForm.latitude, houseForm.longitude, houseForm.city, houseForm.area);
            if (v.verified) { setHouseLocationVerified(true); return true; }
            showToast(v.message || 'Verification failed', 'error'); return false;
        } catch { showToast('Verification error', 'error'); return false; }
        finally { setHouseVerifying(false); }
    };

    /* ── handlers ── */
    const handleSaveProfile = async () => {
        if (!formData.full_name.trim()) { showToast('Name is required', 'error'); return; }
        setSaving(true);
        try { const r = await updateProfile(formData); setProfile(r.user); updateUser(r.user); showToast('Profile updated!'); closeModal(); }
        catch (e) { showToast(e.message || 'Failed', 'error'); }
        finally { setSaving(false); }
    };

    const handleChangePassword = async () => {
        if (passwordData.new_password !== passwordData.confirm_password) { showToast('Passwords do not match', 'error'); return; }
        if (passwordData.new_password.length < 6) { showToast('Min 6 characters', 'error'); return; }
        try { await changePassword({ current_password: passwordData.current_password, new_password: passwordData.new_password }); showToast('Password changed!'); closeModal(); setPasswordData({ current_password: '', new_password: '', confirm_password: '' }); }
        catch (e) { showToast(e.message, 'error'); }
    };

    const handleDeleteAccount = async () => {
        try { await deleteAccount(deletePassword); showToast('Account deleted'); setTimeout(logout, 1500); }
        catch (e) { showToast(e.message, 'error'); }
    };

    const handleCreateShop = async () => {
        if (!shopForm.business_name || !shopForm.category || !shopForm.city || !shopForm.state) { showToast('Fill required fields', 'error'); return; }
        if (!shopLocationVerified) { const ok = await verifyShopLoc(); if (!ok) return; }
        try {
            const r = await createShop({ ...shopForm, keywords: shopForm.keywords, latitude: parseFloat(shopForm.latitude), longitude: parseFloat(shopForm.longitude) });
            if (r.success) { showToast('Shop created!'); closeModal(); loadProfile(); loadUserShopsForJob(); setShopForm(emptyShop); setShopLocationVerified(false); }
        } catch (e) { showToast(e.message, 'error'); }
    };

    const handleCreateHouse = async () => {
        if (!houseForm.rooms || !houseForm.rent_per_month) { showToast('Fill required fields', 'error'); return; }
        if (!houseLocationVerified) { const ok = await verifyHouseLoc(); if (!ok) return; }
        try {
            const r = await createHouse({ ...houseForm, rooms: +houseForm.rooms, halls: +houseForm.halls, kitchens: +houseForm.kitchens, floor: +houseForm.floor, rent_per_month: +houseForm.rent_per_month, advance_amount: houseForm.advance_amount ? +houseForm.advance_amount : null, latitude: parseFloat(houseForm.latitude), longitude: parseFloat(houseForm.longitude) });
            if (r.success) { showToast('House listed!'); closeModal(); loadProfile(); setHouseForm(emptyHouse); setHouseLocationVerified(false); }
        } catch (e) { showToast(e.message, 'error'); }
    };

    const handleCreateJob = async () => {
        if (!jobForm.company_name || !jobForm.job_title || !jobForm.salary) { showToast('Fill required fields', 'error'); return; }
        try {
            const r = await createJob({ ...jobForm, salary: +jobForm.salary, shop_id: jobForm.shop_id || null, latitude: null, longitude: null });
            if (r.success) { showToast('Job posted!'); closeModal(); loadProfile(); setJobForm(emptyJob); }
        } catch (e) { showToast(e.message, 'error'); }
    };

    const handleUpdateHouse = async () => {
        try {
            await updateHouse(editingHouse.id, { ...houseForm, rooms: +houseForm.rooms, halls: +houseForm.halls, kitchens: +houseForm.kitchens, floor: +houseForm.floor, rent_per_month: +houseForm.rent_per_month, advance_amount: houseForm.advance_amount ? +houseForm.advance_amount : null });
            showToast('House updated!'); closeModal(); loadProfile();
        } catch (e) { showToast(e.message, 'error'); }
    };

    const handleUpdateJob = async () => {
        try {
            await updateJob(editingJob.id, { ...jobForm, salary: +jobForm.salary });
            showToast('Job updated!'); closeModal(); loadProfile();
        } catch (e) { showToast(e.message, 'error'); }
    };

    const openEditHouse = (h) => { setEditingHouse(h); setHouseForm({ rooms: h.rooms, halls: h.halls, kitchens: h.kitchens, floor: h.floor, rent_per_month: h.rent_per_month, advance_amount: h.advance_amount || '', latitude: h.latitude || '', longitude: h.longitude || '', area: h.area || '', city: h.city || '', state: h.state || '', description: h.description || '', is_available: h.is_available, house_image_base64: null, house_image_preview: '' }); setModal('editHouse'); };
    const openEditJob = (j) => { setEditingJob(j); setJobForm({ shop_id: j.shop_id || '', company_name: j.company_name, job_title: j.job_title, salary: j.salary, salary_type: j.salary_type, qualification: j.qualification || '', job_type: j.job_type, area: j.area || '', city: j.city || '', state: j.state || '', is_open: j.is_open }); setModal('editJob'); };
    const handleShopSelect = (id) => {
        const s = userShopsForJob.find(x => x.id === id);
        setJobForm(p => ({ ...p, shop_id: id, company_name: s ? s.business_name : '', area: s?.area || '', city: s?.city || '', state: s?.state || '' }));
    };

    /* ── LOADING ── */
    if (loading) {
        return (
            <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
                <Spinner size={32} color="#325fec" />
            </div>
        );
    }

    /* ── RENDER ── */
    return (
        <div style={{ maxWidth: 430, margin: '0 auto', minHeight: '100dvh', background: '#f3f4f6', fontFamily: 'var(--font)', paddingBottom: 90 }}>
            <Toast msg={toast.msg} type={toast.type} />

            {/* ── Top bar ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 8px' }}>
                <span style={{ fontSize: 18, fontWeight: 700 }}>Profile</span>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', fontSize: 22 }}>
                        🔔
                        <span style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, background: '#ef4444', borderRadius: '50%' }} />
                    </button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22 }}>⚙️</button>
                </div>
            </div>

            {/* ── Profile card ── */}
            <div style={{ margin: '8px 16px 0', background: '#eef2ff', borderRadius: 18, padding: '24px 20px 20px', textAlign: 'center', position: 'relative' }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
                    <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#325fec', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 700, color: '#fff', margin: '0 auto', overflow: 'hidden' }}>
                        {profile?.avatar
                            ? <img src={profile.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : (profile?.full_name?.charAt(0) || 'U')}
                    </div>
                    <button style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: '#325fec', border: '2.5px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13, color: '#fff' }}>📷</button>
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{profile?.full_name}</div>
                <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 14 }}>📞 {profile?.phone}</div>
                <Btn onClick={() => { setFormData({ full_name: profile?.full_name || '', area: profile?.area || '', city: profile?.city || '', state: profile?.state || '' }); setModal('editProfile'); }} variant="secondary" size="sm" style={{ borderRadius: 99, padding: '8px 22px' }} icon={<span style={{ fontSize: 14 }}>✏️</span>}>
                    Edit Profile
                </Btn>
            </div>

            {/* ── Stats row ── */}
            <div style={{ display: 'flex', gap: 10, margin: '14px 16px', overflowX: 'auto', paddingBottom: 2 }}>
                <StatCard icon="🔖" count={shops.length} label="My Shops" bg="#e8f0fe" color="#325fec" />
                <StatCard icon="⭐" count={houses.length} label="My Houses" bg="#fef3c7" color="#d97706" />
                <StatCard icon="💼" count={jobs.length} label="Jobs Posted" bg="#d1fae5" color="#059669" />
            </div>

            {/* ── Add Business ── */}
            <div style={{ margin: '0 16px 14px', background: '#fff', borderRadius: 16, padding: '16px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Add Business</div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <Btn onClick={() => setModal('shop')} variant="primary" size="sm" fullWidth icon="🏪">Shop</Btn>
                    <Btn onClick={() => setModal('house')} variant="green" size="sm" fullWidth icon="🏠">House</Btn>
                    <Btn onClick={() => setModal('job')} variant="purple" size="sm" fullWidth icon="💼">Job</Btn>
                </div>
            </div>

            {/* ── Tabs ── */}
            <div style={{ margin: '0 16px 14px', background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid #f3f4f6' }}>
                    {[
                        { key: 'shops', label: `Shops (${shops.length})` },
                        { key: 'houses', label: `Houses (${houses.length})` },
                        { key: 'jobs', label: `Jobs (${jobs.length})` }
                    ].map(t => (
                        <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                            flex: 1, padding: '13px 8px', border: 'none', background: 'none', cursor: 'pointer',
                            fontSize: 13, fontWeight: 600, fontFamily: 'var(--font)',
                            color: activeTab === t.key ? '#325fec' : '#9ca3af',
                            borderBottom: activeTab === t.key ? '2.5px solid #325fec' : '2.5px solid transparent',
                            transition: 'all .15s'
                        }}>{t.label}</button>
                    ))}
                </div>

                <div style={{ padding: 14 }}>
                    {/* SHOPS */}
                    {activeTab === 'shops' && (
                        shops.length === 0
                            ? <Empty label="No shops yet" />
                            : <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                {shops.map(s => (
                                    <div key={s.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                                        {s.shop_image && <img src={`data:image/jpeg;base64,${s.shop_image}`} alt="" style={{ width: '100%', height: 90, objectFit: 'cover' }} />}
                                        <div style={{ padding: '10px 10px 12px' }}>
                                            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.business_name}</div>
                                            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>{s.category}</div>
                                            <div style={{ fontSize: 11, color: '#9ca3af' }}>{s.area}, {s.city}</div>
                                            {s.is_verified && <Badge label="✓ Verified" color="#16a34a" bg="#dcfce7" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                    )}

                    {/* HOUSES */}
                    {activeTab === 'houses' && (
                        houses.length === 0
                            ? <Empty label="No houses listed" />
                            : <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {houses.map(h => (
                                    <div key={h.id} style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
                                        {h.house_image && <img src={`data:image/jpeg;base64,${h.house_image}`} alt="" style={{ width: '100%', height: 110, objectFit: 'cover' }} />}
                                        <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                                            <div>
                                                <div style={{ fontSize: 14, fontWeight: 700 }}>{h.rooms} BHK House</div>
                                                <div style={{ fontSize: 13, color: '#325fec', fontWeight: 600 }}>{formatPrice(h.rent_per_month)}/mo</div>
                                                <div style={{ fontSize: 12, color: '#9ca3af' }}>{h.area}, {h.city}</div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <Badge label={h.is_available ? 'Available' : 'Booked'} color={h.is_available ? '#16a34a' : '#dc2626'} bg={h.is_available ? '#dcfce7' : '#fee2e2'} />
                                                <Btn size="sm" variant="secondary" onClick={() => openEditHouse(h)} style={{ borderRadius: 8, padding: '6px 12px', fontSize: 12 }}>✏️ Edit</Btn>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                    )}

                    {/* JOBS */}
                    {activeTab === 'jobs' && (
                        jobs.length === 0
                            ? <Empty label="No jobs posted" />
                            : <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {jobs.map(j => (
                                    <div key={j.id} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px', background: '#fff' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 14, fontWeight: 700 }}>{j.job_title}</div>
                                                <div style={{ fontSize: 13, color: '#6b7280' }}>{j.shop_name || j.company_name}</div>
                                                <div style={{ fontSize: 14, fontWeight: 600, color: '#325fec' }}>{formatPrice(j.salary)}/{j.salary_type === 'month' ? 'mo' : 'day'}</div>
                                                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{j.area}, {j.city}</div>
                                                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                                                    <Badge label={j.is_open ? '● Open' : '● Closed'} color={j.is_open ? '#16a34a' : '#dc2626'} bg={j.is_open ? '#dcfce7' : '#fee2e2'} />
                                                    <Badge label={j.job_type === 'full_time' ? 'Full Time' : 'Part Time'} color="#6b7280" bg="#f3f4f6" />
                                                </div>
                                            </div>
                                            <Btn size="sm" variant="secondary" onClick={() => openEditJob(j)} style={{ borderRadius: 8, padding: '6px 12px', fontSize: 12 }}>✏️ Edit</Btn>
                                        </div>
                                    </div>
                                ))}
                            </div>
                    )}
                </div>
            </div>

            {/* ── Settings ── */}
            <div style={{ margin: '0 16px 14px', background: '#fff', borderRadius: 16, padding: '6px 18px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 14, fontWeight: 700, padding: '14px 0 6px' }}>Settings</div>
                <SettingsRow icon="👤" label="Edit Profile" onClick={() => { setFormData({ full_name: profile?.full_name || '', area: profile?.area || '', city: profile?.city || '', state: profile?.state || '' }); setModal('editProfile'); }} />
                <SettingsRow icon="📍" label="Change Location" onClick={() => { setFormData({ full_name: profile?.full_name || '', area: profile?.area || '', city: profile?.city || '', state: profile?.state || '' }); setModal('editProfile'); }} />
                <SettingsRow icon="🔔" label="Notification Settings" onClick={() => {}} />
                <SettingsRow icon="🔒" label="Change Password" onClick={() => setModal('password')} />
                <SettingsRow icon="❓" label="Help & Support" onClick={() => {}} />
                <SettingsRow icon="ℹ️" label="About NearZO" onClick={() => {}} />
            </div>

            {/* ── Pro Banner ── */}
            <div style={{ margin: '0 16px 14px', background: '#325fec', borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fff2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>👑</div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: '#a5b4fc', fontWeight: 500 }}>Get better experience with</div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>NearZO Pro</div>
                    <div style={{ fontSize: 11, color: '#c7d2fe' }}>Unlock exclusive features and support local business.</div>
                </div>
                <button style={{ background: '#fff', color: '#325fec', border: 'none', borderRadius: 10, padding: '8px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)', whiteSpace: 'nowrap' }}>Upgrade →</button>
            </div>

            {/* ── Account ── */}
            <div style={{ margin: '0 16px', background: '#fff', borderRadius: 16, padding: '6px 18px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 14, fontWeight: 700, padding: '14px 0 6px' }}>Account</div>
                <SettingsRow icon="🚪" label="Logout" onClick={logout} danger />
                <SettingsRow icon="⚠️" label="Delete Account" onClick={() => setModal('delete')} danger />
            </div>

            {/* ── Bottom Nav ── */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #e5e7eb', display: 'flex', maxWidth: 430, margin: '0 auto', zIndex: 100 }}>
                {[
                    { icon: '🏠', label: 'Home', active: false },
                    { icon: '🗺️', label: 'Map', active: false },
                    { icon: '🏪', label: 'Shops', active: false },
                    { icon: '💼', label: 'Jobs', active: false },
                ].map(n => (
                    <button key={n.label} style={{ flex: 1, padding: '10px 0 12px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                        <span style={{ fontSize: 22 }}>{n.icon}</span>
                        <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, fontFamily: 'var(--font)' }}>{n.label}</span>
                    </button>
                ))}
            </div>

            {/* ════════════════════════════
                 MODALS
            ════════════════════════════ */}

            {/* Edit Profile */}
            <Modal open={modal === 'editProfile'} onClose={closeModal} title="Edit Profile"
                footer={<><Btn variant="secondary" onClick={closeModal}>Cancel</Btn><Btn variant="primary" onClick={handleSaveProfile} loading={saving}>Save</Btn></>}>
                <FormGrid>
                    <FormItem full><Input label="Full Name *" value={formData.full_name} onChange={e => setFormData(p => ({ ...p, full_name: e.target.value }))} /></FormItem>
                    <FormItem half><SelectField label="City" value={formData.city} onChange={e => setFormData(p => ({ ...p, city: e.target.value, area: '' }))} options={[{ value: '', label: 'Select City' }, ...cities.map(c => ({ value: c.name, label: c.name }))]} /></FormItem>
                    <FormItem half><Input label="Area" value={formData.area} onChange={e => setFormData(p => ({ ...p, area: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="State" value={formData.state} onChange={e => setFormData(p => ({ ...p, state: e.target.value }))} /></FormItem>
                </FormGrid>
            </Modal>

            {/* Change Password */}
            <Modal open={modal === 'password'} onClose={closeModal} title="Change Password"
                footer={<><Btn variant="secondary" onClick={closeModal}>Cancel</Btn><Btn variant="primary" onClick={handleChangePassword}>Update</Btn></>}>
                <FormGrid>
                    <FormItem full><Input label="Current Password" type="password" value={passwordData.current_password} onChange={e => setPasswordData(p => ({ ...p, current_password: e.target.value }))} /></FormItem>
                    <FormItem full><Input label="New Password" type="password" value={passwordData.new_password} onChange={e => setPasswordData(p => ({ ...p, new_password: e.target.value }))} /></FormItem>
                    <FormItem full><Input label="Confirm Password" type="password" value={passwordData.confirm_password} onChange={e => setPasswordData(p => ({ ...p, confirm_password: e.target.value }))} /></FormItem>
                </FormGrid>
            </Modal>

            {/* Delete Account */}
            <Modal open={modal === 'delete'} onClose={closeModal} title="Delete Account"
                footer={<><Btn variant="secondary" onClick={closeModal}>Cancel</Btn><Btn variant="danger" onClick={handleDeleteAccount}>Delete</Btn></>}>
                <div style={{ background: '#fee2e2', borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: 13, color: '#dc2626', fontWeight: 500 }}>
                    ⚠️ This action is irreversible. All data will be permanently deleted.
                </div>
                <Input label="Enter password to confirm" type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} />
            </Modal>

            {/* Add Shop */}
            <Modal open={modal === 'shop'} onClose={closeModal} title="Add New Shop"
                footer={<><Btn variant="secondary" onClick={closeModal}>Cancel</Btn><Btn variant="primary" onClick={handleCreateShop} disabled={!shopLocationVerified}>Create Shop</Btn></>}>
                <FormGrid>
                    <FormItem full><Input label="Business Name *" value={shopForm.business_name} onChange={e => setShopForm(p => ({ ...p, business_name: e.target.value }))} /></FormItem>
                    <FormItem full>
                        <SelectField label="Category *" value={shopForm.category} onChange={e => setShopForm(p => ({ ...p, category: e.target.value, keywords: [] }))}
                            options={[{ value: '', label: 'Select Category' }, ...shopCategories.map(c => ({ value: c.name, label: c.name }))]} />
                    </FormItem>
                    {selectedCategoryItems.length > 0 && (
                        <FormItem full>
                            <FieldLabel>Key Items</FieldLabel>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                                {selectedCategoryItems.map(item => (
                                    <span key={item.id} onClick={() => { if (!shopForm.keywords.includes(item.item_name)) setShopForm(p => ({ ...p, keywords: [...p.keywords, item.item_name] })); }}
                                        style={{ padding: '5px 12px', borderRadius: 99, border: `1.5px solid ${shopForm.keywords.includes(item.item_name) ? '#325fec' : '#e5e7eb'}`, background: shopForm.keywords.includes(item.item_name) ? '#e8f0fe' : '#f9fafb', color: shopForm.keywords.includes(item.item_name) ? '#325fec' : '#374151', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                                        {item.item_name}
                                    </span>
                                ))}
                            </div>
                        </FormItem>
                    )}
                    <FormItem half><Input label="Additional Phone" value={shopForm.additional_phone} onChange={e => setShopForm(p => ({ ...p, additional_phone: e.target.value }))} /></FormItem>
                    <FormItem full><Textarea label="Description" value={shopForm.description} onChange={e => setShopForm(p => ({ ...p, description: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Opening Time" type="time" value={shopForm.opening_time} onChange={e => setShopForm(p => ({ ...p, opening_time: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Closing Time" type="time" value={shopForm.closing_time} onChange={e => setShopForm(p => ({ ...p, closing_time: e.target.value }))} /></FormItem>
                    <FormItem full>
                        <div style={{ height: 1, background: '#f3f4f6', margin: '4px 0 12px' }} />
                        <FieldLabel>Location</FieldLabel>
                        <Btn variant="ghost" onClick={() => getCurrentLocation(setShopForm)} loading={locating} fullWidth icon="📍" size="sm">
                            {locating ? 'Detecting...' : 'Get Current Location'}
                        </Btn>
                    </FormItem>
                    <FormItem half><Input label="Latitude" value={shopForm.latitude} readOnly style={{ background: '#f9fafb', color: '#6b7280' }} /></FormItem>
                    <FormItem half><Input label="Longitude" value={shopForm.longitude} readOnly style={{ background: '#f9fafb', color: '#6b7280' }} /></FormItem>
                    <FormItem half>
                        <SelectField label="City *" value={shopForm.city} onChange={e => setShopForm(p => ({ ...p, city: e.target.value, area: '' }))}
                            options={[{ value: '', label: 'Select City' }, ...cities.map(c => ({ value: c.name, label: c.name }))]} />
                    </FormItem>
                    <FormItem half>
                        <SelectField label="Area" value={shopForm.area} onChange={e => setShopForm(p => ({ ...p, area: e.target.value }))}
                            options={[{ value: '', label: 'Select Area' }, ...shopAreas.map(a => ({ value: a.area, label: a.area }))]} />
                    </FormItem>
                    <FormItem half><Input label="State *" value={shopForm.state} onChange={e => setShopForm(p => ({ ...p, state: e.target.value }))} /></FormItem>
                    <FormItem half>
                        <Btn variant={shopLocationVerified ? 'success' : 'primary'} size="sm" onClick={verifyShopLoc} loading={shopVerifying} fullWidth>
                            {shopVerifying ? 'Verifying...' : shopLocationVerified ? '✓ Verified' : 'Verify Location'}
                        </Btn>
                    </FormItem>
                    <FormItem full>
                        <div style={{ height: 1, background: '#f3f4f6', margin: '4px 0 12px' }} />
                        <FieldLabel>Shop Image</FieldLabel>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', border: '1.5px dashed #d1d5db', borderRadius: 10, cursor: 'pointer', color: '#6b7280', fontSize: 14, fontWeight: 500 }}>
                            📷 Upload Image
                            <input type="file" accept="image/*" hidden onChange={async e => { const f = e.target.files[0]; if (!f) return; const b = await b64(f); setShopForm(p => ({ ...p, shop_image_base64: b, shop_image_preview: URL.createObjectURL(f) })); }} />
                        </label>
                        {shopForm.shop_image_preview && <img src={shopForm.shop_image_preview} alt="" style={{ marginTop: 10, width: '100%', height: 120, objectFit: 'cover', borderRadius: 10 }} />}
                    </FormItem>
                </FormGrid>
            </Modal>

            {/* Add House */}
            <Modal open={modal === 'house'} onClose={closeModal} title="Add New House"
                footer={<><Btn variant="secondary" onClick={closeModal}>Cancel</Btn><Btn variant="primary" onClick={handleCreateHouse} disabled={!houseLocationVerified}>List House</Btn></>}>
                <FormGrid>
                    <FormItem half><Input label="Rooms *" type="number" value={houseForm.rooms} onChange={e => setHouseForm(p => ({ ...p, rooms: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Halls *" type="number" value={houseForm.halls} onChange={e => setHouseForm(p => ({ ...p, halls: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Kitchens *" type="number" value={houseForm.kitchens} onChange={e => setHouseForm(p => ({ ...p, kitchens: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Floor *" type="number" value={houseForm.floor} onChange={e => setHouseForm(p => ({ ...p, floor: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Rent/Month (₹) *" type="number" value={houseForm.rent_per_month} onChange={e => setHouseForm(p => ({ ...p, rent_per_month: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Advance (₹)" type="number" value={houseForm.advance_amount} onChange={e => setHouseForm(p => ({ ...p, advance_amount: e.target.value }))} /></FormItem>
                    <FormItem full><Textarea label="Description" value={houseForm.description} onChange={e => setHouseForm(p => ({ ...p, description: e.target.value }))} /></FormItem>
                    <FormItem full><Toggle checked={houseForm.is_available} onChange={v => setHouseForm(p => ({ ...p, is_available: v }))} label="Available for Rent" /></FormItem>
                    <FormItem full>
                        <div style={{ height: 1, background: '#f3f4f6', margin: '8px 0 12px' }} />
                        <FieldLabel>Location</FieldLabel>
                        <Btn variant="ghost" onClick={() => getCurrentLocation(setHouseForm)} loading={locating} fullWidth icon="📍" size="sm">
                            {locating ? 'Detecting...' : 'Get Current Location'}
                        </Btn>
                    </FormItem>
                    <FormItem half><Input label="Latitude" value={houseForm.latitude} readOnly style={{ background: '#f9fafb', color: '#6b7280' }} /></FormItem>
                    <FormItem half><Input label="Longitude" value={houseForm.longitude} readOnly style={{ background: '#f9fafb', color: '#6b7280' }} /></FormItem>
                    <FormItem half>
                        <SelectField label="City *" value={houseForm.city} onChange={e => setHouseForm(p => ({ ...p, city: e.target.value, area: '' }))}
                            options={[{ value: '', label: 'Select City' }, ...cities.map(c => ({ value: c.name, label: c.name }))]} />
                    </FormItem>
                    <FormItem half>
                        <SelectField label="Area" value={houseForm.area} onChange={e => setHouseForm(p => ({ ...p, area: e.target.value }))}
                            options={[{ value: '', label: 'Select Area' }, ...houseAreas.map(a => ({ value: a.area, label: a.area }))]} />
                    </FormItem>
                    <FormItem half><Input label="State *" value={houseForm.state} onChange={e => setHouseForm(p => ({ ...p, state: e.target.value }))} /></FormItem>
                    <FormItem half>
                        <Btn variant={houseLocationVerified ? 'success' : 'primary'} size="sm" onClick={verifyHouseLoc} loading={houseVerifying} fullWidth>
                            {houseVerifying ? 'Verifying...' : houseLocationVerified ? '✓ Verified' : 'Verify Location'}
                        </Btn>
                    </FormItem>
                    <FormItem full>
                        <div style={{ height: 1, background: '#f3f4f6', margin: '4px 0 12px' }} />
                        <FieldLabel>House Image</FieldLabel>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', border: '1.5px dashed #d1d5db', borderRadius: 10, cursor: 'pointer', color: '#6b7280', fontSize: 14, fontWeight: 500 }}>
                            🏠 Upload Image
                            <input type="file" accept="image/*" hidden onChange={async e => { const f = e.target.files[0]; if (!f) return; const b = await b64(f); setHouseForm(p => ({ ...p, house_image_base64: b, house_image_preview: URL.createObjectURL(f) })); }} />
                        </label>
                        {houseForm.house_image_preview && <img src={houseForm.house_image_preview} alt="" style={{ marginTop: 10, width: '100%', height: 120, objectFit: 'cover', borderRadius: 10 }} />}
                    </FormItem>
                </FormGrid>
            </Modal>

            {/* Post Job */}
            <Modal open={modal === 'job'} onClose={closeModal} title="Post a Job"
                footer={<><Btn variant="secondary" onClick={closeModal}>Cancel</Btn><Btn variant="primary" onClick={handleCreateJob}>Post Job</Btn></>}>
                <FormGrid>
                    <FormItem full>
                        <SelectField label="Link to Shop (Optional)" value={jobForm.shop_id} onChange={e => handleShopSelect(e.target.value)}
                            options={[{ value: '', label: '-- No Shop --' }, ...userShopsForJob.map(s => ({ value: s.id, label: `${s.business_name} - ${s.city}` }))]} />
                    </FormItem>
                    <FormItem half><Input label="Company Name *" value={jobForm.company_name} onChange={e => setJobForm(p => ({ ...p, company_name: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Job Title *" value={jobForm.job_title} onChange={e => setJobForm(p => ({ ...p, job_title: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Salary *" type="number" value={jobForm.salary} onChange={e => setJobForm(p => ({ ...p, salary: e.target.value }))} /></FormItem>
                    <FormItem half>
                        <SelectField label="Salary Type" value={jobForm.salary_type} onChange={e => setJobForm(p => ({ ...p, salary_type: e.target.value }))}
                            options={[{ value: 'month', label: 'Per Month' }, { value: 'day', label: 'Per Day' }]} />
                    </FormItem>
                    <FormItem half>
                        <SelectField label="Job Type" value={jobForm.job_type} onChange={e => setJobForm(p => ({ ...p, job_type: e.target.value }))}
                            options={[{ value: 'full_time', label: 'Full Time' }, { value: 'part_time', label: 'Part Time' }]} />
                    </FormItem>
                    <FormItem full><Textarea label="Qualification Required" value={jobForm.qualification} onChange={e => setJobForm(p => ({ ...p, qualification: e.target.value }))} /></FormItem>
                    <FormItem full><Toggle checked={jobForm.is_open} onChange={v => setJobForm(p => ({ ...p, is_open: v }))} label="Job Position is Open" /></FormItem>
                    <FormItem half>
                        <SelectField label="City *" value={jobForm.city} onChange={e => setJobForm(p => ({ ...p, city: e.target.value, area: '' }))} disabled={!!jobForm.shop_id}
                            options={[{ value: '', label: 'Select City' }, ...cities.map(c => ({ value: c.name, label: c.name }))]} />
                    </FormItem>
                    <FormItem half>
                        <SelectField label="Area" value={jobForm.area} onChange={e => setJobForm(p => ({ ...p, area: e.target.value }))} disabled={!jobForm.city || !!jobForm.shop_id}
                            options={[{ value: '', label: 'Select Area' }, ...jobAreas.map(a => ({ value: a.area, label: a.area }))]} />
                    </FormItem>
                    <FormItem half><Input label="State *" value={jobForm.state} onChange={e => setJobForm(p => ({ ...p, state: e.target.value }))} disabled={!!jobForm.shop_id} /></FormItem>
                </FormGrid>
            </Modal>

            {/* Edit House */}
            <Modal open={modal === 'editHouse'} onClose={closeModal} title="Edit House"
                footer={<><Btn variant="secondary" onClick={closeModal}>Cancel</Btn><Btn variant="primary" onClick={handleUpdateHouse}>Save Changes</Btn></>}>
                <FormGrid>
                    <FormItem half><Input label="Rooms *" type="number" value={houseForm.rooms} onChange={e => setHouseForm(p => ({ ...p, rooms: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Halls *" type="number" value={houseForm.halls} onChange={e => setHouseForm(p => ({ ...p, halls: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Kitchens *" type="number" value={houseForm.kitchens} onChange={e => setHouseForm(p => ({ ...p, kitchens: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Floor *" type="number" value={houseForm.floor} onChange={e => setHouseForm(p => ({ ...p, floor: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Rent/Month (₹) *" type="number" value={houseForm.rent_per_month} onChange={e => setHouseForm(p => ({ ...p, rent_per_month: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Advance (₹)" type="number" value={houseForm.advance_amount} onChange={e => setHouseForm(p => ({ ...p, advance_amount: e.target.value }))} /></FormItem>
                    <FormItem full><Textarea label="Description" value={houseForm.description} onChange={e => setHouseForm(p => ({ ...p, description: e.target.value }))} /></FormItem>
                    <FormItem full><Toggle checked={houseForm.is_available} onChange={v => setHouseForm(p => ({ ...p, is_available: v }))} label="Available for Rent" /></FormItem>
                    <FormItem full>
                        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Location: {houseForm.area}, {houseForm.city}, {houseForm.state}</div>
                    </FormItem>
                </FormGrid>
            </Modal>

            {/* Edit Job */}
            <Modal open={modal === 'editJob'} onClose={closeModal} title="Edit Job"
                footer={<><Btn variant="secondary" onClick={closeModal}>Cancel</Btn><Btn variant="primary" onClick={handleUpdateJob}>Save Changes</Btn></>}>
                <FormGrid>
                    <FormItem half><Input label="Job Title *" value={jobForm.job_title} onChange={e => setJobForm(p => ({ ...p, job_title: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Company Name *" value={jobForm.company_name} onChange={e => setJobForm(p => ({ ...p, company_name: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Salary *" type="number" value={jobForm.salary} onChange={e => setJobForm(p => ({ ...p, salary: e.target.value }))} /></FormItem>
                    <FormItem half>
                        <SelectField label="Salary Type" value={jobForm.salary_type} onChange={e => setJobForm(p => ({ ...p, salary_type: e.target.value }))}
                            options={[{ value: 'month', label: 'Per Month' }, { value: 'day', label: 'Per Day' }]} />
                    </FormItem>
                    <FormItem half>
                        <SelectField label="Job Type" value={jobForm.job_type} onChange={e => setJobForm(p => ({ ...p, job_type: e.target.value }))}
                            options={[{ value: 'full_time', label: 'Full Time' }, { value: 'part_time', label: 'Part Time' }]} />
                    </FormItem>
                    <FormItem full><Textarea label="Qualification" value={jobForm.qualification} onChange={e => setJobForm(p => ({ ...p, qualification: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Area" value={jobForm.area} onChange={e => setJobForm(p => ({ ...p, area: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="City" value={jobForm.city} onChange={e => setJobForm(p => ({ ...p, city: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="State" value={jobForm.state} onChange={e => setJobForm(p => ({ ...p, state: e.target.value }))} /></FormItem>
                    <FormItem full><Toggle checked={jobForm.is_open} onChange={v => setJobForm(p => ({ ...p, is_open: v }))} label="Job Position is Open" /></FormItem>
                </FormGrid>
            </Modal>
        </div>
    );
}

/* Empty state */
const Empty = ({ label }) => (
    <div style={{ textAlign: 'center', padding: '28px 16px', color: '#9ca3af', fontSize: 14, fontWeight: 500 }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
        {label}
    </div>
);