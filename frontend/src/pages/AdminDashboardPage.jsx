const STATS = [
  { id: 'jobs', label: 'Totalt jobb', value: '1 284', delta: '+8.3%', trend: 'up' },
  { id: 'users', label: 'Anvandare', value: '892', delta: '+4.1%', trend: 'up' },
  { id: 'revenue', label: 'Intakter (SEK)', value: '96 440', delta: '+11.7%', trend: 'up' },
  { id: 'flagged', label: 'Flaggade konton', value: '14', delta: '-2', trend: 'down' },
];

const USERS = [
  { id: 1, name: 'Anna Lindgren', hobbyTotal: '28 900', status: 'Nara grans', jobsMonth: 12 },
  { id: 2, name: 'Bjorn Karlsson', hobbyTotal: '14 120', status: 'OK', jobsMonth: 7 },
  { id: 3, name: 'Maria Svensson', hobbyTotal: '30 000', status: 'Sparrad', jobsMonth: 21 },
  { id: 4, name: 'Erik Magnusson', hobbyTotal: '18 450', status: 'OK', jobsMonth: 9 },
  { id: 5, name: 'Sofia Berg', hobbyTotal: '24 980', status: 'Nara grans', jobsMonth: 16 },
];

const JOBS = [
  { id: 301, title: 'Grassklippning och kantskarning', category: 'Hem & Tradgard', price: '650', status: 'Aktivt' },
  { id: 302, title: 'IKEA-montering av 3 mobler', category: 'Handyman', price: '850', status: 'Aktivt' },
  { id: 303, title: 'Hundpromenad 2 ganger i veckan', category: 'Djur & Husdjur', price: '300', status: 'Aktivt' },
  { id: 304, title: 'Storstadning 3 rum och kok', category: 'Stadning', price: '900', status: 'Flaggat' },
  { id: 305, title: 'Hjalp med mindre flytt', category: 'Flytt & Transport', price: '1200', status: 'Pausat' },
];

function statusStyle(status) {
  if (status === 'Sparrad' || status === 'Flaggat') {
    return { background: 'var(--red-light)', color: 'var(--red)' };
  }

  if (status === 'Nara grans' || status === 'Pausat') {
    return { background: 'var(--yellow-light)', color: 'var(--yellow-text)' };
  }

  return { background: 'var(--green-light)', color: 'var(--green-text)' };
}

function DeltaTag({ delta, trend }) {
  const isUp = trend === 'up';
  const color = isUp ? 'var(--green-text)' : 'var(--yellow-text)';
  const bg = isUp ? 'var(--green-light)' : 'var(--yellow-light)';

  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 700,
        color,
        background: bg,
        borderRadius: 20,
        padding: '4px 10px',
      }}
    >
      {delta}
    </span>
  );
}

function TableShell({ title, subtitle, children }) {
  return (
    <section className="section" style={{ marginBottom: 0 }}>
      <div className="section-hdr" style={{ marginBottom: 14 }}>
        <div>
          <h3>{title}</h3>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function AdminDashboardPage() {
  return (
    <main style={{ padding: '36px 0 64px' }}>
      <div className="container">
        <header style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--muted)' }}>Mock-data tills admin API kopplas in.</p>
        </header>

        <section className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: 16 }}>
          {STATS.map((stat) => (
            <article key={stat.id} className="card" style={{ padding: 16 }}>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>{stat.label}</p>
              <p style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.1, marginBottom: 12 }}>{stat.value}</p>
              <DeltaTag delta={stat.delta} trend={stat.trend} />
            </article>
          ))}
        </section>

        <section className="admin-alerts-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <article className="card" style={{ padding: 14, borderLeft: '4px solid var(--yellow)' }}>
            <h2 style={{ fontSize: 15, marginBottom: 6 }}>Systemvarning</h2>
            <p style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.6 }}>
              5 konton ligger over 80% av hobbyinkomstgransen och behovar uppfoljning.
            </p>
          </article>

          <article className="card" style={{ padding: 14, borderLeft: '4px solid var(--blue)' }}>
            <h2 style={{ fontSize: 15, marginBottom: 6 }}>Moderering</h2>
            <p style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.6 }}>
              3 jobb markerade for manuell granskning pa grund av otydliga beskrivningar.
            </p>
          </article>
        </section>

        <section className="admin-tables-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <TableShell title="Anvandaroversikt" subtitle="Senast uppdaterad med mock-data">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', fontSize: 12, color: 'var(--muted)' }}>
                    <th style={{ padding: '8px 6px' }}>Namn</th>
                    <th style={{ padding: '8px 6px' }}>Hobby totalt</th>
                    <th style={{ padding: '8px 6px' }}>Jobb/manad</th>
                    <th style={{ padding: '8px 6px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {USERS.map((user) => (
                    <tr key={user.id} style={{ borderTop: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '10px 6px', fontSize: 13, fontWeight: 600 }}>{user.name}</td>
                      <td style={{ padding: '10px 6px', fontSize: 13 }}>{user.hobbyTotal} kr</td>
                      <td style={{ padding: '10px 6px', fontSize: 13 }}>{user.jobsMonth}</td>
                      <td style={{ padding: '10px 6px' }}>
                        <span
                          style={{
                            ...statusStyle(user.status),
                            borderRadius: 999,
                            padding: '4px 10px',
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {user.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TableShell>

          <TableShell title="Jobboversikt" subtitle="Aktiva och flaggade annonser">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', fontSize: 12, color: 'var(--muted)' }}>
                    <th style={{ padding: '8px 6px' }}>Titel</th>
                    <th style={{ padding: '8px 6px' }}>Kategori</th>
                    <th style={{ padding: '8px 6px' }}>Pris</th>
                    <th style={{ padding: '8px 6px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {JOBS.map((job) => (
                    <tr key={job.id} style={{ borderTop: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '10px 6px', fontSize: 13, fontWeight: 600 }}>{job.title}</td>
                      <td style={{ padding: '10px 6px', fontSize: 13 }}>{job.category}</td>
                      <td style={{ padding: '10px 6px', fontSize: 13 }}>{job.price} kr</td>
                      <td style={{ padding: '10px 6px' }}>
                        <span
                          style={{
                            ...statusStyle(job.status),
                            borderRadius: 999,
                            padding: '4px 10px',
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {job.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TableShell>
        </section>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .admin-stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .admin-tables-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 700px) {
          .admin-stats-grid,
          .admin-alerts-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
