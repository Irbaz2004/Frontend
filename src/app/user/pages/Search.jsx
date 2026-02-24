import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Chip,
    Button,
    Drawer,
    IconButton,
    Badge,
    Divider,
    Alert,
    Skeleton,
    TextField,
    InputAdornment
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Close as CloseIcon,
    LocationOn as LocationIcon,
    Tune as TuneIcon,
    Clear as ClearIcon
} from '@mui/icons-material';
import { useLocation } from '../../../hooks/useLocation';
import { useSearch } from '../../../hooks/useSearch';
import SearchBar from '../components/SearchBar';
import ShopCard from '../components/ShopCard';
import JobCard from '../components/JobCard';
import DoctorCard from '../components/DoctorCard';
import FilterDrawer from '../components/FilterDrawer';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function SearchPage() {
    const [filterOpen, setFilterOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    
    const { location } = useLocation();
    const {
        query,
        setQuery,
        results,
        loading,
        error,
        filters,
        updateFilters,
        clearSearch,
        totalResults,
        suggestions,
        trending,
        history
    } = useSearch();

    const tabs = [
        { id: 'all', label: 'All', count: totalResults },
        { id: 'businesses', label: 'Shops', count: results?.businesses?.data?.length || 0 },
        { id: 'jobs', label: 'Jobs', count: results?.jobs?.data?.length || 0 },
        { id: 'doctors', label: 'Doctors', count: results?.doctors?.data?.length || 0 },
        { id: 'worship', label: 'Worship', count: results?.worship?.data?.length || 0 }
    ];

    const handleFilterChange = (newFilters) => {
        updateFilters(newFilters);
        setFilterOpen(false);
    };

    const handleSuggestionClick = (suggestion) => {
        setQuery(suggestion.text);
    };

    const handleClearSearch = () => {
        clearSearch();
        setActiveTab('all');
    };

    return (
        <Box sx={{ bgcolor: '#f8f8f8', minHeight: '100vh', pb: 8 }}>
            <Container maxWidth="lg" sx={{ py: 3 }}>
                {/* Search Header */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
                        Search
                    </Typography>
                    
                    {/* Search Bar */}
                    <SearchBar
                        value={query}
                        onChange={setQuery}
                        onSearch={() => {}}
                        suggestions={suggestions}
                        onSuggestionClick={handleSuggestionClick}
                        onClear={handleClearSearch}
                    />
                </Box>

                {/* Active Filters */}
                {Object.keys(filters).some(key => filters[key]) && (
                    <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {filters.category && (
                            <Chip
                                label={`Category: ${filters.category}`}
                                onDelete={() => updateFilters({ category: '' })}
                                size="small"
                            />
                        )}
                        {filters.type && (
                            <Chip
                                label={`Type: ${filters.type}`}
                                onDelete={() => updateFilters({ type: '' })}
                                size="small"
                            />
                        )}
                        {filters.radius && (
                            <Chip
                                label={`Radius: ${filters.radius}`}
                                onDelete={() => updateFilters({ radius: '5km' })}
                                size="small"
                            />
                        )}
                        <Chip
                            label="Clear All"
                            onDelete={handleClearSearch}
                            color="error"
                            variant="outlined"
                            size="small"
                        />
                    </Box>
                )}

                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Box sx={{ display: 'flex', overflowX: 'auto', gap: 2 }}>
                        {tabs.map((tab) => (
                            <Button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                sx={{
                                    minWidth: 'auto',
                                    px: 2,
                                    py: 1,
                                    color: activeTab === tab.id ? '#C00C0C' : '#666',
                                    borderBottom: activeTab === tab.id ? 2 : 0,
                                    borderColor: '#C00C0C',
                                    borderRadius: 0,
                                    fontWeight: activeTab === tab.id ? 700 : 500
                                }}
                            >
                                {tab.label}
                                {tab.count > 0 && (
                                    <Chip
                                        label={tab.count}
                                        size="small"
                                        sx={{
                                            ml: 1,
                                            height: 20,
                                            bgcolor: activeTab === tab.id ? '#C00C0C' : '#eee',
                                            color: activeTab === tab.id ? 'white' : '#666'
                                        }}
                                    />
                                )}
                            </Button>
                        ))}
                    </Box>
                </Box>

                {/* Results */}
                {loading ? (
                    <LoadingSkeleton />
                ) : error ? (
                    <Alert severity="error" sx={{ borderRadius: 2 }}>
                        {error}
                    </Alert>
                ) : !query ? (
                    // Initial state - show trending and history
                    <Grid container spacing={3}>
                        {/* Trending Searches */}
                        {trending.length > 0 && (
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                                    Trending Searches 🔥
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {trending.map((item) => (
                                        <Chip
                                            key={item.query}
                                            label={item.query}
                                            onClick={() => setQuery(item.query)}
                                            sx={{
                                                bgcolor: '#f0f0f0',
                                                '&:hover': { bgcolor: '#e0e0e0' }
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Grid>
                        )}

                        {/* Recent Searches */}
                        {history.length > 0 && (
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                                    Recent Searches
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {history.map((item) => (
                                        <Chip
                                            key={item}
                                            label={item}
                                            onClick={() => setQuery(item)}
                                            onDelete={() => {}}
                                            variant="outlined"
                                        />
                                    ))}
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                ) : totalResults === 0 ? (
                    <EmptyState
                        icon={<SearchIcon sx={{ fontSize: 64 }} />}
                        title="No results found"
                        description={`We couldn't find anything for "${query}"`}
                        action={
                            <Button variant="outlined" onClick={handleClearSearch}>
                                Clear Search
                            </Button>
                        }
                    />
                ) : (
                    // Search Results
                    <Grid container spacing={2}>
                        {activeTab === 'all' && (
                            <>
                                {/* Businesses */}
                                {results?.businesses?.data?.map((item) => (
                                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                                        <ShopCard shop={item} />
                                    </Grid>
                                ))}

                                {/* Jobs */}
                                {results?.jobs?.data?.map((item) => (
                                    <Grid item xs={12} md={6} key={item.id}>
                                        <JobCard job={item} />
                                    </Grid>
                                ))}

                                {/* Doctors */}
                                {results?.doctors?.data?.map((item) => (
                                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                                        <DoctorCard doctor={item} />
                                    </Grid>
                                ))}
                            </>
                        )}

                        {activeTab === 'businesses' && results?.businesses?.data?.map((item) => (
                            <Grid item xs={12} sm={6} md={4} key={item.id}>
                                <ShopCard shop={item} />
                            </Grid>
                        ))}

                        {activeTab === 'jobs' && results?.jobs?.data?.map((item) => (
                            <Grid item xs={12} md={6} key={item.id}>
                                <JobCard job={item} />
                            </Grid>
                        ))}

                        {activeTab === 'doctors' && results?.doctors?.data?.map((item) => (
                            <Grid item xs={12} sm={6} md={4} key={item.id}>
                                <DoctorCard doctor={item} />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>

            {/* Filter Drawer */}
            <FilterDrawer
                open={filterOpen}
                onClose={() => setFilterOpen(false)}
                filters={filters}
                onApply={handleFilterChange}
                onClear={() => updateFilters({
                    category: '',
                    type: '',
                    minPrice: '',
                    maxPrice: '',
                    rating: ''
                })}
            />
        </Box>
    );
}