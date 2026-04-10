import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import Alert from '../components/common/Alert.jsx';
import Spinner from '../components/common/Spinner.jsx';
export default function LoginPage() {
  const { login } = useAuth(); const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' }); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const change = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));
  const handleSubmit = async (ev) => { ev.preventDefault(); setLoading(true); setError(''); try { await login(form.email, form.password); navigate('/home'); } catch (e) { setError(e.message); } finally { setLoading(false); } };
  return <div style={{ minHeight: 'calc(100vh - var(--nav-h) - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}><div style={{ background: 'var(--white)', borderRadius: 14, boxShadow: 'var(--sh-lg)', padding: 40, width: '100%', maxWidth: 440, border: '1px solid var(--border)' }}><div style={{ textAlign: 'center', marginBottom: 28 }}><Link to="/" style={{ fontSize: 24, fontWeight: 800, color: 'var(--dark)' }}>hobby<span style={{ color: 'var(--blue)' }}>jobb</span></Link></div>{error && <Alert type="error" style={{ marginBottom: 20 }}>{error}</Alert>}<form onSubmit={handleSubmit}><div className="form-group"><label>E-post</label><input type="email" placeholder="din@email.se" value={form.email} onChange={change('email')} /></div><div className="form-group"><label>Losenord</label><input type="password" placeholder="••••••••" value={form.password} onChange={change('password')} /></div><button type="submit" className="btn btn-primary btn-full" disabled={loading}>{loading ? <Spinner size={18} color="#fff" /> : 'Logga in'}</button></form><p style={{ textAlign: 'center', marginTop: 18, fontSize: 14, color: 'var(--muted)' }}>Inget konto? <Link to="/register" style={{ color: 'var(--blue)', fontWeight: 600 }}>Skapa konto</Link></p></div></div>;
}
