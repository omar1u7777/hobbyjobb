import { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService.js';
export const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('hj_token'));
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (!token) { setLoading(false); return; } authService.getMe().then(me => setUser(me)).catch(() => { localStorage.removeItem('hj_token'); setToken(null); }).finally(() => setLoading(false)); }, [token]);
  const login = useCallback(async (email, password) => { const { user: me, token: jwt } = await authService.login(email, password); localStorage.setItem('hj_token', jwt); setToken(jwt); setUser(me); return me; }, []);
  const register = useCallback(async (data) => { const { user: me, token: jwt } = await authService.register(data); localStorage.setItem('hj_token', jwt); setToken(jwt); setUser(me); return me; }, []);
  const logout = useCallback(() => { localStorage.removeItem('hj_token'); setToken(null); setUser(null); }, []);
  const refreshUser = useCallback(async () => { try { const me = await authService.getMe(); setUser(me); } catch (_) {} }, []);
  return <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>{children}</AuthContext.Provider>;
}
