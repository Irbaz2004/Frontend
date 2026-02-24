// Error handling utilities

/**
 * Custom API Error class
 */
export class APIError extends Error {
    constructor(message, status, code = null) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.code = code;
    }
}

/**
 * Handle API errors
 * @param {Error} error
 * @returns {string}
 */
export const handleAPIError = (error) => {
    if (error.name === 'APIError') {
        switch (error.status) {
            case 401:
                return 'Session expired. Please login again.';
            case 403:
                return 'You don\'t have permission to perform this action.';
            case 404:
                return 'The requested resource was not found.';
            case 409:
                return 'This operation conflicts with existing data.';
            case 422:
                return 'Please check your input and try again.';
            case 429:
                return 'Too many requests. Please try again later.';
            case 500:
                return 'Server error. Please try again later.';
            default:
                return error.message || 'Something went wrong.';
        }
    }
    
    if (error.name === 'NetworkError' || !navigator.onLine) {
        return 'Network error. Please check your internet connection.';
    }
    
    return error.message || 'An unexpected error occurred.';
};

/**
 * Log error to console (and to service in production)
 * @param {Error} error
 * @param {Object} context
 */
export const logError = (error, context = {}) => {
    console.error('Error:', {
        message: error.message,
        stack: error.stack,
        ...context
    });
    
    // In production, you could send to error tracking service
    if (process.env.NODE_ENV === 'production') {
        // Send to error tracking service
        // e.g., Sentry.captureException(error);
    }
};

/**
 * Create error message for user
 * @param {Error} error
 * @param {string} fallback
 * @returns {string}
 */
export const getUserFriendlyError = (error, fallback = 'Something went wrong') => {
    if (error.userMessage) return error.userMessage;
    
    const messages = {
        'NetworkError': 'Please check your internet connection',
        'TimeoutError': 'Request timed out. Please try again',
        'PermissionDenied': 'You don\'t have permission to do that',
        'NotFound': 'The item you\'re looking for doesn\'t exist',
        'ValidationError': 'Please check your input and try again'
    };
    
    return messages[error.name] || fallback;
};

/**
 * Check if error is network related
 * @param {Error} error
 * @returns {boolean}
 */
export const isNetworkError = (error) => {
    return error.name === 'NetworkError' || 
           error.message.includes('network') ||
           error.message.includes('fetch') ||
           !navigator.onLine;
};

/**
 * Check if error is authentication related
 * @param {Error} error
 * @returns {boolean}
 */
export const isAuthError = (error) => {
    return error.status === 401 || error.status === 403;
};

/**
 * Retry failed request
 * @param {Function} fn
 * @param {number} maxAttempts
 * @returns {Promise}
 */
export const retryRequest = async (fn, maxAttempts = 3) => {
    let lastError;
    
    for (let i = 0; i < maxAttempts; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            
            // Don't retry auth errors
            if (isAuthError(error)) {
                throw error;
            }
            
            // Exponential backoff
            if (i < maxAttempts - 1) {
                await new Promise(resolve => 
                    setTimeout(resolve, Math.pow(2, i) * 1000)
                );
            }
        }
    }
    
    throw lastError;
};

/**
 * Create validation error
 * @param {Object} errors
 * @returns {Error}
 */
export const createValidationError = (errors) => {
    const error = new Error('Validation failed');
    error.name = 'ValidationError';
    error.errors = errors;
    error.userMessage = 'Please check the form for errors';
    return error;
};

/**
 * Parse error response from API
 * @param {Response} response
 * @returns {Promise<Error>}
 */
export const parseErrorResponse = async (response) => {
    try {
        const data = await response.json();
        return new APIError(
            data.message || response.statusText,
            response.status,
            data.code
        );
    } catch {
        return new APIError(
            response.statusText,
            response.status
        );
    }
};

/**
 * Handle form submission errors
 * @param {Error} error
 * @param {Function} setError
 */
export const handleFormError = (error, setError) => {
    if (error.name === 'ValidationError' && error.errors) {
        // Set field-specific errors
        Object.entries(error.errors).forEach(([field, message]) => {
            setError(field, message);
        });
    } else {
        // Set general error
        setError('general', getUserFriendlyError(error));
    }
};

/**
 * Error boundary fallback component
 */
export const ErrorFallback = ({ error, resetErrorBoundary }) => {
    return (
        <div style={{
            padding: '20px',
            textAlign: 'center',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <h2>Something went wrong</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
                {getUserFriendlyError(error)}
            </p>
            <button
                onClick={resetErrorBoundary}
                style={{
                    padding: '10px 20px',
                    background: '#C00C0C',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                }}
            >
                Try again
            </button>
        </div>
    );
};