// app/user/Profile.jsx - Mobile UI matching the provided design image
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
   GLOBAL STYLES
───────────────────────────────────────────── */
const GLOBAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --blue: #3366FF;
    --blue-light: #EEF2FF;
    --green: #22C55E;
    --green-light: #DCFCE7;
    --orange: #F97316;
    --orange-light: #FFF7ED;
    --red: #EF4444;
    --red-light: #FEE2E2;
    --purple: #8B5CF6;
    --purple-light: #EDE9FE;
    --border: #E5E7EB;
    --text: #111827;
    --text-2: #6B7280;
    --text-3: #9CA3AF;
    --bg: #F5F6FA;
    --card: #FFFFFF;
    --font: 'Inter', sans-serif;
  }

  body { font-family: var(--font); background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }
  input, select, textarea, button { font-family: var(--font); }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 99px; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes sheetUp {
    from { transform: translateY(100%); }
    to   { transform: translateY(0); }
  }
`;

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
        } catch { }
        try {
            const r2 = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
            const d2 = await r2.json();
            return { city: d2.city || d2.locality || null, area: d2.locality || null, state: d2.principalSubdivision || null };
        } catch { return null; }
    }
}
const locationService = new LocationService();

/* ─────────────────────────────────────────────
   PRIMITIVES
───────────────────────────────────────────── */
const Spinner = ({ size = 18, color = '#fff' }) => (
    <span style={{
        display: 'inline-block', width: size, height: size,
        border: `2px solid ${color}30`, borderTop: `2px solid ${color}`,
        borderRadius: '50%', animation: 'spin .7s linear infinite', flexShrink: 0
    }} />
);

const FieldLabel = ({ children }) => (
    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.5px' }}>
        {children}
    </label>
);

const Input = ({ label, style = {}, wrapStyle = {}, ...props }) => (
    <div style={{ ...wrapStyle }}>
        {label && <FieldLabel>{label}</FieldLabel>}
        <input
            {...props}
            style={{
                width: '100%', padding: '11px 14px',
                border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14,
                color: '#111827', background: '#FAFAFA', outline: 'none',
                transition: 'border-color .15s', ...style
            }}
            onFocus={e => e.target.style.borderColor = '#3366FF'}
            onBlur={e => e.target.style.borderColor = '#E5E7EB'}
        />
    </div>
);

const Textarea = ({ label, wrapStyle = {}, ...props }) => (
    <div style={{ ...wrapStyle }}>
        {label && <FieldLabel>{label}</FieldLabel>}
        <textarea
            {...props} rows={3}
            style={{
                width: '100%', padding: '11px 14px',
                border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14,
                color: '#111827', background: '#FAFAFA', outline: 'none', resize: 'vertical',
                transition: 'border-color .15s'
            }}
            onFocus={e => e.target.style.borderColor = '#3366FF'}
            onBlur={e => e.target.style.borderColor = '#E5E7EB'}
        />
    </div>
);

const SelectField = ({ label, options = [], wrapStyle = {}, ...props }) => (
    <div style={{ ...wrapStyle }}>
        {label && <FieldLabel>{label}</FieldLabel>}
        <select
            {...props}
            style={{
                width: '100%', padding: '11px 14px',
                border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14,
                color: '#111827', background: '#FAFAFA', outline: 'none', appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat', backgroundPosition: 'calc(100% - 12px) center', paddingRight: 36
            }}
        >
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
    </div>
);

const Btn = ({ children, onClick, variant = 'primary', size = 'md', loading, disabled, style = {}, icon, fullWidth }) => {
    const base = {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: 6, borderRadius: 10, border: 'none',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        fontWeight: 600, fontFamily: 'var(--font)', transition: 'all .15s',
        opacity: disabled ? .5 : 1, width: fullWidth ? '100%' : undefined, whiteSpace: 'nowrap',
    };
    const sizes = { sm: { padding: '8px 16px', fontSize: 13 }, md: { padding: '12px 20px', fontSize: 14 }, lg: { padding: '14px 26px', fontSize: 15 } };
    const variants = {
        primary:   { background: '#3366FF', color: '#fff' },
        secondary: { background: '#F3F4F6', color: '#374151', border: '1.5px solid #E5E7EB' },
        danger:    { background: '#FEE2E2', color: '#EF4444' },
        ghost:     { background: 'transparent', color: '#3366FF', border: '1.5px solid #3366FF' },
        success:   { background: '#DCFCE7', color: '#16A34A' },
        green:     { background: '#22C55E', color: '#fff' },
        purple:    { background: '#8B5CF6', color: '#fff' },
        orange:    { background: '#F97316', color: '#fff' },
    };
    return (
        <button onClick={!disabled && !loading ? onClick : undefined} style={{ ...base, ...sizes[size], ...variants[variant], ...style }}>
            {loading ? <Spinner size={14} color={variant === 'secondary' ? '#374151' : '#fff'} /> : icon}
            {children}
        </button>
    );
};

const Toggle = ({ checked, onChange, label }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
        <div onClick={() => onChange(!checked)} style={{ width: 44, height: 24, borderRadius: 99, background: checked ? '#3366FF' : '#D1D5DB', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: 3, left: checked ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.2)', transition: 'left .2s' }} />
        </div>
        {label && <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>{label}</span>}
    </label>
);

/* ─────────────────────────────────────────────
   MODAL (bottom sheet)
───────────────────────────────────────────── */
const Modal = ({ open, onClose, title, children, footer }) => {
    if (!open) return null;
    return (
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(3px)' }}>
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 430, margin: '0 auto', maxHeight: '92vh', background: '#fff', borderRadius: '22px 22px 0 0', display: 'flex', flexDirection: 'column', animation: 'sheetUp .28s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 14px', borderBottom: '1px solid #F3F4F6' }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{title}</span>
                    <button onClick={onClose} style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#6B7280' }}>✕</button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>{children}</div>
                {footer && (
                    <div style={{ padding: '14px 20px', borderTop: '1px solid #F3F4F6', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
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
const Toast = ({ msg, type = 'success' }) => {
    if (!msg) return null;
    const c = { success: { bg: '#DCFCE7', color: '#16A34A' }, error: { bg: '#FEE2E2', color: '#EF4444' } };
    return (
        <div style={{ position: 'fixed', top: 16, left: 0, right: 0, zIndex: 2000, display: 'flex', justifyContent: 'center', padding: '0 16px', animation: 'fadeUp .25s ease', pointerEvents: 'none' }}>
            <div style={{ background: c[type].bg, color: c[type].color, padding: '12px 20px', borderRadius: 12, fontWeight: 600, fontSize: 14, boxShadow: '0 4px 20px rgba(0,0,0,.12)', maxWidth: 360 }}>
                {msg}
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   FORM HELPERS
───────────────────────────────────────────── */
const FormGrid = ({ children }) => <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>{children}</div>;
const FormItem = ({ half, full, children }) => (
    <div style={{ flex: full ? '1 1 100%' : '1 1 calc(50% - 6px)', minWidth: half ? 130 : '100%' }}>{children}</div>
);

/* ─────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────── */
const Empty = ({ label }) => (
    <div style={{ textAlign: 'center', padding: '32px 16px', color: '#9CA3AF', fontSize: 14, fontWeight: 500 }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
        {label}
    </div>
);

/* ─────────────────────────────────────────────
   STAT PILL (top row of profile)
───────────────────────────────────────────── */
const StatPill = ({ icon, iconBg, iconColor, count, label }) => (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, color: iconColor }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.1, color: '#111827' }}>{count}</div>
            <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>{label}</div>
        </div>
    </div>
);

/* ─────────────────────────────────────────────
   MANAGE LISTING ROW
───────────────────────────────────────────── */
const ManageRow = ({ icon, iconBg, iconColor, title, subtitle, badgeCount, badgeLabel, onAdd, addLabel, verified, unverified, onClick }) => (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: 12 }}>
        {/* Header */}
        <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', cursor: onClick ? 'pointer' : 'default' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, color: iconColor }}>
                {icon}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{title}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>{subtitle}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: '#EEF2FF', color: '#3366FF', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 99 }}>
                    {badgeCount} {badgeLabel}
                </span>
                <span style={{ color: '#9CA3AF', fontSize: 18 }}>›</span>
            </div>
        </div>
        {/* Sub row */}
        <div style={{ borderTop: '1px solid #F3F4F6', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
                <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>{verified ?? 0} Verified</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F97316', display: 'inline-block' }} />
                <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>{unverified ?? 0} Unverified</span>
            </div>
            <div style={{ flex: 1 }} />
            <button onClick={onAdd} style={{ background: 'none', border: 'none', color: '#3366FF', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> {addLabel}
            </button>
        </div>
    </div>
);

/* ─────────────────────────────────────────────
   OTHER DETAIL ROW
───────────────────────────────────────────── */
const DetailRow = ({ icon, label, value, onClick, last }) => (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 0', borderBottom: last ? 'none' : '1px solid #F3F4F6', cursor: onClick ? 'pointer' : 'default' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F5F6FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
            {icon}
        </div>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: '#111827' }}>{label}</span>
        {value && <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{value}</span>}
        <span style={{ color: '#C4C9D4', fontSize: 18 }}>›</span>
    </div>
);

/* ─────────────────────────────────────────────
   BOTTOM NAV
───────────────────────────────────────────── */
const NavItem = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} style={{ flex: 1, padding: '10px 0 12px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, fontFamily: 'var(--font)' }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, color: active ? '#3366FF' : '#9CA3AF' }}>{label}</span>
    </button>
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
    const [toast, setToast] = useState({ msg: '', type: 'success' });
    const [cities, setCities] = useState([]);
    const [shopAreas, setShopAreas] = useState([]);
    const [houseAreas, setHouseAreas] = useState([]);
    const [jobAreas, setJobAreas] = useState([]);
    const [shopCategories, setShopCategories] = useState([]);
    const [selectedCategoryItems, setSelectedCategoryItems] = useState([]);

    const [modal, setModal] = useState('');
    const [editingHouse, setEditingHouse] = useState(null);
    const [editingJob, setEditingJob] = useState(null);
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

    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast({ msg: '', type: 'success' }), 3500); };
    const closeModal = () => setModal('');
    const formatPrice = p => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);
    const b64 = file => new Promise((res, rej) => { const r = new FileReader(); r.readAsDataURL(file); r.onload = () => res(r.result); r.onerror = rej; });

    useEffect(() => { loadProfile(); loadCities(); loadCategories(); loadUserShopsForJob(); }, []);
    useEffect(() => { if (shopForm.city) loadAreasFor(shopForm.city, setShopAreas); else setShopAreas([]); }, [shopForm.city]);
    useEffect(() => { if (houseForm.city) loadAreasFor(houseForm.city, setHouseAreas); else setHouseAreas([]); }, [houseForm.city]);
    useEffect(() => { if (jobForm.city) loadAreasFor(jobForm.city, setJobAreas); else setJobAreas([]); }, [jobForm.city]);
    useEffect(() => {
        if (shopForm.category) { const cat = shopCategories.find(c => c.name === shopForm.category); setSelectedCategoryItems(cat?.key_items || []); }
        else setSelectedCategoryItems([]);
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
        try { await updateJob(editingJob.id, { ...jobForm, salary: +jobForm.salary }); showToast('Job updated!'); closeModal(); loadProfile(); }
        catch (e) { showToast(e.message, 'error'); }
    };
    const openEditHouse = (h) => {
        setEditingHouse(h);
        setHouseForm({ rooms: h.rooms, halls: h.halls, kitchens: h.kitchens, floor: h.floor, rent_per_month: h.rent_per_month, advance_amount: h.advance_amount || '', latitude: h.latitude || '', longitude: h.longitude || '', area: h.area || '', city: h.city || '', state: h.state || '', description: h.description || '', is_available: h.is_available, house_image_base64: null, house_image_preview: '' });
        setModal('editHouse');
    };
    const openEditJob = (j) => {
        setEditingJob(j);
        setJobForm({ shop_id: j.shop_id || '', company_name: j.company_name, job_title: j.job_title, salary: j.salary, salary_type: j.salary_type, qualification: j.qualification || '', job_type: j.job_type, area: j.area || '', city: j.city || '', state: j.state || '', is_open: j.is_open });
        setModal('editJob');
    };
    const handleShopSelect = (id) => {
        const s = userShopsForJob.find(x => x.id === id);
        setJobForm(p => ({ ...p, shop_id: id, company_name: s ? s.business_name : '', area: s?.area || '', city: s?.city || '', state: s?.state || '' }));
    };

    // Derived counts
    const shopVerified = shops.filter(s => s.is_verified).length;
    const shopUnverified = shops.length - shopVerified;
    const houseVerifiedCount = houses.filter(h => h.is_verified).length;
    const houseUnverifiedCount = houses.length - houseVerifiedCount;
    const jobVerifiedCount = jobs.filter(j => j.is_verified).length;
    const jobUnverifiedCount = jobs.length - jobVerifiedCount;
    const totalListings = shops.length + houses.length + jobs.length;
    const totalViews = (profile?.total_views || 0);

    if (loading) {
        return (
            <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F6FA' }}>
                <Spinner size={34} color="#3366FF" />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 430, margin: '0 auto', minHeight: '100dvh', background: '#F5F6FA', fontFamily: 'var(--font)', paddingBottom: 90 }}>
            <Toast msg={toast.msg} type={toast.type} />

            {/* ── Top Bar ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px', background: '#fff', borderBottom: '1px solid #F3F4F6' }}>
                <span style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>My Profile</span>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {/* Bell */}
                    <div style={{ position: 'relative' }}>
                        <button style={{ width: 38, height: 38, borderRadius: '50%', background: '#F5F6FA', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer' }}>🔔</button>
                        <span style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, background: '#EF4444', borderRadius: '50%', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', fontWeight: 700 }}>3</span>
                    </div>
                    {/* Settings */}
                    <button style={{ width: 38, height: 38, borderRadius: '50%', background: '#F5F6FA', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer' }}>⚙️</button>
                </div>
            </div>

            {/* ── Profile Card ── */}
            <div style={{ background: '#fff', margin: '12px 16px', borderRadius: 16, border: '1px solid #E5E7EB', padding: '18px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    {/* Avatar */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#3366FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#fff', overflow: 'hidden', border: '3px solid #EEF2FF' }}>
                            {profile?.avatar
                                ? <img src={profile.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : (profile?.full_name?.charAt(0) || 'U')}
                        </div>
                        <button style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: '50%', background: '#3366FF', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 11, color: '#fff' }}>📷</button>
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{profile?.full_name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6B7280', marginBottom: 3 }}>
                            <span>📞</span> <span>{profile?.phone}</span>
                        </div>
                        {profile?.email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6B7280', marginBottom: 3 }}>
                                <span>✉️</span> <span>{profile.email}</span>
                            </div>
                        )}
                        {(profile?.city || profile?.state) && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6B7280' }}>
                                <span>📍</span> <span>{[profile.city, profile.state].filter(Boolean).join(', ')}</span>
                            </div>
                        )}
                    </div>
                    {/* Edit btn */}
                    <button
                        onClick={() => { setFormData({ full_name: profile?.full_name || '', area: profile?.area || '', city: profile?.city || '', state: profile?.state || '' }); setModal('editProfile'); }}
                        style={{ background: '#EEF2FF', border: 'none', borderRadius: 10, padding: '8px 14px', color: '#3366FF', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', flexShrink: 0 }}
                    >
                        Edit Profile
                    </button>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: '#F3F4F6', margin: '16px 0' }} />

                {/* Stats row */}
                <div style={{ display: 'flex', gap: 0 }}>
                    <StatPill icon="🗂️" iconBg="#EEF2FF" iconColor="#3366FF" count={totalListings} label="Total Listings" />
                    <div style={{ width: 1, background: '#F3F4F6', margin: '0 4px' }} />
                    <StatPill icon="👁️" iconBg="#EDE9FE" iconColor="#8B5CF6" count={totalViews >= 1000 ? (totalViews / 1000).toFixed(1) + 'K' : totalViews} label="Total Views" />
                </div>
            </div>

            {/* ── Manage Your Listings ── */}
            <div style={{ padding: '4px 16px 2px' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Manage Your Listings</div>

                <ManageRow
                    icon="🏪" iconBg="#EEF2FF" iconColor="#3366FF"
                    title="Manage Shops" subtitle="Add, edit or manage your shop listings"
                    badgeCount={shops.length} badgeLabel="Active"
                    verified={shopVerified} unverified={shopUnverified}
                    onAdd={() => setModal('shop')} addLabel="Add Shop"
                />
                <ManageRow
                    icon="🏠" iconBg="#DCFCE7" iconColor="#22C55E"
                    title="Manage Houses" subtitle="Add, edit or manage your house listings"
                    badgeCount={houses.length} badgeLabel="Active"
                    verified={houseVerifiedCount} unverified={houseUnverifiedCount}
                    onAdd={() => setModal('house')} addLabel="Add House"
                />
                <ManageRow
                    icon="💼" iconBg="#FFF7ED" iconColor="#F97316"
                    title="Manage Jobs" subtitle="Add, edit or manage your job listings"
                    badgeCount={jobs.length} badgeLabel="Active"
                    verified={jobVerifiedCount} unverified={jobUnverifiedCount}
                    onAdd={() => setModal('job')} addLabel="Add Job"
                />
            </div>

            {/* ── Other Details ── */}
            <div style={{ margin: '4px 16px 14px', background: '#fff', borderRadius: 16, padding: '4px 16px', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', padding: '14px 0 4px' }}>Other Details</div>
                <DetailRow icon="👛" label="My Wallet" value="₹2,450" onClick={() => {}} />
                <DetailRow icon="📋" label="My Bookings & Leads" onClick={() => {}} />
                <DetailRow icon="❤️" label="Saved Items" onClick={() => {}} />
                <DetailRow icon="⭐" label="Reviews" onClick={() => {}} />
                <DetailRow icon="🔒" label="Change Password" onClick={() => setModal('password')} />
                <DetailRow icon="🎧" label="Help & Support" onClick={() => {}} />
                <DetailRow icon="ℹ️" label="About NearZO" onClick={() => {}} last />
            </div>

            {/* ── Danger Zone ── */}
            <div style={{ margin: '0 16px 16px', background: '#fff', borderRadius: 16, padding: '4px 16px', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', padding: '14px 0 4px' }}>Account</div>
                <div onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 0', borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🚪</div>
                    <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: '#F97316' }}>Logout</span>
                </div>
                <div onClick={() => setModal('delete')} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 0', cursor: 'pointer' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚠️</div>
                    <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: '#EF4444' }}>Delete Account</span>
                </div>
            </div>

            {/* ── Bottom Nav ── */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1.5px solid #F3F4F6', display: 'flex', maxWidth: 430, margin: '0 auto', zIndex: 100 }}>
                <NavItem icon="🏠" label="Home" />
                <NavItem icon="🗺️" label="Map" />
                <NavItem icon="🏪" label="Shops" />
                <NavItem icon="🏡" label="House" />
                <NavItem icon="💼" label="Jobs" />
                <NavItem icon="👤" label="Profile" active />
            </div>

            {/* ════ MODALS ════ */}

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
                <div style={{ background: '#FEE2E2', borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: 13, color: '#EF4444', fontWeight: 500 }}>
                    ⚠️ This action is irreversible. All your data will be permanently deleted.
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
                                        style={{ padding: '5px 12px', borderRadius: 99, border: `1.5px solid ${shopForm.keywords.includes(item.item_name) ? '#3366FF' : '#E5E7EB'}`, background: shopForm.keywords.includes(item.item_name) ? '#EEF2FF' : '#F9FAFB', color: shopForm.keywords.includes(item.item_name) ? '#3366FF' : '#374151', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
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
                        <div style={{ height: 1, background: '#F3F4F6', margin: '4px 0 12px' }} />
                        <FieldLabel>Location</FieldLabel>
                        <Btn variant="ghost" onClick={() => getCurrentLocation(setShopForm)} loading={locating} fullWidth icon="📍" size="sm">
                            {locating ? 'Detecting...' : 'Get Current Location'}
                        </Btn>
                    </FormItem>
                    <FormItem half><Input label="Latitude" value={shopForm.latitude} readOnly style={{ background: '#F9FAFB', color: '#6B7280' }} /></FormItem>
                    <FormItem half><Input label="Longitude" value={shopForm.longitude} readOnly style={{ background: '#F9FAFB', color: '#6B7280' }} /></FormItem>
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
                        <div style={{ height: 1, background: '#F3F4F6', margin: '4px 0 12px' }} />
                        <FieldLabel>Shop Image</FieldLabel>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', border: '1.5px dashed #D1D5DB', borderRadius: 10, cursor: 'pointer', color: '#6B7280', fontSize: 14, fontWeight: 500 }}>
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
                    <FormItem half><Input label="Halls" type="number" value={houseForm.halls} onChange={e => setHouseForm(p => ({ ...p, halls: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Kitchens" type="number" value={houseForm.kitchens} onChange={e => setHouseForm(p => ({ ...p, kitchens: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Floor" type="number" value={houseForm.floor} onChange={e => setHouseForm(p => ({ ...p, floor: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Rent/Month (₹) *" type="number" value={houseForm.rent_per_month} onChange={e => setHouseForm(p => ({ ...p, rent_per_month: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Advance (₹)" type="number" value={houseForm.advance_amount} onChange={e => setHouseForm(p => ({ ...p, advance_amount: e.target.value }))} /></FormItem>
                    <FormItem full><Textarea label="Description" value={houseForm.description} onChange={e => setHouseForm(p => ({ ...p, description: e.target.value }))} /></FormItem>
                    <FormItem full><Toggle checked={houseForm.is_available} onChange={v => setHouseForm(p => ({ ...p, is_available: v }))} label="Available for Rent" /></FormItem>
                    <FormItem full>
                        <div style={{ height: 1, background: '#F3F4F6', margin: '8px 0 12px' }} />
                        <FieldLabel>Location</FieldLabel>
                        <Btn variant="ghost" onClick={() => getCurrentLocation(setHouseForm)} loading={locating} fullWidth icon="📍" size="sm">
                            {locating ? 'Detecting...' : 'Get Current Location'}
                        </Btn>
                    </FormItem>
                    <FormItem half><Input label="Latitude" value={houseForm.latitude} readOnly style={{ background: '#F9FAFB', color: '#6B7280' }} /></FormItem>
                    <FormItem half><Input label="Longitude" value={houseForm.longitude} readOnly style={{ background: '#F9FAFB', color: '#6B7280' }} /></FormItem>
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
                        <div style={{ height: 1, background: '#F3F4F6', margin: '4px 0 12px' }} />
                        <FieldLabel>House Image</FieldLabel>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', border: '1.5px dashed #D1D5DB', borderRadius: 10, cursor: 'pointer', color: '#6B7280', fontSize: 14, fontWeight: 500 }}>
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
                    <FormItem half><Input label="Halls" type="number" value={houseForm.halls} onChange={e => setHouseForm(p => ({ ...p, halls: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Kitchens" type="number" value={houseForm.kitchens} onChange={e => setHouseForm(p => ({ ...p, kitchens: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Floor" type="number" value={houseForm.floor} onChange={e => setHouseForm(p => ({ ...p, floor: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Rent/Month (₹) *" type="number" value={houseForm.rent_per_month} onChange={e => setHouseForm(p => ({ ...p, rent_per_month: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Advance (₹)" type="number" value={houseForm.advance_amount} onChange={e => setHouseForm(p => ({ ...p, advance_amount: e.target.value }))} /></FormItem>
                    <FormItem full><Textarea label="Description" value={houseForm.description} onChange={e => setHouseForm(p => ({ ...p, description: e.target.value }))} /></FormItem>
                    <FormItem full><Toggle checked={houseForm.is_available} onChange={v => setHouseForm(p => ({ ...p, is_available: v }))} label="Available for Rent" /></FormItem>
                    <FormItem full>
                        <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>Location: {houseForm.area}, {houseForm.city}, {houseForm.state}</div>
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