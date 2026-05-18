// context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser, getToken, getUserRole, logoutUser, checkAuth, getProfile } from '../../services/auth';

const AuthContext = createContext();

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check authentication status when app loads
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        setLoading(true);
        try {
            const storedToken = getToken();
            const storedUser = getCurrentUser();
            const storedRole = getUserRole();

            console.log('Checking auth - Token:', storedToken ? 'Present' : 'Missing');
            console.log('Checking auth - User:', storedUser ? 'Present' : 'Missing');
            console.log('Checking auth - Role:', storedRole);

            // If any auth data is missing, clear everything
            if (!storedToken || !storedUser || !storedRole) {
                console.log('Incomplete auth data found, clearing session');
                logoutUser();
                setLoading(false);
                return;
            }

            // Check auth with backend
            console.log('Verifying auth with backend...');
            const result = await checkAuth();
            
            if (result.authenticated) {
                console.log('Auth is valid, restoring session');
                
                // Fetch fresh user profile to get latest full_name
                try {
                    const profileData = await getProfile();
                    if (profileData.success && profileData.user) {
                        const updatedUser = {
                            ...storedUser,
                            full_name: profileData.user.full_name,
                            phone: profileData.user.phone,
                            area: profileData.user.area,
                            city: profileData.user.city,
                            state: profileData.user.state,
                            is_verified: profileData.user.is_verified,
                            wants_notifications: profileData.user.wants_notifications
                        };
                        setUser(updatedUser);
                        // Update localStorage with fresh data
                        localStorage.setItem('nearzo_user', JSON.stringify(updatedUser));
                    } else {
                        setUser(storedUser);
                    }
                } catch (profileErr) {
                    console.error('Failed to fetch fresh profile:', profileErr);
                    setUser(storedUser);
                }
                
                setRole(storedRole);
                setToken(storedToken);
            } else {
                console.log('Auth invalid or expired, clearing session');
                logoutUser();
            }
        } catch (err) {
            console.error('Auth check error:', err);
            setError(err.message);
            logoutUser();
        } finally {
            setLoading(false);
        }
    };

    const login = async (userData, userToken, userRole) => {
        console.log('Logging in user:', { userData, userToken, userRole });
        
        // Fetch complete user profile to get full_name
        try {
            // Set token first so API calls work
            localStorage.setItem('nearzo_token', userToken);
            
            const profileData = await getProfile();
            if (profileData.success && profileData.user) {
                const completeUserData = {
                    id: userData.id,
                    phone: userData.phone,
                    role: userData.role,
                    full_name: profileData.user.full_name || userData.full_name || userData.phone,
                    area: profileData.user.area || userData.area || '',
                    city: profileData.user.city || userData.city || '',
                    state: profileData.user.state || userData.state || '',
                    is_verified: profileData.user.is_verified || false,
                    wants_notifications: profileData.user.wants_notifications !== false
                };
                setUser(completeUserData);
                localStorage.setItem('nearzo_user', JSON.stringify(completeUserData));
            } else {
                // Fallback to provided user data
                const fallbackUserData = {
                    id: userData.id,
                    phone: userData.phone,
                    role: userData.role,
                    full_name: userData.full_name || userData.phone,
                    area: userData.area || '',
                    city: userData.city || '',
                    state: userData.state || '',
                    is_verified: false,
                    wants_notifications: true
                };
                setUser(fallbackUserData);
                localStorage.setItem('nearzo_user', JSON.stringify(fallbackUserData));
            }
        } catch (err) {
            console.error('Failed to fetch profile during login:', err);
            // Fallback to provided user data
            const fallbackUserData = {
                id: userData.id,
                phone: userData.phone,
                role: userData.role,
                full_name: userData.full_name || userData.phone,
                area: userData.area || '',
                city: userData.city || '',
                state: userData.state || '',
                is_verified: false,
                wants_notifications: true
            };
            setUser(fallbackUserData);
            localStorage.setItem('nearzo_user', JSON.stringify(fallbackUserData));
        }
        
        setToken(userToken);
        setRole(userRole);
        
        // Store role in localStorage
        localStorage.setItem('nearzo_role', userRole);
        
        console.log('Stored in localStorage:', {
            user: localStorage.getItem('nearzo_user'),
            token: localStorage.getItem('nearzo_token') ? 'Present' : 'Missing',
            role: localStorage.getItem('nearzo_role')
        });
    };

    const logout = () => {
        console.log('Logging out user');
        setUser(null);
        setToken(null);
        setRole(null);
        logoutUser();
    };

    const updateUser = (updatedData) => {
        const updatedUser = { ...user, ...updatedData };
        setUser(updatedUser);
        localStorage.setItem('nearzo_user', JSON.stringify(updatedUser));
    };

    const value = {
        user,
        role,
        token,
        loading,
        error,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user && !!token && !!role,
        isAdmin: role === 'admin',
        isUser: role === 'user',
        isBusiness: role === 'business',
        checkAuthStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Also export AuthContext if needed elsewhere
export { AuthContext };