import { createContext, useContext, useState, useCallback } from 'react';
export const NotificationContext = createContext(null);
export function NotificationProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const markAllRead = useCallback(() => setUnreadCount(0), []);
  const addToast = useCallback((message, type = 'info') => { const id = Date.now(); setNotifications(prev => [...prev, { id, message, type }]); setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000); }, []);
  const removeToast = useCallback((id) => setNotifications(prev => prev.filter(n => n.id !== id)), []);
  return <NotificationContext.Provider value={{ unreadCount, notifications, markAllRead, addToast, removeToast }}>{children}</NotificationContext.Provider>;
}
export function useNotification() { const ctx = useContext(NotificationContext); if (!ctx) throw new Error('useNotification must be used within NotificationProvider'); return ctx; }
