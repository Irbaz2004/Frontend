// app/user/Profile.jsx - Redesigned to match provided UI design
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
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  @import url('https://fonts.googleapis.com/icon?family=Material+Icons');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --blue: #2563EB;
    --blue-light: #EFF6FF;
    --blue-mid: #DBEAFE;
    --green: #16A34A;
    --green-light: #F0FDF4;
    --green-mid: #DCFCE7;
    --red: #DC2626;
    --red-light: #FEF2F2;
    --red-mid: #FEE2E2;
    --orange: #EA580C;
    --orange-light: #FFF7ED;
    --orange-mid: #FFEDD5;
    --purple: #7C3AED;
    --purple-light: #F5F3FF;
    --purple-mid: #EDE9FE;
    --yellow: #CA8A04;
    --yellow-light: #FEFCE8;
    --border: #E5E7EB;
    --border-light: #F3F4F6;
    --text: #111827;
    --text-2: #374151;
    --text-3: #6B7280;
    --text-4: #9CA3AF;
    --bg: #F9FAFB;
    --card: #FFFFFF;
    --radius: 16px;
    --font: 'Inter', sans-serif;
    --shadow-sm: 0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.04);
    --shadow: 0 4px 16px rgba(0,0,0,.08);
    --shadow-lg: 0 10px 40px rgba(0,0,0,.12);
  }

  html, body { font-family: var(--font); background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }

  input, select, textarea, button { font-family: var(--font); }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 99px; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes slideUp {
    from { transform: translateY(100%); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }

  .mi { font-family: 'Material Icons'; font-style: normal; font-weight: normal; font-size: 20px; line-height: 1; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; user-select: none; }
  .icon-btn { background: none; border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; padding: 8px; border-radius: 50%; transition: background .15s; }
  .icon-btn:hover { background: var(--border-light); }

  /* Responsive grid */
  @media (min-width: 768px) {
    .profile-layout { display: grid; grid-template-columns: 320px 1fr; gap: 24px; align-items: start; }
    .profile-sidebar { position: sticky; top: 24px; }
  }

  @media (min-width: 1200px) {
    .profile-layout { grid-template-columns: 340px 1fr; }
  }
`;

if (!document.getElementById('profile-styles-v2')) {
    const s = document.createElement('style');
    s.id = 'profile-styles-v2';
    s.textContent = GLOBAL_STYLE;
    document.head.appendChild(s);
}

/* ─────────────────────────────────────────────
   MATERIAL ICON
───────────────────────────────────────────── */
const Icon = ({ name, size = 20, color, style = {} }) => (
    <span className="mi" style={{ fontSize: size, color, ...style }}>{name}</span>
);

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
   PRIMITIVE COMPONENTS
───────────────────────────────────────────── */
const Spinner = ({ size = 18, color = '#fff' }) => (
    <span style={{
        display: 'inline-block', width: size, height: size,
        border: `2px solid ${color}30`, borderTop: `2px solid ${color}`,
        borderRadius: '50%', animation: 'spin .7s linear infinite', flexShrink: 0
    }} />
);

const Badge = ({ label, color = '#2563EB', bg = '#EFF6FF', dot }) => (
    <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '3px 10px', borderRadius: 99,
        fontSize: 11, fontWeight: 600, color, background: bg, whiteSpace: 'nowrap'
    }}>
        {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />}
        {label}
    </span>
);

const FieldLabel = ({ children }) => (
    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px' }}>
        {children}
    </label>
);

const Input = ({ label, style = {}, wrapStyle = {}, ...props }) => (
    <div style={{ ...wrapStyle }}>
        {label && <FieldLabel>{label}</FieldLabel>}
        <input
            {...props}
            style={{
                width: '100%', padding: '10px 14px',
                border: '1.5px solid #E5E7EB', borderRadius: 10,
                fontSize: 14, fontWeight: 400, color: '#111827',
                background: '#FAFAFA', outline: 'none',
                transition: 'border-color .15s, box-shadow .15s', ...style
            }}
            onFocus={e => { e.target.style.borderColor = '#2563EB'; e.target.style.boxShadow = '0 0 0 3px #DBEAFE'; }}
            onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
        />
    </div>
);

const Textarea = ({ label, wrapStyle = {}, ...props }) => (
    <div style={{ ...wrapStyle }}>
        {label && <FieldLabel>{label}</FieldLabel>}
        <textarea {...props} rows={3} style={{
            width: '100%', padding: '10px 14px',
            border: '1.5px solid #E5E7EB', borderRadius: 10,
            fontSize: 14, color: '#111827', background: '#FAFAFA',
            outline: 'none', resize: 'vertical', transition: 'border-color .15s'
        }}
            onFocus={e => { e.target.style.borderColor = '#2563EB'; }}
            onBlur={e => { e.target.style.borderColor = '#E5E7EB'; }}
        />
    </div>
);

const SelectField = ({ label, options = [], wrapStyle = {}, ...props }) => (
    <div style={{ ...wrapStyle }}>
        {label && <FieldLabel>{label}</FieldLabel>}
        <select {...props} style={{
            width: '100%', padding: '10px 14px',
            border: '1.5px solid #E5E7EB', borderRadius: 10,
            fontSize: 14, color: '#111827', background: '#FAFAFA',
            outline: 'none', appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat', backgroundPosition: 'calc(100% - 12px) center', paddingRight: 36
        }}>
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
    </div>
);

const Btn = ({ children, onClick, variant = 'primary', size = 'md', loading, disabled, style = {}, icon, fullWidth }) => {
    const base = {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        borderRadius: 10, border: 'none', cursor: disabled || loading ? 'not-allowed' : 'pointer',
        fontWeight: 600, fontFamily: 'var(--font)', transition: 'all .15s',
        opacity: disabled ? .55 : 1, width: fullWidth ? '100%' : undefined, whiteSpace: 'nowrap',
    };
    const sizes = {
        sm: { padding: '7px 14px', fontSize: 13 },
        md: { padding: '11px 20px', fontSize: 14 },
        lg: { padding: '14px 28px', fontSize: 15 },
    };
    const variants = {
        primary: { background: '#2563EB', color: '#fff' },
        secondary: { background: '#F3F4F6', color: '#374151', border: '1.5px solid #E5E7EB' },
        danger: { background: '#FEE2E2', color: '#DC2626' },
        ghost: { background: 'transparent', color: '#2563EB', border: '1.5px solid #2563EB' },
        success: { background: '#DCFCE7', color: '#16A34A' },
        green: { background: '#16A34A', color: '#fff' },
        orange: { background: '#EA580C', color: '#fff' },
        purple: { background: '#7C3AED', color: '#fff' },
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
        <div onClick={() => onChange(!checked)} style={{
            width: 44, height: 24, borderRadius: 99, background: checked ? '#2563EB' : '#D1D5DB',
            position: 'relative', transition: 'background .2s', flexShrink: 0
        }}>
            <div style={{
                position: 'absolute', top: 3, left: checked ? 23 : 3,
                width: 18, height: 18, borderRadius: '50%', background: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,.2)', transition: 'left .2s'
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
        <div onClick={onClose} style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'flex-end',
            backdropFilter: 'blur(2px)', animation: 'fadeIn .2s ease'
        }}>
            <div onClick={e => e.stopPropagation()} style={{
                width: '100%', maxWidth: 560, margin: '0 auto',
                maxHeight: '93vh', background: '#fff',
                borderRadius: '20px 20px 0 0', display: 'flex', flexDirection: 'column',
                animation: 'slideUp .25s ease'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 14px', borderBottom: '1px solid #F3F4F6' }}>
                    <span style={{ fontSize: 16, fontWeight: 700 }}>{title}</span>
                    <button onClick={onClose} style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="close" size={18} color="#374151" />
                    </button>
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
const Toast = ({ msg, type = 'success', onClose }) => {
    if (!msg) return null;
    const colors = { success: { bg: '#DCFCE7', color: '#16A34A' }, error: { bg: '#FEE2E2', color: '#DC2626' } };
    return (
        <div style={{ position: 'fixed', top: 16, left: 0, right: 0, zIndex: 2000, display: 'flex', justifyContent: 'center', padding: '0 16px', animation: 'fadeUp .25s ease', pointerEvents: 'none' }}>
            <div style={{ background: colors[type].bg, color: colors[type].color, padding: '12px 20px', borderRadius: 12, fontWeight: 600, fontSize: 14, boxShadow: '0 4px 20px rgba(0,0,0,.12)', maxWidth: 380 }}>
                {msg}
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   FORM GRID
───────────────────────────────────────────── */
const FormGrid = ({ children }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>{children}</div>
);
const FormItem = ({ half, full, children }) => (
    <div style={{ flex: full ? '1 1 100%' : '1 1 calc(50% - 7px)', minWidth: 180 }}>{children}</div>
);

/* ─────────────────────────────────────────────
   DETAIL ROW (settings-style)
───────────────────────────────────────────── */
const DetailRow = ({ iconName, iconColor = '#2563EB', iconBg = '#EFF6FF', label, rightText, onClick, danger, last }) => (
    <button onClick={onClick} style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 0', background: 'none', border: 'none', cursor: 'pointer',
        width: '100%', textAlign: 'left',
        borderBottom: last ? 'none' : '1px solid #F3F4F6',
        color: danger ? '#DC2626' : '#111827',
    }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: danger ? '#FEE2E2' : iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name={iconName} size={20} color={danger ? '#DC2626' : iconColor} />
        </div>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: danger ? '#DC2626' : '#111827' }}>{label}</span>
        {rightText && <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{rightText}</span>}
        <Icon name="chevron_right" size={20} color={danger ? '#DC2626' : '#9CA3AF'} />
    </button>
);

/* ─────────────────────────────────────────────
   STAT CARD (top row)
───────────────────────────────────────────── */
const StatCard = ({ iconName, count, label, iconColor, iconBg }) => (
    <div style={{ flex: '1 1 0', minWidth: 70, background: '#F8FAFF', borderRadius: 14, padding: '14px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, border: '1px solid #E8EFFE' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={iconName} size={20} color={iconColor} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{count ?? '—'}</div>
        <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 500, textAlign: 'center', lineHeight: 1.3 }}>{label}</div>
    </div>
);

/* ─────────────────────────────────────────────
   LISTING SECTION CARD
───────────────────────────────────────────── */
const ListingSection = ({ iconName, iconColor, iconBg, title, subtitle, badgeCount, badgeColor, badgeBg, onAdd, addLabel, liveCount, verifiedCount, unverifiedCount, onManage }) => (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        {/* Header row */}
        <button onClick={onManage} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid #F3F4F6', textAlign: 'left' }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={iconName} size={22} color={iconColor} />
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{title}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{subtitle}</div>
            </div>
            <Badge label={`${badgeCount} Active`} color={badgeColor} bg={badgeBg} />
            <Icon name="chevron_right" size={20} color="#9CA3AF" />
        </button>
        {/* Stats + Add row */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 18px', gap: 8 }}>
            <MiniStat iconName="check_circle" color="#2563EB" count={liveCount} label="Live" />
            <div style={{ width: 1, height: 28, background: '#E5E7EB' }} />
            <MiniStat iconName="verified" color="#16A34A" count={verifiedCount} label="Verified" />
            <div style={{ width: 1, height: 28, background: '#E5E7EB' }} />
            <MiniStat iconName="cancel" color="#DC2626" count={unverifiedCount} label="Unverified" />
            <div style={{ flex: 1 }} />
            <button onClick={onAdd} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '7px 14px', borderRadius: 8, border: '1.5px solid #2563EB',
                background: '#EFF6FF', color: '#2563EB', fontWeight: 600, fontSize: 13,
                cursor: 'pointer', fontFamily: 'var(--font)'
            }}>
                <Icon name="add" size={16} color="#2563EB" />
                {addLabel}
            </button>
        </div>
    </div>
);

const MiniStat = ({ iconName, color, count, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <Icon name={iconName} size={16} color={color} />
        <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{count ?? 0}</span>
        <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>{label}</span>
    </div>
);

/* ─────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────── */
const Empty = ({ label }) => (
    <div style={{ textAlign: 'center', padding: '32px 16px', color: '#9CA3AF', fontSize: 14, fontWeight: 500 }}>
        <Icon name="inbox" size={40} color="#D1D5DB" style={{ display: 'block', margin: '0 auto 10px' }} />
        {label}
    </div>
);

/* ─────────────────────────────────────────────
   AVATAR
───────────────────────────────────────────── */
const Avatar = ({ profile, size = 72, fontSize = 28 }) => (
    <div style={{ position: 'relative', display: 'inline-block' }}>
        <div style={{ width: size, height: size, borderRadius: '50%', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize, fontWeight: 700, color: '#fff', overflow: 'hidden', flexShrink: 0, border: '3px solid #fff', boxShadow: '0 2px 12px rgba(37,99,235,.25)' }}>
            {profile?.avatar
                ? <img src={profile.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (profile?.full_name?.charAt(0)?.toUpperCase() || 'U')}
        </div>
        <button style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: '#2563EB', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="photo_camera" size={13} color="#fff" />
        </button>
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

    /* Derived counts from live data */
    const shopLive = shops.length;
    const shopVerified = shops.filter(s => s.is_verified).length;
    const shopUnverified = shops.filter(s => !s.is_verified).length;

    const houseLive = houses.length;
    const houseVerified = houses.filter(h => h.is_verified).length;
    const houseUnverified = houses.filter(h => !h.is_verified).length;

    const jobLive = jobs.filter(j => j.is_open).length;
    const jobVerified = jobs.filter(j => j.is_verified).length;
    const jobUnverified = jobs.filter(j => !j.is_verified).length;

    const totalListings = shops.length + houses.length + jobs.length;

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
            <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB' }}>
                <Spinner size={36} color="#2563EB" />
            </div>
        );
    }

    /* ── RENDER ── */
    return (
        <div style={{ minHeight: '100dvh', background: '#F9FAFB', fontFamily: 'var(--font)' }}>
            <Toast msg={toast.msg} type={toast.type} />

            {/* ─── MAIN LAYOUT ─── */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 16px 100px' }}>
                <div className="profile-layout">

                    {/* ═══════════ SIDEBAR / LEFT COLUMN ═══════════ */}
                    <div className="profile-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {/* Profile Card */}
                        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', padding: '24px 20px 20px', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <Avatar profile={profile} size={72} fontSize={28} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {profile?.full_name}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6B7280', marginBottom: 3 }}>
                                        <Icon name="phone" size={14} color="#9CA3AF" />
                                        {profile?.phone}
                                    </div>
                                    {profile?.email && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6B7280', marginBottom: 3 }}>
                                            <Icon name="mail" size={14} color="#9CA3AF" />
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.email}</span>
                                        </div>
                                    )}
                                    {(profile?.city || profile?.area) && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6B7280' }}>
                                            <Icon name="location_on" size={14} color="#9CA3AF" />
                                            {[profile.area, profile.city, profile.state].filter(Boolean).join(', ')}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => { setFormData({ full_name: profile?.full_name || '', area: profile?.area || '', city: profile?.city || '', state: profile?.state || '' }); setModal('editProfile'); }}
                                style={{ marginTop: 16, width: '100%', padding: '9px', borderRadius: 10, border: '1.5px solid #E5E7EB', background: '#F9FAFB', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'var(--font)' }}
                            >
                                <Icon name="edit" size={15} color="#374151" />
                                Edit Profile
                            </button>
                        </div>

                        {/* Stats Row */}
                        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: '16px', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <StatCard iconName="store" count={totalListings} label="Total Listings" iconColor="#2563EB" iconBg="#DBEAFE" />
                                <StatCard iconName="visibility" count={profile?.total_views ?? 0} label="Total Views" iconColor="#7C3AED" iconBg="#EDE9FE" />
                            </div>
                        </div>

                        {/* Other Details */}
                        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: '6px 18px', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', padding: '12px 0 6px', textTransform: 'uppercase', letterSpacing: '.5px' }}>Other Details</div>
                            <DetailRow iconName="help_outline" iconColor="#2563EB" iconBg="#EFF6FF" label="Help & Support" onClick={() => { }} />
                            <DetailRow iconName="info_outline" iconColor="#7C3AED" iconBg="#F5F3FF" label="About NearZO" onClick={() => { }} last />
                        </div>

                        {/* Settings */}
                        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: '6px 18px', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', padding: '12px 0 6px', textTransform: 'uppercase', letterSpacing: '.5px' }}>Settings</div>
                            <DetailRow iconName="person_outline" iconColor="#2563EB" iconBg="#EFF6FF" label="Edit Profile" onClick={() => { setFormData({ full_name: profile?.full_name || '', area: profile?.area || '', city: profile?.city || '', state: profile?.state || '' }); setModal('editProfile'); }} />
                            <DetailRow iconName="lock_outline" iconColor="#16A34A" iconBg="#DCFCE7" label="Change Password" onClick={() => setModal('password')} />
                            <DetailRow iconName="logout" iconColor="#DC2626" iconBg="#FEE2E2" label="Logout" onClick={logout} danger />
                            <DetailRow iconName="delete_outline" iconColor="#DC2626" iconBg="#FEE2E2" label="Delete Account" onClick={() => setModal('delete')} danger last />
                        </div>

                        {/* Pro Banner */}
                        <div style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', borderRadius: 16, padding: '18px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 4px 20px rgba(37,99,235,.3)' }}>
                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Icon name="workspace_premium" size={24} color="#FCD34D" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 11, color: '#93C5FD', fontWeight: 500 }}>Get better experience with</div>
                                <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>NearZO Pro</div>
                                <div style={{ fontSize: 11, color: '#BFDBFE' }}>Unlock exclusive features</div>
                            </div>
                            <button style={{ background: '#fff', color: '#2563EB', border: 'none', borderRadius: 10, padding: '8px 14px', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font)', whiteSpace: 'nowrap' }}>
                                Upgrade →
                            </button>
                        </div>
                    </div>

                    {/* ═══════════ RIGHT / MAIN COLUMN ═══════════ */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {/* ── Manage Your Listings ── */}
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginBottom: 12 }}>Manage Your Listings</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <ListingSection
                                    iconName="storefront"
                                    iconColor="#2563EB"
                                    iconBg="#DBEAFE"
                                    title="Manage Shops"
                                    subtitle="Add, edit or manage your shop listings"
                                    badgeCount={shopLive}
                                    badgeColor="#2563EB"
                                    badgeBg="#EFF6FF"
                                    liveCount={shopLive}
                                    verifiedCount={shopVerified}
                                    unverifiedCount={shopUnverified}
                                    onAdd={() => setModal('shop')}
                                    addLabel="Add Shop"
                                    onManage={() => { }}
                                />
                                <ListingSection
                                    iconName="home"
                                    iconColor="#16A34A"
                                    iconBg="#DCFCE7"
                                    title="Manage Houses"
                                    subtitle="Add, edit or manage your house listings"
                                    badgeCount={houseLive}
                                    badgeColor="#16A34A"
                                    badgeBg="#F0FDF4"
                                    liveCount={houseLive}
                                    verifiedCount={houseVerified}
                                    unverifiedCount={houseUnverified}
                                    onAdd={() => setModal('house')}
                                    addLabel="Add House"
                                    onManage={() => { }}
                                />
                                <ListingSection
                                    iconName="work"
                                    iconColor="#EA580C"
                                    iconBg="#FFEDD5"
                                    title="Manage Jobs"
                                    subtitle="Add, edit or manage your job listings"
                                    badgeCount={jobLive}
                                    badgeColor="#EA580C"
                                    badgeBg="#FFF7ED"
                                    liveCount={jobLive}
                                    verifiedCount={jobVerified}
                                    unverifiedCount={jobUnverified}
                                    onAdd={() => setModal('job')}
                                    addLabel="Add Job"
                                    onManage={() => { }}
                                />
                            </div>
                        </div>

                        {/* ── Listings Tabs ── */}
                        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                            {/* Tab header */}
                            <div style={{ display: 'flex', borderBottom: '1px solid #F3F4F6' }}>
                                {[
                                    { key: 'shops', label: 'Shops', count: shops.length, icon: 'storefront' },
                                    { key: 'houses', label: 'Houses', count: houses.length, icon: 'home' },
                                    { key: 'jobs', label: 'Jobs', count: jobs.length, icon: 'work' },
                                ].map(t => (
                                    <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                                        flex: 1, padding: '14px 8px', border: 'none', background: 'none', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                        fontSize: 13, fontWeight: 600, fontFamily: 'var(--font)',
                                        color: activeTab === t.key ? '#2563EB' : '#9CA3AF',
                                        borderBottom: activeTab === t.key ? '2.5px solid #2563EB' : '2.5px solid transparent',
                                        transition: 'all .15s'
                                    }}>
                                        <Icon name={t.icon} size={16} color={activeTab === t.key ? '#2563EB' : '#9CA3AF'} />
                                        {t.label}
                                        <span style={{ padding: '2px 7px', borderRadius: 99, background: activeTab === t.key ? '#EFF6FF' : '#F3F4F6', color: activeTab === t.key ? '#2563EB' : '#9CA3AF', fontSize: 11, fontWeight: 700 }}>
                                            {t.count}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div style={{ padding: 16 }}>
                                {/* SHOPS */}
                                {activeTab === 'shops' && (
                                    shops.length === 0
                                        ? <Empty label="No shops yet. Add your first shop!" />
                                        : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                                            {shops.map(s => (
                                                <div key={s.id} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                                                    {s.shop_image
                                                        ? <img src={`data:image/jpeg;base64,${s.shop_image}`} alt="" style={{ width: '100%', height: 90, objectFit: 'cover' }} />
                                                        : <div style={{ width: '100%', height: 90, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="storefront" size={32} color="#BFDBFE" /></div>
                                                    }
                                                    <div style={{ padding: '10px 12px 12px' }}>
                                                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.business_name}</div>
                                                        <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 6 }}>{s.category}</div>
                                                        <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 3 }}>
                                                            <Icon name="location_on" size={11} color="#9CA3AF" />
                                                            {s.area}, {s.city}
                                                        </div>
                                                        {s.is_verified
                                                            ? <Badge label="Verified" color="#16A34A" bg="#DCFCE7" dot />
                                                            : <Badge label="Unverified" color="#DC2626" bg="#FEE2E2" dot />
                                                        }
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                )}

                                {/* HOUSES */}
                                {activeTab === 'houses' && (
                                    houses.length === 0
                                        ? <Empty label="No houses listed yet. Add your first house!" />
                                        : <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            {houses.map(h => (
                                                <div key={h.id} style={{ border: '1px solid #E5E7EB', borderRadius: 14, overflow: 'hidden', background: '#fff', boxShadow: 'var(--shadow-sm)', display: 'flex' }}>
                                                    {h.house_image
                                                        ? <img src={`data:image/jpeg;base64,${h.house_image}`} alt="" style={{ width: 100, objectFit: 'cover', flexShrink: 0 }} />
                                                        : <div style={{ width: 100, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="home" size={32} color="#BBF7D0" /></div>
                                                    }
                                                    <div style={{ padding: '12px 14px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                                                        <div>
                                                            <div style={{ fontSize: 14, fontWeight: 700 }}>{h.rooms} BHK House</div>
                                                            <div style={{ fontSize: 13, color: '#2563EB', fontWeight: 700 }}>{formatPrice(h.rent_per_month)}/mo</div>
                                                            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                                                                <Icon name="location_on" size={12} color="#9CA3AF" />
                                                                {h.area}, {h.city}
                                                            </div>
                                                            <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                                                                <Badge label={h.is_available ? 'Available' : 'Booked'} color={h.is_available ? '#16A34A' : '#DC2626'} bg={h.is_available ? '#DCFCE7' : '#FEE2E2'} dot />
                                                                {h.is_verified ? <Badge label="Verified" color="#16A34A" bg="#DCFCE7" dot /> : <Badge label="Unverified" color="#DC2626" bg="#FEE2E2" dot />}
                                                            </div>
                                                        </div>
                                                        <Btn size="sm" variant="secondary" onClick={() => openEditHouse(h)} icon={<Icon name="edit" size={14} color="#374151" />} style={{ borderRadius: 8 }}>
                                                            Edit
                                                        </Btn>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                )}

                                {/* JOBS */}
                                {activeTab === 'jobs' && (
                                    jobs.length === 0
                                        ? <Empty label="No jobs posted yet. Post your first job!" />
                                        : <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            {jobs.map(j => (
                                                <div key={j.id} style={{ border: '1px solid #E5E7EB', borderRadius: 14, padding: '14px 16px', background: '#fff', boxShadow: 'var(--shadow-sm)' }}>
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: 14, fontWeight: 700 }}>{j.job_title}</div>
                                                            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}>{j.shop_name || j.company_name}</div>
                                                            <div style={{ fontSize: 14, fontWeight: 700, color: '#2563EB' }}>{formatPrice(j.salary)}/{j.salary_type === 'month' ? 'mo' : 'day'}</div>
                                                            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                                                                <Icon name="location_on" size={12} color="#9CA3AF" />
                                                                {j.area}, {j.city}
                                                            </div>
                                                            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                                                                <Badge label={j.is_open ? 'Open' : 'Closed'} color={j.is_open ? '#16A34A' : '#DC2626'} bg={j.is_open ? '#DCFCE7' : '#FEE2E2'} dot />
                                                                <Badge label={j.job_type === 'full_time' ? 'Full Time' : 'Part Time'} color="#6B7280" bg="#F3F4F6" />
                                                                {j.is_verified ? <Badge label="Verified" color="#16A34A" bg="#DCFCE7" dot /> : <Badge label="Unverified" color="#DC2626" bg="#FEE2E2" dot />}
                                                            </div>
                                                        </div>
                                                        <Btn size="sm" variant="secondary" onClick={() => openEditJob(j)} icon={<Icon name="edit" size={14} color="#374151" />} style={{ borderRadius: 8 }}>
                                                            Edit
                                                        </Btn>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Bottom Nav (mobile only) ── */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #E5E7EB', display: 'flex', zIndex: 100, boxShadow: '0 -2px 12px rgba(0,0,0,.06)' }}>
                {[
                    { icon: 'home', label: 'Home', active: false },
                    { icon: 'map', label: 'Map', active: false },
                    { icon: 'storefront', label: 'Shops', active: false },
                    { icon: 'home_work', label: 'House', active: false },
                    { icon: 'work', label: 'Jobs', active: false },
                    { icon: 'person', label: 'Profile', active: true },
                ].map(n => (
                    <button key={n.label} style={{ flex: 1, padding: '10px 0 12px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                        <Icon name={n.icon} size={22} color={n.active ? '#2563EB' : '#9CA3AF'} />
                        <span style={{ fontSize: 10, color: n.active ? '#2563EB' : '#9CA3AF', fontWeight: n.active ? 700 : 500, fontFamily: 'var(--font)' }}>{n.label}</span>
                    </button>
                ))}
            </div>

            {/* ══════════════════════════
                 MODALS
            ══════════════════════════ */}

            {/* Edit Profile */}
            <Modal open={modal === 'editProfile'} onClose={closeModal} title="Edit Profile"
                footer={<><Btn variant="secondary" onClick={closeModal}>Cancel</Btn><Btn variant="primary" onClick={handleSaveProfile} loading={saving}>Save Changes</Btn></>}>
                <FormGrid>
                    <FormItem full><Input label="Full Name *" value={formData.full_name} onChange={e => setFormData(p => ({ ...p, full_name: e.target.value }))} /></FormItem>
                    <FormItem half><SelectField label="City" value={formData.city} onChange={e => setFormData(p => ({ ...p, city: e.target.value, area: '' }))} options={[{ value: '', label: 'Select City' }, ...cities.map(c => ({ value: c.name, label: c.name }))]} /></FormItem>
                    <FormItem half><Input label="Area" value={formData.area} onChange={e => setFormData(p => ({ ...p, area: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="State" value={formData.state} onChange={e => setFormData(p => ({ ...p, state: e.target.value }))} /></FormItem>
                </FormGrid>
            </Modal>

            {/* Change Password */}
            <Modal open={modal === 'password'} onClose={closeModal} title="Change Password"
                footer={<><Btn variant="secondary" onClick={closeModal}>Cancel</Btn><Btn variant="primary" onClick={handleChangePassword}>Update Password</Btn></>}>
                <FormGrid>
                    <FormItem full><Input label="Current Password" type="password" value={passwordData.current_password} onChange={e => setPasswordData(p => ({ ...p, current_password: e.target.value }))} /></FormItem>
                    <FormItem full><Input label="New Password" type="password" value={passwordData.new_password} onChange={e => setPasswordData(p => ({ ...p, new_password: e.target.value }))} /></FormItem>
                    <FormItem full><Input label="Confirm Password" type="password" value={passwordData.confirm_password} onChange={e => setPasswordData(p => ({ ...p, confirm_password: e.target.value }))} /></FormItem>
                </FormGrid>
            </Modal>

            {/* Delete Account */}
            <Modal open={modal === 'delete'} onClose={closeModal} title="Delete Account"
                footer={<><Btn variant="secondary" onClick={closeModal}>Cancel</Btn><Btn variant="danger" onClick={handleDeleteAccount}>Delete Account</Btn></>}>
                <div style={{ background: '#FEE2E2', borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: 13, color: '#DC2626', fontWeight: 500, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <Icon name="warning" size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: 1 }} />
                    This action is irreversible. All data will be permanently deleted.
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
                                        style={{ padding: '5px 12px', borderRadius: 99, border: `1.5px solid ${shopForm.keywords.includes(item.item_name) ? '#2563EB' : '#E5E7EB'}`, background: shopForm.keywords.includes(item.item_name) ? '#EFF6FF' : '#F9FAFB', color: shopForm.keywords.includes(item.item_name) ? '#2563EB' : '#374151', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
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
                        <Btn variant="ghost" onClick={() => getCurrentLocation(setShopForm)} loading={locating} fullWidth icon={<Icon name="my_location" size={15} color="#2563EB" />} size="sm">
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
                        <Btn variant={shopLocationVerified ? 'success' : 'primary'} size="sm" onClick={verifyShopLoc} loading={shopVerifying} fullWidth
                            icon={shopLocationVerified ? <Icon name="verified" size={15} color="#16A34A" /> : null}>
                            {shopVerifying ? 'Verifying...' : shopLocationVerified ? 'Verified' : 'Verify Location'}
                        </Btn>
                    </FormItem>
                    <FormItem full>
                        <div style={{ height: 1, background: '#F3F4F6', margin: '4px 0 12px' }} />
                        <FieldLabel>Shop Image</FieldLabel>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', border: '1.5px dashed #D1D5DB', borderRadius: 10, cursor: 'pointer', color: '#6B7280', fontSize: 14, fontWeight: 500 }}>
                            <Icon name="photo_camera" size={18} color="#6B7280" />
                            Upload Image
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
                        <Btn variant="ghost" onClick={() => getCurrentLocation(setHouseForm)} loading={locating} fullWidth icon={<Icon name="my_location" size={15} color="#2563EB" />} size="sm">
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
                        <Btn variant={houseLocationVerified ? 'success' : 'primary'} size="sm" onClick={verifyHouseLoc} loading={houseVerifying} fullWidth
                            icon={houseLocationVerified ? <Icon name="verified" size={15} color="#16A34A" /> : null}>
                            {houseVerifying ? 'Verifying...' : houseLocationVerified ? 'Verified' : 'Verify Location'}
                        </Btn>
                    </FormItem>
                    <FormItem full>
                        <div style={{ height: 1, background: '#F3F4F6', margin: '4px 0 12px' }} />
                        <FieldLabel>House Image</FieldLabel>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', border: '1.5px dashed #D1D5DB', borderRadius: 10, cursor: 'pointer', color: '#6B7280', fontSize: 14, fontWeight: 500 }}>
                            <Icon name="photo_camera" size={18} color="#6B7280" />
                            Upload Image
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
                        <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Icon name="location_on" size={13} color="#9CA3AF" />
                            {houseForm.area}, {houseForm.city}, {houseForm.state}
                        </div>
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