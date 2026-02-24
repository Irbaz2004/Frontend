import { useState, useCallback } from 'react';

export const useAsync = (asyncFunction) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    const execute = useCallback(async (...args) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await asyncFunction(...args);
            setResult(response);
            return response;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [asyncFunction]);

    return {
        execute,
        loading,
        error,
        result
    };
};