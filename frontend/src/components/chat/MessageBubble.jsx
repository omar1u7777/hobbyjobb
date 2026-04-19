function formatTime(dateStr) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
}

export default function MessageBubble({ message, isOwn }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
      }}
    >
      <article
        style={{
          maxWidth: '82%',
          background: isOwn ? 'var(--blue)' : 'var(--white)',
          color: isOwn ? '#fff' : 'var(--dark)',
          border: isOwn ? 'none' : '1px solid var(--border)',
          borderRadius: 12,
          padding: '10px 12px 8px',
          boxShadow: isOwn ? 'none' : 'var(--sh)',
        }}
      >
        <p style={{ fontSize: 14, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{message.text}</p>
        <p
          style={{
            marginTop: 6,
            fontSize: 11,
            textAlign: 'right',
            color: isOwn ? 'rgba(255,255,255,.8)' : 'var(--muted)',
          }}
        >
          {formatTime(message.sentAt)}
        </p>
      </article>
    </div>
  );
}
