import { useState, useEffect } from 'react';

export const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);
        
        if (media.matches !== matches) {
            setMatches(media.matches);
        }

        const listener = (e) => setMatches(e.matches);
        media.addEventListener('change', listener);

        return () => media.removeEventListener('change', listener);
    }, [matches, query]);

    return matches;
};

// Predefined breakpoints
export const useBreakpoints = () => {
    const isXS = useMediaQuery('(max-width: 600px)');
    const isSM = useMediaQuery('(min-width: 601px) and (max-width: 960px)');
    const isMD = useMediaQuery('(min-width: 961px) and (max-width: 1280px)');
    const isLG = useMediaQuery('(min-width: 1281px) and (max-width: 1920px)');
    const isXL = useMediaQuery('(min-width: 1921px)');

    return {
        isXS,
        isSM,
        isMD,
        isLG,
        isXL,
        isMobile: isXS || isSM,
        isTablet: isMD,
        isDesktop: isLG || isXL
    };
};