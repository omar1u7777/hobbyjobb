// git commit: "feat(auth): build RegisterPage with hobby agreement checkbox and info modal"

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { validators } from '../utils/validators.js';
import Alert from '../components/common/Alert.jsx';
import Modal from '../components/common/Modal.jsx';
import Spinner from '../components/common/Spinner.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', hobbyAgreed: false });
  const [errors, setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hobbyModal, setHobbyModal] = useState(false);

  const change = (field) => (e) =>
    setForm(prev => ({ ...prev, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const validate = () => {
    const e = {};
    e.name     = validators.required(form.name);
    e.email    = validators.email(form.email);
    e.password = validators.password(form.password);
    e.confirm  = validators.passwordMatch(form.password)(form.confirm);
    if (!form.hobbyAgreed) e.hobbyAgreed = 'Du måste acceptera hobbyvillkoren för att fortsätta.';
    setErrors(e);
    return !Object.values(e).some(Boolean);
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
      await register({ name: form.name, email: form.email, password: form.password, hobbyAgreed: form.hobbyAgreed });
      navigate('/home');
    } catch (err) {
      setApiError(err.message || 'Något gick fel vid registreringen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-h) - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
      <div style={{ background: 'var(--white)', borderRadius: 14, boxShadow: 'var(--sh-lg)', padding: 40, width: '100%', maxWidth: 440, border: '1px solid var(--border)' }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ fontSize: 24, fontWeight: 800, color: 'var(--dark)' }}>
            hobby<span style={{ color: 'var(--blue)' }}>jobb</span>
          </Link>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 6 }}>Skapa ett gratis konto</p>
        </div>

        {apiError && <Alert type="error" style={{ marginBottom: 20 }}>{apiError}</Alert>}

        <form onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className="form-group">
            <label htmlFor="name">Fullständigt namn</label>
            <input id="name" type="text" placeholder="Anna Johansson" value={form.name} onChange={change('name')}
              style={errors.name ? { borderColor: 'var(--red)' } : {}} />
            {errors.name && <p className="error">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="reg-email">E-post</label>
            <input id="reg-email" type="email" placeholder="din@email.se" value={form.email} onChange={change('email')}
              style={errors.email ? { borderColor: 'var(--red)' } : {}} />
            {errors.email && <p className="error">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="reg-password">Lösenord</label>
            <input id="reg-password" type="password" placeholder="Minst 8 tecken" value={form.password} onChange={change('password')}
              style={errors.password ? { borderColor: 'var(--red)' } : {}} />
            {errors.password && <p className="error">{errors.password}</p>}
          </div>

          {/* Confirm */}
          <div className="form-group">
            <label htmlFor="confirm">Bekräfta lösenord</label>
            <input id="confirm" type="password" placeholder="Upprepa lösenord" value={form.confirm} onChange={change('confirm')}
              style={errors.confirm ? { borderColor: 'var(--red)' } : {}} />
            {errors.confirm && <p className="error">{errors.confirm}</p>}
          </div>

          {/* Hobby agreement */}
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
            background: '#FFFBEB', border: `1.5px solid ${errors.hobbyAgreed ? 'var(--red)' : '#FCD34D'}`,
            borderRadius: 8, padding: 14, marginBottom: 18,
          }}>
            <input
              type="checkbox"
              id="hobby-agree"
              checked={form.hobbyAgreed}
              onChange={change('hobbyAgreed')}
              style={{ width: 18, height: 18, marginTop: 2, flexShrink: 0, accentColor: 'var(--blue)' }}
            />
            <label htmlFor="hobby-agree" style={{ fontSize: 13, color: '#92400E', lineHeight: 1.5, cursor: 'pointer' }}>
              Jag bekräftar att jag använder HobbyJobb <strong style={{ color: '#78350F' }}>enbart för hobbyverksamhet</strong> och
              förstår att inkomstgränsen är max 30 000 kr/år.{' '}
              <button type="button" onClick={() => setHobbyModal(true)}
                style={{ background: 'none', border: 'none', color: 'var(--blue)', fontWeight: 700, cursor: 'pointer', fontSize: 13, padding: 0 }}>
                Vad innebär det? →
              </button>
            </label>
          </div>
          {errors.hobbyAgreed && <p className="error" style={{ marginTop: -12, marginBottom: 14 }}>{errors.hobbyAgreed}</p>}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <Spinner size={18} color="#fff" /> : 'Skapa konto gratis'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 18, fontSize: 14, color: 'var(--muted)' }}>
          Har redan konto?{' '}
          <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 600 }}>Logga in</Link>
        </p>
      </div>

      {/* Hobby info modal */}
      <Modal open={hobbyModal} onClose={() => setHobbyModal(false)} title="ℹ️ Vad är hobbyverksamhet?">
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 16 }}>
          Hobbyverksamhet är inkomst från aktiviteter du gör <strong>utan vinstsyfte</strong> och inte som din huvudsyssla.
          Skatteverkets tumregel är att du kan tjäna upp till <strong>30 000 kr/år</strong> utan att behöva registrera F-skatt.
        </p>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 16 }}>
          Exempel: gräsklippning, hundpromenad, enklare hantverksarbeten, hjälp med flytt.
        </p>
        <Alert type="warning">
          Det är <strong>ditt eget ansvar</strong> att följa Skatteverkets regler. HobbyJobb spärrar annonsering om du når gränsen men ansvarar inte för din skattehantering.
        </Alert>
        <div style={{ marginTop: 20, textAlign: 'right' }}>
          <button className="btn btn-primary" onClick={() => setHobbyModal(false)}>Förstår — stäng</button>
        </div>
      </Modal>
    </div>
  );
}
