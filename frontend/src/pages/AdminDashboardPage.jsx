import { useEffect, useState } from 'react';
import UserTable from '../components/admin/UserTable.jsx';
import JobTable from '../components/admin/JobTable.jsx';
import CategoryManager from '../components/admin/CategoryManager.jsx';
import FlaggedAccounts from '../components/admin/FlaggedAccounts.jsx';
import AdminStatsCharts from '../components/charts/AdminStatsCharts.jsx';
import { adminService } from '../services/adminService.js';

const FALLBACK_STATS = [
  { id: 'jobs', label: 'Totalt jobb', value: '1 284', delta: '+8.3%', trend: 'up' },
  { id: 'users', label: 'Användare', value: '892', delta: '+4.1%', trend: 'up' },
  { id: 'revenue', label: 'Intäkter (SEK)', value: '96 440', delta: '+11.7%', trend: 'up' },
  { id: 'flagged', label: 'Flaggade konton', value: '14', delta: '-2', trend: 'down' },
];

function formatNumber(value) {
  if (value === null || value === undefined) return '—';
  return Number(value).toLocaleString('sv-SE');
}

function buildStatsFromApi(api) {
  return [
    { id: 'jobs', label: 'Totalt jobb', value: formatNumber(api.totalJobs), delta: `Öppna: ${formatNumber(api.openJobs)}`, trend: 'up' },
    { id: 'users', label: 'Användare', value: formatNumber(api.totalUsers), delta: `Boostade jobb: ${formatNumber(api.boostedJobs)}`, trend: 'up' },
    { id: 'revenue', label: 'Plattformsintäkt (SEK)', value: formatNumber(api.platformRevenue), delta: `Brutto: ${formatNumber(api.grossVolume)} kr`, trend: 'up' },
    { id: 'flagged', label: 'Flaggade konton', value: formatNumber(api.flaggedAccounts), delta: `Kategorier: ${formatNumber(api.totalCategories)}`, trend: api.flaggedAccounts > 0 ? 'down' : 'up' },
  ];
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

function AlertsRow({ stats, apiLive }) {
  const flaggedStat = stats.find((s) => s.id === 'flagged');
  const flaggedCount = flaggedStat ? Number(String(flaggedStat.value).replace(/\s/g, '')) || 0 : 0;

  const jobsStat = stats.find((s) => s.id === 'jobs');
  const openJobsText = jobsStat?.delta || '';
  const openJobsMatch = openJobsText.match(/(\d[\d\s]*)/);
  const openJobsCount = openJobsMatch ? Number(openJobsMatch[1].replace(/\s/g, '')) || 0 : 0;

  if (!apiLive) return null;

  const hasWarning = flaggedCount > 0;
  const hasModeration = openJobsCount > 0;

  if (!hasWarning && !hasModeration) {
    return (
      <section className="admin-alerts-row" style={{ marginBottom: 16 }}>
        <article className="card" style={{ padding: 14, borderLeft: '4px solid var(--green)' }}>
          <h2 style={{ fontSize: 15, marginBottom: 6 }}>✅ Systemstatus</h2>
          <p style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.6 }}>
            Inga flaggade konton eller jobb som kräver uppföljning just nu.
          </p>
        </article>
      </section>
    );
  }

  return (
    <section className="admin-alerts-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
      <article className="card" style={{ padding: 14, borderLeft: `4px solid ${hasWarning ? 'var(--yellow)' : 'var(--green)'}` }}>
        <h2 style={{ fontSize: 15, marginBottom: 6 }}>{hasWarning ? '⚠️ Systemvarning' : '✅ Inga varningar'}</h2>
        <p style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.6 }}>
          {hasWarning
            ? `${flaggedCount} ${flaggedCount === 1 ? 'konto ligger' : 'konton ligger'} över 80% av hobbyinkomstgränsen och behöver uppföljning.`
            : 'Inga konton nära hobbyinkomstgränsen just nu.'}
        </p>
      </article>

      <article className="card" style={{ padding: 14, borderLeft: `4px solid ${openJobsCount > 10 ? 'var(--yellow)' : 'var(--blue)'}` }}>
        <h2 style={{ fontSize: 15, marginBottom: 6 }}>📋 Öppna jobb</h2>
        <p style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.6 }}>
          {openJobsCount} {openJobsCount === 1 ? 'jobb' : 'jobb'} är öppna och väntar på ansökningar.
        </p>
      </article>
    </section>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(FALLBACK_STATS);
  const [apiLive, setApiLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        const apiStats = await adminService.getStats();
        if (cancelled) return;

        if (apiStats) {
          setStats(buildStatsFromApi(apiStats));
          setApiLive(true);
        }
      } catch (_) {
        // Fall back to mock; no-op
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadStats();
    return () => { cancelled = true; };
  }, []);

  return (
    <main style={{ padding: '36px 0 64px' }}>
      <div className="container">
        <header style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--muted)' }}>
            {loading ? 'Laddar statistik…' : apiLive ? 'Plattformsöversikt i realtid.' : 'Kunde inte ladda statistik.'}
          </p>
        </header>

        <section className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: 16 }}>
          {stats.map((stat) => (
            <article key={stat.id} className="card" style={{ padding: 16 }}>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>{stat.label}</p>
              <p style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.1, marginBottom: 12 }}>{stat.value}</p>
              <DeltaTag delta={stat.delta} trend={stat.trend} />
            </article>
          ))}
        </section>

        <AlertsRow stats={stats} apiLive={apiLive} />

        <AdminStatsCharts />

        <FlaggedAccounts />

        <CategoryManager />

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

          .admin-charts-top {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 700px) {
          .admin-stats-grid,
          .admin-alerts-row {
            grid-template-columns: 1fr !important;
          }

          .flagged-filters {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
