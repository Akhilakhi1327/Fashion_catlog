import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const CustomerAuthContext = createContext();

export const useCustomerAuth = () => useContext(CustomerAuthContext);

export const CustomerAuthProvider = ({ children }) => {
  const [customerInfo, setCustomerInfo] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await api.get('/users/profile');
        if (res.data && res.data.role !== 'admin') {
          setCustomerInfo(res.data);
          // Fetch wishlist after profile
          const wishRes = await api.get('/users/wishlist');
          setWishlist(wishRes.data.data.map(p => typeof p === 'object' ? p._id : p));
        }
      } catch (error) {
        // Ignored, user might just not be logged in or cookie expired
      }
      setLoading(false);
    };

    fetchCustomer();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/users/login', { email, password });
      localStorage.setItem('eliteFashionToken', res.data.token);
      setCustomerInfo(res.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/users/register', { name, email, password });
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (email, otp) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/users/verify-otp', { email, otp });
      setCustomerInfo(res.data);
      localStorage.setItem('eliteFashionToken', res.data.token);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/users/forgot-password', { email });
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.put(`/users/reset-password/${token}`, { password });
      setCustomerInfo(res.data);
      localStorage.setItem('eliteFashionToken', res.data.token);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/users/logout');
    } catch (error) {
      console.error('Logout error', error);
    }
    localStorage.removeItem('eliteFashionToken');
    setCustomerInfo(null);
    setWishlist([]);
  };

  const toggleWishlist = async (productId) => {
    if (!customerInfo) return; // Must be logged in
    try {
      const res = await api.post(`/users/wishlist/${productId}`);
      // res.data.data is populated wishlist, extract IDs
      setWishlist(res.data.data.map(p => p._id));
      return res.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const isProductWishlisted = (productId) => wishlist.includes(productId);

  return (
    <CustomerAuthContext.Provider
      value={{
        customerInfo,
        wishlist,
        loading,
        error,
        login,
        register,
        verifyOtp,
        forgotPassword,
        resetPassword,
        logout,
        toggleWishlist,
        isProductWishlisted,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};
