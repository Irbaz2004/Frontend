// app/admin/Dashboard.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Skeleton,
    IconButton,
    Tooltip,
    Chip,
    Button,
    ButtonGroup,
    Alert,
    Divider,
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    GetApp as InstallIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Refresh as RefreshIcon,
    Public as PublicIcon,
    DevicesOther as DevicesIcon,
    Smartphone as MobileIcon,
    Laptop as DesktopIcon,
    Tablet as TabletIcon,
    Download as DownloadIcon,
    SwapHoriz as ConversionIcon,
    AccessTime as TimeIcon,
    FiberManualRecord as DotIcon,
} from '@mui/icons-material';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ChartTooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { db } from '../../Firebase';
import { collection, query, where, orderBy, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';

// ─── Design tokens (same family as the rest of the app) ───────────────────────
const C = {
    bg:          '#F4F6FB',
    surface:     '#FFFFFF',
    surfaceAlt:  '#F0F3FA',
    border:      '#E2E8F5',
    borderLight: '#EBF0F9',
    accent:      '#325fec',
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
    shadowMd:    'rgba(15,23,42,0.07)',
};
const FONT = '"Inter", sans-serif';

const PIE_COLORS = [C.accent, C.purple, C.amber, C.green, C.red, '#0EA5E9'];

// How far back we pull raw events for. Everything (daily / monthly / hourly /
// sources / device split) is derived client-side from this one fetch.
// NOTE: at meaningful scale, replace this with pre-aggregated daily/monthly
// counter docs written by a Cloud Function, instead of reading raw events.
const FETCH_DAYS_BACK = 365;

/* ─── Date / formatting helpers ─────────────────────────────────────────── */
function toDate(ts) {
    if (!ts) return null;
    if (typeof ts.toDate === 'function') return ts.toDate();
    return new Date(ts);
}
function dayKey(d) {
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
}
function monthKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function formatNumber(n) {
    if (n == null) return '0';
    return new Intl.NumberFormat('en-IN').format(n);
}
function formatRelativeTime(date) {
    if (!date) return '—';
    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
function extractDomain(referrer) {
    if (!referrer || referrer === 'direct') return 'Direct';
    try {
        const url = new URL(referrer);
        return url.hostname.replace(/^www\./, '');
    } catch {
        return 'Direct';
    }
}
function deviceIcon(device) {
    if (device === 'mobile') return <MobileIcon sx={{ fontSize: 14 }} />;
    if (device === 'tablet') return <TabletIcon sx={{ fontSize: 14 }} />;
    return <DesktopIcon sx={{ fontSize: 14 }} />;
}

/* ─── Build a continuous list of last N days (so empty days show as 0) ──── */
function lastNDayKeys(n) {
    const out = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        out.push(dayKey(d));
    }
    return out;
}
function lastNMonthKeys(n) {
    const out = [];
    const today = new Date();
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        out.push(monthKey(d));
    }
    return out;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Stat Card
═══════════════════════════════════════════════════════════════════════════ */
function StatCard({ icon, label, value, trend, trendLabel, color, loading }) {
    const isUp = trend != null && trend >= 0;
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                borderRadius: '16px',
                border: `1px solid ${C.border}`,
                background: C.surface,
                height: '100%',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '12px',
                        background: `${color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {React.cloneElement(icon, { sx: { fontSize: 20, color } })}
                </Box>
                {trend != null && !loading && (
                    <Chip
                        size="small"
                        icon={isUp ? <TrendingUpIcon sx={{ fontSize: '14px !important' }} /> : <TrendingDownIcon sx={{ fontSize: '14px !important' }} />}
                        label={`${Math.abs(trend).toFixed(0)}%`}
                        sx={{
                            height: 22,
                            fontFamily: FONT,
                            fontWeight: 700,
                            fontSize: 11,
                            bgcolor: isUp ? C.greenLight : C.redLight,
                            color: isUp ? C.green : C.red,
                            '& .MuiChip-icon': { color: isUp ? C.green : C.red },
                        }}
                    />
                )}
            </Box>
            {loading ? (
                <>
                    <Skeleton variant="text" width="60%" height={32} />
                    <Skeleton variant="text" width="80%" height={18} />
                </>
            ) : (
                <>
                    <Typography sx={{ fontFamily: FONT, fontWeight: 800, fontSize: 26, color: C.text, letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                        {value}
                    </Typography>
                    <Typography sx={{ fontFamily: FONT, fontSize: 12.5, color: C.textMuted, fontWeight: 500, mt: 0.3 }}>
                        {label}
                    </Typography>
                    {trendLabel && (
                        <Typography sx={{ fontFamily: FONT, fontSize: 11, color: C.textMuted, mt: 0.5 }}>
                            {trendLabel}
                        </Typography>
                    )}
                </>
            )}
        </Paper>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Card wrapper
═══════════════════════════════════════════════════════════════════════════ */
function Card({ title, subtitle, action, children, sx }) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                borderRadius: '16px',
                border: `1px solid ${C.border}`,
                background: C.surface,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                ...sx,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                    <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: 15, color: C.text }}>{title}</Typography>
                    {subtitle && (
                        <Typography sx={{ fontFamily: FONT, fontSize: 12, color: C.textMuted, mt: 0.2 }}>{subtitle}</Typography>
                    )}
                </Box>
                {action}
            </Box>
            <Box sx={{ flex: 1, minHeight: 0 }}>{children}</Box>
        </Paper>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Custom tooltip for charts
═══════════════════════════════════════════════════════════════════════════ */
function ChartTip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <Box
            sx={{
                background: C.text,
                color: '#fff',
                borderRadius: '10px',
                px: 1.5,
                py: 1,
                fontFamily: FONT,
                fontSize: 12,
                boxShadow: `0 8px 24px ${C.shadowMd}`,
            }}
        >
            <Typography sx={{ fontFamily: FONT, fontSize: 11, opacity: 0.7, mb: 0.4 }}>{label}</Typography>
            {payload.map((p) => (
                <Box key={p.dataKey} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: p.color }} />
                    <Typography sx={{ fontFamily: FONT, fontSize: 12, fontWeight: 700 }}>{p.value}</Typography>
                    <Typography sx={{ fontFamily: FONT, fontSize: 11, opacity: 0.7 }}>{p.name}</Typography>
                </Box>
            ))}
        </Box>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Dashboard
═══════════════════════════════════════════════════════════════════════════ */
const RANGE_OPTIONS = [
    { label: '7D', days: 7 },
    { label: '30D', days: 30 },
    { label: '90D', days: 90 },
];

export default function Dashboard() {
    const [loading, setLoading]     = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError]         = useState('');

    const [summary, setSummary]     = useState({ totalVisits: 0, totalInstalls: 0 });
    const [visits, setVisits]       = useState([]);   // raw docs, last FETCH_DAYS_BACK days
    const [installs, setInstalls]   = useState([]);   // raw docs, last FETCH_DAYS_BACK days
    const [rangeDays, setRangeDays] = useState(30);

    const fetchData = useCallback(async (isRefresh = false) => {
        isRefresh ? setRefreshing(true) : setLoading(true);
        setError('');
        try {
            const since = new Date();
            since.setDate(since.getDate() - FETCH_DAYS_BACK);
            const sinceTs = Timestamp.fromDate(since);

            const [summarySnap, visitsSnap, installsSnap] = await Promise.all([
                getDoc(doc(db, 'analytics', 'summary')),
                getDocs(query(collection(db, 'visits'), where('timestamp', '>=', sinceTs), orderBy('timestamp', 'asc'))),
                getDocs(query(collection(db, 'installs'), where('timestamp', '>=', sinceTs), orderBy('timestamp', 'asc'))),
            ]);

            setSummary(summarySnap.exists() ? summarySnap.data() : { totalVisits: 0, totalInstalls: 0 });
            setVisits(visitsSnap.docs.map((d) => d.data()));
            setInstalls(installsSnap.docs.map((d) => d.data()));
        } catch (err) {
            console.error('Dashboard: failed to load analytics', err);
            setError('Could not load analytics data. Check your Firestore rules / connection.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    /* ── Derived: daily series for the selected range ────────────────────── */
    const dailySeries = useMemo(() => {
        const keys = lastNDayKeys(rangeDays);
        const visitMap = {};
        const installMap = {};
        visits.forEach((v) => {
            const d = toDate(v.timestamp);
            if (!d) return;
            const k = dayKey(d);
            visitMap[k] = (visitMap[k] || 0) + 1;
        });
        installs.forEach((i) => {
            if (i.outcome !== 'accepted') return;
            const d = toDate(i.timestamp);
            if (!d) return;
            const k = dayKey(d);
            installMap[k] = (installMap[k] || 0) + 1;
        });
        return keys.map((k) => {
            const d = new Date(k);
            return {
                key: k,
                label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                visits: visitMap[k] || 0,
                installs: installMap[k] || 0,
            };
        });
    }, [visits, installs, rangeDays]);

    /* ── Derived: monthly series, last 12 months ──────────────────────────── */
    const monthlySeries = useMemo(() => {
        const keys = lastNMonthKeys(12);
        const visitMap = {};
        const installMap = {};
        visits.forEach((v) => {
            const d = toDate(v.timestamp);
            if (!d) return;
            const k = monthKey(d);
            visitMap[k] = (visitMap[k] || 0) + 1;
        });
        installs.forEach((i) => {
            if (i.outcome !== 'accepted') return;
            const d = toDate(i.timestamp);
            if (!d) return;
            const k = monthKey(d);
            installMap[k] = (installMap[k] || 0) + 1;
        });
        return keys.map((k) => {
            const [y, m] = k.split('-');
            const label = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-IN', { month: 'short' });
            return { key: k, label, visits: visitMap[k] || 0, installs: installMap[k] || 0 };
        });
    }, [visits, installs]);

    /* ── Derived: traffic sources (referrer domains), within selected range ── */
    const trafficSources = useMemo(() => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - rangeDays);
        const counts = {};
        visits.forEach((v) => {
            const d = toDate(v.timestamp);
            if (!d || d < cutoff) return;
            const domain = extractDomain(v.referrer);
            counts[domain] = (counts[domain] || 0) + 1;
        });
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        const top = sorted.slice(0, 5);
        const otherTotal = sorted.slice(5).reduce((s, [, c]) => s + c, 0);
        const data = top.map(([name, value]) => ({ name, value }));
        if (otherTotal > 0) data.push({ name: 'Other', value: otherTotal });
        return data;
    }, [visits, rangeDays]);

    /* ── Derived: device breakdown, within selected range ─────────────────── */
    const deviceBreakdown = useMemo(() => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - rangeDays);
        const counts = { desktop: 0, mobile: 0, tablet: 0 };
        visits.forEach((v) => {
            const d = toDate(v.timestamp);
            if (!d || d < cutoff) return;
            const dev = counts[v.device] !== undefined ? v.device : 'desktop';
            counts[dev] += 1;
        });
        return Object.entries(counts)
            .filter(([, v]) => v > 0)
            .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
    }, [visits, rangeDays]);

    /* ── Derived: traffic by hour of day (all fetched data) ────────────────── */
    const hourlyTraffic = useMemo(() => {
        const counts = Array.from({ length: 24 }, () => 0);
        visits.forEach((v) => {
            const d = toDate(v.timestamp);
            if (!d) return;
            counts[d.getHours()] += 1;
        });
        return counts.map((value, hour) => ({
            hour,
            label: hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`,
            value,
        }));
    }, [visits]);

    /* ── Derived: recent activity feed (merge visits + installs) ──────────── */
    const recentActivity = useMemo(() => {
        const v = visits.map((d) => ({ type: 'visit', ...d, ts: toDate(d.timestamp) }));
        const i = installs.map((d) => ({ type: 'install', ...d, ts: toDate(d.timestamp) }));
        return [...v, ...i]
            .filter((e) => e.ts)
            .sort((a, b) => b.ts - a.ts)
            .slice(0, 10);
    }, [visits, installs]);

    /* ── Derived: today vs yesterday trend, conversion rate ────────────────── */
    const todayKey = dayKey(new Date());
    const yestKey  = dayKey(new Date(Date.now() - 86400000));
    const todayVisits     = dailySeries.find((d) => d.key === todayKey)?.visits || 0;
    const yesterdayVisits = dailySeries.find((d) => d.key === yestKey)?.visits || 0;
    const visitTrend = yesterdayVisits > 0 ? ((todayVisits - yesterdayVisits) / yesterdayVisits) * 100 : (todayVisits > 0 ? 100 : 0);

    const todayInstalls     = dailySeries.find((d) => d.key === todayKey)?.installs || 0;
    const yesterdayInstalls = dailySeries.find((d) => d.key === yestKey)?.installs || 0;
    const installTrend = yesterdayInstalls > 0 ? ((todayInstalls - yesterdayInstalls) / yesterdayInstalls) * 100 : (todayInstalls > 0 ? 100 : 0);

    const acceptedInstallsInRange = installs.filter((i) => i.outcome === 'accepted').length;
    const conversionRate = visits.length > 0 ? (acceptedInstallsInRange / visits.length) * 100 : 0;

    const busiestHour = useMemo(() => {
        if (!hourlyTraffic.some((h) => h.value > 0)) return null;
        return hourlyTraffic.reduce((max, h) => (h.value > max.value ? h : max), hourlyTraffic[0]);
    }, [hourlyTraffic]);

    /* ── CSV export of the raw events currently loaded ─────────────────────── */
    const exportCSV = () => {
        const rows = [['type', 'timestamp', 'page_or_outcome', 'device', 'referrer_or_source']];
        visits.forEach((v) => {
            const d = toDate(v.timestamp);
            rows.push(['visit', d ? d.toISOString() : '', v.page || '', v.device || '', v.referrer || '']);
        });
        installs.forEach((i) => {
            const d = toDate(i.timestamp);
            rows.push(['install', d ? d.toISOString() : '', i.outcome || '', i.device || '', i.source || '']);
        });
        const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nearzo-analytics-${dayKey(new Date())}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, background: C.bg, minHeight: '100%', fontFamily: FONT }}>
            {/* ── Header ───────────────────────────────────────────────────── */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
                <Box>
                    <Typography sx={{ fontFamily: FONT, fontWeight: 800, fontSize: 22, color: C.text, letterSpacing: '-0.4px' }}>
                        Analytics Dashboard
                    </Typography>
                    <Typography sx={{ fontFamily: FONT, fontSize: 13, color: C.textMuted, mt: 0.3 }}>
                        Website traffic & app installs, last {FETCH_DAYS_BACK} days
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <ButtonGroup size="small" sx={{ borderRadius: '10px', overflow: 'hidden' }}>
                        {RANGE_OPTIONS.map((r) => (
                            <Button
                                key={r.label}
                                onClick={() => setRangeDays(r.days)}
                                sx={{
                                    fontFamily: FONT,
                                    fontWeight: 700,
                                    fontSize: 12.5,
                                    px: 1.8,
                                    textTransform: 'none',
                                    border: `1px solid ${C.border} !important`,
                                    background: rangeDays === r.days ? C.accent : C.surface,
                                    color: rangeDays === r.days ? '#fff' : C.textSub,
                                    '&:hover': { background: rangeDays === r.days ? C.accentDark : C.accentLight },
                                }}
                            >
                                {r.label}
                            </Button>
                        ))}
                    </ButtonGroup>
                    <Tooltip title="Export CSV" arrow>
                        <IconButton
                            onClick={exportCSV}
                            sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: C.surfaceAlt, '&:hover': { bgcolor: C.accentLight, color: C.accent } }}
                        >
                            <DownloadIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Refresh" arrow>
                        <IconButton
                            onClick={() => fetchData(true)}
                            sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: C.surfaceAlt, '&:hover': { bgcolor: C.accentLight, color: C.accent } }}
                        >
                            <RefreshIcon sx={{ fontSize: 18, animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px', fontFamily: FONT }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {/* ── Stat cards ───────────────────────────────────────────────── */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        icon={<VisibilityIcon />}
                        color={C.accent}
                        loading={loading}
                        value={formatNumber(summary.totalVisits)}
                        label="Total website visits"
                        trend={visitTrend}
                        trendLabel={`${formatNumber(todayVisits)} today vs ${formatNumber(yesterdayVisits)} yesterday`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        icon={<InstallIcon />}
                        color={C.purple}
                        loading={loading}
                        value={formatNumber(summary.totalInstalls)}
                        label="Total app installs"
                        trend={installTrend}
                        trendLabel={`${formatNumber(todayInstalls)} today vs ${formatNumber(yesterdayInstalls)} yesterday`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        icon={<ConversionIcon />}
                        color={C.green}
                        loading={loading}
                        value={`${conversionRate.toFixed(1)}%`}
                        label={`Visit → install rate (last ${rangeDays}d)`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        icon={<TimeIcon />}
                        color={C.amber}
                        loading={loading}
                        value={busiestHour ? busiestHour.label : '—'}
                        label="Busiest hour for traffic"
                    />
                </Grid>
            </Grid>

            {/* ── Daily traffic chart ─────────────────────────────────────── */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} lg={8}>
                    <Card title="Daily traffic" subtitle={`Visits vs. installs — last ${rangeDays} days`}>
                        {loading ? (
                            <Skeleton variant="rounded" width="100%" height={260} />
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <AreaChart data={dailySeries} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="visitsGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={C.accent} stopOpacity={0.3} />
                                            <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="installsGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={C.purple} stopOpacity={0.3} />
                                            <stop offset="100%" stopColor={C.purple} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke={C.borderLight} vertical={false} />
                                    <XAxis
                                        dataKey="label"
                                        tick={{ fontFamily: FONT, fontSize: 11, fill: C.textMuted }}
                                        axisLine={false} tickLine={false}
                                        interval={rangeDays > 30 ? Math.floor(rangeDays / 10) : 'preserveStartEnd'}
                                    />
                                    <YAxis tick={{ fontFamily: FONT, fontSize: 11, fill: C.textMuted }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <ChartTooltip content={<ChartTip />} />
                                    <Legend wrapperStyle={{ fontFamily: FONT, fontSize: 12 }} />
                                    <Area type="monotone" dataKey="visits" name="Visits" stroke={C.accent} strokeWidth={2.5} fill="url(#visitsGrad)" />
                                    <Area type="monotone" dataKey="installs" name="Installs" stroke={C.purple} strokeWidth={2.5} fill="url(#installsGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </Card>
                </Grid>

                <Grid item xs={12} lg={4}>
                    <Card title="Device breakdown" subtitle={`Last ${rangeDays} days`}>
                        {loading ? (
                            <Skeleton variant="circular" width={180} height={180} sx={{ mx: 'auto' }} />
                        ) : deviceBreakdown.length === 0 ? (
                            <EmptyMini icon={<DevicesIcon sx={{ fontSize: 28, color: C.textMuted }} />} text="No visits yet" />
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie data={deviceBreakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={3}>
                                            {deviceBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                        </Pie>
                                        <ChartTooltip content={<ChartTip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mt: 1 }}>
                                    {deviceBreakdown.map((d, i) => (
                                        <Box key={d.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                            <Typography sx={{ fontFamily: FONT, fontSize: 12, color: C.textSub, fontWeight: 600 }}>
                                                {d.name} ({d.value})
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Card>
                </Grid>
            </Grid>

            {/* ── Monthly progress + Traffic sources ──────────────────────── */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} lg={7}>
                    <Card title="Monthly progress" subtitle="Visits vs. installs — last 12 months">
                        {loading ? (
                            <Skeleton variant="rounded" width="100%" height={260} />
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={monthlySeries} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid stroke={C.borderLight} vertical={false} />
                                    <XAxis dataKey="label" tick={{ fontFamily: FONT, fontSize: 11, fill: C.textMuted }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontFamily: FONT, fontSize: 11, fill: C.textMuted }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <ChartTooltip content={<ChartTip />} />
                                    <Legend wrapperStyle={{ fontFamily: FONT, fontSize: 12 }} />
                                    <Bar dataKey="visits" name="Visits" fill={C.accent} radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="installs" name="Installs" fill={C.purple} radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Card>
                </Grid>

                <Grid item xs={12} lg={5}>
                    <Card title="Traffic sources" subtitle={`Top referrers — last ${rangeDays} days`}>
                        {loading ? (
                            <Skeleton variant="rounded" width="100%" height={220} />
                        ) : trafficSources.length === 0 ? (
                            <EmptyMini icon={<PublicIcon sx={{ fontSize: 28, color: C.textMuted }} />} text="No traffic data yet" />
                        ) : (
                            <Box>
                                {trafficSources.map((s, i) => {
                                    const total = trafficSources.reduce((sum, x) => sum + x.value, 0);
                                    const pct = total > 0 ? (s.value / total) * 100 : 0;
                                    return (
                                        <Box key={s.name} sx={{ mb: 1.4 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography sx={{ fontFamily: FONT, fontSize: 12.5, fontWeight: 600, color: C.text, display: 'flex', alignItems: 'center', gap: 0.6 }}>
                                                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                                    {s.name}
                                                </Typography>
                                                <Typography sx={{ fontFamily: FONT, fontSize: 12, color: C.textMuted, fontWeight: 600 }}>
                                                    {s.value} · {pct.toFixed(0)}%
                                                </Typography>
                                            </Box>
                                            <Box sx={{ height: 6, borderRadius: 3, background: C.surfaceAlt, overflow: 'hidden' }}>
                                                <Box sx={{ height: '100%', width: `${pct}%`, borderRadius: 3, background: PIE_COLORS[i % PIE_COLORS.length], transition: 'width .4s ease' }} />
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}
                    </Card>
                </Grid>
            </Grid>

            {/* ── Hourly pattern + Recent activity ────────────────────────── */}
            <Grid container spacing={2}>
                <Grid item xs={12} lg={7}>
                    <Card title="Traffic by hour" subtitle="When your visitors are browsing (all-time)">
                        {loading ? (
                            <Skeleton variant="rounded" width="100%" height={220} />
                        ) : (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={hourlyTraffic} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid stroke={C.borderLight} vertical={false} />
                                    <XAxis dataKey="label" tick={{ fontFamily: FONT, fontSize: 10, fill: C.textMuted }} axisLine={false} tickLine={false} interval={2} />
                                    <YAxis tick={{ fontFamily: FONT, fontSize: 11, fill: C.textMuted }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <ChartTooltip content={<ChartTip />} />
                                    <Bar dataKey="value" name="Visits" fill={C.accentMid} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Card>
                </Grid>

                <Grid item xs={12} lg={5}>
                    <Card title="Recent activity" subtitle="Latest visits & installs">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} variant="text" height={36} />)
                        ) : recentActivity.length === 0 ? (
                            <EmptyMini icon={<TimeIcon sx={{ fontSize: 28, color: C.textMuted }} />} text="No activity yet" />
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                {recentActivity.map((e, i) => (
                                    <Box key={i}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, py: 1 }}>
                                            <Box
                                                sx={{
                                                    width: 30, height: 30, borderRadius: '9px', flexShrink: 0,
                                                    background: e.type === 'install' ? C.purpleLight : C.accentLight,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}
                                            >
                                                {e.type === 'install'
                                                    ? <InstallIcon sx={{ fontSize: 15, color: C.purple }} />
                                                    : <VisibilityIcon sx={{ fontSize: 15, color: C.accent }} />}
                                            </Box>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography sx={{ fontFamily: FONT, fontSize: 12.5, fontWeight: 600, color: C.text }}>
                                                    {e.type === 'install'
                                                        ? `App install ${e.outcome === 'accepted' ? 'completed' : 'dismissed'}`
                                                        : `Website visit`}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.2 }}>
                                                    {deviceIcon(e.device)}
                                                    <Typography sx={{ fontFamily: FONT, fontSize: 11, color: C.textMuted }}>
                                                        {e.type === 'install' ? (e.source || 'unknown source') : extractDomain(e.referrer)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Typography sx={{ fontFamily: FONT, fontSize: 11, color: C.textMuted, flexShrink: 0 }}>
                                                {formatRelativeTime(e.ts)}
                                            </Typography>
                                        </Box>
                                        {i < recentActivity.length - 1 && <Divider sx={{ borderColor: C.borderLight }} />}
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Card>
                </Grid>
            </Grid>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </Box>
    );
}

function EmptyMini({ icon, text }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 5, gap: 1 }}>
            {icon}
            <Typography sx={{ fontFamily: FONT, fontSize: 12.5, color: C.textMuted }}>{text}</Typography>
        </Box>
    );
}