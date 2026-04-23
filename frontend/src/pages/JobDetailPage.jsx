// git commit: "feat(jobs): build JobDetailPage with job info, application form, and poster profile"
import { applicationService } from '../services/applicationService.js';
import { paymentService } from '../services/paymentService.js';
import { reviewService } from '../services/reviewService.js';
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jobService } from '../services/jobService.js';
import { useAuth } from '../hooks/useAuth.js';
import { formatPrice, formatDate } from '../utils/formatters.js';
import CategoryBadge from '../components/jobs/CategoryBadge.jsx';
import ReviewForm from '../components/jobs/ReviewForm.jsx';
import Alert from '../components/common/Alert.jsx';
import Modal from '../components/common/Modal.jsx';
import Spinner from '../components/common/Spinner.jsx';

export default function JobDetailPage() {
  const { id }          = useParams();
  const { user }        = useAuth();
  const navigate        = useNavigate();
  const [job, setJob]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const [applyOpen, setApplyOpen]   = useState(false);
  const [applyMsg, setApplyMsg]     = useState('');
  const [applyErr, setApplyErr]     = useState('');
  const [applyOk, setApplyOk]       = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);

  const [releaseLoading, setReleaseLoading] = useState(false);
  const [releaseErr, setReleaseErr] = useState('');
  const [releaseOk, setReleaseOk]   = useState(false);

  const [jobReviews, setJobReviews] = useState([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewErr, setReviewErr] = useState('');

  const handleRelease = async () => {
    if (!window.confirm('Markera jobbet som slutfört och frigör betalningen till utföraren?')) return;
    setReleaseLoading(true);
    setReleaseErr('');
    try {
      await paymentService.releaseEscrow(id);
      setReleaseOk(true);
      const updated = await jobService.getJob(id);
      setJob(updated);
    } catch (e) {
      setReleaseErr(e.message);
    } finally {
      setReleaseLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    jobService.getJob(id)
      .then(setJob)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Load reviews when job is completed
  useEffect(() => {
    if (job?.status === 'completed') {
      reviewService.getForJob(id)
        .then(r => { if (Array.isArray(r)) setJobReviews(r); })
        .catch(() => setJobReviews([]));
    }
  }, [job?.status, id]);

  const revieweeId = user && job
    ? (user.id === job.poster_id ? job.accepted_applicant?.id : job.poster_id)
    : null;
  const revieweeName = user && job
    ? (user.id === job.poster_id ? job.accepted_applicant?.name : (job.poster?.name ?? 'beställaren'))
    : '';
  const isParticipant = user && job && (user.id === job.poster_id || user.id === job.accepted_applicant?.id);
  const hasReviewed = user && jobReviews.some(r => (r.reviewer?.id ?? r.reviewer_id) === user.id);
  const canReview = job?.status === 'completed' && isParticipant && !!revieweeId && !hasReviewed;

  const handleSubmitReview = async ({ rating, comment }) => {
    setReviewLoading(true);
    setReviewErr('');
    try {
      await reviewService.create({
        job_id: Number(id),
        reviewee_id: revieweeId,
        rating,
        comment: comment || undefined,
      });
      const refreshed = await reviewService.getForJob(id);
      if (Array.isArray(refreshed)) setJobReviews(refreshed);
      setReviewOpen(false);
    } catch (e) {
      setReviewErr(e.message);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleApply = async () => {
    if (!applyMsg.trim()) { setApplyErr('Skriv ett meddelande till beställaren.'); return; }
    if (!user) { navigate('/login', { state: { from: { pathname: `/jobs/${id}` } } }); return; }
    setApplyLoading(true);
    setApplyErr('');
    try {
      await applicationService.apply(id, applyMsg, null);
      setApplyOk(true);
    } catch (e) {
      setApplyErr(e.message);
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '80px 0', textAlign: 'center' }}><Spinner /></div>;
  if (error)   return <div className="container" style={{ padding: '60px 24px' }}><Alert type="error">{error}</Alert></div>;
  if (!job)    return null;

  const isOwner = user?.id === job.poster_id;

  return (
    <main style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Back */}
        <Link to="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>
          ← Tillbaka till jobblistan
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'start' }} className="detail-layout">

          {/* Left: Job info */}
          <div>
            <div className="section">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
                <div style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                  {job.category?.icon ?? '📌'}
                </div>
                <div style={{ flex: 1 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{job.title}</h1>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    {job.category && <CategoryBadge name={job.category.name} size="md" />}
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>📍 {job.location}</span>
                    {job.expires_at && <span style={{ fontSize: 13, color: 'var(--muted)' }}>📅 {formatDate(job.expires_at)}</span>}
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>🕐 Publicerad {formatDate(job.createdAt ?? job.created_at)}</span>
                  </div>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', marginBottom: 20 }} />

              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Beskrivning</h2>
              <p style={{ color: 'var(--ink)', lineHeight: 1.8, whiteSpace: 'pre-line', fontSize: 15 }}>{job.description}</p>
            </div>

            {/* Poster profile */}
            <div className="section">
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Om beställaren</h2>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,var(--blue),#60A5FA)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
                  {(job.poster?.name ?? job.poster_name)?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{job.poster?.name ?? job.poster_name}</div>
                  <div style={{ color: '#F59E0B', fontSize: 13 }}>
                    {'★'.repeat(5)}
                    <span style={{ color: 'var(--muted)', marginLeft: 6 }}>
                      · {job.poster?.jobs_completed ?? 0} jobb slutförda
                    </span>
                  </div>
                </div>
                <Link to={`/profil/${job.poster_id}`} className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}>
                  Visa profil
                </Link>
              </div>
            </div>

            {/* Job Reviews - shown for completed jobs */}
            {job.status === 'completed' && jobReviews.length > 0 && (
              <div className="section">
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Recensioner för detta jobb</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {jobReviews.map(r => (
                    <div key={r.id} style={{ background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)', padding: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{r.reviewer?.name ?? 'Användare'}</span>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ color: '#F59E0B', fontSize: 14 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{formatDate(r.created_at)}</span>
                        </div>
                      </div>
                      <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>{r.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Booking card */}
          <div style={{ position: 'sticky', top: 88 }}>
            <div style={{ background: 'var(--white)', borderRadius: 14, border: '1px solid var(--border)', boxShadow: 'var(--sh-lg)', padding: 28 }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--blue)', marginBottom: 4 }}>
                {formatPrice(job.price)}
              </div>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
                {job.price_type === 'hourly' ? 'Per timme' : job.price_type === 'negotiable' ? 'Förhandlingsbart' : 'Fast pris'} · inkl. 8% plattformsavgift
              </p>

              {isOwner ? (
                <div>
                  <Alert type="info" style={{ marginBottom: 12 }}>Det här är ditt eget jobb.</Alert>
                  {releaseErr && <Alert type="error" style={{ marginBottom: 12 }}>{releaseErr}</Alert>}
                  {job.status === 'open' && (
                    <Link
                      to={`/checkout/${job.id}`}
                      className="btn btn-primary btn-full btn-lg"
                      style={{ marginBottom: 8 }}
                    >
                      💳 Betala & starta jobbet
                    </Link>
                  )}
                  {job.status === 'in_progress' && !releaseOk && (
                    <button
                      className="btn btn-primary btn-full btn-lg"
                      onClick={handleRelease}
                      disabled={releaseLoading}
                      style={{ marginBottom: 8 }}
                    >
                      {releaseLoading ? <Spinner size={18} color="#fff" /> : '✅ Markera klart & frigör betalning'}
                    </button>
                  )}
                  {job.status === 'completed' && (
                    <Alert type="success" style={{ marginBottom: 8 }}>
                      🏁 Jobbet är slutfört och utföraren har fått betalt.
                    </Alert>
                  )}
                  {canReview && (
                    <button
                      className="btn btn-outline btn-full"
                      style={{ marginBottom: 8 }}
                      onClick={() => setReviewOpen(true)}
                    >
                      ⭐ Lämna recension
                    </button>
                  )}
                  <Link to={`/mina-jobb`} className="btn btn-outline btn-full">Hantera jobb</Link>
                </div>
              ) : applyOk ? (
                <Alert type="success">✅ Din ansökan är skickad! Beställaren hör av sig.</Alert>
              ) : job.status !== 'open' ? (
                <>
                  <Alert type="info" style={{ marginBottom: 8 }}>Jobbet är inte längre öppet för ansökningar.</Alert>
                  {canReview && (
                    <button
                      className="btn btn-primary btn-full"
                      onClick={() => setReviewOpen(true)}
                    >
                      ⭐ Lämna recension
                    </button>
                  )}
                </>
              ) : (
                <button className="btn btn-primary btn-full btn-lg" onClick={() => setApplyOpen(true)}>
                  Ansök nu
                </button>
              )}

              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { icon: '📍', text: job.location },
                  { icon: '📅', text: job.expires_at ? formatDate(job.expires_at) : 'Flexibelt' },
                  { icon: '💼', text: job.hobby_type === 'recurring' ? 'Återkommande' : 'Engångsjobb' },
                ].map(r => (
                  <div key={r.icon} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--muted)', alignItems: 'center' }}>
                    <span>{r.icon}</span> {r.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review modal */}
      <Modal open={reviewOpen} onClose={() => setReviewOpen(false)} title="Lämna recension">
        {reviewErr && <Alert type="error" style={{ marginBottom: 16 }}>{reviewErr}</Alert>}
        <ReviewForm
          revieweeName={revieweeName}
          onSubmit={handleSubmitReview}
          loading={reviewLoading}
        />
      </Modal>

      {/* Apply modal */}
      <Modal open={applyOpen} onClose={() => setApplyOpen(false)} title="Ansök på jobbet">
        {applyErr && <Alert type="error" style={{ marginBottom: 16 }}>{applyErr}</Alert>}
        <div className="form-group">
          <label htmlFor="apply-msg">Ditt meddelande till beställaren</label>
          <textarea
            id="apply-msg"
            rows={5}
            placeholder="Beskriv varför du är rätt person för jobbet, din erfarenhet och din tillgänglighet..."
            value={applyMsg}
            onChange={e => setApplyMsg(e.target.value)}
          />
          <p className="hint">{applyMsg.length} tecken</p>
        </div>
        <button className="btn btn-primary btn-full" onClick={handleApply} disabled={applyLoading}>
          {applyLoading ? <Spinner size={18} color="#fff" /> : 'Skicka ansökan'}
        </button>
      </Modal>

      <style>{`@media(max-width:900px){.detail-layout{grid-template-columns:1fr!important}}`}</style>
    </main>
  );
}
