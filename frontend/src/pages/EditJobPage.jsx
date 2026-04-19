// git commit: "feat(jobs): add EditJobPage for editing existing jobs"

import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { jobService } from '../services/jobService.js';
import { useHobbyLimit } from '../hooks/useHobbyLimit.js';
import { formatPrice } from '../utils/formatters.js';
import JobForm from '../components/jobs/JobForm.jsx';
import Alert from '../components/common/Alert.jsx';
import Spinner from '../components/common/Spinner.jsx';

export default function EditJobPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { totalYear } = useHobbyLimit();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [job, setJob] = useState(null);

  // Load existing job data
  useEffect(() => {
    async function loadJob() {
      try {
        const data = await jobService.getJob(id);
        // Transform to JobForm format (snake_case → camelCase)
        setJob({
          id: data.id,
          title: data.title || '',
          description: data.description || '',
          categoryId: data.category_id || data.category?.id || '',
          location: data.location || '',
          lat: data.lat || null,
          lng: data.lng || null,
          date: data.date || data.expires_at ? new Date(data.date || data.expires_at).toISOString().split('T')[0] : '',
          time: data.time || '',
          price: data.price || '',
          priceType: data.price_type || 'fixed',
          hobbyType: data.hobby_type || 'one-time',
        });
      } catch (e) {
        setError('Kunde inte hämta jobbdata. Försök igen senare.');
      } finally {
        setLoading(false);
      }
    }
    loadJob();
  }, [id]);

  const handleSubmit = async (form) => {
    setSaving(true);
    setError('');
    try {
      await jobService.updateJob(id, form);
      navigate(`/jobs/${id}`, { state: { updated: true } });
    } catch (e) {
      setError(e.message || 'Kunde inte uppdatera jobbet. Försök igen.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main style={{ padding: '60px 0' }}>
        <div className="container" style={{ maxWidth: 680, textAlign: 'center' }}>
          <Spinner size={48} />
          <p style={{ marginTop: 20, color: 'var(--muted)' }}>Hämtar jobbdata...</p>
        </div>
      </main>
    );
  }

  if (!job && !loading) {
    return (
      <main style={{ padding: '60px 0' }}>
        <div className="container" style={{ maxWidth: 680 }}>
          <Alert type="error">
            Jobbet kunde inte hittas. <Link to="/mina-jobb">Tillbaka till mina jobb</Link>
          </Alert>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Redigera jobb</h1>
          <p style={{ color: 'var(--muted)' }}>
            Uppdatera informationen för ditt publicerade jobb.
          </p>
        </div>

        {error && <Alert type="error" style={{ marginBottom: 24 }}>{error}</Alert>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28, alignItems: 'start' }} className="postjob-layout">
          <div>
            <JobForm 
              initial={job} 
              onSubmit={handleSubmit} 
              loading={saving} 
              totalYear={totalYear} 
            />
          </div>

          {/* Tips sidebar */}
          <aside style={{ position: 'sticky', top: 88 }}>
            <div style={{ background: 'var(--blue-light)', border: '1px solid var(--blue-mid)', borderRadius: 10, padding: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue)', marginBottom: 6 }}>💡 Tips</p>
              <p style={{ fontSize: 13, color: 'var(--ink)' }}>
                Uppdatera jobbet om detaljer har ändrats. Tänk på att ändringar kan påverka befintliga ansökningar.
              </p>
            </div>

            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginTop: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark)', marginBottom: 6 }}>📊 Din inkomststatus</p>
              <p style={{ fontSize: 13, color: 'var(--ink)' }}>Intjänat i år: <strong>{formatPrice(totalYear)}</strong></p>
              <p style={{ fontSize: 13, color: 'var(--ink)' }}>Kvar: <strong>{formatPrice(Math.max(30_000 - totalYear, 0))}</strong></p>
            </div>

            <Link 
              to={`/jobs/${id}`} 
              className="btn btn-ghost btn-full"
              style={{ marginTop: 16 }}
            >
              ← Avbryt och gå tillbaka
            </Link>
          </aside>
        </div>
      </div>

      <style>{`@media(max-width:900px){.postjob-layout{grid-template-columns:1fr!important}}`}</style>
    </main>
  );
}
