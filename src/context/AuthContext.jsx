import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('oct9_token'));
  const [loading, setLoading] = useState(true);
  const [showPublicRatings, setShowPublicRatings] = useState(false);
  const [showProductBadges, setShowProductBadges] = useState(false);
  const [siteMode, setSiteMode] = useState('under_development'); // 'under_development' or 'live'
  const [launchSettings, setLaunchSettings] = useState({
    launch_target_date: '2026-10-18T10:00:00+05:30',
    launch_title: 'OCT9 | Official Launch — 18 October',
    launch_headline: 'The Grand Launch',
    launch_subheadline: '18 October',
    launch_description: 'We are preparing an exclusive curation of hand-embroidered silhouettes, timeless festive ensembles, and modern ethnic pret. Experience the unveiling on 18 October.',
    launch_categories: ['Stitched Suits', 'Festive Anarkalis', 'Artisanal Sarees', 'Occasion Pret']
  });

  const refreshSettings = async () => {
    try {
      const res = await api.getPublicSettings();
      if (res.success && res.settings) {
        setShowPublicRatings(Boolean(res.settings.show_public_ratings));
        setShowProductBadges(Boolean(res.settings.show_product_badges));
        if (res.settings.site_mode) {
          setSiteMode(res.settings.site_mode);
        }
        setLaunchSettings((prev) => ({
          ...prev,
          launch_target_date: res.settings.launch_target_date || prev.launch_target_date,
          launch_title: res.settings.launch_title || prev.launch_title,
          launch_headline: res.settings.launch_headline || prev.launch_headline,
          launch_subheadline: res.settings.launch_subheadline || prev.launch_subheadline,
          launch_description: res.settings.launch_description !== undefined ? res.settings.launch_description : prev.launch_description,
          launch_categories: res.settings.launch_categories || prev.launch_categories,
        }));
      }
    } catch (e) {
      console.warn('Failed to load store display settings:', e.message);
    }
  };

  const updateSiteMode = async (newMode) => {
    try {
      const res = await api.setSiteMode(newMode);
      if (res.success) {
        setSiteMode(res.site_mode);
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || 'Failed to update site mode' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  useEffect(() => {
    async function loadUser() {
      try {
        if (token) {
          const res = await api.getProfile();
          if (res.success) {
            setUser(res.user);
          } else {
            logout();
          }
        } else {
          // Check if session cookie is active on server
          const sessionRes = await api.getSession();
          if (sessionRes?.success && sessionRes.authenticated && sessionRes.user) {
            setUser(sessionRes.user);
          }
        }
      } catch (e) {
        console.warn('Session check or server unavailable:', e.message);
        if (token) {
          localStorage.removeItem('oct9_token');
          setToken(null);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success) {
      if (res.token) {
        localStorage.setItem('oct9_token', res.token);
        setToken(res.token);
      }
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success) {
      if (res.token) {
        localStorage.setItem('oct9_token', res.token);
        setToken(res.token);
      }
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('oct9_token');
      setToken(null);
      setUser(null);
    }
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
        siteMode,
        setSiteMode,
        launchSettings,
        updateSiteMode,
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
