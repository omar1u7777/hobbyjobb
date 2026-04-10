import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useJobs } from '../hooks/useJobs.js';
import { useHobbyLimit } from '../hooks/useHobbyLimit.js';
import JobCard from '../components/jobs/JobCard.jsx';
import Spinner from '../components/common/Spinner.jsx';
import IncomeTracker from '../components/profile/IncomeTracker.jsx';
export default function HomePage() {
  const { user } = useAuth(); const { jobs, loading } = useJobs({ limit: 6 }); const { totalYear, pct, isNear } = useHobbyLimit();
  const hour = new Date().getHours(); const greeting = hour < 12 ? 'God morgon' : hour < 17 ? 'Hej' : 'God kvall';
  return <main style={{ padding: '40px 0 64px' }}><div className="container"><h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>{greeting}, {user?.name?.split(' ')[0]} 👋</h1><p style={{ color: 'var(--muted)', marginBottom: 32 }}>Har ar din oversikt.</p><div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 28, alignItems: 'start' }}><div><div style={{ display: 'flex', gap: 12, marginBottom: 32 }}><Link to="/jobs" className="btn btn-primary">Hitta jobb</Link><Link to="/lagg-upp-jobb" className="btn btn-outline">+ Lagg upp jobb</Link></div><h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Senaste jobben</h2>{loading ? <Spinner /> : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{jobs.map(j => <JobCard key={j.id} job={j} />)}</div>}</div><IncomeTracker totalYear={totalYear} pct={pct} isNear={isNear} /></div></div></main>;
}
