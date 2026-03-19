import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('tg_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('tg_token');
    localStorage.removeItem('tg_user');
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('tg_token');
    if (token) {
      API.get('/auth/me')
        .then(res => { setUser(res.data); localStorage.setItem('tg_user', JSON.stringify(res.data)); })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [logout]);

  const login = (token, userData) => {
    localStorage.setItem('tg_token', token);
    localStorage.setItem('tg_user', JSON.stringify(userData));
    setUser(userData);
  };

  const refreshUser = async () => {
    try {
      const res = await API.get('/auth/me');
      setUser(res.data);
      localStorage.setItem('tg_user', JSON.stringify(res.data));
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
