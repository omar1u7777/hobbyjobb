// git commit: "feat(common): add Alert component for success, error, and warning messages"

const CONFIG = {
  success: { bg: 'var(--green-light)',  color: 'var(--green-text)', icon: '✅' },
  error:   { bg: 'var(--red-light)',    color: 'var(--red)',        icon: '❌' },
  warning: { bg: 'var(--yellow-light)', color: 'var(--yellow-text)',icon: '⚠️' },
  info:    { bg: 'var(--blue-light)',   color: 'var(--blue)',       icon: 'ℹ️' },
};

export default function Alert({ type = 'info', children, onClose, style = {} }) {
  const cfg = CONFIG[type] ?? CONFIG.info;

  return (
    <div style={{
      background: cfg.bg,
      color: cfg.color,
      borderRadius: 8,
      padding: '12px 16px',
      fontSize: 14,
      fontWeight: 500,
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      ...style,
    }}>
      <span style={{ flexShrink: 0 }}>{cfg.icon}</span>
      <span style={{ flex: 1 }}>{children}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 16, lineHeight: 1 }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
