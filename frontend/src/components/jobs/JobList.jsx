// git commit: "feat(jobs): add JobList component rendering a grid of JobCards"

import JobCard from './JobCard.jsx';
import Spinner from '../common/Spinner.jsx';

export default function JobList({ jobs, loading, error }) {
  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><Spinner /></div>;
  if (error)   return <p style={{ color: 'var(--red)', padding: 20 }}>Fel: {error}</p>;
  if (!jobs?.length) return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
      <p style={{ fontWeight: 600 }}>Inga jobb hittades</p>
      <p style={{ fontSize: 14, marginTop: 6 }}>Försök med andra filter eller sök i ett större område.</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {jobs.map(j => <JobCard key={j.id} job={j} />)}
    </div>
  );
}
