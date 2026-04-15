// context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser, getToken, getUserRole, logoutUser, verifyToken } from '../../services/auth';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
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

            // Verify token with backend
            console.log('Verifying token with backend...');
            const isValid = await verifyToken(storedToken);
            
            if (isValid && isValid.valid) {
                console.log('Token is valid, restoring session');
                setUser(storedUser);
                setRole(storedRole);
                setToken(storedToken);
            } else {
                console.log('Token invalid or expired, clearing session');
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

    const login = (userData, userToken, userRole) => {
        console.log('Logging in user:', { userData, userToken, userRole });
        
        setUser(userData);
        setToken(userToken);
        setRole(userRole);
        
        // Store in localStorage
        localStorage.setItem('nearzo_user', JSON.stringify(userData));
        localStorage.setItem('nearzo_token', userToken);
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

    const value = {
        user,
        role,
        token,
        loading,
        error,
        login,
        logout,
        isAuthenticated: !!user && !!token && !!role,
        checkAuthStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}