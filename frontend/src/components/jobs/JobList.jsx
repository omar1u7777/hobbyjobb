import JobCard from './JobCard.jsx';
import Spinner from '../common/Spinner.jsx';
export default function JobList({ jobs, loading, error }) {
  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><Spinner /></div>;
  if (error) return <p style={{ color: 'var(--red)', padding: 20 }}>Fel: {error}</p>;
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{jobs.map(j => <JobCard key={j.id} job={j} />)}</div>;
}
