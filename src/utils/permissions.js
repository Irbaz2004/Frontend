// Permission checking utilities

import { ROLES } from './constants';
import { getAuthData } from './storage';

/**
 * Check if user has required role
 * @param {string|Array} requiredRoles
 * @returns {boolean}
 */
export const hasRole = (requiredRoles) => {
    const { role } = getAuthData();
    if (!role) return false;
    
    if (Array.isArray(requiredRoles)) {
        return requiredRoles.includes(role);
    }
    return role === requiredRoles;
};

/**
 * Check if user is admin
 * @returns {boolean}
 */
export const isAdmin = () => {
    return hasRole(ROLES.ADMIN);
};

/**
 * Check if user is business owner
 * @returns {boolean}
 */
export const isBusiness = () => {
    return hasRole([ROLES.BUSINESS, ROLES.DOCTOR]);
};

/**
 * Check if user is doctor
 * @returns {boolean}
 */
export const isDoctor = () => {
    return hasRole(ROLES.DOCTOR);
};

/**
 * Check if user is worship place
 * @returns {boolean}
 */
export const isWorship = () => {
    return hasRole(ROLES.WORSHIP);
};

/**
 * Check if user is regular user
 * @returns {boolean}
 */
export const isUser = () => {
    return hasRole(ROLES.USER);
};

/**
 * Check if user owns a resource
 * @param {string} resourceId
 * @param {string} resourceUserId
 * @returns {boolean}
 */
export const isOwner = (resourceUserId) => {
    const { user } = getAuthData();
    return user?.id === resourceUserId;
};

/**
 * Check if user can access route
 * @param {string} route
 * @returns {boolean}
 */
export const canAccessRoute = (route) => {
    const { role } = getAuthData();
    
    // Public routes
    const publicRoutes = ['/', '/app/login', '/app/register'];
    if (publicRoutes.includes(route)) return true;
    
    // Role-based routes
    if (route.startsWith('/app/user') && role !== ROLES.USER && role !== ROLES.ADMIN) {
        return false;
    }
    
    if (route.startsWith('/app/business') && !isBusiness() && !isAdmin()) {
        return false;
    }
    
    if (route.startsWith('/app/doctor') && !isDoctor() && !isAdmin()) {
        return false;
    }
    
    if (route.startsWith('/app/worship') && !isWorship() && !isAdmin()) {
        return false;
    }
    
    if (route.startsWith('/app/admin') && !isAdmin()) {
        return false;
    }
    
    return true;
};

/**
 * Check if user can perform action
 * @param {string} action
 * @param {Object} resource
 * @returns {boolean}
 */
export const canPerformAction = (action, resource = null) => {
    const { role, user } = getAuthData();
    
    // Admin can do anything
    if (role === ROLES.ADMIN) return true;
    
    switch (action) {
        case 'create:job':
            return isBusiness();
            
        case 'update:job':
        case 'delete:job':
            // Can only update/delete own jobs
            return isBusiness() && resource?.businessId === user?.id;
            
        case 'apply:job':
            return isUser();
            
        case 'create:appointment':
            return isUser();
            
        case 'update:appointment':
            // Doctor can update own appointments
            return isDoctor() && resource?.doctorId === user?.id;
            
        case 'create:review':
            return isUser();
            
        case 'create:event':
            return isWorship();
            
        default:
            return false;
    }
};

/**
 * Get allowed actions for user
 * @returns {Object}
 */
export const getAllowedActions = () => {
    const { role } = getAuthData();
    
    const actions = {
        canViewJobs: true,
        canSearch: true,
        canViewNearby: true
    };
    
    if (isUser()) {
        actions.canApplyJobs = true;
        actions.canBookAppointments = true;
        actions.canWriteReviews = true;
        actions.canSaveItems = true;
    }
    
    if (isBusiness()) {
        actions.canCreateJobs = true;
        actions.canManageJobs = true;
        actions.canViewApplications = true;
        actions.canUpdateBusiness = true;
        actions.canManageItems = true;
    }
    
    if (isDoctor()) {
        actions.canManageAppointments = true;
        actions.canUpdateAvailability = true;
        actions.canViewPatients = true;
    }
    
    if (isWorship()) {
        actions.canManageEvents = true;
        actions.canUpdatePrayerTimes = true;
        actions.canManageFacilities = true;
    }
    
    if (isAdmin()) {
        actions.canManageUsers = true;
        actions.canVerifyBusinesses = true;
        actions.canViewReports = true;
        actions.canManageSettings = true;
    }
    
    return actions;
};

/**
 * Check if user can edit profile
 * @param {string} profileId
 * @returns {boolean}
 */
export const canEditProfile = (profileId) => {
    const { user, role } = getAuthData();
    return user?.id === profileId || role === ROLES.ADMIN;
};

/**
 * Get redirect path based on role
 * @returns {string}
 */
export const getDefaultRoute = () => {
    const { role } = getAuthData();
    
    const routes = {
        [ROLES.USER]: '/app/user/home',
        [ROLES.BUSINESS]: '/app/business/dashboard',
        [ROLES.DOCTOR]: '/app/doctor/dashboard',
        [ROLES.WORSHIP]: '/app/worship/dashboard',
        [ROLES.ADMIN]: '/app/admin/dashboard'
    };
    
    return routes[role] || '/app/login';
};