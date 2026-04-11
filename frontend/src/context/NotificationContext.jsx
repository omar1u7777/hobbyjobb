// git commit: "feat(notifications): add NotificationContext for unread message badge count"

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import api from '../services/api.js';

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount]     = useState(0);
  const [notifications, setNotifications] = useState([]);

  const fetchUnread = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/messages/unread-count');
      setUnreadCount(data.count ?? 0);
    } catch (_) { /* silently fail */ }
  }, [user]);

  // Poll every 30 seconds while logged in
  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }
    fetchUnread();
    const id = setInterval(fetchUnread, 30_000);
    return () => clearInterval(id);
  }, [user, fetchUnread]);

  const markAllRead = useCallback(() => setUnreadCount(0), []);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) =>
    setNotifications(prev => prev.filter(n => n.id !== id)), []);

  const value = { unreadCount, notifications, fetchUnread, markAllRead, addToast, removeToast };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Global toast container */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 9999,
        pointerEvents: 'none',
      }}>
        {notifications.map(n => (
          <div key={n.id} style={{
            background: n.type === 'error' ? 'var(--red)' : n.type === 'success' ? 'var(--green)' : 'var(--dark)',
            color: '#fff',
            padding: '12px 18px',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 500,
            boxShadow: 'var(--sh-lg)',
            pointerEvents: 'auto',
            animation: 'slideIn 0.2s ease',
            maxWidth: 320,
          }}>
            {n.message}
          </div>
        ))}
      </div>
      <style>{`@keyframes slideIn{from{transform:translateX(40px);opacity:0}to{transform:none;opacity:1}}`}</style>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
}
