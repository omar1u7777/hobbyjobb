import UserTable from '../components/admin/UserTable.jsx';
import JobTable from '../components/admin/JobTable.jsx';
import AdminStatsCharts from '../components/charts/AdminStatsCharts.jsx';

const STATS = [
  { id: 'jobs', label: 'Totalt jobb', value: '1 284', delta: '+8.3%', trend: 'up' },
  { id: 'users', label: 'Användare', value: '892', delta: '+4.1%', trend: 'up' },
  { id: 'revenue', label: 'Intäkter (SEK)', value: '96 440', delta: '+11.7%', trend: 'up' },
  { id: 'flagged', label: 'Flaggade konton', value: '14', delta: '-2', trend: 'down' },
];

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

export default function AdminDashboardPage() {
  return (
    <main style={{ padding: '36px 0 64px' }}>
      <div className="container">
        <header style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--muted)' }}>Mock-data tills admin-API kopplas in.</p>
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
              5 konton ligger över 80% av hobbyinkomstgränsen och behöver uppföljning.
            </p>
          </article>

          <article className="card" style={{ padding: 14, borderLeft: '4px solid var(--blue)' }}>
            <h2 style={{ fontSize: 15, marginBottom: 6 }}>Moderering</h2>
            <p style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.6 }}>
              3 jobb markerade för manuell granskning på grund av otydliga beskrivningar.
            </p>
          </article>
        </section>

        <AdminStatsCharts />

        <section className="admin-tables-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <UserTable />
          <JobTable />
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

          .admin-charts-grid {
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
