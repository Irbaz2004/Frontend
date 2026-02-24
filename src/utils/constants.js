// App constants

// API
export const API_BASE = import.meta.env.VITE_API_URL || 'https://backend-qb4v.onrender.com/api';

// App info
export const APP_NAME = 'NearZO';
export const APP_VERSION = '2.0.0';
export const APP_DESCRIPTION = 'Your Hyperlocal Connection';

// Roles
export const ROLES = {
    USER: 'user',
    BUSINESS: 'business',
    DOCTOR: 'doctor',
    WORSHIP: 'worship',
    ADMIN: 'admin'
};

export const ROLE_LABELS = {
    [ROLES.USER]: 'Job Seeker',
    [ROLES.BUSINESS]: 'Business Owner',
    [ROLES.DOCTOR]: 'Doctor',
    [ROLES.WORSHIP]: 'Place of Worship',
    [ROLES.ADMIN]: 'Admin'
};

export const ROLE_ICONS = {
    [ROLES.USER]: '👤',
    [ROLES.BUSINESS]: '🏪',
    [ROLES.DOCTOR]: '👨‍⚕️',
    [ROLES.WORSHIP]: '🕋',
    [ROLES.ADMIN]: '👑'
};

export const ROLE_COLORS = {
    [ROLES.USER]: '#2196f3',
    [ROLES.BUSINESS]: '#4caf50',
    [ROLES.DOCTOR]: '#f44336',
    [ROLES.WORSHIP]: '#9c27b0',
    [ROLES.ADMIN]: '#ff9800'
};

// Business categories
export const BUSINESS_CATEGORIES = [
    { value: 'stationery', label: 'Stationery Shop', icon: '📝' },
    { value: 'doctor', label: 'Doctor / Clinic', icon: '👨‍⚕️' },
    { value: 'grocery', label: 'Grocery Store', icon: '🛒' },
    { value: 'restaurant', label: 'Restaurant', icon: '🍽️' },
    { value: 'salon', label: 'Salon & Spa', icon: '💇' },
    { value: 'electronics', label: 'Electronics', icon: '📱' },
    { value: 'clothing', label: 'Clothing Store', icon: '👕' },
    { value: 'pharmacy', label: 'Pharmacy', icon: '💊' },
    { value: 'bakery', label: 'Bakery', icon: '🥐' },
    { value: 'other', label: 'Other', icon: '🏪' }
];

// Religion types
export const RELIGION_TYPES = [
    { value: 'masjid', label: 'Masjid / Mosque', icon: '🕌' },
    { value: 'temple', label: 'Temple / Mandir', icon: '🛕' },
    { value: 'church', label: 'Church', icon: '⛪' },
    { value: 'gurudwara', label: 'Gurudwara', icon: '🛐' },
    { value: 'other', label: 'Other', icon: '📿' }
];

// Doctor specializations
export const DOCTOR_SPECIALIZATIONS = [
    'Cardiologist',
    'Dentist',
    'Dermatologist',
    'ENT Specialist',
    'General Physician',
    'Gynecologist',
    'Neurologist',
    'Orthopedic',
    'Pediatrician',
    'Psychiatrist',
    'Radiologist',
    'Surgeon'
];

// Job types
export const JOB_TYPES = {
    FULL_TIME: 'full_time',
    PART_TIME: 'part_time',
    CONTRACT: 'contract',
    INTERNSHIP: 'internship'
};

export const JOB_TYPE_LABELS = {
    [JOB_TYPES.FULL_TIME]: 'Full Time',
    [JOB_TYPES.PART_TIME]: 'Part Time',
    [JOB_TYPES.CONTRACT]: 'Contract',
    [JOB_TYPES.INTERNSHIP]: 'Internship'
};

// Salary periods
export const SALARY_PERIODS = {
    HOURLY: 'hourly',
    DAILY: 'daily',
    MONTHLY: 'monthly',
    YEARLY: 'yearly'
};

// Application status
export const APPLICATION_STATUS = {
    PENDING: 'pending',
    SHORTLISTED: 'shortlisted',
    REJECTED: 'rejected',
    HIRED: 'hired'
};

// Appointment status
export const APPOINTMENT_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed'
};

// Notification types
export const NOTIFICATION_TYPES = {
    APPOINTMENT_REQUEST: 'appointment_request',
    APPOINTMENT_APPROVED: 'appointment_approved',
    APPOINTMENT_REJECTED: 'appointment_rejected',
    APPOINTMENT_REMINDER: 'appointment_reminder',
    BUSINESS_VERIFIED: 'business_verified',
    BUSINESS_REJECTED: 'business_rejected',
    NEW_JOB: 'new_job',
    JOB_APPLICATION: 'job_application',
    APPLICATION_STATUS: 'application_status',
    NEW_REVIEW: 'new_review',
    SYSTEM: 'system',
    BROADCAST: 'broadcast'
};

// Radius options
export const RADIUS_OPTIONS = [
    { value: '400m', label: '400m', meters: 400 },
    { value: '1km', label: '1km', meters: 1000 },
    { value: '2km', label: '2km', meters: 2000 },
    { value: '5km', label: '5km', meters: 5000 },
    { value: '10km', label: '10km', meters: 10000 }
];

// Sort options
export const SORT_OPTIONS = {
    RECENT: 'recent',
    DISTANCE: 'distance',
    RATING: 'rating',
    SALARY_HIGH: 'salary_high',
    SALARY_LOW: 'salary_low'
};

// Local storage keys
export const STORAGE_KEYS = {
    TOKEN: 'nearzo_token',
    USER: 'nearzo_user',
    ROLE: 'nearzo_role',
    RADIUS: 'nearzo_radius',
    SAVED_PHONE: 'saved_phone',
    NOTIFICATION_PREFS: 'notification_preferences',
    THEME: 'theme'
};

// Route paths
export const ROUTES = {
    HOME: '/',
    LOGIN: '/app/login',
    REGISTER: '/app/register',
    USER_HOME: '/app/user/home',
    USER_SEARCH: '/app/user/search',
    USER_JOBS: '/app/user/jobs',
    USER_SHOPS: '/app/user/shops',
    USER_DOCTORS: '/app/user/doctors',
    USER_PROFILE: '/app/user/profile',
    BUSINESS_DASHBOARD: '/app/business/dashboard',
    BUSINESS_JOBS: '/app/business/jobs',
    BUSINESS_APPLICATIONS: '/app/business/applications',
    BUSINESS_PROFILE: '/app/business/profile',
    DOCTOR_DASHBOARD: '/app/doctor/dashboard',
    DOCTOR_APPOINTMENTS: '/app/doctor/appointments',
    DOCTOR_PATIENTS: '/app/doctor/patients',
    WORSHIP_DASHBOARD: '/app/worship/dashboard',
    WORSHIP_EVENTS: '/app/worship/events',
    WORSHIP_PRAYERS: '/app/worship/prayers',
    ADMIN_DASHBOARD: '/app/admin/dashboard',
    ADMIN_USERS: '/app/admin/users',
    ADMIN_VERIFICATIONS: '/app/admin/verifications'
};