import { useState } from 'react';
import { useJobs } from '../hooks/useJobs.js';
import JobList from '../components/jobs/JobList.jsx';
import JobFilter from '../components/jobs/JobFilter.jsx';
export default function JobListPage() {
  const [search, setSearch] = useState('');
  const { jobs, total, loading, error, params, updateParams } = useJobs({ limit: 20 });
  const handleSearch = (e) => { e.preventDefault(); updateParams({ search: search || null }); };
  return <main><div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '20px 0' }}><div className="container"><form onSubmit={handleSearch} style={{ display: 'flex', gap: 12 }}><div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '0 16px', gap: 10 }}><span>🔍</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Sok jobb..." style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: 'var(--dark)', flex: 1, padding: '13px 0' }} /></div><button type="submit" className="btn btn-primary">Sok</button></form></div></div><div style={{ padding: '32px 0 64px' }}><div className="container"><div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 28, alignItems: 'start' }}><JobFilter params={params} onChange={updateParams} /><div><p style={{ fontSize: 15, color: 'var(--muted)', marginBottom: 20 }}>Visar <strong style={{ color: 'var(--dark)' }}>{total} jobb</strong></p><JobList jobs={jobs} loading={loading} error={error} /></div></div></div></div></main>;
}
