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
        marginBottom: 8,
        animation: 'fadeInUp 0.3s ease-out',
      }}
    >
      <article
        style={{
          maxWidth: '75%',
          background: isOwn 
            ? 'linear-gradient(135deg, #2563eb, #3b82f6)' 
            : 'rgba(255, 255, 255, 0.9)',
          color: isOwn ? '#fff' : 'var(--dark)',
          border: isOwn ? 'none' : '1px solid rgba(0, 0, 0, 0.05)',
          borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          padding: '12px 16px',
          boxShadow: isOwn 
            ? '0 4px 12px rgba(37, 99, 235, 0.3)' 
            : '0 4px 12px rgba(0, 0, 0, 0.04)',
          backdropFilter: isOwn ? 'none' : 'blur(10px)',
          position: 'relative',
        }}
      >
        <p style={{ 
          fontSize: 14, 
          lineHeight: 1.5, 
          whiteSpace: 'pre-wrap',
          margin: 0,
          fontFamily: 'var(--font)' 
        }}>
          {message.text}
        </p>
        <p
          style={{
            marginTop: 6,
            marginBottom: 0,
            fontSize: 10,
            fontWeight: 500,
            textAlign: 'right',
            color: isOwn ? 'rgba(255,255,255,.7)' : 'var(--muted)',
          }}
        >
          {formatTime(message.sentAt)}
        </p>
      </article>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
