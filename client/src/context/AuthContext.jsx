import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  const setSession = (userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const clearSession = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const login = async (credentials) => {
    const { data } = await authAPI.login(credentials);
    setSession(data);
    return data;
  };

  const signup = async (userData) => {
    const { data } = await authAPI.signup(userData);
    setSession(data);
    return data;
  };

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  // Validate token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    authAPI.getMe()
      .then(({ data }) => setUser((prev) => ({ ...prev, ...data })))
      .catch(() => clearSession())
      .finally(() => setLoading(false));
  }, [clearSession]);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, isAdmin: user?.role === 'Admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
