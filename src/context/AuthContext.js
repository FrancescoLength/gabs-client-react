import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import * as api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload.sub);
        const admin = payload.sub === 'france.schino@live.it';
        setIsAdmin(admin);
      } catch (e) {
        console.error("Failed to decode token", e);
        logout();
      }
    } else {
      setUser(null);
      setIsAdmin(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    if (data.access_token) {
      setToken(data.access_token);
      localStorage.setItem('authToken', data.access_token);
    }
    return data;
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('authToken');
  };

  const value = useMemo(() => ({
    token,
    user,
    isAdmin,
    isLoggedIn: !!token,
    login,
    logout,
  }), [token, user, isAdmin]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};