import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, getToken, setToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // True while restoring a saved session from the server on first load
  const [loading, setLoading] = useState(() => Boolean(getToken()));

  // Restore the session: the JWT is the only thing kept in the browser; the user comes from MySQL.
  useEffect(() => {
    if (!getToken()) return;
    let cancelled = false;
    api('/auth/me')
      .then((res) => { if (!cancelled) setUser(res.user); })
      .catch(() => { if (!cancelled) setToken(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  // Token rejected by the server mid-session -> sign the user out
  useEffect(() => {
    window.addEventListener('auth:expired', logout);
    return () => window.removeEventListener('auth:expired', logout);
  }, [logout]);

  const login = async (email, password, role) => {
    try {
      const res = await api('/auth/login', { method: 'POST', body: { email, password, role } });
      setToken(res.token);
      setUser(res.user);
      return { success: true, user: res.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const signup = async (formData, role) => {
    try {
      const { confirmPassword, ...payload } = formData;
      const res = await api('/auth/register', { method: 'POST', body: { ...payload, role } });
      setToken(res.token);
      setUser(res.user);
      return { success: true, user: res.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateUser = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role, login, signup, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
