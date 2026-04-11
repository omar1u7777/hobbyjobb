// git commit: "feat(auth): build LoginPage with tab switching, validation, and redirect after login"

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { validators } from '../utils/validators.js';
import Alert from '../components/common/Alert.jsx';
import Spinner from '../components/common/Spinner.jsx';

export default function LoginPage() {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const location     = useLocation();
  const from         = location.state?.from?.pathname || '/home';

  const [form, setForm]   = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);

  const change = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    e.email    = validators.email(form.email);
    e.password = validators.required(form.password);
    setErrors(e);
    return !Object.values(e).some(Boolean);
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setApiError(err.message || 'Fel e-post eller lösenord.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-h) - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
      <div style={{ background: 'var(--white)', borderRadius: 14, boxShadow: 'var(--sh-lg)', padding: 40, width: '100%', maxWidth: 440, border: '1px solid var(--border)' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ fontSize: 24, fontWeight: 800, color: 'var(--dark)' }}>
            hobby<span style={{ color: 'var(--blue)' }}>jobb</span>
          </Link>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 6 }}>Lokala hobbybaserade smajobb</p>
        </div>

        {apiError && <Alert type="error" style={{ marginBottom: 20 }}>{apiError}</Alert>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">E-post</label>
            <input
              id="email"
              type="email"
              placeholder="din@email.se"
              value={form.email}
              onChange={change('email')}
              autoComplete="email"
              style={errors.email ? { borderColor: 'var(--red)' } : {}}
            />
            {errors.email && <p className="error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Lösenord</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={change('password')}
              autoComplete="current-password"
              style={errors.password ? { borderColor: 'var(--red)' } : {}}
            />
            {errors.password && <p className="error">{errors.password}</p>}
          </div>

          <div style={{ textAlign: 'right', marginTop: -8, marginBottom: 18 }}>
            <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 600 }}>Glömt lösenord?</Link>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <Spinner size={18} color="#fff" /> : 'Logga in'}
          </button>
        </form>

        <div className="divider" style={{ margin: '20px 0' }}>eller</div>

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--muted)' }}>
          Inget konto?{' '}
          <Link to="/register" style={{ color: 'var(--blue)', fontWeight: 600 }}>Skapa konto gratis</Link>
        </p>
      </div>
    </div>
  );
}
