// Analytics tracking utilities

/**
 * Track page view
 * @param {string} path
 */
export const trackPageView = (path) => {
    if (process.env.NODE_ENV === 'production') {
        // Send to analytics service
        console.log('Page view:', path);
        
        // Example with Google Analytics
        if (window.gtag) {
            window.gtag('config', 'GA_MEASUREMENT_ID', {
                page_path: path
            });
        }
    }
};

/**
 * Track event
 * @param {string} category
 * @param {string} action
 * @param {Object} params
 */
export const trackEvent = (category, action, params = {}) => {
    if (process.env.NODE_ENV === 'production') {
        console.log('Event:', { category, action, ...params });
        
        if (window.gtag) {
            window.gtag('event', action, {
                event_category: category,
                ...params
            });
        }
    }
};

/**
 * Track user action
 * @param {string} action
 * @param {Object} data
 */
export const trackUserAction = (action, data = {}) => {
    trackEvent('User Action', action, data);
};

/**
 * Track search
 * @param {string} query
 * @param {number} resultsCount
 */
export const trackSearch = (query, resultsCount) => {
    trackEvent('Search', 'perform', {
        search_term: query,
        results_count: resultsCount
    });
};

/**
 * Track business view
 * @param {string} businessId
 * @param {string} businessName
 */
export const trackBusinessView = (businessId, businessName) => {
    trackEvent('Business', 'view', {
        business_id: businessId,
        business_name: businessName
    });
};

/**
 * Track job view
 * @param {string} jobId
 * @param {string} jobTitle
 */
export const trackJobView = (jobId, jobTitle) => {
    trackEvent('Job', 'view', {
        job_id: jobId,
        job_title: jobTitle
    });
};

/**
 * Track application
 * @param {string} jobId
 * @param {string} jobTitle
 */
export const trackJobApplication = (jobId, jobTitle) => {
    trackEvent('Job', 'apply', {
        job_id: jobId,
        job_title: jobTitle
    });
};

/**
 * Track appointment booking
 * @param {string} doctorId
 * @param {string} doctorName
 */
export const trackAppointmentBooking = (doctorId, doctorName) => {
    trackEvent('Appointment', 'book', {
        doctor_id: doctorId,
        doctor_name: doctorName
    });
};

/**
 * Track registration
 * @param {string} role
 */
export const trackRegistration = (role) => {
    trackEvent('User', 'register', { role });
};

/**
 * Track login
 * @param {string} role
 */
export const trackLogin = (role) => {
    trackEvent('User', 'login', { role });
};

/**
 * Track share
 * @param {string} type
 * @param {string} id
 */
export const trackShare = (type, id) => {
    trackEvent('Share', type, { item_id: id });
};

/**
 * Track review
 * @param {string} targetType
 * @param {number} rating
 */
export const trackReview = (targetType, rating) => {
    trackEvent('Review', 'submit', {
        target_type: targetType,
        rating
    });
};

/**
 * Set user properties
 * @param {Object} properties
 */
export const setUserProperties = (properties) => {
    if (process.env.NODE_ENV === 'production') {
        console.log('User properties:', properties);
        
        if (window.gtag) {
            window.gtag('set', 'user_properties', properties);
        }
    }
};

/**
 * Identify user
 * @param {string} userId
 * @param {Object} traits
 */
export const identifyUser = (userId, traits = {}) => {
    if (process.env.NODE_ENV === 'production') {
        console.log('Identify user:', userId, traits);
        
        if (window.analytics) {
            window.analytics.identify(userId, traits);
        }
    }
};

/**
 * Track screen view (mobile)
 * @param {string} screenName
 */
export const trackScreenView = (screenName) => {
    trackEvent('Screen', 'view', { screen_name: screenName });
};

/**
 * Track error
 * @param {Error} error
 * @param {Object} context
 */
export const trackError = (error, context = {}) => {
    trackEvent('Error', error.name, {
        message: error.message,
        stack: error.stack,
        ...context
    });
};

/**
 * Track performance
 * @param {string} name
 * @param {number} duration
 */
export const trackPerformance = (name, duration) => {
    trackEvent('Performance', name, { duration_ms: duration });
};

/**
 * Track feature usage
 * @param {string} feature
 * @param {Object} params
 */
export const trackFeatureUsage = (feature, params = {}) => {
    trackEvent('Feature', 'use', {
        feature_name: feature,
        ...params
    });
};