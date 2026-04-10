import { useAuth } from '../hooks/useAuth.js';
import { useHobbyLimit } from '../hooks/useHobbyLimit.js';
import IncomeTracker from '../components/profile/IncomeTracker.jsx';
export default function ProfilePage() {
  const { user } = useAuth(); const { totalYear, pct, isNear } = useHobbyLimit();
  if (!user) return null;
  return <main><div style={{ background: 'var(--dark)', padding: '40px 0', color: '#fff' }}><div className="container"><div style={{ display: 'flex', alignItems: 'center', gap: 20 }}><div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,var(--blue),#60A5FA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700 }}>{user.name?.[0]?.toUpperCase()}</div><div><h1 style={{ fontSize: 24, fontWeight: 800 }}>{user.name}</h1><p style={{ fontSize: 14, color: '#94A3B8' }}>{user.location ?? 'Plats okand'} · {user.email}</p></div></div></div></div><div style={{ padding: '32px 0 64px' }}><div className="container"><div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28 }}><div className="section"><h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Om mig</h3><p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>{user.bio || 'Ingen bio annu.'}</p></div><IncomeTracker totalYear={totalYear} pct={pct} isNear={isNear} /></div></div></div></main>;
}
