
import React, { createContext, useState, useContext } from 'react';
import * as api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Leggiamo il token dal localStorage per mantenere l'utente loggato
  const [token, setToken] = useState(localStorage.getItem('authToken'));

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

  const value = {
    token,
    isLoggedIn: !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizzato per accedere facilmente al contesto
export const useAuth = () => {
  return useContext(AuthContext);
};
