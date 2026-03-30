import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, formatApiErrorDetail } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // null = checking, false = not authenticated, object = authenticated
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const { data } = await authAPI.getMe();
      setUser(data);
    } catch (error) {
      // Try to refresh token
      try {
        await authAPI.refresh();
        const { data } = await authAPI.getMe();
        setUser(data);
      } catch {
        setUser(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    try {
      const { data } = await authAPI.login({ email, password });
      setUser(data);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: formatApiErrorDetail(error.response?.data?.detail) || error.message 
      };
    }
  };

  const register = async (name, email, username, password) => {
    try {
      const { data } = await authAPI.register({ name, email, username, password });
      setUser(data);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: formatApiErrorDetail(error.response?.data?.detail) || error.message 
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user && user !== false,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
