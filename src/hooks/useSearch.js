import { useState, useCallback, useEffect } from 'react';
import {
    searchAll,
    getAutocomplete,
    getTrendingSearches,
    getSearchHistory,
    clearSearchHistory
} from '../services/user';
import { addRecentSearch, getRecentSearches } from '../utils/storage';
import { useDebounce } from './useDebounce';
import { useLocation } from './useLocation';

export const useSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [trending, setTrending] = useState([]);
    const [history, setHistory] = useState([]);
    const [filters, setFilters] = useState({
        category: '',
        type: '',
        sort: 'relevance',
        radius: '5km'
    });

    const { location } = useLocation();
    const debouncedQuery = useDebounce(query, 300);

    // Fetch autocomplete suggestions
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (debouncedQuery.length < 2) {
                setSuggestions([]);
                return;
            }

            try {
                const data = await getAutocomplete(debouncedQuery);
                setSuggestions(data.suggestions || []);
            } catch (err) {
                console.error('Autocomplete error:', err);
                setSuggestions([]);
            }
        };

        fetchSuggestions();
    }, [debouncedQuery]);

    // Load trending and history on mount
    useEffect(() => {
        const loadInitial = async () => {
            try {
                const [trendingData, historyData] = await Promise.all([
                    getTrendingSearches(),
                    getSearchHistory()
                ]);
                setTrending(trendingData.trending || []);
                setHistory(historyData);
            } catch (err) {
                console.error('Error loading search data:', err);
            }
        };

        loadInitial();
    }, []);

    // Perform search
    const search = useCallback(async (searchQuery = query, customFilters = {}) => {
        if (!searchQuery || searchQuery.length < 2) {
            setResults(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const params = {
                q: searchQuery,
                ...filters,
                ...customFilters,
                ...(location && {
                    lat: location.latitude,
                    lng: location.longitude
                })
            };

            const data = await searchAll(params);
            setResults(data);
            
            // Save to recent searches
            addRecentSearch(searchQuery);
            setHistory(prev => [searchQuery, ...prev.filter(h => h !== searchQuery)].slice(0, 10));
            
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [query, filters, location]);

    // Update filters
    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    // Clear search
    const clearSearch = useCallback(() => {
        setQuery('');
        setResults(null);
        setSuggestions([]);
    }, []);

    // Clear history
    const clearHistory = useCallback(async () => {
        try {
            await clearSearchHistory();
            setHistory([]);
        } catch (err) {
            console.error('Error clearing history:', err);
        }
    }, []);

    return {
        // State
        query,
        setQuery,
        results,
        loading,
        error,
        suggestions,
        trending,
        history,
        filters,
        
        // Actions
        search,
        updateFilters,
        clearSearch,
        clearHistory,
        
        // Helpers
        hasResults: results && (
            (results.businesses?.data?.length > 0) ||
            (results.jobs?.data?.length > 0) ||
            (results.worship?.data?.length > 0)
        ),
        totalResults: results?.businesses?.data?.length + 
                     (results?.jobs?.data?.length || 0) + 
                     (results?.worship?.data?.length || 0) || 0
    };
};