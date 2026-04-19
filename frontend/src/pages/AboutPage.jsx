import { Link } from 'react-router-dom';

/* ─── Team ────────────────────────────────────────────────── */
const TEAM = [
  {
    id: 's1',
    initial: 'O',
    color: '#2563eb',
    name: 'Omar — S1',
    role: 'Projektledare & Backend Lead',
    bio: 'Ansvarade för systemarkitektur, JWT-autentisering, Stripe Connect och deployment till Render.',
  },
  {
    id: 's2',
    initial: 'A',
    color: '#0f172a',
    name: 'Amin — S2',
    bio: 'Designade databasschema, implementerade REST API för jobb och ansökningar samt hobbyinkomstlogik.',
    role: 'Backend API & Databas',
  },
  {
    id: 's3',
    initial: 'E',
    color: '#16a34a',
    name: 'Edvin — S3',
    role: 'Frontend Lead & Design',
    bio: 'Satte upp React-projektet, designsystemet, gemensamma komponenter och landningssidan.',
  },
  {
    id: 's4',
    initial: 'T',
    color: '#d97706',
    name: 'Suha — S4',
    role: 'Frontend Features',
    bio: 'Implementerade auth-sidor, jobblista, jobbdetalj, profilsida och hela användarflödet.',
  },
  {
    id: 's5',
    initial: 'M',
    color: '#7c3aed',
    name: 'Qusai — S5',
    role: 'Admin, Statistik & Chatt',
    bio: 'Byggde adminpanelen, statistikdiagram, chatt-UI och informationssidor.',
  },
];

/* ─── Värderingar ─────────────────────────────────────────── */
const VALUES = [
  {
    icon: '🏘️',
    title: 'Lokal nytta',
    text: 'En tjänst för verkliga vardagsbehov — små uppdrag nära där folk bor.',
  },
  {
    icon: '🔒',
    title: 'Trygghet först',
    text: 'Plattformen är designad runt hobbyregler med tydlig inkomstöversikt.',
  },
  {
    icon: '⚡',
    title: 'Enkelhet',
    text: 'Snabbt att lägga upp, hitta och slutföra jobb utan onödig friktion.',
  },
];

/* ─── Avatar ──────────────────────────────────────────────── */
function Avatar({ initial, color }) {
  return (
    <div
      style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: color,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 28,
        fontWeight: 800,
        marginBottom: 14,
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function AboutPage() {
  return (
    <main style={{ padding: '42px 0 72px' }}>
      <div className="container">

        {/* ── Hero ────────────────────────────────────────── */}
        <section
          className="card card-lg"
          style={{
            padding: 30,
            marginBottom: 20,
            background:
              'linear-gradient(125deg, rgba(15,23,42,.06) 0%, rgba(37,99,235,.08) 46%, rgba(255,255,255,1) 100%), var(--white)',
          }}
        >
          <span className="badge badge-blue" style={{ marginBottom: 12 }}>
            Om HobbyJobb
          </span>

          <h1 style={{ fontSize: 30, lineHeight: 1.2, fontWeight: 800, marginBottom: 12 }}>
            Om HobbyJobb
          </h1>

          <p style={{ color: 'var(--ink)', maxWidth: 860, lineHeight: 1.75, marginBottom: 10 }}>
            HobbyJobb är en modern marknadsplats där privatpersoner kan hitta eller erbjuda
            mindre tjänster på ett tryggt och tydligt sätt — helt inom Skatteverkets regler
            för hobbyverksamhet.
          </p>
          <p style={{ color: 'var(--ink)', maxWidth: 860, lineHeight: 1.75, marginBottom: 10 }}>
            Plattformen kopplar ihop folk som behöver hjälp med allt från gräsklippning och
            hundpromenad till enklare hantverk och IT-stöd. Betalningar hanteras säkert via
            Stripe Connect med automatisk escrow, och vi håller koll på hobbyinkomstgränsen
            åt dig.
          </p>
          <p style={{ color: 'var(--ink)', maxWidth: 860, lineHeight: 1.75, marginBottom: 20 }}>
            Projektet är byggt av fem studenter inom kursen{' '}
            <strong>DA219B Fullstack Utveckling</strong> vid{' '}
            <strong>Högskolan Kristianstad (HKR)</strong>, VT 2026.
          </p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link className="btn btn-primary" to="/jobs">
              Se tillgängliga jobb
            </Link>
            <Link className="btn btn-outline" to="/hobbyinfo">
              Läs hobbyregler
            </Link>
          </div>
        </section>

        {/* ── Värderingar ─────────────────────────────────── */}
        <section className="section" style={{ marginBottom: 20 }}>
          <div className="section-hdr">
            <h2>Våra värderingar</h2>
          </div>

          <div
            className="about-values-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 12,
            }}
          >
            {VALUES.map((v) => (
              <article
                key={v.title}
                className="card"
                style={{ padding: '20px 20px 22px', borderTop: '3px solid var(--blue)' }}
              >
                <div style={{ fontSize: 26, marginBottom: 10 }}>{v.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{v.title}</h3>
                <p style={{ color: 'var(--ink)', fontSize: 14, lineHeight: 1.7 }}>{v.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Team ────────────────────────────────────────── */}
        <section className="section" style={{ marginBottom: 20 }}>
          <div className="section-hdr">
            <h2>Teamet bakom HobbyJobb</h2>
          </div>

          <div
            className="about-team-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 14,
            }}
          >
            {TEAM.map((member) => (
              <article
                key={member.id}
                className="card"
                style={{ padding: '20px 20px 22px' }}
              >
                <Avatar initial={member.initial} color={member.color} />
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                  {member.name}
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--blue)',
                    fontWeight: 700,
                    marginBottom: 10,
                  }}
                >
                  {member.role}
                </p>
                <p style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.65 }}>
                  {member.bio}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Kursinformation ─────────────────────────────── */}
        <section
          className="card"
          style={{
            padding: '22px 28px',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <div style={{ fontSize: 32 }}>🎓</div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
              DA219B — Fullstack Utveckling
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>
              Högskolan Kristianstad (HKR) · Grupp 5 · VT 2026
            </p>
          </div>
        </section>
      </div>

      <style>{`
        @media (max-width: 1000px) {
          .about-team-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .about-values-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 700px) {
          .about-team-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
