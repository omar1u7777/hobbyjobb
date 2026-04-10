import { useEffect } from 'react';
export default function Modal({ open, onClose, title, children, maxWidth = 520 }) {
  useEffect(() => { if (!open) return; const h = (e) => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [open, onClose]);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);
  if (!open) return null;
  return <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}><div onClick={e => e.stopPropagation()} style={{ background: 'var(--white)', borderRadius: 14, boxShadow: 'var(--sh-lg)', width: '100%', maxWidth, maxHeight: '90vh', overflowY: 'auto' }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid var(--border-light)' }}><h2 style={{ fontSize: 17, fontWeight: 700 }}>{title}</h2><button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--muted)' }}>✕</button></div><div style={{ padding: '20px 24px 24px' }}>{children}</div></div></div>;
}
