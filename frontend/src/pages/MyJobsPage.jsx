import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { jobService } from '../services/jobService.js';
import { applicationService } from '../services/applicationService.js'; // ✅ NY
import { formatPrice, formatDate } from '../utils/formatters.js';
import CategoryBadge from '../components/jobs/CategoryBadge.jsx';
import Alert from '../components/common/Alert.jsx';
import Modal from '../components/common/Modal.jsx';
import Spinner from '../components/common/Spinner.jsx';

const TABS = [
  { key: 'published', label: '📢 Publicerade' },
  { key: 'received',  label: '📥 Mottagna ansökningar' },
  { key: 'sent',      label: '📤 Skickade ansökningar' },
];

export default function MyJobsPage() {
  const [tab, setTab]         = useState('published');
  const [jobs, setJobs]       = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const flattenApp = (a) => ({
    ...a,
    job_id: a.job_id ?? a.job?.id,
    job_title: a.job_title ?? a.job?.title,
    applicant_name: a.applicant_name ?? a.applicant?.name,
    poster_name: a.poster_name ?? a.job?.poster?.name,
    message: a.message,
    status: a.status,
    created_at: a.created_at ?? a.createdAt,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'published') {
        const data = await jobService.getMyJobs();
        setJobs(Array.isArray(data) ? data : []);
      } else if (tab === 'received') {
        const data = await applicationService.getReceived();
        setApplications(Array.isArray(data) ? data.map(flattenApp) : []);
      } else {
        const data = await applicationService.getSent();
        setApplications(Array.isArray(data) ? data.map(flattenApp) : []);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await jobService.deleteJob(deleteId);
      setJobs(prev => prev.filter(j => j.id !== deleteId));
      setDeleteId(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleApplicationStatus = async (id, status) => {
    try {
      await applicationService.updateStatus(id, status); // ✅ BYTT
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <main style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Mina jobb</h1>
            <p style={{ color: 'var(--muted)' }}>Hantera dina publicerade jobb och ansökningar.</p>
          </div>
          <Link to="/lagg-upp-jobb" className="btn btn-primary">+ Lägg upp nytt jobb</Link>
        </div>

        {error && <Alert type="error" style={{ marginBottom: 20 }} onClose={() => setError('')}>{error}</Alert>}

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'var(--border-light)', borderRadius: 8, padding: 4, marginBottom: 24, width: 'fit-content', gap: 2 }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '9px 18px', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none',
                background: tab === t.key ? 'var(--white)' : 'none',
                color: tab === t.key ? 'var(--dark)' : 'var(--muted)',
                boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
                transition: 'all .15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading
          ? <div style={{ padding: 60, textAlign: 'center' }}><Spinner /></div>
          : tab === 'published'
          ? (
            jobs.length === 0
              ? <EmptyState msg="Du har inga publicerade jobb ännu." cta={{ to: '/lagg-upp-jobb', label: 'Lägg upp ditt första jobb' }} />
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {jobs.map(j => (
                    <div key={j.id} style={{ background: 'var(--white)', borderRadius: 'var(--r)', border: '1px solid var(--border)', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                          <Link to={`/jobs/${j.id}`} style={{ fontSize: 15, fontWeight: 700, color: 'var(--dark)' }}>{j.title}</Link>
                          <StatusBadge status={j.status} />
                        </div>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                          {j.category && <CategoryBadge name={j.category.name} />}
                          <span style={{ fontSize: 13, color: 'var(--muted)' }}>📍 {j.location}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--blue)', marginBottom: 8 }}>{formatPrice(j.price)}</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Link to={`/jobs/${j.id}`} className="btn btn-ghost btn-sm">Visa</Link>
                          <Link
                            to={`/jobs/${j.id}/edit`}
                            className="btn btn-sm"
                            style={{ background: 'var(--blue-light)', color: 'var(--blue)', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                          >
                            Redigera
                          </Link>
                          <Link
                            to={`/jobs/${j.id}/boost`}
                            className="btn btn-sm"
                            style={{ background: '#FEF3C7', color: '#92400E', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            title={j.is_boosted ? 'Förläng boost' : 'Boosta jobbet'}
                          >
                            🚀 {j.is_boosted ? 'Förläng' : 'Boosta'}
                          </Link>
                          <button
                            className="btn btn-sm" onClick={() => setDeleteId(j.id)}
                            style={{ background: 'var(--red-light)', color: 'var(--red)', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                          >
                            Ta bort
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
          )
          : (
            applications.length === 0
              ? <EmptyState msg={tab === 'received' ? 'Inga mottagna ansökningar ännu.' : 'Du har inte ansökt på några jobb ännu.'} cta={{ to: '/jobs', label: 'Bläddra jobb' }} />
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {applications.map(a => (
                    <div key={a.id} style={{ background: 'var(--white)', borderRadius: 'var(--r)', border: '1px solid var(--border)', padding: '18px 22px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                          <Link to={`/jobs/${a.job_id}`} style={{ fontSize: 15, fontWeight: 700, color: 'var(--dark)', display: 'block', marginBottom: 4 }}>
                            {a.job_title ?? `Jobb #${a.job_id}`}
                          </Link>
                          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                            <StatusBadge status={a.status} />
                            <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                              {tab === 'received' ? `Från: ${a.applicant_name}` : `Beställare: ${a.poster_name}`}
                            </span>
                            <span style={{ fontSize: 13, color: 'var(--muted)' }}>{formatDate(a.createdAt ?? a.created_at)}</span>
                          </div>
                          {a.message && <p style={{ marginTop: 8, fontSize: 13, color: 'var(--ink)', background: 'var(--bg)', borderRadius: 6, padding: '8px 12px' }}>{a.message}</p>}
                        </div>
                        {tab === 'received' && a.status === 'pending' && (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-sm" onClick={() => handleApplicationStatus(a.id, 'accepted')}
                              style={{ background: 'var(--green-light)', color: 'var(--green-text)', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                              ✅ Acceptera
                            </button>
                            <button className="btn btn-sm" onClick={() => handleApplicationStatus(a.id, 'rejected')}
                              style={{ background: 'var(--red-light)', color: 'var(--red)', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                              ✕ Avvisa
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
          )
        }
      </div>

      {/* Delete confirmation */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Ta bort jobb?" maxWidth={400}>
        <p style={{ color: 'var(--muted)', marginBottom: 20 }}>Denna åtgärd kan inte ångras. Jobbet och alla ansökningar raderas permanent.</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Avbryt</button>
          <button className="btn btn-danger" onClick={handleDelete} disabled={deleteLoading}>
            {deleteLoading ? <Spinner size={16} color="#fff" /> : 'Ta bort'}
          </button>
        </div>
      </Modal>
    </main>
  );
}

function StatusBadge({ status }) {
  const map = {
    open:     { bg: 'var(--green-light)', color: 'var(--green-text)', label: '● Öppen' },
    active:   { bg: 'var(--green-light)', color: 'var(--green-text)', label: '● Aktiv' },
    in_progress: { bg: 'var(--blue-light)', color: 'var(--blue)', label: '🔄 Pågår' },
    pending:  { bg: 'var(--yellow-light)', color: 'var(--yellow-text)', label: '⏳ Väntar' },
    accepted: { bg: 'var(--blue-light)', color: 'var(--blue)', label: '✅ Accepterad' },
    rejected: { bg: 'var(--red-light)', color: 'var(--red)', label: '✕ Avvisad' },
    completed:{ bg: '#F3F4F6', color: 'var(--muted)', label: '🏁 Slutförd' },
  };
  const s = map[status] ?? map.pending;
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
      {s.label}
    </span>
  );
}

function EmptyState({ msg, cta }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
      <p style={{ fontWeight: 600, marginBottom: 16 }}>{msg}</p>
      <Link to={cta.to} className="btn btn-primary">{cta.label}</Link>
    </div>
  );
}