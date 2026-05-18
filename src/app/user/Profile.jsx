// app/user/Profile.jsx
import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
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
    updateJob,
    updateShop,
    deleteShop,
    getShopByIdForEdit,
    getTotalViews
} from '../../services/profile';
import { getAllCities, getAreasByCity, verifyLocation, getShopCategories } from '../../services/location';
import { useAuth } from '../context/AuthContext';

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────────────────────────────────────
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
    --bottom-nav-h: 64px;
    --modal-px: clamp(12px, 4vw, 20px);
    --modal-py: clamp(10px, 2.5vw, 18px);
    --form-gap: clamp(10px, 2.5vw, 14px);
  }

  html, body { font-family: var(--font); background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }

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
    from { transform: translateY(60px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }

  .mi {
    font-family: 'Material Icons';
    font-style: normal;
    font-weight: normal;
    font-size: 20px;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    user-select: none;
  }

  .icon-btn {
    background: none; border: none; cursor: pointer;
    display: inline-flex; align-items: center; justify-content: center;
    padding: 8px; border-radius: 50%; transition: background .15s;
  }
  .icon-btn:hover { background: var(--border-light); }

  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(0,0,0,.5);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
    animation: fadeIn .2s ease;
    padding: 0;
    overscroll-behavior: contain;
  }

  .modal-sheet {
    width: 100%;
    max-width: 560px;
    max-height: calc(100dvh - var(--bottom-nav-h) - env(safe-area-inset-bottom, 0px) - 6px);
    background: #fff;
    border-radius: 20px 20px 0 0;
    display: flex;
    flex-direction: column;
    animation: slideUp .28s cubic-bezier(.32,.72,0,1);
    overflow: hidden;
    margin-bottom: var(--bottom-nav-h);
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }

  @media (min-width: 640px) {
    .modal-overlay { align-items: center; padding: 16px; }
    .modal-sheet {
      border-radius: 20px;
      max-height: calc(100dvh - 80px);
      margin-bottom: 0;
      padding-bottom: 0;
    }
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--modal-py) var(--modal-px) calc(var(--modal-py) - 4px);
    border-bottom: 1px solid #F3F4F6;
    flex-shrink: 0;
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: var(--modal-py) var(--modal-px) 6px;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }

  .modal-footer {
    padding: clamp(10px, 2vw, 14px) var(--modal-px) clamp(12px, 3vw, 18px);
    border-top: 1px solid #F3F4F6;
    display: flex;
    gap: clamp(8px, 2vw, 10px);
    justify-content: flex-end;
    flex-shrink: 0;
    background: #fff;
  }

  .modal-handle {
    width: 36px;
    height: 4px;
    background: #E5E7EB;
    border-radius: 99px;
    margin: 0 auto 0;
    flex-shrink: 0;
  }
  @media (min-width: 640px) { .modal-handle { display: none; } }

  .form-grid { display: flex; flex-wrap: wrap; gap: var(--form-gap); }
  .form-item-half {
    flex: 1 1 calc(50% - var(--form-gap) / 2);
    min-width: clamp(100px, 35vw, 140px);
  }
  .form-item-full { flex: 1 1 100%; }

  @media (max-width: 320px) {
    .form-item-half { flex: 1 1 100%; min-width: 0; }
    :root { --modal-px: 10px; --form-gap: 9px; }
  }

  @media (min-width: 768px) {
    .profile-layout {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 20px;
      align-items: start;
    }
    .profile-sidebar { position: sticky; top: 24px; }
  }
  @media (min-width: 1100px) {
    .profile-layout { grid-template-columns: 330px 1fr; gap: 24px; }
  }
`;

if (!document.getElementById('profile-styles-v4')) {
    const s = document.createElement('style');
    s.id = 'profile-styles-v4';
    s.textContent = GLOBAL_STYLE;
    document.head.appendChild(s);
}

// ─────────────────────────────────────────────────────────────────────────────
// PWA-SAFE IMAGE PICKER
// Fix: Proper PWA/iOS standalone image picker with reliable change detection
// ─────────────────────────────────────────────────────────────────────────────
function openImagePicker(onFile) {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        // Critical for iOS PWA: must be in DOM and visible-ish
        input.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;z-index:-1;';
        document.body.appendChild(input);

        let handled = false;

        const cleanup = () => {
            try { document.body.removeChild(input); } catch { }
        };

        // Use 'input' event as primary (more reliable in PWA)
        const handleChange = (e) => {
            if (handled) return;
            const file = e.target.files?.[0];
            if (file) {
                handled = true;
                const url = URL.createObjectURL(file);
                onFile(file, url);
                resolve({ file, url });
            }
            cleanup();
        };

        input.addEventListener('change', handleChange);
        input.addEventListener('input', handleChange);

        // Fallback: detect focus return without file selection
        window.addEventListener('focus', function onFocus() {
            window.removeEventListener('focus', onFocus);
            setTimeout(() => {
                if (!handled) cleanup();
                resolve(null);
            }, 500);
        }, { once: true });

        // iOS PWA workaround: needs a tiny delay before click
        setTimeout(() => {
            try { input.click(); } catch (err) {
                // Some PWA contexts need dispatchEvent
                input.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            }
        }, 50);
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// LOCATION SERVICE
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// ICON
// ─────────────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 20, color, style = {} }) => (
    <span className="mi" style={{ fontSize: size, color, ...style }}>{name}</span>
);

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
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
    <label style={{
        display: 'block', fontSize: 11, fontWeight: 700,
        color: '#6B7280', marginBottom: 6,
        textTransform: 'uppercase', letterSpacing: '.5px'
    }}>
        {children}
    </label>
);

const inputBase = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid #E5E7EB', borderRadius: 10,
    fontSize: 14, fontWeight: 400, color: '#111827',
    background: '#FAFAFA', outline: 'none',
    transition: 'border-color .15s, box-shadow .15s',
    fontFamily: 'var(--font)',
};

// ─────────────────────────────────────────────────────────────────────────────
// FIX: Uncontrolled-style Input to prevent cursor jump in PWA
// Uses defaultValue + ref pattern with onChange for state sync
// ─────────────────────────────────────────────────────────────────────────────
const Input = memo(({ label, value, onChange, style = {}, wrapStyle = {}, type = 'text', placeholder, disabled, onKeyDown }) => {
    const inputRef = useRef(null);

    // Sync external value changes (e.g. when form resets) without clobbering cursor
    useEffect(() => {
        if (inputRef.current && document.activeElement !== inputRef.current) {
            inputRef.current.value = value ?? '';
        }
    }, [value]);

    const handleFocus = (e) => {
        e.target.style.borderColor = '#2563EB';
        e.target.style.boxShadow = '0 0 0 3px #DBEAFE';
    };
    const handleBlur = (e) => {
        e.target.style.borderColor = '#E5E7EB';
        e.target.style.boxShadow = 'none';
    };

    return (
        <div style={{ ...wrapStyle }}>
            {label && <FieldLabel>{label}</FieldLabel>}
            <input
                ref={inputRef}
                type={type}
                defaultValue={value ?? ''}
                onChange={onChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={placeholder}
                disabled={disabled}
                onKeyDown={onKeyDown}
                style={{ ...inputBase, ...style, opacity: disabled ? 0.5 : 1 }}
            />
        </div>
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// FIX: Uncontrolled-style Textarea to prevent cursor jump
// ─────────────────────────────────────────────────────────────────────────────
const Textarea = memo(({ label, value, onChange, wrapStyle = {} }) => {
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current && document.activeElement !== ref.current) {
            ref.current.value = value ?? '';
        }
    }, [value]);

    return (
        <div style={{ ...wrapStyle }}>
            {label && <FieldLabel>{label}</FieldLabel>}
            <textarea
                ref={ref}
                defaultValue={value ?? ''}
                onChange={onChange}
                rows={3}
                style={{ ...inputBase, resize: 'vertical' }}
                onFocus={e => { e.target.style.borderColor = '#2563EB'; }}
                onBlur={e => { e.target.style.borderColor = '#E5E7EB'; }}
            />
        </div>
    );
});

const SelectField = ({ label, options = [], wrapStyle = {}, value, onChange, disabled }) => (
    <div style={{ ...wrapStyle }}>
        {label && <FieldLabel>{label}</FieldLabel>}
        <select
            value={value}
            onChange={onChange}
            disabled={disabled}
            style={{
                ...inputBase,
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat', backgroundPosition: 'calc(100% - 12px) center', paddingRight: 36,
                opacity: disabled ? 0.5 : 1,
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
    };
    return (
        <button
            onClick={!disabled && !loading ? onClick : undefined}
            style={{ ...base, ...sizes[size], ...variants[variant], ...style }}>
            {loading ? <Spinner size={14} color={variant === 'secondary' ? '#374151' : '#fff'} /> : icon}
            {children}
        </button>
    );
};

const Toggle = ({ checked, onChange, label }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
        <div onClick={() => onChange(!checked)} style={{
            width: 44, height: 24, borderRadius: 99,
            background: checked ? '#2563EB' : '#D1D5DB',
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

// ─────────────────────────────────────────────────────────────────────────────
// MODAL
// ─────────────────────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, children, footer }) => {
    useEffect(() => {
        if (open) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    if (!open) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-sheet"
                onClick={e => e.stopPropagation()}
                style={{
                    marginBottom: window.innerWidth <= 768 ? 'calc(env(safe-area-inset-bottom, 0px) + 80px)' : 0,
                    maxHeight: window.innerWidth <= 768 ? '83dvh' : '75dvh'
                }}
            >
                <div style={{ padding: '10px 0 0', flexShrink: 0 }}>
                    <div className="modal-handle" />
                </div>
                <div className="modal-header">
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{title}</span>
                    <button onClick={onClose} style={{
                        background: '#F3F4F6', border: 'none', borderRadius: '50%',
                        width: 32, height: 32, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                        <Icon name="close" size={18} color="#374151" />
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                    <div style={{ height: 6 }} />
                </div>
                {footer && <div className="modal-footer">{footer}</div>}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type = 'success' }) => {
    if (!msg) return null;
    const colors = { success: { bg: '#DCFCE7', color: '#16A34A' }, error: { bg: '#FEE2E2', color: '#DC2626' } };
    return (
        <div style={{
            position: 'fixed', top: 16, left: 0, right: 0, zIndex: 2000,
            display: 'flex', justifyContent: 'center', padding: '0 16px',
            animation: 'fadeUp .25s ease', pointerEvents: 'none'
        }}>
            <div style={{
                background: colors[type].bg, color: colors[type].color,
                padding: '12px 20px', borderRadius: 12, fontWeight: 600,
                fontSize: 14, boxShadow: '0 4px 20px rgba(0,0,0,.12)', maxWidth: 380,
                display: 'flex', alignItems: 'center', gap: 8
            }}>
                <Icon name={type === 'success' ? 'check_circle' : 'error'} size={16} color={colors[type].color} />
                {msg}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// FORM HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const FormGrid = ({ children }) => <div className="form-grid">{children}</div>;
const FormItem = ({ half, full, children }) => (
    <div className={full ? 'form-item-full' : 'form-item-half'}>{children}</div>
);

const SectionDivider = ({ label }) => (
    <div className="form-item-full" style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 2px' }}>
        <div style={{ flex: 1, height: 1, background: '#F3F4F6' }} />
        {label && <span style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.5px', whiteSpace: 'nowrap' }}>{label}</span>}
        <div style={{ flex: 1, height: 1, background: '#F3F4F6' }} />
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// DETAIL ROW
// ─────────────────────────────────────────────────────────────────────────────
const DetailRow = ({ iconName, iconColor = '#2563EB', iconBg = '#EFF6FF', label, rightText, onClick, danger, last }) => (
    <button onClick={onClick} style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer',
        width: '100%', textAlign: 'left',
        borderBottom: last ? 'none' : '1px solid #F3F4F6',
    }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: danger ? '#FEE2E2' : iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name={iconName} size={17} color={danger ? '#DC2626' : iconColor} />
        </div>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: danger ? '#DC2626' : '#111827' }}>{label}</span>
        {rightText && <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{rightText}</span>}
        <Icon name="chevron_right" size={17} color={danger ? '#DC2626' : '#9CA3AF'} />
    </button>
);

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────────────────────
const StatCard = ({ iconName, count, label, iconColor, iconBg }) => (
    <div style={{ flex: '1 1 0', minWidth: 60, background: '#F8FAFF', borderRadius: 14, padding: '12px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, border: '1px solid #E8EFFE' }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={iconName} size={19} color={iconColor} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{count ?? '—'}</div>
        <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 500, textAlign: 'center', lineHeight: 1.3 }}>{label}</div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// LISTING SECTION
// ─────────────────────────────────────────────────────────────────────────────
const MiniStat = ({ iconName, color, count, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Icon name={iconName} size={15} color={color} />
        <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{count ?? 0}</span>
        <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>{label}</span>
    </div>
);

const ListingSection = ({ iconName, iconColor, iconBg, title, subtitle, badgeCount, badgeColor, badgeBg, onAdd, addLabel, liveCount, verifiedCount, unverifiedCount, onManage, viewCount }) => (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <button onClick={onManage} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid #F3F4F6', textAlign: 'left' }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={iconName} size={21} color={iconColor} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{title}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subtitle}</div>
                {viewCount !== undefined && (
                    <div style={{ fontSize: 11, color: '#2563EB', marginTop: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Icon name="visibility" size={11} color="#2563EB" /> {viewCount} views
                    </div>
                )}
            </div>
            <Badge label={`${badgeCount} Active`} color={badgeColor} bg={badgeBg} />
            <Icon name="chevron_right" size={18} color="#9CA3AF" />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', gap: 8, flexWrap: 'wrap' }}>
            <MiniStat iconName="check_circle" color="#2563EB" count={liveCount} label="Live" />
            <div style={{ width: 1, height: 26, background: '#E5E7EB' }} />
            <MiniStat iconName="verified" color="#16A34A" count={verifiedCount} label="Verified" />
            <div style={{ width: 1, height: 26, background: '#E5E7EB' }} />
            <MiniStat iconName="cancel" color="#DC2626" count={unverifiedCount} label="Unverified" />
            <div style={{ flex: 1 }} />
            <button onClick={onAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, border: '1.5px solid #2563EB', background: '#EFF6FF', color: '#2563EB', fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font)', whiteSpace: 'nowrap' }}>
                <Icon name="add" size={15} color="#2563EB" /> {addLabel}
            </button>
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────────────────────
const Empty = ({ label }) => (
    <div style={{ textAlign: 'center', padding: '28px 12px', color: '#9CA3AF', fontSize: 14, fontWeight: 500 }}>
        <Icon name="inbox" size={38} color="#D1D5DB" style={{ display: 'block', margin: '0 auto 10px' }} />
        {label}
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// ALERT BOX
// ─────────────────────────────────────────────────────────────────────────────
const AlertBox = ({ type = 'danger', icon = 'warning', children }) => {
    const map = {
        danger: { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
        info: { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' },
    };
    const t = map[type];
    return (
        <div style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 10, padding: '11px 13px', marginBottom: 14, fontSize: 13, color: t.color, fontWeight: 500, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <Icon name={icon} size={15} color={t.color} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{children}</span>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE UPLOAD — PWA-safe with instant preview
// ─────────────────────────────────────────────────────────────────────────────
const ImageUpload = ({ preview, isNew, onPick, label = 'Upload Image' }) => (
    <div>
        {preview && (
            <div style={{ marginBottom: 10, borderRadius: 10, overflow: 'hidden', background: '#F3F4F6' }}>
                <div style={{ width: '100%', paddingTop: '56.25%', position: 'relative' }}>
                    <img
                        src={preview}
                        alt={isNew ? 'New preview' : 'Current image'}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={e => { e.target.src = 'https://placehold.co/560x315?text=No+Image'; }}
                    />
                    <div style={{ position: 'absolute', bottom: 8, left: 8, background: isNew ? 'rgba(37,99,235,.88)' : 'rgba(0,0,0,.55)', color: '#fff', fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 6, backdropFilter: 'blur(4px)', letterSpacing: '.3px' }}>
                        {isNew ? '✓ New Image' : 'Current Image'}
                    </div>
                </div>
            </div>
        )}
        <button
            type="button"
            onClick={onPick}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px', border: '1.5px dashed #D1D5DB', borderRadius: 10, cursor: 'pointer', color: '#6B7280', fontSize: 13, fontWeight: 500, background: '#FAFAFA', transition: 'border-color .15s', width: '100%', fontFamily: 'var(--font)' }}
            onMouseOver={e => e.currentTarget.style.borderColor = '#2563EB'}
            onMouseOut={e => e.currentTarget.style.borderColor = '#D1D5DB'}
        >
            <Icon name="photo_camera" size={17} color="#6B7280" />
            {preview ? 'Change Image' : label}
        </button>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// LOCATION SECTION
// ─────────────────────────────────────────────────────────────────────────────
const LocationSection = ({ lat, lng, city, area, state, cities, areas, locating,
    verified, verifying, onGetLocation, onVerify,
    onCityChange, onAreaChange, onStateChange, showState = true }) => (
    <>
        <SectionDivider label="Location" />
        <div className="form-item-full">
            <Btn variant="ghost" onClick={onGetLocation} loading={locating} fullWidth
                icon={<Icon name="my_location" size={15} color="#2563EB" />} size="sm">
                {locating ? 'Detecting…' : 'Use Current Location'}
            </Btn>
        </div>
        {lat && (
            <div className="form-item-full">
                <div style={{ display: 'flex', gap: 6, fontSize: 12, color: '#6B7280', background: '#F9FAFB', borderRadius: 8, padding: '8px 12px', border: '1px solid #E5E7EB', alignItems: 'center' }}>
                    <Icon name="location_on" size={13} color="#2563EB" />
                    <span style={{ fontWeight: 500 }}>{lat?.toFixed?.(5) ?? lat}, {lng?.toFixed?.(5) ?? lng}</span>
                </div>
            </div>
        )}
        <div className="form-item-half">
            <SelectField label="City *" value={city}
                onChange={e => onCityChange(e.target.value)}
                options={[{ value: '', label: 'Select City' }, ...cities.map(c => ({ value: c.name, label: c.name }))]} />
        </div>
        <div className="form-item-half">
            <SelectField label="Area" value={area}
                onChange={e => onAreaChange(e.target.value)}
                options={[{ value: '', label: 'Select Area' }, ...areas.map(a => ({ value: a.area, label: a.area }))]} />
        </div>
        {showState && (
            <div className="form-item-half">
                <Input label="State *" value={state} onChange={e => onStateChange(e.target.value)} />
            </div>
        )}
        <div className="form-item-half">
            <Btn
                variant={verified ? 'success' : 'primary'} size="sm"
                onClick={onVerify} loading={verifying} fullWidth
                icon={verified ? <Icon name="verified" size={15} color="#16A34A" /> : <Icon name="location_searching" size={15} color="#fff" />}>
                {verifying ? 'Verifying…' : verified ? 'Verified ✓' : 'Verify Location'}
            </Btn>
        </div>
    </>
);

// ─────────────────────────────────────────────────────────────────────────────
// ABOUT NEARZO MODAL CONTENT
// ─────────────────────────────────────────────────────────────────────────────
const AboutNearZOContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)', borderRadius: 16, padding: '20px', textAlign: 'center', color: '#fff' }}>
            <div style={{ fontSize: 32, marginBottom: 6 }}>📍</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>NearZO</div>
            <div style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.5 }}>Your local discovery platform — connecting communities, one neighborhood at a time.</div>
        </div>

        {/* What we do */}
        <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10 }}>What We Do</div>
            {[
                { icon: 'storefront', color: '#2563EB', bg: '#EFF6FF', title: 'Discover Local Shops', desc: 'Find shops, restaurants, and businesses right in your neighborhood with real-time location data.' },
                { icon: 'home', color: '#16A34A', bg: '#DCFCE7', title: 'Find Rental Houses', desc: 'Browse verified house and flat listings near you — no brokers, no hidden charges.' },
                { icon: 'work', color: '#EA580C', bg: '#FFEDD5', title: 'Local Job Listings', desc: 'Discover job opportunities posted by businesses in your area — apply directly.' },
                { icon: 'location_on', color: '#7C3AED', bg: '#EDE9FE', title: 'Location-Verified Listings', desc: 'Every shop and house is GPS-verified so you know exactly where it is before you visit.' },
            ].map(item => (
                <div key={item.title} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon name={item.icon} size={18} color={item.color} />
                    </div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{item.title}</div>
                        <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>{item.desc}</div>
                    </div>
                </div>
            ))}
        </div>

        {/* Mission */}
        <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '14px', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="favorite" size={14} color="#DC2626" /> Our Mission
            </div>
            <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>
                NearZO is built to bridge the gap between local businesses and the people around them. We believe every shop owner, landlord, and job provider in small towns and cities deserves a digital presence — and every resident deserves easy access to what's available nearby.
            </div>
        </div>

        {/* Version */}
        <div style={{ textAlign: 'center', fontSize: 11, color: '#9CA3AF' }}>
            Version 1.0.0 · Made with ❤️ in India
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SUPPORT MODAL CONTENT
// ─────────────────────────────────────────────────────────────────────────────
const SupportContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)', borderRadius: 16, padding: '18px', textAlign: 'center', color: '#fff' }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>🤝</div>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>We're here to help!</div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>Reach out to us through any of these channels</div>
        </div>

        {/* Contact */}
        <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10 }}>Contact Us</div>
            {[
                {
                    icon: 'call', color: '#16A34A', bg: '#DCFCE7', label: 'Phone / WhatsApp',
                    value: '+91 98765 43210',
                    sub: 'Mon–Sat, 9 AM – 6 PM',
                    href: 'tel:+919876543210'
                },
                {
                    icon: 'email', color: '#2563EB', bg: '#EFF6FF', label: 'Email Support',
                    value: 'support@nearzo.in',
                    sub: 'We reply within 24 hours',
                    href: 'mailto:support@nearzo.in'
                },
                {
                    icon: 'language', color: '#7C3AED', bg: '#EDE9FE', label: 'Website',
                    value: 'www.nearzo.in',
                    sub: 'Visit our website',
                    href: 'https://nearzo.in'
                },
            ].map(item => (
                <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid #F3F4F6', textDecoration: 'none' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon name={item.icon} size={19} color={item.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.3px' }}>{item.label}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{item.value}</div>
                        <div style={{ fontSize: 11, color: '#9CA3AF' }}>{item.sub}</div>
                    </div>
                    <Icon name="open_in_new" size={15} color="#9CA3AF" />
                </a>
            ))}
        </div>

        {/* Social Media */}
        <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10 }}>Follow Us</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[
                    { icon: 'photo_camera', label: 'Instagram', handle: '@nearzo.in', color: '#E1306C', bg: '#FDF2F8', href: 'https://instagram.com/nearzo.in' },
                    { icon: 'chat', label: 'WhatsApp Channel', handle: 'NearZO Official', color: '#25D366', bg: '#F0FDF4', href: 'https://whatsapp.com/channel/nearzo' },
                    { icon: 'play_circle', label: 'YouTube', handle: 'NearZO', color: '#FF0000', bg: '#FFF0F0', href: 'https://youtube.com/@nearzo' },
                ].map(s => (
                    <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                        style={{ flex: '1 1 calc(50% - 5px)', minWidth: 120, padding: '10px 12px', background: s.bg, borderRadius: 12, border: `1px solid ${s.color}22`, textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <Icon name={s.icon} size={20} color={s.color} />
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{s.label}</div>
                        <div style={{ fontSize: 11, color: '#6B7280' }}>{s.handle}</div>
                    </a>
                ))}
            </div>
        </div>

        {/* FAQ hint */}
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, padding: '12px 14px', fontSize: 13, color: '#92400E', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <Icon name="tips_and_updates" size={15} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
            <span>For issues with listings, location verification, or account access — describe your problem and send a WhatsApp message. We typically resolve issues within a few hours.</span>
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
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
    const [totalViews, setTotalViews] = useState(0);
    const [viewBreakdown, setViewBreakdown] = useState({ shops: 0, houses: 0, jobs: 0 });

    const [modal, setModal] = useState('');
    const [editingShop, setEditingShop] = useState(null);
    const [editingHouse, setEditingHouse] = useState(null);
    const [editingJob, setEditingJob] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const [shopLocationVerified, setShopLocationVerified] = useState(false);
    const [houseLocationVerified, setHouseLocationVerified] = useState(false);
    const [shopVerifying, setShopVerifying] = useState(false);
    const [houseVerifying, setHouseVerifying] = useState(false);

    const [passwordData, setPasswordData] = useState({ current_password: '', new_password: '', confirm_password: '' });
    const [deletePassword, setDeletePassword] = useState('');

    // Track object URLs for cleanup
    const [shopObjUrl, setShopObjUrl] = useState('');
    const [houseObjUrl, setHouseObjUrl] = useState('');

    // Loading states for update operations
    const [updatingShop, setUpdatingShop] = useState(false);
    const [updatingHouse, setUpdatingHouse] = useState(false);
    const [creatingShop, setCreatingShop] = useState(false);
    const [creatingHouse, setCreatingHouse] = useState(false);
    const [creatingJob, setCreatingJob] = useState(false);
    const [updatingJob, setUpdatingJob] = useState(false);

    const emptyShop = { business_name: '', category: '', additional_phone: '', keywords: [], custom_keyword: '', latitude: '', longitude: '', area: '', city: '', state: '', description: '', opening_time: '', closing_time: '', shop_image: null, shop_image_preview: '' };
    const emptyHouse = { rooms: '', halls: '', kitchens: '', floor: '', rent_per_month: '', advance_amount: '', latitude: '', longitude: '', area: '', city: '', state: '', description: '', is_available: true, house_image: null, house_image_preview: '' };
    const emptyJob = { shop_id: '', company_name: '', job_title: '', salary: '', salary_type: 'month', qualification: '', job_type: 'full_time', area: '', city: '', state: '', is_open: true, contact_phone: '' };
    const emptyProfile = { full_name: '', area: '', city: '', state: '' };

    const [shopForm, setShopForm] = useState(emptyShop);
    const [houseForm, setHouseForm] = useState(emptyHouse);
    const [jobForm, setJobForm] = useState(emptyJob);
    const [formData, setFormData] = useState(emptyProfile);

    // ─── FIX: Get the API URL once — works in PWA too
    const API_URL = import.meta.env.VITE_API_URL || window.__NEARZO_API_URL__ || '';

    const showToast = useCallback((msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: '', type: 'success' }), 3500);
    }, []);

    const closeModal = useCallback(() => {
        setModal('');
        setEditingShop(null);
        setEditingHouse(null);
        setEditingJob(null);
        setDeleteConfirm(null);
        if (shopObjUrl) { URL.revokeObjectURL(shopObjUrl); setShopObjUrl(''); }
        if (houseObjUrl) { URL.revokeObjectURL(houseObjUrl); setHouseObjUrl(''); }
    }, [shopObjUrl, houseObjUrl]);

    const formatPrice = p => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

    // Computed stats
    const shopLive = shops.length, shopVerified = shops.filter(s => s.is_verified).length, shopUnverified = shops.filter(s => !s.is_verified).length;
    const houseLive = houses.length, houseVerified = houses.filter(h => h.is_verified).length, houseUnverified = houses.filter(h => !h.is_verified).length;
    const jobLive = jobs.filter(j => j.is_open).length, jobVerified = jobs.filter(j => j.is_verified).length, jobUnverified = jobs.filter(j => !j.is_verified).length;
    const totalListings = shops.length + houses.length + jobs.length;

    useEffect(() => { loadProfile(); loadCities(); loadCategories(); loadUserShopsForJob(); loadTotalViews(); }, []);
    useEffect(() => { if (shopForm.city) loadAreasFor(shopForm.city, setShopAreas); else setShopAreas([]); }, [shopForm.city]);
    useEffect(() => { if (houseForm.city) loadAreasFor(houseForm.city, setHouseAreas); else setHouseAreas([]); }, [houseForm.city]);
    useEffect(() => { if (jobForm.city) loadAreasFor(jobForm.city, setJobAreas); else setJobAreas([]); }, [jobForm.city]);
    useEffect(() => {
        if (shopForm.category) {
            const cat = shopCategories.find(c => c.name === shopForm.category);
            setSelectedCategoryItems(cat?.key_items || []);
        } else setSelectedCategoryItems([]);
    }, [shopForm.category, shopCategories]);

    useEffect(() => () => {
        if (shopObjUrl) URL.revokeObjectURL(shopObjUrl);
        if (houseObjUrl) URL.revokeObjectURL(houseObjUrl);
    }, []);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const r = await getProfile();
            setProfile(r.user); setShops(r.shops || []); setHouses(r.houses || []); setJobs(r.jobs || []);
            setFormData({ full_name: r.user.full_name || '', area: r.user.area || '', city: r.user.city || '', state: r.user.state || '' });
        } catch (error) {
            showToast(error.message || 'Failed to load profile', 'error');
        } finally { setLoading(false); }
    };

    const loadTotalViews = async () => {
        try { const r = await getTotalViews(); setTotalViews(r.total_views); setViewBreakdown(r.breakdown); }
        catch (err) { console.error('Failed to load views:', err); }
    };

    const loadCities = async () => {
        try { const r = await getAllCities(); setCities(r.cities || []); }
        catch (err) { console.error('Failed to load cities:', err); }
    };

    const loadAreasFor = async (city, setter) => {
        try { const r = await getAreasByCity(city); setter(r.areas || []); }
        catch { setter([]); }
    };

    const loadCategories = async () => {
        try { const r = await getShopCategories(); setShopCategories(r?.categories?.length ? r.categories : []); }
        catch (err) { console.error('Failed to load categories:', err); }
    };

    const loadUserShopsForJob = async () => {
        try { const r = await getUserShopsForJob(); setUserShopsForJob(r.shops || []); }
        catch (err) { console.error('Failed to load user shops:', err); }
    };

    const getCurrentLocation = (setter) => {
        if (!navigator.geolocation) { showToast('Geolocation not supported', 'error'); return; }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const lat = pos.coords.latitude, lng = pos.coords.longitude;
            try {
                const info = await locationService.reverseGeocode(lat, lng);
                const matched = cities.find(c => c.name.toLowerCase() === (info?.city || '').toLowerCase());
                setter(p => ({ ...p, latitude: lat, longitude: lng, city: matched ? matched.name : (info?.city || ''), area: info?.area || '', state: info?.state || p.state || '' }));
                showToast(`📍 ${info?.area ? info.area + ', ' : ''}${info?.city || 'Location found'}`);
            } catch {
                setter(p => ({ ...p, latitude: lat, longitude: lng }));
                showToast('Location detected but address not found', 'error');
            } finally { setLocating(false); }
        }, (err) => { setLocating(false); showToast(err.message || 'Location access denied', 'error'); }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
    };

    // ─────────────────────────────────────────────────────────────────────────
    // FIX: PWA-safe image handlers
    // Uses async openImagePicker — works reliably in iOS/Android PWA standalone mode
    // ─────────────────────────────────────────────────────────────────────────
    const handlePickShopImage = useCallback(async () => {
        try {
            const result = await openImagePicker((file, url) => {
                // Revoke previous object URL
                setShopObjUrl(prev => {
                    if (prev) URL.revokeObjectURL(prev);
                    return url;
                });
                // Update form state immediately
                setShopForm(p => ({ ...p, shop_image: file, shop_image_preview: url }));
                showToast('Image selected ✓');
            });
            if (!result) {
                // User cancelled, no toast needed
            }
        } catch (err) {
            showToast('Failed to pick image. Please try again.', 'error');
        }
    }, [showToast]);

    const handlePickHouseImage = useCallback(async () => {
        try {
            const result = await openImagePicker((file, url) => {
                setHouseObjUrl(prev => {
                    if (prev) URL.revokeObjectURL(prev);
                    return url;
                });
                setHouseForm(p => ({ ...p, house_image: file, house_image_preview: url }));
                showToast('Image selected ✓');
            });
        } catch (err) {
            showToast('Failed to pick image. Please try again.', 'error');
        }
    }, [showToast]);

    const verifyShopLoc = async () => {
        if (!shopForm.city || !shopForm.area || !shopForm.latitude) {
            showToast('Get location first, then select city & area', 'error'); return false;
        }
        setShopVerifying(true);
        try {
            const v = await verifyLocation(shopForm.latitude, shopForm.longitude, shopForm.city, shopForm.area);
            if (v.verified) { setShopLocationVerified(true); showToast('Location verified!'); return true; }
            showToast(v.message || 'Verification failed', 'error'); return false;
        } catch (err) { showToast(err.message || 'Verification error', 'error'); return false; }
        finally { setShopVerifying(false); }
    };

    const verifyHouseLoc = async () => {
        if (!houseForm.city || !houseForm.area || !houseForm.latitude) {
            showToast('Get location first, then select city & area', 'error'); return false;
        }
        setHouseVerifying(true);
        try {
            const v = await verifyLocation(houseForm.latitude, houseForm.longitude, houseForm.city, houseForm.area);
            if (v.verified) { setHouseLocationVerified(true); showToast('Location verified!'); return true; }
            showToast(v.message || 'Verification failed', 'error'); return false;
        } catch (err) { showToast(err.message || 'Verification error', 'error'); return false; }
        finally { setHouseVerifying(false); }
    };

    const handleSaveProfile = async () => {
        if (!formData.full_name.trim()) { showToast('Name is required', 'error'); return; }
        setSaving(true);
        try {
            const r = await updateProfile(formData);
            setProfile(r.user); updateUser(r.user);
            showToast('Profile updated!'); closeModal();
        } catch (err) { showToast(err.message || 'Failed to update profile', 'error'); }
        finally { setSaving(false); }
    };

    const handleChangePassword = async () => {
        if (passwordData.new_password !== passwordData.confirm_password) { showToast('Passwords do not match', 'error'); return; }
        if (passwordData.new_password.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }
        try {
            await changePassword({ current_password: passwordData.current_password, new_password: passwordData.new_password });
            showToast('Password changed successfully!'); closeModal();
            setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
        } catch (err) { showToast(err.message || 'Failed to change password', 'error'); }
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) { showToast('Please enter your password to confirm', 'error'); return; }
        try {
            await deleteAccount(deletePassword);
            showToast('Account deleted successfully');
            setTimeout(() => logout(), 1500);
        } catch (err) { showToast(err.message || 'Failed to delete account', 'error'); }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // FIX: Shop create/update — proper FormData + error handling
    // ─────────────────────────────────────────────────────────────────────────
    const handleCreateShop = async () => {
        if (!shopForm.business_name?.trim() || !shopForm.category || !shopForm.city || !shopForm.state) {
            showToast('Please fill all required fields', 'error'); return;
        }
        if (!shopLocationVerified) {
            const ok = await verifyShopLoc(); if (!ok) return;
        }
        setCreatingShop(true);
        try {
            const fd = new FormData();
            ['business_name', 'category', 'additional_phone', 'area', 'city', 'state', 'description', 'opening_time', 'closing_time'].forEach(k => fd.append(k, shopForm[k] || ''));
            fd.append('keywords', JSON.stringify(shopForm.keywords || []));
            fd.append('latitude', String(shopForm.latitude || ''));
            fd.append('longitude', String(shopForm.longitude || ''));
            if (shopForm.shop_image instanceof File) fd.append('shop_image', shopForm.shop_image);

            const token = localStorage.getItem('nearzo_token');
            const res = await fetch(`${API_URL}/profile/shops`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: fd
            });

            if (!res.ok) {
                const errText = await res.text();
                let errMsg = `Server error ${res.status}`;
                try { errMsg = JSON.parse(errText).message || errMsg; } catch { }
                throw new Error(errMsg);
            }

            const r = await res.json();
            if (r.success) {
                showToast('Shop created successfully! 🎉');
                closeModal(); loadProfile(); loadUserShopsForJob(); loadTotalViews();
                setShopForm(emptyShop); setShopLocationVerified(false);
                if (shopObjUrl) { URL.revokeObjectURL(shopObjUrl); setShopObjUrl(''); }
            } else {
                showToast(r.message || 'Failed to create shop', 'error');
            }
        } catch (err) {
            console.error('Create shop error:', err);
            showToast(err.message || 'Network error. Please check your connection.', 'error');
        } finally { setCreatingShop(false); }
    };

    const handleUpdateShop = async () => {
        if (!shopForm.business_name?.trim() || !shopForm.category) {
            showToast('Business name and category are required', 'error'); return;
        }
        setUpdatingShop(true);
        try {
            const fd = new FormData();
            ['business_name', 'category', 'additional_phone', 'area', 'city', 'state', 'description', 'opening_time', 'closing_time'].forEach(k => fd.append(k, shopForm[k] || ''));
            fd.append('keywords', JSON.stringify(shopForm.keywords || []));
            fd.append('latitude', String(shopForm.latitude || ''));
            fd.append('longitude', String(shopForm.longitude || ''));
            // FIX: Only append new image if user selected one (instanceof File check)
            if (shopForm.shop_image instanceof File) {
                fd.append('shop_image', shopForm.shop_image);
            }

            const token = localStorage.getItem('nearzo_token');
            const res = await fetch(`${API_URL}/profile/shops/${editingShop.id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: fd
            });

            if (!res.ok) {
                const errText = await res.text();
                let errMsg = `Server error ${res.status}`;
                try { errMsg = JSON.parse(errText).message || errMsg; } catch { }
                throw new Error(errMsg);
            }

            const r = await res.json();
            if (r.success) {
                showToast('Shop updated successfully! ✓');
                closeModal(); loadProfile(); loadUserShopsForJob(); loadTotalViews();
                setEditingShop(null);
                if (shopObjUrl) { URL.revokeObjectURL(shopObjUrl); setShopObjUrl(''); }
            } else {
                showToast(r.message || 'Failed to update shop', 'error');
            }
        } catch (err) {
            console.error('Update shop error:', err);
            showToast(err.message || 'Network error. Please check your connection.', 'error');
        } finally { setUpdatingShop(false); }
    };

    const handleDeleteShopConfirm = async () => {
        if (!deleteConfirm) return;
        try {
            const r = await deleteShop(deleteConfirm.id);
            showToast(r.message || 'Shop deleted successfully');
            closeModal(); loadProfile(); loadUserShopsForJob(); loadTotalViews();
        } catch (err) { showToast(err.message || 'Failed to delete shop', 'error'); }
    };

    const openEditShop = async (shop) => {
        try {
            const r = await getShopByIdForEdit(shop.id);
            const s = r.shop;
            setEditingShop(s);
            let keywordsArray = [];
            if (s.keywords) {
                if (Array.isArray(s.keywords)) keywordsArray = s.keywords;
                else if (typeof s.keywords === 'string') {
                    try { keywordsArray = JSON.parse(s.keywords); } catch { keywordsArray = []; }
                }
            }
            setShopForm({
                business_name: s.business_name,
                category: s.category,
                additional_phone: s.additional_phone || '',
                keywords: keywordsArray,
                custom_keyword: '',
                latitude: s.latitude || '',
                longitude: s.longitude || '',
                area: s.area || '',
                city: s.city || '',
                state: s.state || '',
                description: s.description || '',
                opening_time: s.opening_time ? s.opening_time.slice(0, 5) : '',
                closing_time: s.closing_time ? s.closing_time.slice(0, 5) : '',
                shop_image: null,
                shop_image_preview: s.shop_image || ''
            });
            setShopLocationVerified(s.is_verified);
            setModal('editShop');
        } catch (err) { showToast(err.message || 'Failed to load shop details', 'error'); }
    };

    const openDeleteShopConfirm = (shop) => { setDeleteConfirm(shop); setModal('deleteShopConfirm'); };

    // ─────────────────────────────────────────────────────────────────────────
    // FIX: House create/update — proper error handling
    // ─────────────────────────────────────────────────────────────────────────
    const handleCreateHouse = async () => {
        if (!houseForm.rooms || !houseForm.rent_per_month) {
            showToast('Rooms and rent amount are required', 'error'); return;
        }
        if (!houseLocationVerified) {
            const ok = await verifyHouseLoc(); if (!ok) return;
        }
        setCreatingHouse(true);
        try {
            const fd = new FormData();
            ['rooms', 'halls', 'kitchens', 'floor', 'rent_per_month', 'advance_amount', 'latitude', 'longitude', 'area', 'city', 'state', 'description'].forEach(k => fd.append(k, houseForm[k] || ''));
            fd.append('is_available', String(houseForm.is_available));
            if (houseForm.house_image instanceof File) fd.append('house_image', houseForm.house_image);

            const token = localStorage.getItem('nearzo_token');
            const res = await fetch(`${API_URL}/profile/houses`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: fd
            });

            if (!res.ok) {
                const errText = await res.text();
                let errMsg = `Server error ${res.status}`;
                try { errMsg = JSON.parse(errText).message || errMsg; } catch { }
                throw new Error(errMsg);
            }

            const r = await res.json();
            if (r.success) {
                showToast('House listed successfully! 🏠');
                closeModal(); loadProfile(); loadTotalViews();
                setHouseForm(emptyHouse); setHouseLocationVerified(false);
                if (houseObjUrl) { URL.revokeObjectURL(houseObjUrl); setHouseObjUrl(''); }
            } else {
                showToast(r.message || 'Failed to list house', 'error');
            }
        } catch (err) {
            console.error('Create house error:', err);
            showToast(err.message || 'Network error. Please check your connection.', 'error');
        } finally { setCreatingHouse(false); }
    };

    const handleUpdateHouse = async () => {
        setUpdatingHouse(true);
        try {
            const fd = new FormData();
            ['rooms', 'halls', 'kitchens', 'floor', 'rent_per_month', 'advance_amount', 'latitude', 'longitude', 'area', 'city', 'state', 'description'].forEach(k => fd.append(k, houseForm[k] || ''));
            fd.append('is_available', String(houseForm.is_available));
            // FIX: Only append if new image selected
            if (houseForm.house_image instanceof File) {
                fd.append('house_image', houseForm.house_image);
            }

            const token = localStorage.getItem('nearzo_token');
            const res = await fetch(`${API_URL}/profile/houses/${editingHouse.id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: fd
            });

            if (!res.ok) {
                const errText = await res.text();
                let errMsg = `Server error ${res.status}`;
                try { errMsg = JSON.parse(errText).message || errMsg; } catch { }
                throw new Error(errMsg);
            }

            const r = await res.json();
            if (r.success) {
                showToast('House updated successfully! ✓');
                closeModal(); loadProfile(); loadTotalViews();
                if (houseObjUrl) { URL.revokeObjectURL(houseObjUrl); setHouseObjUrl(''); }
            } else {
                showToast(r.message || 'Failed to update house', 'error');
            }
        } catch (err) {
            console.error('Update house error:', err);
            showToast(err.message || 'Network error. Please check your connection.', 'error');
        } finally { setUpdatingHouse(false); }
    };


// Update the handleCreateJob function to include contact_phone:
const handleCreateJob = async () => {
    if (!jobForm.company_name?.trim() || !jobForm.job_title?.trim() || !jobForm.salary) {
        showToast('Company name, job title, and salary are required', 'error'); 
        return;
    }
    if (!jobForm.contact_phone?.trim()) {
        showToast('Contact phone number is required', 'error');
        return;
    }
    setCreatingJob(true);
    try {
        const r = await createJob({ 
            ...jobForm, 
            salary: +jobForm.salary, 
            shop_id: jobForm.shop_id || null, 
            contact_phone: jobForm.contact_phone  // Add this
        });
        if (r.success) {
            showToast('Job posted successfully! 💼');
            closeModal(); 
            loadProfile(); 
            loadTotalViews(); 
            setJobForm(emptyJob);
        } else { 
            showToast(r.message || 'Failed to post job', 'error'); 
        }
    } catch (err) { 
        showToast(err.message || 'Failed to post job', 'error'); 
    } finally { 
        setCreatingJob(false); 
    }
};

// In Profile.jsx - Fix handleUpdateJob

const handleUpdateJob = async () => {
    // Validate required fields
    if (!jobForm.company_name?.trim()) {
        showToast('Company name is required', 'error');
        return;
    }
    if (!jobForm.job_title?.trim()) {
        showToast('Job title is required', 'error');
        return;
    }
    if (!jobForm.salary) {
        showToast('Salary is required', 'error');
        return;
    }
    if (!jobForm.city?.trim()) {
        showToast('City is required', 'error');
        return;
    }
    if (!jobForm.state?.trim()) {
        showToast('State is required', 'error');
        return;
    }
    
    setUpdatingJob(true);
    try {
        const updateData = {
            shop_id: jobForm.shop_id || null,
            company_name: jobForm.company_name,
            job_title: jobForm.job_title,
            salary: parseFloat(jobForm.salary),
            salary_type: jobForm.salary_type,
            qualification: jobForm.qualification || null,
            job_type: jobForm.job_type,
            area: jobForm.area || null,
            city: jobForm.city,
            state: jobForm.state,
            is_open: jobForm.is_open,
            contact_phone: jobForm.contact_phone || null
        };
        
        console.log('Updating job with data:', updateData);
        
        await updateJob(editingJob.id, updateData);
        
        showToast('Job updated successfully! ✓');
        closeModal();
        loadProfile();
        loadTotalViews();
    } catch (err) {
        console.error('Update job error:', err);
        showToast(err.message || 'Failed to update job', 'error');
    } finally {
        setUpdatingJob(false);
    }
};

// Update openEditJob to include contact_phone:
// In Profile.jsx - Fix openEditJob function

const openEditJob = (j) => {
    setEditingJob(j);
    setJobForm({
        shop_id: j.shop_id || '', 
        company_name: j.company_name || '', 
        job_title: j.job_title || '',
        salary: j.salary || '', 
        salary_type: j.salary_type || 'month', 
        qualification: j.qualification || '',
        job_type: j.job_type || 'full_time', 
        area: j.area || '', 
        city: j.city || '', 
        state: j.state || '', 
        is_open: j.is_open === true || j.is_open === false ? j.is_open : true,
        contact_phone: j.contact_phone || ''
    });
    setModal('editJob');
};

    const openEditHouse = (h) => {
        setEditingHouse(h);
        setHouseForm({
            rooms: h.rooms, halls: h.halls, kitchens: h.kitchens, floor: h.floor,
            rent_per_month: h.rent_per_month, advance_amount: h.advance_amount || '',
            latitude: h.latitude || '', longitude: h.longitude || '',
            area: h.area || '', city: h.city || '', state: h.state || '',
            description: h.description || '', is_available: h.is_available,
            house_image: null, house_image_preview: h.house_image || ''
        });
        setModal('editHouse');
    };

  
    const handleShopSelect = (id) => {
        const s = userShopsForJob.find(x => x.id === Number(id));
        setJobForm(p => ({ ...p, shop_id: id, company_name: s ? s.business_name : '', area: s?.area || '', city: s?.city || '', state: s?.state || '' }));
    };

    const handleAddCustomKeyword = () => {
        const kw = shopForm.custom_keyword.trim();
        if (!kw) return;
        if (shopForm.keywords.some(k => k.toLowerCase() === kw.toLowerCase())) { showToast('Keyword already added', 'error'); return; }
        setShopForm(p => ({ ...p, keywords: [...p.keywords, kw], custom_keyword: '' }));
    };

    const handleRemoveKeyword = (kw) => setShopForm(p => ({ ...p, keywords: p.keywords.filter(k => k !== kw) }));

    // ─── Shared shop form fields
    const ShopFormFields = () => (
        <FormGrid>
            <FormItem full>
                <Input label="Business Name *" value={shopForm.business_name}
                    onChange={e => setShopForm(p => ({ ...p, business_name: e.target.value }))} />
            </FormItem>
            <FormItem full>
                <SelectField label="Category *" value={shopForm.category}
                    onChange={e => setShopForm(p => ({ ...p, category: e.target.value, keywords: [] }))}
                    options={[{ value: '', label: 'Select Category' }, ...shopCategories.map(c => ({ value: c.name, label: c.name }))]} />
            </FormItem>

            {selectedCategoryItems.length > 0 && (
                <FormItem full>
                    <FieldLabel>Key Items — tap to select</FieldLabel>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                        {selectedCategoryItems.map(item => {
                            const sel = shopForm.keywords.includes(item.item_name);
                            return (
                                <span key={item.id}
                                    onClick={() => { if (!sel) setShopForm(p => ({ ...p, keywords: [...p.keywords, item.item_name] })); }}
                                    style={{ padding: '5px 12px', borderRadius: 99, border: `1.5px solid ${sel ? '#2563EB' : '#E5E7EB'}`, background: sel ? '#EFF6FF' : '#F9FAFB', color: sel ? '#2563EB' : '#374151', fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all .15s' }}>
                                    {item.item_name}
                                </span>
                            );
                        })}
                    </div>
                </FormItem>
            )}

            <FormItem full>
                <FieldLabel>Custom Keyword</FieldLabel>
                <div style={{ display: 'flex', gap: 8 }}>
                    <input
                        style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, color: '#111827', background: '#FAFAFA', outline: 'none', fontFamily: 'var(--font)', minWidth: 0 }}
                        placeholder="e.g. Fresh Juice"
                        value={shopForm.custom_keyword}
                        onChange={e => setShopForm(p => ({ ...p, custom_keyword: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCustomKeyword())}
                    />
                    <button onClick={handleAddCustomKeyword} style={{ padding: '0 14px', borderRadius: 10, border: '1.5px solid #2563EB', background: '#EFF6FF', color: '#2563EB', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 13, whiteSpace: 'nowrap', flexShrink: 0 }}>Add</button>
                </div>
            </FormItem>

            {shopForm.keywords.length > 0 && (
                <FormItem full>
                    <FieldLabel>Selected Keywords</FieldLabel>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                        {shopForm.keywords.map(kw => (
                            <span key={kw} style={{ padding: '5px 12px', borderRadius: 99, background: '#EFF6FF', border: '1.5px solid #2563EB', color: '#2563EB', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                                {kw}
                                <span onClick={() => handleRemoveKeyword(kw)} style={{ cursor: 'pointer', fontSize: 16, lineHeight: 1, opacity: .7 }}>×</span>
                            </span>
                        ))}
                    </div>
                </FormItem>
            )}

            <FormItem half>
                <Input label="Additional Phone" value={shopForm.additional_phone}
                    onChange={e => setShopForm(p => ({ ...p, additional_phone: e.target.value }))} />
            </FormItem>
            <FormItem half>
                <Input label="Opening Time" type="time" value={shopForm.opening_time}
                    onChange={e => setShopForm(p => ({ ...p, opening_time: e.target.value }))} />
            </FormItem>
            <FormItem half>
                <Input label="Closing Time" type="time" value={shopForm.closing_time}
                    onChange={e => setShopForm(p => ({ ...p, closing_time: e.target.value }))} />
            </FormItem>
            <FormItem full>
                <Textarea label="Description" value={shopForm.description}
                    onChange={e => setShopForm(p => ({ ...p, description: e.target.value }))} />
            </FormItem>
            <FormItem full>
                <FieldLabel>Shop Image</FieldLabel>
                <ImageUpload
                    preview={shopForm.shop_image_preview}
                    isNew={!!shopForm.shop_image}
                    onPick={handlePickShopImage}
                />
            </FormItem>
        </FormGrid>
    );

    if (loading) {
        return (
            <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB' }}>
                <Spinner size={36} color="#2563EB" />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100dvh', background: '#F9FAFB', fontFamily: 'var(--font)' }}>
            <Toast msg={toast.msg} type={toast.type} />

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(14px, 3vw, 20px) clamp(10px, 3vw, 16px) 100px' }}>
                <div className="profile-layout">

                    {/* ── SIDEBAR ── */}
                    <div className="profile-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {/* Profile Card */}
                        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', padding: 'clamp(16px,4vw,24px) clamp(14px,4vw,20px) 18px', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{ width: 66, height: 66, borderRadius: '50%', background: 'linear-gradient(135deg,#2563EB,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                    {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 17, fontWeight: 800, color: '#111827', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.full_name}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#6B7280', marginBottom: 2 }}>
                                        <Icon name="phone" size={13} color="#9CA3AF" /> {profile?.phone}
                                    </div>
                                    {(profile?.city || profile?.area) && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6B7280' }}>
                                            <Icon name="location_on" size={13} color="#9CA3AF" />
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {[profile.area, profile.city, profile.state].filter(Boolean).join(', ')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => { setFormData({ full_name: profile?.full_name || '', area: profile?.area || '', city: profile?.city || '', state: profile?.state || '' }); setModal('editProfile'); }}
                                style={{ marginTop: 14, width: '100%', padding: '9px', borderRadius: 10, border: '1.5px solid #E5E7EB', background: '#F9FAFB', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'var(--font)' }}>
                                <Icon name="edit" size={14} color="#374151" /> Edit Profile
                            </button>
                        </div>

                        {/* Stats */}
                        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: '14px', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <StatCard iconName="store" count={totalListings} label="Total Listings" iconColor="#2563EB" iconBg="#DBEAFE" />
                                <StatCard iconName="visibility" count={totalViews} label="Total Views" iconColor="#7C3AED" iconBg="#EDE9FE" />
                            </div>
                        </div>

                        {/* Other */}
                        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: '4px 16px', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', padding: '10px 0 2px', textTransform: 'uppercase', letterSpacing: '.6px' }}>Other</div>
                            <DetailRow iconName="help_outline" iconColor="#2563EB" iconBg="#EFF6FF" label="Help & Support" onClick={() => setModal('support')} />
                            <DetailRow iconName="info_outline" iconColor="#7C3AED" iconBg="#F5F3FF" label="About NearZO" onClick={() => setModal('about')} last />
                        </div>

                        {/* Settings */}
                        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: '4px 16px', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', padding: '10px 0 2px', textTransform: 'uppercase', letterSpacing: '.6px' }}>Settings</div>
                            <DetailRow iconName="person_outline" iconColor="#2563EB" iconBg="#EFF6FF" label="Edit Profile"
                                onClick={() => { setFormData({ full_name: profile?.full_name || '', area: profile?.area || '', city: profile?.city || '', state: profile?.state || '' }); setModal('editProfile'); }} />
                            <DetailRow iconName="lock_outline" iconColor="#16A34A" iconBg="#DCFCE7" label="Change Password" onClick={() => setModal('password')} />
                            <DetailRow iconName="logout" iconColor="#DC2626" iconBg="#FEE2E2" label="Logout" onClick={logout} danger />
                            <DetailRow iconName="delete_outline" iconColor="#DC2626" iconBg="#FEE2E2" label="Delete Account" onClick={() => setModal('delete')} danger last />
                        </div>
                    </div>

                    {/* ── RIGHT COLUMN ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: '#111827', marginBottom: 10, marginTop: 20 }}>Manage Your Listings</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <ListingSection iconName="storefront" iconColor="#2563EB" iconBg="#DBEAFE" title="Manage Shops" subtitle="Add, edit or manage your shop listings" badgeCount={shopLive} badgeColor="#2563EB" badgeBg="#EFF6FF" liveCount={shopLive} verifiedCount={shopVerified} unverifiedCount={shopUnverified} onAdd={() => setModal('shop')} addLabel="Add Shop" onManage={() => {}} viewCount={viewBreakdown.shops} />
                                <ListingSection iconName="home" iconColor="#16A34A" iconBg="#DCFCE7" title="Manage Houses" subtitle="Add, edit or manage your house listings" badgeCount={houseLive} badgeColor="#16A34A" badgeBg="#F0FDF4" liveCount={houseLive} verifiedCount={houseVerified} unverifiedCount={houseUnverified} onAdd={() => setModal('house')} addLabel="Add House" onManage={() => {}} viewCount={viewBreakdown.houses} />
                                <ListingSection iconName="work" iconColor="#EA580C" iconBg="#FFEDD5" title="Manage Jobs" subtitle="Add, edit or manage your job listings" badgeCount={jobLive} badgeColor="#EA580C" badgeBg="#FFF7ED" liveCount={jobLive} verifiedCount={jobVerified} unverifiedCount={jobUnverified} onAdd={() => setModal('job')} addLabel="Add Job" onManage={() => {}} viewCount={viewBreakdown.jobs} />
                            </div>
                        </div>

                        {/* Tabs */}
                        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ display: 'flex', borderBottom: '1px solid #F3F4F6' }}>
                                {[
                                    { key: 'shops', label: 'Shops', count: shops.length, icon: 'storefront' },
                                    { key: 'houses', label: 'Houses', count: houses.length, icon: 'home' },
                                    { key: 'jobs', label: 'Jobs', count: jobs.length, icon: 'work' },
                                ].map(t => (
                                    <button key={t.key} onClick={() => setActiveTab(t.key)}
                                        style={{ flex: 1, padding: 'clamp(10px,2.5vw,14px) 6px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 'clamp(12px,3vw,13px)', fontWeight: 600, fontFamily: 'var(--font)', color: activeTab === t.key ? '#2563EB' : '#9CA3AF', borderBottom: activeTab === t.key ? '2.5px solid #2563EB' : '2.5px solid transparent' }}>
                                        <Icon name={t.icon} size={15} color={activeTab === t.key ? '#2563EB' : '#9CA3AF'} />
                                        {t.label}
                                        <span style={{ padding: '2px 6px', borderRadius: 99, background: activeTab === t.key ? '#EFF6FF' : '#F3F4F6', color: activeTab === t.key ? '#2563EB' : '#9CA3AF', fontSize: 11, fontWeight: 700 }}>{t.count}</span>
                                    </button>
                                ))}
                            </div>

                            <div style={{ padding: 'clamp(10px, 2.5vw, 16px)' }}>
                                {/* SHOPS */}
                                {activeTab === 'shops' && (
                                    shops.length === 0
                                        ? <Empty label="No shops yet. Add your first shop!" />
                                        : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(140px, 40vw, 180px), 1fr))', gap: 10 }}>
                                            {shops.map(s => (
                                                <div key={s.id} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                                                    <div style={{ width: '100%', height: 90, overflow: 'hidden', background: '#EFF6FF' }}>
                                                        {s.shop_image && s.shop_image.startsWith('http') ? (
                                                            <img src={s.shop_image} alt={s.business_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                onError={e => { e.target.style.display = 'none'; const p = e.target.parentElement; if (p) p.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center"><span class="mi" style="font-size:30px;color:#BFDBFE">storefront</span></div>'; }} />
                                                        ) : (
                                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="storefront" size={30} color="#BFDBFE" /></div>
                                                        )}
                                                    </div>
                                                    <div style={{ padding: '9px 10px 11px' }}>
                                                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.business_name}</div>
                                                        <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 3 }}>{s.category}</div>
                                                        {(s.opening_time || s.closing_time) && (
                                                            <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
                                                                <Icon name="schedule" size={10} color="#9CA3AF" />
                                                                {s.opening_time?.slice(0, 5)}{s.opening_time && s.closing_time && ' – '}{s.closing_time?.slice(0, 5)}
                                                            </div>
                                                        )}
                                                        <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 3 }}>
                                                            <Icon name="visibility" size={11} color="#9CA3AF" /> {s.views_count || 0} views
                                                        </div>
                                                        <div style={{ marginBottom: 7 }}>
                                                            {s.is_verified ? <Badge label="Verified" color="#16A34A" bg="#DCFCE7" dot /> : <Badge label="Unverified" color="#DC2626" bg="#FEE2E2" dot />}
                                                        </div>
                                                        <div style={{ display: 'flex', gap: 5 }}>
                                                            <button onClick={() => openEditShop(s)} style={{ flex: 1, padding: '6px', borderRadius: 7, border: '1px solid #2563EB', background: '#EFF6FF', color: '#2563EB', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>Edit</button>
                                                            <button onClick={() => openDeleteShopConfirm(s)} style={{ flex: 1, padding: '6px', borderRadius: 7, border: '1px solid #DC2626', background: '#FEE2E2', color: '#DC2626', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>Delete</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                )}

                                {/* HOUSES */}
                                {activeTab === 'houses' && (
                                    houses.length === 0
                                        ? <Empty label="No houses listed yet." />
                                        : <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            {houses.map(h => (
                                                <div key={h.id} style={{ border: '1px solid #E5E7EB', borderRadius: 14, overflow: 'hidden', background: '#fff', boxShadow: 'var(--shadow-sm)', display: 'flex' }}>
                                                    <div style={{ width: 90, flexShrink: 0 }}>
                                                        {h.house_image && h.house_image.startsWith('http') ? (
                                                            <img src={h.house_image} alt="House" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                                                onError={e => { e.target.style.display = 'none'; const p = e.target.parentElement; if (p) p.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#F0FDF4"><span class="mi" style="font-size:28px;color:#BBF7D0">home</span></div>'; }} />
                                                        ) : (
                                                            <div style={{ width: '100%', height: '100%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 88 }}><Icon name="home" size={28} color="#BBF7D0" /></div>
                                                        )}
                                                    </div>
                                                    <div style={{ padding: '11px 12px', flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontSize: 14, fontWeight: 700 }}>{h.rooms} BHK House</div>
                                                        <div style={{ fontSize: 13, color: '#2563EB', fontWeight: 700 }}>{formatPrice(h.rent_per_month)}/mo</div>
                                                        <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                                                            <Icon name="visibility" size={12} color="#9CA3AF" /> {h.views_count || 0}
                                                        </div>
                                                        <div style={{ marginTop: 5, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                                                            <Badge label={h.is_available ? 'Available' : 'Booked'} color={h.is_available ? '#16A34A' : '#DC2626'} bg={h.is_available ? '#DCFCE7' : '#FEE2E2'} dot />
                                                            {h.is_verified ? <Badge label="Verified" color="#16A34A" bg="#DCFCE7" dot /> : <Badge label="Unverified" color="#DC2626" bg="#FEE2E2" dot />}
                                                        </div>
                                                        <div style={{ marginTop: 7 }}>
                                                            <Btn size="sm" variant="secondary" onClick={() => openEditHouse(h)} icon={<Icon name="edit" size={13} color="#374151" />}>Edit</Btn>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                )}

                                {/* JOBS */}
                                {activeTab === 'jobs' && (
                                    jobs.length === 0
                                        ? <Empty label="No jobs posted yet." />
                                        : <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            {jobs.map(j => (
                                                <div key={j.id} style={{ border: '1px solid #E5E7EB', borderRadius: 14, padding: '12px 14px', background: '#fff', boxShadow: 'var(--shadow-sm)' }}>
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.job_title}</div>
                                                            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 3 }}>{j.shop_name || j.company_name}</div>
                                                            <div style={{ fontSize: 14, fontWeight: 700, color: '#2563EB' }}>{formatPrice(j.salary)}/{j.salary_type === 'month' ? 'mo' : 'day'}</div>
                                                            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
                                                                <Icon name="visibility" size={12} color="#9CA3AF" /> {j.views_count || 0}
                                                            </div>
                                                            <div style={{ display: 'flex', gap: 5, marginTop: 7, flexWrap: 'wrap' }}>
                                                                <Badge label={j.is_open ? 'Open' : 'Closed'} color={j.is_open ? '#16A34A' : '#DC2626'} bg={j.is_open ? '#DCFCE7' : '#FEE2E2'} dot />
                                                                <Badge label={j.job_type === 'full_time' ? 'Full Time' : 'Part Time'} color="#6B7280" bg="#F3F4F6" />
                                                                {j.is_verified ? <Badge label="Verified" color="#16A34A" bg="#DCFCE7" dot /> : <Badge label="Unverified" color="#DC2626" bg="#FEE2E2" dot />}
                                                            </div>
                                                        </div>
                                                        <Btn size="sm" variant="secondary" onClick={() => openEditJob(j)} icon={<Icon name="edit" size={13} color="#374151" />}>Edit</Btn>
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

            {/* ═══════════════════════════════════════════
                MODALS
            ════════════════════════════════════════════ */}

            {/* Edit Profile */}
            <Modal open={modal === 'editProfile'} onClose={closeModal} title="Edit Profile"
                footer={<><Btn variant="secondary" onClick={closeModal}>Cancel</Btn><Btn variant="primary" onClick={handleSaveProfile} loading={saving}>Save</Btn></>}>
                <FormGrid>
                    <FormItem full>
                        <Input label="Full Name *" value={formData.full_name}
                            onChange={e => setFormData(p => ({ ...p, full_name: e.target.value }))} />
                    </FormItem>
                    <FormItem half>
                        <SelectField label="City" value={formData.city}
                            onChange={e => setFormData(p => ({ ...p, city: e.target.value, area: '' }))}
                            options={[{ value: '', label: 'Select City' }, ...cities.map(c => ({ value: c.name, label: c.name }))]} />
                    </FormItem>
                    <FormItem half>
                        <Input label="Area" value={formData.area}
                            onChange={e => setFormData(p => ({ ...p, area: e.target.value }))} />
                    </FormItem>
                    <FormItem half>
                        <Input label="State" value={formData.state}
                            onChange={e => setFormData(p => ({ ...p, state: e.target.value }))} />
                    </FormItem>
                </FormGrid>
            </Modal>

            {/* Change Password */}
            <Modal open={modal === 'password'} onClose={closeModal} title="Change Password"
                footer={<><Btn variant="secondary" onClick={closeModal}>Cancel</Btn><Btn variant="primary" onClick={handleChangePassword}>Update</Btn></>}>
                <FormGrid>
                    <FormItem full>
                        <Input label="Current Password" type="password" value={passwordData.current_password}
                            onChange={e => setPasswordData(p => ({ ...p, current_password: e.target.value }))} />
                    </FormItem>
                    <FormItem full>
                        <Input label="New Password" type="password" value={passwordData.new_password}
                            onChange={e => setPasswordData(p => ({ ...p, new_password: e.target.value }))} />
                    </FormItem>
                    <FormItem full>
                        <Input label="Confirm New Password" type="password" value={passwordData.confirm_password}
                            onChange={e => setPasswordData(p => ({ ...p, confirm_password: e.target.value }))} />
                    </FormItem>
                </FormGrid>
            </Modal>

            {/* Delete Account */}
            <Modal open={modal === 'delete'} onClose={closeModal} title="Delete Account"
                footer={<><Btn variant="secondary" onClick={closeModal}>Cancel</Btn><Btn variant="danger" onClick={handleDeleteAccount}>Delete Account</Btn></>}>
                <AlertBox type="danger" icon="warning">
                    This action is <strong>irreversible</strong>. All your listings and data will be permanently deleted.
                </AlertBox>
                <Input label="Enter your password to confirm" type="password" value={deletePassword}
                    onChange={e => setDeletePassword(e.target.value)} />
            </Modal>

            {/* Add Shop */}
            <Modal open={modal === 'shop'} onClose={closeModal} title="Add New Shop"
                footer={<><Btn variant="secondary" onClick={closeModal}>Cancel</Btn><Btn variant="primary" onClick={handleCreateShop} loading={creatingShop} icon={<Icon name="storefront" size={15} color="#fff" />}>Create Shop</Btn></>}>
                <ShopFormFields />
                <div style={{ height: 12 }} />
                <div className="form-grid">
                    <LocationSection
                        lat={shopForm.latitude} lng={shopForm.longitude}
                        city={shopForm.city} area={shopForm.area} state={shopForm.state}
                        cities={cities} areas={shopAreas}
                        locating={locating} verified={shopLocationVerified} verifying={shopVerifying}
                        onGetLocation={() => getCurrentLocation(setShopForm)}
                        onVerify={verifyShopLoc}
                        onCityChange={v => setShopForm(p => ({ ...p, city: v, area: '' }))}
                        onAreaChange={v => setShopForm(p => ({ ...p, area: v }))}
                        onStateChange={v => setShopForm(p => ({ ...p, state: v }))}
                    />
                </div>
            </Modal>

            {/* Edit Shop */}
            <Modal open={modal === 'editShop'} onClose={closeModal} title="Edit Shop"
                footer={<><Btn variant="secondary" onClick={closeModal}>Cancel</Btn><Btn variant="primary" onClick={handleUpdateShop} loading={updatingShop}>Save Changes</Btn></>}>
                <ShopFormFields />
                <div style={{ height: 12 }} />
                <div className="form-grid">
                    <SectionDivider label="Location" />
                    <div className="form-item-half">
                        <Input label="City" value={shopForm.city}
                            onChange={e => setShopForm(p => ({ ...p, city: e.target.value }))} />
                    </div>
                    <div className="form-item-half">
                        <Input label="Area" value={shopForm.area}
                            onChange={e => setShopForm(p => ({ ...p, area: e.target.value }))} />
                    </div>
                    <div className="form-item-full">
                        <Input label="State" value={shopForm.state}
                            onChange={e => setShopForm(p => ({ ...p, state: e.target.value }))} />
                    </div>
                </div>
            </Modal>

            {/* Delete Shop Confirm */}
            <Modal open={modal === 'deleteShopConfirm'} onClose={closeModal} title="Delete Shop"
                footer={<><Btn variant="secondary" onClick={closeModal}>Cancel</Btn><Btn variant="danger" onClick={handleDeleteShopConfirm} icon={<Icon name="delete" size={15} color="#DC2626" />}>Delete Shop</Btn></>}>
                <AlertBox type="danger" icon="warning">
                    Are you sure you want to delete <strong>{deleteConfirm?.business_name}</strong>?
                    This will also permanently remove all jobs linked to this shop.
                </AlertBox>
            </Modal>

            {/* Add House */}
            <Modal open={modal === 'house'} onClose={closeModal} title="Add New House"
                footer={<><Btn variant="secondary" onClick={closeModal}>Cancel</Btn><Btn variant="primary" onClick={handleCreateHouse} loading={creatingHouse} icon={<Icon name="home" size={15} color="#fff" />}>List House</Btn></>}>
                <FormGrid>
                    <FormItem half><Input label="Rooms *" type="number" value={houseForm.rooms} onChange={e => setHouseForm(p => ({ ...p, rooms: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Halls" type="number" value={houseForm.halls} onChange={e => setHouseForm(p => ({ ...p, halls: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Kitchens" type="number" value={houseForm.kitchens} onChange={e => setHouseForm(p => ({ ...p, kitchens: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Floor" type="number" value={houseForm.floor} onChange={e => setHouseForm(p => ({ ...p, floor: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Rent / Month (₹) *" type="number" value={houseForm.rent_per_month} onChange={e => setHouseForm(p => ({ ...p, rent_per_month: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Advance (₹)" type="number" value={houseForm.advance_amount} onChange={e => setHouseForm(p => ({ ...p, advance_amount: e.target.value }))} /></FormItem>
                    <FormItem full><Textarea label="Description" value={houseForm.description} onChange={e => setHouseForm(p => ({ ...p, description: e.target.value }))} /></FormItem>
                    <FormItem full><Toggle checked={houseForm.is_available} onChange={v => setHouseForm(p => ({ ...p, is_available: v }))} label="Available for Rent" /></FormItem>
                    <FormItem full>
                        <FieldLabel>House Image</FieldLabel>
                        <ImageUpload
                            preview={houseForm.house_image_preview}
                            isNew={!!houseForm.house_image}
                            onPick={handlePickHouseImage}
                        />
                    </FormItem>
                    <LocationSection
                        lat={houseForm.latitude} lng={houseForm.longitude}
                        city={houseForm.city} area={houseForm.area} state={houseForm.state}
                        cities={cities} areas={houseAreas}
                        locating={locating} verified={houseLocationVerified} verifying={houseVerifying}
                        onGetLocation={() => getCurrentLocation(setHouseForm)}
                        onVerify={verifyHouseLoc}
                        onCityChange={v => setHouseForm(p => ({ ...p, city: v, area: '' }))}
                        onAreaChange={v => setHouseForm(p => ({ ...p, area: v }))}
                        onStateChange={v => setHouseForm(p => ({ ...p, state: v }))}
                    />
                </FormGrid>
            </Modal>

            {/* Edit House */}
            <Modal open={modal === 'editHouse'} onClose={closeModal} title="Edit House"
                footer={<><Btn variant="secondary" onClick={closeModal}>Cancel</Btn><Btn variant="primary" onClick={handleUpdateHouse} loading={updatingHouse}>Save Changes</Btn></>}>
                <FormGrid>
                    <FormItem half><Input label="Rooms *" type="number" value={houseForm.rooms} onChange={e => setHouseForm(p => ({ ...p, rooms: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Halls" type="number" value={houseForm.halls} onChange={e => setHouseForm(p => ({ ...p, halls: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Kitchens" type="number" value={houseForm.kitchens} onChange={e => setHouseForm(p => ({ ...p, kitchens: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Floor" type="number" value={houseForm.floor} onChange={e => setHouseForm(p => ({ ...p, floor: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Rent / Month (₹) *" type="number" value={houseForm.rent_per_month} onChange={e => setHouseForm(p => ({ ...p, rent_per_month: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Advance (₹)" type="number" value={houseForm.advance_amount} onChange={e => setHouseForm(p => ({ ...p, advance_amount: e.target.value }))} /></FormItem>
                    <FormItem full><Textarea label="Description" value={houseForm.description} onChange={e => setHouseForm(p => ({ ...p, description: e.target.value }))} /></FormItem>
                    <FormItem full><Toggle checked={houseForm.is_available} onChange={v => setHouseForm(p => ({ ...p, is_available: v }))} label="Available for Rent" /></FormItem>
                    <FormItem full>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9CA3AF', padding: '8px 12px', background: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB' }}>
                            <Icon name="location_on" size={13} color="#2563EB" />
                            {[houseForm.area, houseForm.city, houseForm.state].filter(Boolean).join(', ') || 'Location not set'}
                        </div>
                    </FormItem>
                    <FormItem full>
                        <FieldLabel>House Image</FieldLabel>
                        <ImageUpload
                            preview={houseForm.house_image_preview}
                            isNew={!!houseForm.house_image}
                            onPick={handlePickHouseImage}
                        />
                    </FormItem>
                </FormGrid>
            </Modal>

            {/* Add Job */}
            <Modal open={modal === 'job'} onClose={closeModal} title="Post a Job"
                footer={<><Btn variant="secondary" onClick={closeModal}>Cancel</Btn><Btn variant="primary" onClick={handleCreateJob} loading={creatingJob} icon={<Icon name="work" size={15} color="#fff" />}>Post Job</Btn></>}>
                <FormGrid>
                    <FormItem full>
                        <SelectField label="Link to Shop (Optional)" value={jobForm.shop_id}
                            onChange={e => handleShopSelect(e.target.value)}
                            options={[{ value: '', label: '— No Shop —' }, ...userShopsForJob.map(s => ({ value: s.id, label: `${s.business_name} · ${s.city}` }))]} />
                    </FormItem>
                    <FormItem half><Input label="Company Name *" value={jobForm.company_name} onChange={e => setJobForm(p => ({ ...p, company_name: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Job Title *" value={jobForm.job_title} onChange={e => setJobForm(p => ({ ...p, job_title: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Salary *" type="number" value={jobForm.salary} onChange={e => setJobForm(p => ({ ...p, salary: e.target.value }))} /></FormItem>
                    <FormItem half>
                        <SelectField label="Salary Type" value={jobForm.salary_type}
                            onChange={e => setJobForm(p => ({ ...p, salary_type: e.target.value }))}
                            options={[{ value: 'month', label: 'Per Month' }, { value: 'day', label: 'Per Day' }]} />
                    </FormItem>
                    <FormItem half>
                        <SelectField label="Job Type" value={jobForm.job_type}
                            onChange={e => setJobForm(p => ({ ...p, job_type: e.target.value }))}
                            options={[{ value: 'full_time', label: 'Full Time' }, { value: 'part_time', label: 'Part Time' }]} />
                    </FormItem>
                    <FormItem half>
    <Input label="Contact Phone *" value={jobForm.contact_phone} 
        onChange={e => setJobForm(p => ({ ...p, contact_phone: e.target.value }))} 
        placeholder="Phone number for candidates to call" />
</FormItem>

                    <FormItem full><Textarea label="Qualification Required" value={jobForm.qualification} onChange={e => setJobForm(p => ({ ...p, qualification: e.target.value }))} /></FormItem>
                    <FormItem full><Toggle checked={jobForm.is_open} onChange={v => setJobForm(p => ({ ...p, is_open: v }))} label="Job Position is Open" /></FormItem>
                    <SectionDivider label="Location" />
                    <div className="form-item-half">
                        <SelectField label="City *" value={jobForm.city}
                            onChange={e => setJobForm(p => ({ ...p, city: e.target.value, area: '' }))}
                            disabled={!!jobForm.shop_id}
                            options={[{ value: '', label: 'Select City' }, ...cities.map(c => ({ value: c.name, label: c.name }))]} />
                    </div>
                    <div className="form-item-half">
                        <SelectField label="Area" value={jobForm.area}
                            onChange={e => setJobForm(p => ({ ...p, area: e.target.value }))}
                            disabled={!jobForm.city || !!jobForm.shop_id}
                            options={[{ value: '', label: 'Select Area' }, ...jobAreas.map(a => ({ value: a.area, label: a.area }))]} />
                    </div>
                    <div className="form-item-half">
                        <Input label="State *" value={jobForm.state}
                            onChange={e => setJobForm(p => ({ ...p, state: e.target.value }))}
                            disabled={!!jobForm.shop_id} />
                    </div>
                </FormGrid>
            </Modal>

            {/* Edit Job */}
            <Modal open={modal === 'editJob'} onClose={closeModal} title="Edit Job"
                footer={<><Btn variant="secondary" onClick={closeModal}>Cancel</Btn><Btn variant="primary" onClick={handleUpdateJob} loading={updatingJob}>Save Changes</Btn></>}>
                <FormGrid>
                    <FormItem half><Input label="Job Title *" value={jobForm.job_title} onChange={e => setJobForm(p => ({ ...p, job_title: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Company Name *" value={jobForm.company_name} onChange={e => setJobForm(p => ({ ...p, company_name: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="Salary *" type="number" value={jobForm.salary} onChange={e => setJobForm(p => ({ ...p, salary: e.target.value }))} /></FormItem>
                    <FormItem half>
                        <SelectField label="Salary Type" value={jobForm.salary_type}
                            onChange={e => setJobForm(p => ({ ...p, salary_type: e.target.value }))}
                            options={[{ value: 'month', label: 'Per Month' }, { value: 'day', label: 'Per Day' }]} />
                    </FormItem>
                    <FormItem half>
                        <SelectField label="Job Type" value={jobForm.job_type}
                            onChange={e => setJobForm(p => ({ ...p, job_type: e.target.value }))}
                            options={[{ value: 'full_time', label: 'Full Time' }, { value: 'part_time', label: 'Part Time' }]} />
                    </FormItem>
                    <FormItem half>
    <Input label="Contact Phone" value={jobForm.contact_phone} 
        onChange={e => setJobForm(p => ({ ...p, contact_phone: e.target.value }))} />
</FormItem>
                    <FormItem full><Textarea label="Qualification" value={jobForm.qualification} onChange={e => setJobForm(p => ({ ...p, qualification: e.target.value }))} /></FormItem>
                    <FormItem full><Toggle checked={jobForm.is_open} onChange={v => setJobForm(p => ({ ...p, is_open: v }))} label="Job Position is Open" /></FormItem>
                    <SectionDivider label="Location" />
                    <FormItem half><Input label="Area" value={jobForm.area} onChange={e => setJobForm(p => ({ ...p, area: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="City" value={jobForm.city} onChange={e => setJobForm(p => ({ ...p, city: e.target.value }))} /></FormItem>
                    <FormItem half><Input label="State" value={jobForm.state} onChange={e => setJobForm(p => ({ ...p, state: e.target.value }))} /></FormItem>
                </FormGrid>
            </Modal>

            {/* About NearZO */}
            <Modal open={modal === 'about'} onClose={closeModal} title="About NearZO">
                <AboutNearZOContent />
            </Modal>

            {/* Help & Support */}
            <Modal open={modal === 'support'} onClose={closeModal} title="Help & Support">
                <SupportContent />
            </Modal>
        </div>
    );
}