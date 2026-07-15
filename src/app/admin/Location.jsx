// Location.jsx
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
    getAllCities,
    getAreasByCity,
    getCitiesWithAreas,
    searchLocations,
    getAllLocations,
    createLocation,
    updateLocation,
    deleteLocation,
    getLocationStats
} from '../../services/location';

// ─── Icons (inline SVG to avoid extra deps) ───────────────────────────────────
const SearchIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
);
const PlusIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
);
const EditIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
);
const DeleteIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
);
const CloseIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
);
const ChevronDown = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
);
const ChevronRight = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
);
const LocationPinIcon = ({ color = '#3b82f6', size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
);
const RefreshIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
);
const BotIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7H3a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm9 0a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zM3 21a1 1 0 0 1-1-1v-1h20v1a1 1 0 0 1-1 1z"/></svg>
);
const BuildingIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h1v1H9zM14 9h1v1h-1zM9 14h1v1H9zM14 14h1v1h-1z"/></svg>
);

// ─── Stat Card Component ───────────────────────────────────────────────────────
const StatCard = ({ icon, value, label, iconBg }) => (
    <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: '18px 22px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flex: 1,
        minWidth: 0,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #f0f0f0',
    }}>
        <div style={{
            width: 46, height: 46, borderRadius: '50%',
            background: iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
        }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#111', lineHeight: 1.1 }}>{value}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{label}</div>
        </div>
    </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
export default function Location() {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ total_locations: 0, total_cities: 0, total_states: 0 });
    const [cities, setCities] = useState([]);
    const [citiesWithAreas, setCitiesWithAreas] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Tree state
    const [expandedStates, setExpandedStates] = useState(['Tamil Nadu']);
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedState, setSelectedState] = useState('Tamil Nadu');

    // Filter state
    const [areaSearch, setAreaSearch] = useState('');

    // Pagination
    const [page, setPage] = useState(1);
    const areasPerPage = 9;

    // Side panel
    const [sidePanelOpen, setSidePanelOpen] = useState(true);
    const [sidePanelSearch, setSidePanelSearch] = useState('');
    const [importText, setImportText] = useState('');

    // Dialog
    const [openDialog, setOpenDialog] = useState(false);
    const [editingLocation, setEditingLocation] = useState(null);
    const [formData, setFormData] = useState({ area: '', city: '', state: 'Tamil Nadu', pincode: '' });

    const role = localStorage.getItem('nearzo_role');
    const isAdmin = role === 'admin';

    // Build tree data from API response
    const treeData = [
        {
            country: 'India',
            states: citiesWithAreas.map(city => ({
                name: city.city_state || 'Tamil Nadu',
                cities: [city.city_name]
            })).reduce((acc, curr) => {
                const existing = acc.find(s => s.name === curr.name);
                if (existing) {
                    existing.cities = [...existing.cities, ...curr.cities];
                } else {
                    acc.push(curr);
                }
                return acc;
            }, [])
        }
    ];

    // Get areas for selected city from citiesWithAreas
    const selectedCityData = citiesWithAreas.find(c => c.city_name === selectedCity);
    const allAreas = selectedCityData?.areas || [];
    const filteredAreas = allAreas.filter(a =>
        !areaSearch || a.area?.toLowerCase().includes(areaSearch.toLowerCase())
    );
    const totalPages = Math.ceil(filteredAreas.length / areasPerPage);
    const pagedAreas = filteredAreas.slice((page - 1) * areasPerPage, page * areasPerPage);

    // Side panel areas
    const sidePanelAreas = allAreas.filter(a =>
        !sidePanelSearch || a.area?.toLowerCase().includes(sidePanelSearch.toLowerCase())
    );

    useEffect(() => {
        loadAll();
        // Set default selected city to first city if available
        if (citiesWithAreas.length > 0 && !selectedCity) {
            setSelectedCity(citiesWithAreas[0].city_name);
        }
    }, []);

    useEffect(() => {
        if (citiesWithAreas.length > 0 && !selectedCity) {
            setSelectedCity(citiesWithAreas[0].city_name);
        }
    }, [citiesWithAreas]);

    const loadAll = async () => {
        setLoading(true);
        try {
            const [citiesRes, cwAreas, statsRes] = await Promise.all([
                getAllCities(),
                getCitiesWithAreas(),
                getLocationStats(),
            ]);
            setCities(citiesRes?.cities || []);
            setCitiesWithAreas(cwAreas?.cities || []);
            setStats(statsRes?.stats || {});
        } catch (e) {
            showSnackbar('Failed to load data', 'error');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveLocation = async () => {
        if (!formData.area || !formData.city) {
            showSnackbar('Area and City are required', 'error');
            return;
        }
        try {
            if (editingLocation) {
                await updateLocation(editingLocation.id, formData);
                showSnackbar('Location updated successfully');
            } else {
                await createLocation(formData);
                showSnackbar('Location created successfully');
            }
            setOpenDialog(false);
            loadAll();
        } catch (e) {
            showSnackbar(e.message, 'error');
        }
    };

    const handleDeleteArea = async (id) => {
        if (window.confirm('Delete this area?')) {
            try {
                await deleteLocation(id);
                showSnackbar('Deleted successfully');
                loadAll();
            } catch (e) {
                showSnackbar(e.message, 'error');
            }
        }
    };

    const handleOpenDialog = (location = null) => {
        if (location) {
            setEditingLocation(location);
            setFormData({ 
                area: location.area, 
                city: location.city, 
                state: location.state || 'Tamil Nadu', 
                pincode: location.pincode || '' 
            });
        } else {
            setEditingLocation(null);
            setFormData({ 
                area: '', 
                city: selectedCity || '', 
                state: selectedState || 'Tamil Nadu', 
                pincode: '' 
            });
        }
        setOpenDialog(true);
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
        setTimeout(() => setSnackbar(s => ({ ...s, open: false })), 3500);
    };

    const handleAutoCreate = async () => {
        if (!importText.trim()) return;
        const areas = importText.split(',').map(a => a.trim()).filter(Boolean);
        try {
            for (const area of areas) {
                await createLocation({ area, city: selectedCity, state: selectedState, pincode: '' });
            }
            showSnackbar(`${areas.length} areas created`);
            setImportText('');
            loadAll();
        } catch (e) {
            showSnackbar(e.message, 'error');
        }
    };

    const exportToExcel = () => {
        const exportData = allAreas.map(area => ({
            'Area': area.area,
            'City': selectedCity,
            'State': selectedState,
            'Pincode': area.pincode || '-',
        }));
        
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `${selectedCity}_Areas`);
        XLSX.writeFile(wb, `${selectedCity}_areas_${new Date().toISOString().split('T')[0]}.xlsx`);
        showSnackbar('Export completed successfully');
    };

    // ─── Styles ─────────────────────────────────────────────────────────────────
    const s = {
        page: {
            background: '#ffffff',
            minHeight: '100vh',
            fontFamily: "'Inter', -apple-system, sans-serif",
            padding: '24px',
            borderRadius: 12,
            boxSizing: 'border-box',
        },
        header: {
            marginBottom: 24,
        },
        title: {
            fontSize: 22, fontWeight: 700, color: '#111', margin: 0,
        },
        subtitle: {
            fontSize: 13, color: '#6b7280', marginTop: 2,
        },
        statsRow: {
            display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap',
        },
        topBar: {
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 16, gap: 12, flexWrap: 'wrap',
        },
        addBtn: {
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#3b82f6', color: '#fff', border: 'none',
            borderRadius: 8, padding: '9px 18px', fontSize: 13,
            fontWeight: 600, cursor: 'pointer',
        },
        exportBtn: {
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#10b981', color: '#fff', border: 'none',
            borderRadius: 8, padding: '9px 18px', fontSize: 13,
            fontWeight: 600, cursor: 'pointer',
        },
        mainLayout: {
            display: 'flex', gap: 0, background: '#fff',
            borderRadius: 12, border: '1px solid #e5e7eb',
            overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
        },
        treePanel: {
            width: 260, borderRight: '1px solid #f0f0f0',
            padding: '12px 0', flexShrink: 0,
            background: '#fff',
        },
        treeItem: (depth, selected) => ({
            display: 'flex', alignItems: 'center', gap: 6,
            padding: `7px 12px 7px ${12 + depth * 14}px`,
            cursor: 'pointer', fontSize: 13,
            color: selected ? '#3b82f6' : '#374151',
            background: selected ? '#eff6ff' : 'transparent',
            borderRadius: selected ? '0 6px 6px 0' : 0,
            fontWeight: selected ? 600 : 400,
            transition: 'background 0.15s',
        }),
        tableSection: {
            flex: 1, minWidth: 0,
        },
        filterBar: {
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderBottom: '1px solid #f0f0f0',
            flexWrap: 'wrap', gap: 12,
        },
        searchBox: {
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
            padding: '6px 12px', width: 220, color: '#9ca3af',
            fontSize: 13,
        },
        searchInput: {
            border: 'none', outline: 'none', background: 'transparent',
            fontSize: 13, color: '#374151', flex: 1, width: '100%',
        },
        tableHeader: {
            display: 'grid',
            gridTemplateColumns: '24px 1fr 100px 80px',
            gap: 0,
            padding: '10px 16px',
            borderBottom: '1px solid #f0f0f0',
            fontSize: 12, fontWeight: 600, color: '#6b7280',
            background: '#fafafa',
        },
        tableRow: (hover) => ({
            display: 'grid',
            gridTemplateColumns: '24px 1fr 100px 80px',
            padding: '11px 16px',
            borderBottom: '1px solid #f8f8f8',
            fontSize: 13, color: '#374151',
            alignItems: 'center',
            background: hover ? '#f9fafb' : '#fff',
            transition: 'background 0.1s',
        }),
        activeChip: {
            background: '#dcfce7', color: '#16a34a',
            borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 600,
            display: 'inline-block',
        },
        editBtn: {
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: '#3b82f6', color: '#fff', border: 'none',
            borderRadius: 6, padding: '4px 10px', fontSize: 12,
            fontWeight: 600, cursor: 'pointer',
        },
        deleteBtn: {
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: 'transparent', color: '#6b7280', border: '1px solid #e5e7eb',
            borderRadius: 6, padding: '4px 10px', fontSize: 12,
            cursor: 'pointer',
        },
        paginationBar: {
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 16px', borderTop: '1px solid #f0f0f0',
            fontSize: 12, color: '#6b7280', flexWrap: 'wrap', gap: 8,
        },
        pageBtn: (active) => ({
            width: 28, height: 28, borderRadius: 6, border: '1px solid #e5e7eb',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, cursor: 'pointer', fontWeight: active ? 700 : 400,
            background: active ? '#3b82f6' : '#fff', color: active ? '#fff' : '#374151',
            marginLeft: 4,
        }),
        sidePanel: {
            width: 340, flexShrink: 0, borderLeft: '1px solid #f0f0f0',
            display: 'flex', flexDirection: 'column',
            background: '#fff',
        },
        sidePanelHeader: {
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 16px 12px',
            borderBottom: '1px solid #f0f0f0',
        },
        sidePanelTitle: {
            fontSize: 16, fontWeight: 700, color: '#111',
        },
    };

    const [hoveredRow, setHoveredRow] = useState(null);

    // Get unique states from citiesWithAreas
    const uniqueStates = [...new Set(citiesWithAreas.map(c => c.city_state || 'Tamil Nadu'))];

    return (
        <div style={s.page}>
            {/* Header */}
            <div style={s.header}>
                <h1 style={s.title}>Location Management</h1>
                 {/* Top Bar */}
            <div style={s.topBar}>
                <div></div>
                <div style={{ display: 'flex', gap: 12 ,marginTop: -30}}>
                    <button style={s.exportBtn} onClick={exportToExcel}>
                        Export Excel
                    </button>
                    {isAdmin && (
                        <button style={s.addBtn} onClick={() => handleOpenDialog()}>
                            <PlusIcon /> Add Location
                        </button>
                    )}
                </div>
            </div>
            </div>

            {/* Stat Cards */}
            <div style={s.statsRow}>
                <StatCard
                    icon={<LocationPinIcon color="#3b82f6" size={22} />}
                    value={uniqueStates.length || 1}
                    label="Total States"
                    iconBg="#dbeafe"
                />
                <StatCard
                    icon={<BuildingIcon />}
                    value={citiesWithAreas.length || 0}
                    label="Total Cities"
                    iconBg="#dbeafe"
                />
                <StatCard
                    icon={<LocationPinIcon color="#ef4444" size={22} />}
                    value={stats?.total_locations || 0}
                    label="Total Areas"
                    iconBg="#fee2e2"
                />
            </div>

           

            {/* Main Layout */}
            <div style={s.mainLayout}>
                {/* Tree Panel */}
                <div style={s.treePanel}>
                    <div
                        style={s.treeItem(0, false)}
                        onClick={() => setExpandedStates(prev => 
                            prev.includes('India') ? prev.filter(x => x !== 'India') : [...prev, 'India']
                        )}
                    >
                        {expandedStates.includes('India') ? <ChevronDown /> : <ChevronRight />}
                        <span style={{ fontSize: 14 }}>🇮🇳</span>
                        <span style={{ fontWeight: 600 }}>India</span>
                    </div>

                    {expandedStates.includes('India') && uniqueStates.map(state => (
                        <div key={state}>
                            <div
                                style={s.treeItem(1, selectedState === state)}
                                onClick={() => {
                                    setExpandedStates(prev =>
                                        prev.includes(state) ? prev.filter(x => x !== state) : [...prev, state]
                                    );
                                    setSelectedState(state);
                                }}
                            >
                                {expandedStates.includes(state) ? <ChevronDown /> : <ChevronRight />}
                                <BuildingIcon />
                                <span>{state}</span>
                            </div>

                            {expandedStates.includes(state) && citiesWithAreas
                                .filter(c => (c.city_state || 'Tamil Nadu') === state)
                                .map(city => (
                                    <div
                                        key={city.city_name}
                                        style={s.treeItem(2, selectedCity === city.city_name)}
                                        onClick={() => { 
                                            setSelectedCity(city.city_name); 
                                            setPage(1); 
                                            setSidePanelOpen(true);
                                            setAreaSearch('');
                                        }}
                                    >
                                        <BuildingIcon />
                                        <span>{city.city_name}</span>
                                        <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 'auto' }}>
                                            {city.areas?.length || 0}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    ))}
                </div>

                {/* Table Section */}
                <div style={s.tableSection}>
                    {/* Filter Bar */}
                    <div style={s.filterBar}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                                {selectedCity || 'Select a city'}
                            </span>
                            <span style={{ fontSize: 12, color: '#9ca3af' }}>
                                {allAreas.length} areas
                            </span>
                        </div>
                        <div style={s.searchBox}>
                            <SearchIcon />
                            <input
                                style={s.searchInput}
                                placeholder="Search area..."
                                value={areaSearch}
                                onChange={e => { setAreaSearch(e.target.value); setPage(1); }}
                            />
                        </div>
                    </div>

                    {/* Table Header */}
                    <div style={s.tableHeader}>
                        <div><input type="checkbox" style={{ cursor: 'pointer' }} /></div>
                        <div>Area Name</div>
                        <div>Status</div>
                        <div>Actions</div>
                    </div>

                    {/* Area Rows */}
                    {loading ? (
                        <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Loading...</div>
                    ) : !selectedCity ? (
                        <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Select a city from the left panel</div>
                    ) : pagedAreas.length === 0 ? (
                        <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                            No areas found for {selectedCity}
                            {isAdmin && (
                                <div style={{ marginTop: 12 }}>
                                    <button style={s.addBtn} onClick={() => handleOpenDialog()}>
                                        <PlusIcon /> Add first area
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        pagedAreas.map((area, i) => (
                            <div
                                key={area.id || i}
                                style={s.tableRow(hoveredRow === i)}
                                onMouseEnter={() => setHoveredRow(i)}
                                onMouseLeave={() => setHoveredRow(null)}
                            >
                                <div><input type="checkbox" style={{ cursor: 'pointer' }} /></div>
                                <div style={{ fontWeight: 500 }}>{area.area}</div>
                                <div><span style={s.activeChip}>Active</span></div>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    <button style={s.editBtn} onClick={() => handleOpenDialog(area)}>
                                        <EditIcon /> Edit
                                    </button>
                                    {isAdmin && (
                                        <button style={s.deleteBtn} onClick={() => handleDeleteArea(area.id)}>
                                            <DeleteIcon /> Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}

                    {/* Pagination */}
                    {filteredAreas.length > 0 && (
                        <div style={s.paginationBar}>
                            <span>
                                Showing {(page - 1) * areasPerPage + 1}–{Math.min(page * areasPerPage, filteredAreas.length)} of {filteredAreas.length} areas
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <button
                                    style={{ ...s.pageBtn(false), marginRight: 8 }}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    ←
                                </button>
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (page <= 3) {
                                        pageNum = i + 1;
                                    } else if (page >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = page - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            style={s.pageBtn(page === pageNum)}
                                            onClick={() => setPage(pageNum)}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button
                                    style={{ ...s.pageBtn(false), marginLeft: 8 }}
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    →
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Side Panel */}
                {sidePanelOpen && selectedCity && (
                    <div style={s.sidePanel}>
                        {/* Panel Header */}
                        <div style={s.sidePanelHeader}>
                            <div>
                                <div style={s.sidePanelTitle}>
                                    <span style={{ fontWeight: 700 }}>{selectedCity}</span>
                                    <span style={{ color: '#6b7280', fontWeight: 400 }}>, {selectedState}</span>
                                </div>
                                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                                    {allAreas.length} total areas
                                </div>
                            </div>
                            <button
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 4 }}
                                onClick={() => setSidePanelOpen(false)}
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        {/* Search Area */}
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <div style={{ ...s.searchBox, flex: 1 }}>
                                    <SearchIcon />
                                    <input
                                        style={s.searchInput}
                                        placeholder="Search area..."
                                        value={sidePanelSearch}
                                        onChange={e => setSidePanelSearch(e.target.value)}
                                    />
                                </div>
                                {isAdmin && (
                                    <button style={{ ...s.addBtn, padding: '7px 12px', fontSize: 12 }} onClick={() => handleOpenDialog()}>
                                        <PlusIcon /> Add
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Side Panel Area List */}
                        <div style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 350px)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 60px', padding: '8px 16px', borderBottom: '1px solid #f0f0f0', fontSize: 11, fontWeight: 600, color: '#9ca3af', background: '#fafafa' }}>
                                <div>Area Name</div>
                                <div>Status</div>
                                <div>Actions</div>
                            </div>
                            {sidePanelAreas.slice(0, 15).map((area, i) => (
                                <div key={area.id || i} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 60px', padding: '9px 16px', borderBottom: '1px solid #f8f8f8', fontSize: 12, alignItems: 'center' }}>
                                    <div style={{ color: '#374151', fontWeight: 500 }}>{area.area}</div>
                                    <div><span style={s.activeChip}>Active</span></div>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 2 }} onClick={() => handleOpenDialog(area)}>
                                            <EditIcon />
                                        </button>
                                        {isAdmin && (
                                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 2 }} onClick={() => handleDeleteArea(area.id)}>
                                                <DeleteIcon />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {sidePanelAreas.length === 0 && (
                                <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>No areas found</div>
                            )}
                        </div>

                        {/* Import Section - Admin only */}
                        {isAdmin && (
                            <div style={{ padding: '14px 16px', borderTop: '1px solid #f0f0f0' }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 10 }}>Import Areas</div>
                                <textarea
                                    style={{
                                        width: '100%', border: '1px solid #e5e7eb', borderRadius: 8,
                                        padding: '8px 10px', fontSize: 12, color: '#374151',
                                        resize: 'vertical', minHeight: 60, outline: 'none',
                                        boxSizing: 'border-box', fontFamily: 'inherit',
                                    }}
                                    placeholder="Paste a comma-separated list of areas. Example: Area1, Area2, Area3..."
                                    value={importText}
                                    onChange={e => setImportText(e.target.value)}
                                />
                                <button
                                    style={{ ...s.addBtn, width: '100%', justifyContent: 'center', padding: '10px', fontSize: 13, marginTop: 10 }}
                                    onClick={handleAutoCreate}
                                >
                                    <BotIcon /> Auto Create Areas
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Add/Edit Dialog */}
            {openDialog && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000,
                }}>
                    <div style={{
                        background: '#fff', borderRadius: 14, padding: 28,
                        width: 420, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#111' }}>
                                {editingLocation ? 'Edit Location' : 'Add New Location'}
                            </h2>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }} onClick={() => setOpenDialog(false)}>
                                <CloseIcon />
                            </button>
                        </div>
                        {[
                            { label: 'Area Name *', key: 'area', placeholder: 'e.g., Khaderpet, Gandhi Nagar' },
                            { label: 'City *', key: 'city', placeholder: 'e.g., Vellore, Ambur' },
                            { label: 'State', key: 'state', placeholder: 'Tamil Nadu' },
                            { label: 'Pincode', key: 'pincode', placeholder: 'e.g., 632001' },
                        ].map(field => (
                            <div key={field.key} style={{ marginBottom: 14 }}>
                                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>{field.label}</label>
                                <input
                                    style={{
                                        width: '100%', border: '1px solid #e5e7eb', borderRadius: 8,
                                        padding: '9px 12px', fontSize: 13, outline: 'none',
                                        boxSizing: 'border-box', color: '#374151',
                                    }}
                                    placeholder={field.placeholder}
                                    value={formData[field.key]}
                                    onChange={e => setFormData(f => ({ ...f, [field.key]: e.target.value }))}
                                />
                            </div>
                        ))}
                        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                            <button
                                style={{ flex: 1, padding: '10px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13, color: '#374151' }}
                                onClick={() => setOpenDialog(false)}
                            >
                                Cancel
                            </button>
                            <button
                                style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 8, background: '#3b82f6', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                                onClick={handleSaveLocation}
                            >
                                {editingLocation ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Snackbar */}
            {snackbar.open && (
                <div style={{
                    position: 'fixed', bottom: 24, right: 24,
                    background: snackbar.severity === 'error' ? '#ef4444' : '#22c55e',
                    color: '#fff', borderRadius: 10, padding: '12px 20px',
                    fontSize: 13, fontWeight: 500, zIndex: 2000,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                }}>
                    {snackbar.message}
                </div>
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                * { box-sizing: border-box; }
                input[type="checkbox"] { accent-color: #3b82f6; }
                textarea:focus { border-color: #3b82f6 !important; }
                input:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
                button { transition: all 0.2s ease; }
                button:hover { transform: translateY(-1px); opacity: 0.9; }
            `}</style>
        </div>
    );
}