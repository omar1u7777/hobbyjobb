import { Link } from 'react-router-dom';
export default function Footer() {
  return <footer style={{ background: 'var(--dark)', color: '#94A3B8', padding: '40px 0 24px' }}><div className="container"><Link to="/" style={{ fontSize: 20, fontWeight: 800, color: '#fff', display: 'block', marginBottom: 8 }}>hobby<span style={{ color: 'var(--blue)' }}>jobb</span></Link><p style={{ fontSize: 14, marginBottom: 20 }}>Sveriges plattform for lokala hobbybaserade smajobb.</p><div style={{ borderTop: '1px solid #1E293B', paddingTop: 20, fontSize: 13 }}>© 2026 HobbyJobb · DA219B Grupp 5 · Hogskolan Kristianstad</div></div></footer>;
}
