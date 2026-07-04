import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const res = await authService.getProfile();
        if (res.success && res.data) {
          setAdmin(res.data);
          localStorage.setItem('eliteFashionAdmin', JSON.stringify(res.data));
        } else {
          // Do not logout completely if not admin, could just be a public user
          localStorage.removeItem('eliteFashionAdmin');
        }
      } catch (error) {
        // console.error('Auth check failed:', error);
        localStorage.removeItem('eliteFashionAdmin');
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      if (res.success && res.data.token) {
        localStorage.setItem('eliteFashionToken', res.data.token);
        localStorage.setItem('eliteFashionAdmin', JSON.stringify(res.data));
        setAdmin(res.data);
        return { success: true };
      }
      return { success: false, message: 'Invalid server response' };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check credentials.',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logoutAdmin();
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('eliteFashionToken');
    localStorage.removeItem('eliteFashionAdmin');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, isAuthenticated: !!admin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
