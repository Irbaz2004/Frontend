import { useState, useEffect, useCallback } from 'react';
import { getTheme, saveTheme } from '../utils/storage';

export const useTheme = () => {
    const [theme, setTheme] = useState(getTheme());

    useEffect(() => {
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update meta theme-color
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute(
                'content',
                theme === 'dark' ? '#1a1a1a' : '#C00C0C'
            );
        }
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(prev => {
            const newTheme = prev === 'light' ? 'dark' : 'light';
            saveTheme(newTheme);
            return newTheme;
        });
    }, []);

    const setLightTheme = useCallback(() => {
        setTheme('light');
        saveTheme('light');
    }, []);

    const setDarkTheme = useCallback(() => {
        setTheme('dark');
        saveTheme('dark');
    }, []);

    return {
        theme,
        isDark: theme === 'dark',
        isLight: theme === 'light',
        toggleTheme,
        setLightTheme,
        setDarkTheme
    };
};