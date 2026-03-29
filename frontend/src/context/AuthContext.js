import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockUsers } from '../mockData';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for saved user
    const savedUser = localStorage.getItem('ffglory_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Mock login - in real app, this would call backend API
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('ffglory_user', JSON.stringify(foundUser));
      return { success: true, user: foundUser };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const register = (name, email, password) => {
    // Mock register - in real app, this would call backend API
    const newUser = {
      id: Date.now().toString(),
      email,
      name,
      role: 'user',
      credits: 0,
      totalGloryEarned: 0,
      createdAt: new Date().toISOString()
    };
    setUser(newUser);
    localStorage.setItem('ffglory_user', JSON.stringify(newUser));
    return { success: true, user: newUser };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ffglory_user');
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
    loading,
    login,
    register,
    logout,
    updateCredits,
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
