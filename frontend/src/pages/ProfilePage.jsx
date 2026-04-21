// git commit: "feat(profile): build ProfilePage with dark hero, tabs, income tracker, and settings"

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useHobbyLimit } from '../hooks/useHobbyLimit.js';
import { userService } from '../services/userService.js';
import { authService } from '../services/authService.js';
import IncomeTracker from '../components/profile/IncomeTracker.jsx';
import ReviewList from '../components/profile/ReviewList.jsx';
import UserStats from '../components/profile/UserStats.jsx';
import Alert from '../components/common/Alert.jsx';
import Spinner from '../components/common/Spinner.jsx';

const TABS = ['Översikt', 'Jobbhistorik', 'Recensioner', 'Inställningar'];

export default function ProfilePage() {
  const { id }       = useParams();
  const { user: me, refreshUser } = useAuth();
  const isOwn        = !id || id === me?.id?.toString();
  const userId       = id ?? me?.id;

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('Översikt');
  const [saveMsg, setSaveMsg] = useState('');
  const [saveErr, setSaveErr] = useState('');
  const [saving, setSaving]   = useState(false);

  const { totalYear, pct, isNear } = useHobbyLimit();

  // Settings form (only used when isOwn)
  const [settings, setSettings] = useState({ name: '', bio: '', location: '', avatar: '' });

  // Password change form
  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');

  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    // Load profile — this is critical
    userService.getProfile(userId)
      .then(p => {
        setProfile(p);
        if (isOwn) setSettings({ name: p.name ?? '', bio: p.bio ?? '', location: p.location ?? '', avatar: p.avatar ?? '' });
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Load reviews separately — non-fatal if it fails
    userService.getReviews(userId)
      .then(r => { if (Array.isArray(r)) setReviews(r); })
      .catch(() => setReviews([]));
  }, [isOwn, userId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    setSaveErr('');
    try {
      await userService.updateProfile(userId, settings);
      await refreshUser();
      setSaveMsg('Profilen sparades!');
    } catch (err) {
      setSaveErr(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg('');
    setPwErr('');
    if (pwForm.new !== pwForm.confirm) {
      setPwErr('Lösenorden matchar inte');
      return;
    }
    if (pwForm.new.length < 6) {
      setPwErr('Lösenordet måste vara minst 6 tecken');
      return;
    }
    setPwLoading(true);
    try {
      await authService.changePassword(pwForm.current, pwForm.new);
      setPwMsg('Lösenordet har ändrats!');
      setPwForm({ current: '', new: '', confirm: '' });
    } catch (err) {
      setPwErr(err.message || 'Kunde inte ändra lösenord');
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '80px 0', textAlign: 'center' }}><Spinner /></div>;
  if (!profile) return null;

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <main>
      {/* Dark hero */}
      <div style={{ background: 'var(--dark)', padding: '40px 0 0', color: '#fff' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', paddingBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20 }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg,var(--blue),#60A5FA)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, fontWeight: 700, color: '#fff',
                border: '3px solid var(--bg)', flexShrink: 0,
              }}>
                {profile.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{profile.name}</h1>
                <p style={{ fontSize: 14, color: '#94A3B8', marginBottom: 8 }}>
                  {profile.location ?? 'Plats okänd'} · Medlem sedan {new Date(profile.createdAt ?? profile.created_at).getFullYear()}
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {profile.is_verified && (
                    <span style={{ background: 'rgba(34,197,94,.2)', color: '#86EFAC', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>
                      ✅ Verifierad
                    </span>
                  )}
                  {avgRating && (
                    <span style={{ background: 'rgba(255,255,255,.12)', color: '#E2E8F0', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>
                      ★ {avgRating} ({reviews.length} recensioner)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, marginTop: 24, borderBottom: '1px solid rgba(255,255,255,.1)' }}>
            {(isOwn ? TABS : TABS.filter(t => t !== 'Inställningar')).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '12px 20px', fontSize: 14, fontWeight: 600,
                  color: tab === t ? '#fff' : '#94A3B8',
                  cursor: 'pointer', background: 'none',
                  border: 'none', borderBottom: `2px solid ${tab === t ? 'var(--blue)' : 'transparent'}`,
                  marginBottom: -1, transition: 'all .15s',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '32px 0 64px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'start' }} className="profile-layout">

            {/* Main content */}
            <div>
              {tab === 'Översikt' && (
                <>
                  <UserStats profile={profile} reviews={reviews} avgRating={avgRating} />

                  {profile.bio && (
                    <div className="section">
                      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Om mig</h3>
                      <p style={{ color: 'var(--muted)', lineHeight: 1.7, fontSize: 14 }}>{profile.bio}</p>
                    </div>
                  )}
                </>
              )}

              {tab === 'Jobbhistorik' && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                  <p style={{ fontWeight: 600, marginBottom: 8 }}>Jobbhistorik kommer snart</p>
                  <p style={{ fontSize: 13 }}>Här visas avslutade och pågående uppdrag.</p>
                </div>
              )}

              {tab === 'Recensioner' && <ReviewList reviews={reviews} />}

              {tab === 'Inställningar' && isOwn && (
                <>
                  <div className="section" style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Profilinställningar</h3>
                    {saveMsg && <Alert type="success" style={{ marginBottom: 16 }}>{saveMsg}</Alert>}
                    {saveErr && <Alert type="error" style={{ marginBottom: 16 }}>{saveErr}</Alert>}
                    <form onSubmit={handleSave}>
                      <div className="form-group">
                        <label>Namn</label>
                        <input type="text" value={settings.name} onChange={e => setSettings(s => ({ ...s, name: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label>Plats</label>
                        <input type="text" placeholder="t.ex. Stockholm" value={settings.location} onChange={e => setSettings(s => ({ ...s, location: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label>Avatar URL</label>
                        <input type="url" placeholder="https://..." value={settings.avatar} onChange={e => setSettings(s => ({ ...s, avatar: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label>Bio</label>
                        <textarea rows={4} placeholder="Berätta lite om dig själv..." value={settings.bio} onChange={e => setSettings(s => ({ ...s, bio: e.target.value }))} />
                      </div>
                      <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? <Spinner size={16} color="#fff" /> : 'Spara ändringar'}
                      </button>
                    </form>
                  </div>

                  <div className="section">
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Ändra lösenord</h3>
                    {pwMsg && <Alert type="success" style={{ marginBottom: 16 }}>{pwMsg}</Alert>}
                    {pwErr && <Alert type="error" style={{ marginBottom: 16 }}>{pwErr}</Alert>}
                    <form onSubmit={handleChangePassword}>
                      <div className="form-group">
                        <label>Nuvarande lösenord</label>
                        <input
                          type="password"
                          value={pwForm.current}
                          onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))}
                          placeholder="Ditt nuvarande lösenord"
                        />
                      </div>
                      <div className="form-group">
                        <label>Nytt lösenord</label>
                        <input
                          type="password"
                          value={pwForm.new}
                          onChange={e => setPwForm(p => ({ ...p, new: e.target.value }))}
                          placeholder="Minst 6 tecken"
                        />
                      </div>
                      <div className="form-group">
                        <label>Bekräfta nytt lösenord</label>
                        <input
                          type="password"
                          value={pwForm.confirm}
                          onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                          placeholder="Upprepa det nya lösenordet"
                        />
                      </div>
                      <button type="submit" className="btn btn-primary" disabled={pwLoading}>
                        {pwLoading ? <Spinner size={16} color="#fff" /> : 'Byt lösenord'}
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>

            {/* Right: income tracker (own profile only) */}
            {isOwn && (
              <div>
                <IncomeTracker totalYear={totalYear} pct={pct} isNear={isNear} />
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:900px){.profile-layout{grid-template-columns:1fr!important}.stats-grid{grid-template-columns:repeat(2,1fr)!important}}
        @media(max-width:500px){.stats-grid{grid-template-columns:1fr 1fr!important}}
      `}</style>
    </main>
  );
}