import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <h1 style={{
        fontSize: '5rem',
        fontWeight: 800,
        color: 'var(--primary, #2563eb)',
        margin: 0,
        lineHeight: 1,
      }}>
        404
      </h1>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: 600,
        color: 'var(--dark, #1e293b)',
        margin: '0.75rem 0 0.5rem',
      }}>
        Sidan hittades inte
      </h2>
      <p style={{
        color: 'var(--muted, #64748b)',
        maxWidth: 420,
        lineHeight: 1.6,
        marginBottom: '1.5rem',
      }}>
        Sidan du letar efter finns inte eller har flyttats.
        Kontrollera webbadressen och försök igen.
      </p>
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '0.75rem 1.5rem',
          background: 'var(--primary, #2563eb)',
          color: '#fff',
          borderRadius: 8,
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '0.95rem',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        ← Tillbaka till startsidan
      </Link>
    </div>
  );
}
