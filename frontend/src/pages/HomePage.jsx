// git commit: "feat(home): build authenticated HomePage dashboard with recent jobs and quick actions"

import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useJobs } from '../hooks/useJobs.js';
import { useHobbyLimit } from '../hooks/useHobbyLimit.js';
import JobCard from '../components/jobs/JobCard.jsx';
import Spinner from '../components/common/Spinner.jsx';
import IncomeTracker from '../components/profile/IncomeTracker.jsx';

export default function HomePage() {
  const { user }                     = useAuth();
  const { jobs, loading }            = useJobs({ limit: 6 });
  const { totalYear, pct, isNear }   = useHobbyLimit();

  const hour    = new Date().getHours();
  const greeting = hour < 12 ? 'God morgon' : hour < 17 ? 'Hej' : 'God kväll';

  return (
    <main style={{ padding: '40px 0 64px' }}>
      <div className="container">

        {/* Welcome */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
            {greeting}, {user?.name?.split(' ')[0] ?? 'där'} 👋
          </h1>
          <p style={{ color: 'var(--muted)' }}>Här är din översikt för idag.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 28, alignItems: 'start' }} className="home-grid">

          {/* Left column */}
          <div>
            {/* Quick actions */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
              <Link to="/jobs" className="btn btn-primary">🔍 Hitta jobb</Link>
              <Link to="/lagg-upp-jobb" className="btn btn-outline">+ Lägg upp jobb</Link>
              <Link to="/mina-jobb" className="btn btn-ghost">📋 Mina jobb</Link>
            </div>

            {/* Recent jobs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Senaste jobben nära dig</h2>
              <Link to="/jobs" style={{ fontSize: 14, color: 'var(--blue)', fontWeight: 600 }}>Visa alla →</Link>
            </div>

            {loading
              ? <div style={{ textAlign: 'center', padding: 40 }}><Spinner /></div>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {jobs.map(j => <JobCard key={j.id} job={j} />)}
                </div>
            }
          </div>

          {/* Right column */}
          <div>
            <IncomeTracker totalYear={totalYear} pct={pct} isNear={isNear} />

            <div className="section" style={{ marginTop: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Snabblänkar</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { to: '/profil',       icon: '👤', label: 'Min profil' },
                  { to: '/mina-jobb',   icon: '📋', label: 'Mina jobb' },
                  { to: '/chatt',        icon: '💬', label: 'Meddelanden' },
                  { to: '/hobbyinfo',    icon: 'ℹ️', label: 'Hobbyregler' },
                ].map(l => (
                  <Link key={l.to} to={l.to} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                    borderRadius: 8, background: 'var(--bg)', fontSize: 14, fontWeight: 500,
                    color: 'var(--dark)', border: '1px solid var(--border)', transition: 'all .12s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='var(--blue)'; e.currentTarget.style.background='var(--blue-light)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--bg)'; }}
                  >
                    <span>{l.icon}</span> {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:900px){.home-grid{grid-template-columns:1fr!important}}`}</style>
    </main>
  );
}
