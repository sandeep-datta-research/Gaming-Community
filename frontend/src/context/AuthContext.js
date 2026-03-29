import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for saved user and token
    const savedToken = localStorage.getItem('ffglory_token');
    const savedUser = localStorage.getItem('ffglory_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      // Set default axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      const { user: userData, access_token } = response.data;
      
      setUser(userData);
      setToken(access_token);
      localStorage.setItem('ffglory_user', JSON.stringify(userData));
      localStorage.setItem('ffglory_token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post(`${API}/auth/register`, { name, email, password });
      const { user: userData, access_token } = response.data;
      
      setUser(userData);
      setToken(access_token);
      localStorage.setItem('ffglory_user', JSON.stringify(userData));
      localStorage.setItem('ffglory_token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ffglory_user');
    localStorage.removeItem('ffglory_token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const refreshUser = async () => {
    if (!token) return;
    
    try {
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      localStorage.setItem('ffglory_user', JSON.stringify(response.data));
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const updateCredits = (amount) => {
    if (user) {
      const updatedUser = { ...user, credits: user.credits + amount };
      setUser(updatedUser);
      localStorage.setItem('ffglory_user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshUser,
    updateCredits,
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
};
