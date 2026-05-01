// git commit: "feat(auth): implement global AuthContext with JWT persistence"

import { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem('hj_token'));
  const [loading, setLoading] = useState(true);

  // On mount only: validate stored token (not re-run on login/logout)
  useEffect(() => {
    const stored = localStorage.getItem('hj_token');
    if (!stored) {
      setLoading(false);
      return;
    }
    authService.getMe()
      .then(me => setUser(me))
      .catch((err) => {
        if (err?.status === 401) {
          localStorage.removeItem('hj_token');
          setToken(null);
        }
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email, password) => {
    const { user: me, token: jwt } = await authService.login(email, password);
    localStorage.setItem('hj_token', jwt);
    setToken(jwt);
    setUser(me);
    return me;
  }, []);

  const register = useCallback(async (data) => {
    const { user: me, token: jwt } = await authService.register(data);
    localStorage.setItem('hj_token', jwt);
    setToken(jwt);
    setUser(me);
    return me;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('hj_token');
    setToken(null);
    setUser(null);
  }, []);

  /** Call after profile updates so user state stays fresh */
  const refreshUser = useCallback(async () => {
    try {
      const me = await authService.getMe();
      setUser(me);
    } catch (_) { /* ignore */ }
  }, []);

  const value = { user, token, loading, login, register, logout, refreshUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
