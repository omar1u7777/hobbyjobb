import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jobService } from '../services/jobService.js';
import { useAuth } from '../hooks/useAuth.js';
import { formatPrice, formatDate } from '../utils/formatters.js';
import Alert from '../components/common/Alert.jsx';
import Modal from '../components/common/Modal.jsx';
import Spinner from '../components/common/Spinner.jsx';
export default function JobDetailPage() {
  const { id } = useParams(); const { user } = useAuth(); const navigate = useNavigate();
  const [job, setJob] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [applyOpen, setApplyOpen] = useState(false); const [applyMsg, setApplyMsg] = useState(''); const [applyErr, setApplyErr] = useState(''); const [applyOk, setApplyOk] = useState(false); const [applyLoading, setApplyLoading] = useState(false);
  useEffect(() => { setLoading(true); jobService.getJob(id).then(setJob).catch(e => setError(e.message)).finally(() => setLoading(false)); }, [id]);
  const handleApply = async () => { if (!applyMsg.trim()) { setApplyErr('Skriv ett meddelande.'); return; } if (!user) { navigate('/login'); return; } setApplyLoading(true); setApplyErr(''); try { await jobService.applyToJob(id, applyMsg); setApplyOk(true); } catch (e) { setApplyErr(e.message); } finally { setApplyLoading(false); } };
  if (loading) return <div style={{ padding: '80px 0', textAlign: 'center' }}><Spinner /></div>;
  if (error) return <div className="container" style={{ padding: 60 }}><Alert type="error">{error}</Alert></div>;
  if (!job) return null;
  const isOwner = user?.id === job.poster_id;
  return <main style={{ padding: '40px 0 80px' }}><div className="container"><Link to="/jobs" style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24, display: 'inline-block' }}>← Tillbaka</Link><div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'start' }}><div className="section"><h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{job.title}</h1><div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>{job.location && <span style={{ fontSize: 13, color: 'var(--muted)' }}>📍 {job.location}</span>}<span style={{ fontSize: 13, color: 'var(--muted)' }}>📅 {formatDate(job.created_at)}</span></div><p style={{ color: 'var(--ink)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{job.description}</p></div><div style={{ position: 'sticky', top: 88 }}><div style={{ background: 'var(--white)', borderRadius: 14, border: '1px solid var(--border)', boxShadow: 'var(--sh-lg)', padding: 28 }}><div style={{ fontSize: 32, fontWeight: 900, color: 'var(--blue)', marginBottom: 4 }}>{formatPrice(job.price)}</div><p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>Fast pris</p>{isOwner ? <Alert type="info">Ditt eget jobb</Alert> : applyOk ? <Alert type="success">Ansokan skickad!</Alert> : <button className="btn btn-primary btn-full btn-lg" onClick={() => setApplyOpen(true)}>Ansok nu</button>}</div></div></div></div><Modal open={applyOpen} onClose={() => setApplyOpen(false)} title="Ansok pa jobbet">{applyErr && <Alert type="error" style={{ marginBottom: 16 }}>{applyErr}</Alert>}<div className="form-group"><label>Ditt meddelande</label><textarea rows={5} placeholder="Varfor ar du ratt person..." value={applyMsg} onChange={e => setApplyMsg(e.target.value)} /></div><button className="btn btn-primary btn-full" onClick={handleApply} disabled={applyLoading}>{applyLoading ? <Spinner size={18} color="#fff" /> : 'Skicka ansokan'}</button></Modal></main>;
}
