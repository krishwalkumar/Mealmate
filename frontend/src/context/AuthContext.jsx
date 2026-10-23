import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('mealmate_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('mealmate_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync / Verify profile on initial app load if token exists
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('mealmate_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get('/auth/me');
        const currentUser = response.data.data.user;
        setUser(currentUser);
        localStorage.setItem('mealmate_user', JSON.stringify(currentUser));
      } catch (err) {
        // If token is expired or invalid, log out cleanly
        if (err.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = response.data.data;

    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('mealmate_token', receivedToken);
    localStorage.setItem('mealmate_user', JSON.stringify(receivedUser));

    return receivedUser;
  };

  const register = async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    const { token: receivedToken, user: receivedUser } = response.data.data;

    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('mealmate_token', receivedToken);
    localStorage.setItem('mealmate_user', JSON.stringify(receivedUser));

    return receivedUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('mealmate_token');
    localStorage.removeItem('mealmate_user');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
