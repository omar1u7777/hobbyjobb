// git commit: "feat(footer): build 4-column dark Footer with navigation links"

import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--dark)', color: '#94A3B8', padding: '40px 0 24px' }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: 40,
          marginBottom: 28,
        }} className="footer-grid">
          {/* Brand */}
          <div>
            <Link to="/" style={{ fontSize: 20, fontWeight: 800, color: '#fff', display: 'block', marginBottom: 8 }}>
              hobby<span style={{ color: 'var(--blue)' }}>jobb</span>
            </Link>
            <p style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 240 }}>
              Sveriges plattform för lokala hobbybaserade smajobb. Juridiskt trygg — vi håller koll på inkomstgränsen åt dig.
            </p>
          </div>

          <FooterCol title="Plattform" links={[
            { to: '/jobs', label: 'Hitta jobb' },
            { to: '/lagg-upp-jobb', label: 'Lägg upp jobb' },
            { to: '/hobbyinfo', label: 'Hur det fungerar' },
          ]} />

          <FooterCol title="Konto" links={[
            { to: '/login', label: 'Logga in' },
            { to: '/register', label: 'Skapa konto' },
            { to: '/profil', label: 'Min profil' },
          ]} />

          <FooterCol title="Info" links={[
            { to: '/hobbyinfo', label: 'Hobbyinfo' },
            { to: '/om-oss', label: 'Om oss' },
            { href: 'https://www.skatteverket.se', label: 'Skatteverket ↗' },
          ]} />
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid #1E293B',
          paddingTop: 20,
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 13,
          flexWrap: 'wrap',
          gap: 10,
        }}>
          <span>© 2026 HobbyJobb · DA219B Grupp 5 · Högskolan Kristianstad</span>
          <div style={{ display: 'flex', gap: 16 }}>
            <Link to="#" style={{ color: '#64748B' }}>Integritetspolicy</Link>
            <Link to="#" style={{ color: '#64748B' }}>Användarvillkor</Link>
            <Link to="#" style={{ color: '#64748B' }}>Cookies</Link>
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:900px){.footer-grid{grid-template-columns:1fr 1fr!important}}
        @media(max-width:600px){.footer-grid{grid-template-columns:1fr!important}}
      `}</style>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 style={{ color: '#fff', fontSize: 13, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title}
      </h4>
      <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {links.map(l => (
          <li key={l.label}>
            {l.href
              ? <a href={l.href} target="_blank" rel="noopener noreferrer" style={{ color: '#94A3B8', fontSize: 14 }}>{l.label}</a>
              : <Link to={l.to} style={{ color: '#94A3B8', fontSize: 14 }}>{l.label}</Link>
            }
          </li>
        ))}
      </ul>
    </div>
  );
}
