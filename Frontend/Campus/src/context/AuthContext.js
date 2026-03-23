import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
// Simplified without jwt-decode (manual decode/parse)

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

  // API base URL
const API_BASE = '/api';

  const login = async (id, password) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, { id, password });
      const { token, user: userData } = response.data;
      
      // Store token
      localStorage.setItem('token', token);
      
// Simplified base64url decode (no jwt-decode)
      function base64urlDecode(str) {
        str += '='.repeat((4 - str.length % 4) % 4);
        return JSON.parse(atob(str.replace(/-/g, '+').replace(/_/g, '/')));
      }
      const payload = base64urlDecode(token.split('.')[1]);
      
      setUser({
        ...userData,
        ...payload
      });

      // Setup axios interceptor
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Check auth on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = base64urlDecode(token.split('.')[1]);
        if (payload.exp * 1000 > Date.now()) {
          setUser(payload);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          logout();
        }
      } catch (error) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const value = {
    user,
    setUser,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
