import { Link } from 'react-router-dom';

const TEAM = [
  {
    id: 's1',
    name: 'Student 1',
    role: 'Projektledare & Backend Lead',
    photo: 'https://ui-avatars.com/api/?name=Student+1&background=2563eb&color=ffffff&size=256',
    focus: 'Auth, deployment, Stripe och arkitektur',
  },
  {
    id: 's2',
    name: 'Student 2',
    role: 'Backend API & Databas',
    photo: 'https://ui-avatars.com/api/?name=Student+2&background=0f172a&color=ffffff&size=256',
    focus: 'CRUD, migrationer, relationer och hobbylogik',
  },
  {
    id: 's3',
    name: 'Student 3',
    role: 'Frontend Lead & Design',
    photo: 'https://ui-avatars.com/api/?name=Student+3&background=16a34a&color=ffffff&size=256',
    focus: 'Designsystem, routing och gemensamma komponenter',
  },
  {
    id: 's4',
    name: 'Student 4',
    role: 'Frontend Features',
    photo: 'https://ui-avatars.com/api/?name=Student+4&background=d97706&color=ffffff&size=256',
    focus: 'Auth-sidor, jobbsidor, profil och användarflöde',
  },
  {
    id: 's5',
    name: 'Student 5',
    role: 'Admin, Statistik & Chatt',
    photo: 'https://ui-avatars.com/api/?name=Student+5&background=7c3aed&color=ffffff&size=256',
    focus: 'Adminpanel, diagram, chatt-UI och infosidor',
  },
];

const VALUES = [
  {
    title: 'Lokal nytta',
    text: 'Vi bygger en tjänst för verkliga vardagsbehov: små uppdrag nära där folk bor.',
  },
  {
    title: 'Trygghet först',
    text: 'Plattformen är designad runt hobbyregler och tydlig inkomstöversikt.',
  },
  {
    title: 'Enkelhet',
    text: 'Det ska vara snabbt att lägga upp, hitta och slutföra jobb utan onödig friktion.',
  },
];

export default function AboutPage() {
  return (
    <main style={{ padding: '42px 0 72px' }}>
      <div className="container">
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
            Ett studentprojekt med fokus på lokala hobbyjobb
          </h1>

          <p style={{ color: 'var(--ink)', maxWidth: 860, lineHeight: 1.75, marginBottom: 18 }}>
            HobbyJobb är utvecklat inom kursen DA219B av Grupp 5 på Högskolan Kristianstad.
            Visionen är en modern marknadsplats där privatpersoner kan hitta eller erbjuda
            mindre tjänster på ett tryggt och tydligt sätt.
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

        <section className="section" style={{ marginBottom: 20 }}>
          <div className="section-hdr">
            <h3>Våra värderingar</h3>
          </div>

          <div className="about-values-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
            {VALUES.map((value) => (
              <article
                key={value.title}
                className="card"
                style={{
                  padding: '16px 16px 18px',
                  borderTop: '3px solid var(--blue)',
                }}
              >
                <h2 style={{ fontSize: 16, marginBottom: 8 }}>{value.title}</h2>
                <p style={{ color: 'var(--ink)', fontSize: 14, lineHeight: 1.7 }}>{value.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-hdr">
            <h3>Team Grupp 5</h3>
          </div>

          <div className="about-team-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
            {TEAM.map((member) => (
              <article key={member.id} className="card" style={{ padding: 16 }}>
                <img
                  src={member.photo}
                  alt={`Profilbild för ${member.name}`}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: 180,
                    objectFit: 'cover',
                    borderRadius: 10,
                    marginBottom: 12,
                    border: '1px solid var(--border)',
                    background: 'var(--border-light)',
                  }}
                />

                <h4 style={{ fontSize: 16, marginBottom: 4 }}>{member.name}</h4>
                <p style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 700, marginBottom: 8 }}>
                  {member.role}
                </p>
                <p style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.6 }}>{member.focus}</p>
              </article>
            ))}
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
