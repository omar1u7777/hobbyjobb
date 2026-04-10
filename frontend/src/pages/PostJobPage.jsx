import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobService } from '../services/jobService.js';
import { useHobbyLimit } from '../hooks/useHobbyLimit.js';
import JobForm from '../components/jobs/JobForm.jsx';
import Alert from '../components/common/Alert.jsx';
export default function PostJobPage() {
  const navigate = useNavigate(); const { totalYear, isAt } = useHobbyLimit();
  const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const handleSubmit = async (form) => { setLoading(true); setError(''); try { const job = await jobService.createJob(form); navigate('/jobs/' + job.id); } catch (e) { setError(e.message); } finally { setLoading(false); } };
  if (isAt) return <main style={{ padding: '60px 0' }}><div className="container" style={{ maxWidth: 680 }}><Alert type="error"><strong>Hobbyinkomstgransen nadd.</strong> Du kan inte publicera fler jobb.</Alert></div></main>;
  return <main style={{ padding: '40px 0 80px' }}><div className="container" style={{ maxWidth: 680 }}><h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Lagg upp ett jobb</h1><p style={{ color: 'var(--muted)', marginBottom: 32 }}>Beskriv jobbet tydligt.</p>{error && <Alert type="error" style={{ marginBottom: 24 }}>{error}</Alert>}<JobForm onSubmit={handleSubmit} loading={loading} totalYear={totalYear} /></div></main>;
}
