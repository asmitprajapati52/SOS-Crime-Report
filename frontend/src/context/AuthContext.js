import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import API from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('sahayataToken'));

  // Load Logged In User
  const loadUser = useCallback(async () => {
    try {
      const res = await API.get('/auth/me');
      setUser(res.data.data);
    } catch (error) {
      console.error('Load user error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  // Check token on refresh
  useEffect(() => {
    if (token) {
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token, loadUser]);

  // Login
  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });

    setToken(res.data.token);
    localStorage.setItem('sahayataToken', res.data.token);
    setUser(res.data.user);

    API.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;

    return res.data;
  };

  // Register
  const register = async (userData) => {
    const res = await API.post('/auth/register', userData);

    setToken(res.data.token);
    localStorage.setItem('sahayataToken', res.data.token);
    setUser(res.data.user);

    API.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;

    return res.data;
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sahayataToken');
    delete API.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        loadUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};