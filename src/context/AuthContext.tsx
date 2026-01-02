import { createContext, useState, useContext, useEffect, useMemo, useCallback, ReactNode } from 'react';
import * as api from '../api';
import { jwtDecode } from 'jwt-decode';
import { LoginResponse } from '../types';

interface AuthContextType {
  token: string | null;
  user: string | null;
  isAdmin: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
}

interface DecodedToken {
  sub: string;
  exp: number;
  [key: string]: unknown;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));

  const logout = useCallback(async () => {
    try {
      if (token) {
        // Perform a backend logout to clear the session from the server.
        await api.logout();
      }
    } catch (error) {
      // Log the error but proceed with client-side logout anyway,
      // as the user should be logged out of the UI regardless.
      console.error("Backend logout failed, proceeding with client-side cleanup:", error);
    }
    // Clear client-side authentication state.
    setToken(null);
    localStorage.removeItem('authToken');
  }, [token]);

  const { user, isAdmin } = useMemo(() => {
    if (!token) return { user: null, isAdmin: false };
    try {
      const payload = jwtDecode<DecodedToken>(token);
      return {
        user: payload.sub,
        isAdmin: payload.sub === import.meta.env.VITE_ADMIN_EMAIL
      };
    } catch (err: unknown) {
      console.error("Failed to decode token:", err);
      // We cannot call logout() here during render.
      // If token is invalid, we'll return null and handle cleanup via effect if needed,
      // or better, just let the next restricted action fail and trigger logout.
      // For now, effectively logged out state:
      return { user: null, isAdmin: false };
    }
  }, [token]);

  // Effect to handle invalid token cleanup if necessary?
  // Actually, if decoding fails, we probably want to clear the token.
  // But doing it in render is bad. Doing it in effect is what caused the original issue.
  // The original issue was setting state (user/admin) in effect.
  // Now we don't set user/admin state. But we might want to setToken(null).
  // Safe way: usage of invalid token will fail API calls, which triggers logout elsewhere?
  // Or we use an effect to check validity.

  useEffect(() => {
    if (token) {
      try {
        jwtDecode<{ username: string; isAdmin: boolean; exp: number }>(token);
      } catch {
        // Only if it really fails decoding do we logout
        setTimeout(() => logout(), 0);
      }
    }
  }, [token, logout]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.login(email, password);
    if (data.access_token) {
      setToken(data.access_token);
      localStorage.setItem('authToken', data.access_token);
    }
    return data;
  }, []);

  const value = useMemo(() => ({
    token,
    user,
    isAdmin,
    isLoggedIn: !!token && !!user, // Ensure both exist
    login,
    logout,
  }), [token, user, isAdmin, login, logout]); // added login to deps

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext) as AuthContextType;
};