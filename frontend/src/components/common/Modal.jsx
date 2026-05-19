// git commit: "feat(common): add Modal overlay component with backdrop and close on ESC"

import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, maxWidth = 520 }) {
  // Close on ESC key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 24,
      }}
    >
      {/* Backdrop som tillgänglig knapp (tabbar, Enter/Space stänger) */}
      <button
        type="button"
        aria-label="Stäng dialog"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,23,42,0.55)',
          backdropFilter: 'blur(2px)',
          border: 'none',
          padding: 0,
          margin: 0,
          cursor: 'pointer',
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        style={{
          position: 'relative',
          background: 'var(--white)',
          borderRadius: 14,
          boxShadow: 'var(--sh-lg)',
          width: '100%',
          maxWidth,
          maxHeight: '90vh',
          overflowY: 'auto',
          animation: 'modalIn 0.18s ease',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--border-light)',
        }}>
          <h2 id="modal-title" style={{ fontSize: 17, fontWeight: 700 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 20,
              color: 'var(--muted)',
              lineHeight: 1,
              padding: 4,
            }}
            aria-label="Stäng"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px 24px' }}>
          {children}
        </div>
      </div>

      <style>{`@keyframes modalIn{from{transform:scale(.95) translateY(8px);opacity:0}to{transform:none;opacity:1}}`}</style>
    </div>
  );
}
