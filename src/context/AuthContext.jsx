import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('oct9_token'));
  const [loading, setLoading] = useState(true);
  const [showPublicRatings, setShowPublicRatings] = useState(false);
  const [showProductBadges, setShowProductBadges] = useState(false);

  const refreshSettings = async () => {
    try {
      const res = await api.getPublicSettings();
      if (res.success && res.settings) {
        setShowPublicRatings(Boolean(res.settings.show_public_ratings));
        setShowProductBadges(Boolean(res.settings.show_product_badges));
      }
    } catch (e) {
      console.warn('Failed to load store display settings:', e.message);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await api.getProfile();
          if (res.success) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch (e) {
          console.warn('Session expired or server unavailable:', e.message);
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success) {
      localStorage.setItem('oct9_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success) {
      localStorage.setItem('oct9_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('oct9_token');
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    if (token) {
      const res = await api.getProfile();
      if (res.success) {
        setUser(res.user);
      }
    }
  };

  const updateProfile = async (profileData) => {
    const res = await api.updateProfile(profileData);
    if (res.success && user) {
      setUser(prev => ({
        ...prev,
        ...res.user
      }));
    }
    return res;
  };

  const saveAddress = async (addressData) => {
    const res = await api.saveAddress(addressData);
    if (res.success && user) {
      setUser(prev => ({
        ...prev,
        addresses: res.addresses
      }));
    }
    return res;
  };

  const updateAddress = async (addressId, addressData) => {
    const res = await api.updateAddress(addressId, addressData);
    if (res.success && user) {
      setUser(prev => ({
        ...prev,
        addresses: res.addresses
      }));
    }
    return res;
  };

  const setDefaultAddress = async (addressId) => {
    const res = await api.setDefaultAddress(addressId);
    if (res.success && user) {
      setUser(prev => ({
        ...prev,
        addresses: res.addresses
      }));
    }
    return res;
  };

  const deleteAddress = async (addressId) => {
    const res = await api.deleteAddress(addressId);
    if (res.success && user) {
      setUser(prev => ({
        ...prev,
        addresses: res.addresses
      }));
    }
    return res;
  };

  const isAdmin = Boolean(user && user.role === 'admin');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(user),
        isAdmin,
        showPublicRatings,
        showProductBadges,
        refreshSettings,
        login,
        register,
        logout,
        refreshProfile,
        updateProfile,
        saveAddress,
        updateAddress,
        setDefaultAddress,
        deleteAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
