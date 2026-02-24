import { useState, useEffect, createContext, useContext } from 'react';
import { 
    getCurrentUser, 
    getToken, 
    logoutUser,
    fetchUserProfile,
    loginUser,
    registerUser
} from '../services/auth';
import { getAuthData, saveAuthData, clearAuthData } from '../utils/storage';
import { trackLogin, trackRegistration } from '../utils/analytics';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const { user: savedUser } = getAuthData();
            if (savedUser) {
                // Verify token by fetching profile
                const profile = await fetchUserProfile();
                setUser(profile);
            }
        } catch (error) {
            console.error('Error loading user:', error);
            clearAuthData();
        } finally {
            setLoading(false);
        }
    };

    const login = async (phone, password, remember = false) => {
        setLoading(true);
        setError(null);
        try {
            const result = await loginUser(phone, password);
            saveAuthData(result);
            setUser(result.user);
            trackLogin(result.user.role);
            return result;
        } catch (err) {
            setError(err.message || 'Login failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const register = async (role, data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await registerUser(role, data);
            saveAuthData(result);
            setUser(result.user);
            trackRegistration(role);
            return result;
        } catch (err) {
            setError(err.message || 'Registration failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        logoutUser();
        clearAuthData();
        setUser(null);
    };

    const updateUser = (updates) => {
        setUser(prev => ({ ...prev, ...updates }));
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isBusiness: ['business', 'doctor'].includes(user?.role),
        isDoctor: user?.role === 'doctor',
        isWorship: user?.role === 'worship',
        isUser: user?.role === 'user'
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};