import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import * as api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const logout = useCallback(async () => {
    try {
      // Perform a backend logout to clear the session from the server.
      await api.logout(token);
    } catch (error) {
      // Log the error but proceed with client-side logout anyway,
      // as the user should be logged out of the UI regardless.
      console.error("Backend logout failed, proceeding with client-side cleanup:", error);
    }
    // Clear client-side authentication state.
    setToken(null);
    localStorage.removeItem('authToken');
  }, [token]);

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload.sub);
        const admin = payload.sub === process.env.REACT_APP_ADMIN_EMAIL;
        setIsAdmin(admin);
      } catch (e) {
        console.error("Failed to decode token", e);
        logout();
      }
    } else {
      setUser(null);
      setIsAdmin(false);
    }
  }, [token, logout]);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    if (data.access_token) {
      setToken(data.access_token);
      localStorage.setItem('authToken', data.access_token);
    }
    return data;
  };

  const value = useMemo(() => ({
    token,
    user,
    isAdmin,
    isLoggedIn: !!token,
    login,
    logout,
  }), [token, user, isAdmin, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};