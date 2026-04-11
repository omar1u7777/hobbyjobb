// git commit: "feat(jobs): build PostJobPage with JobForm, live preview panel, and income validation"

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobService } from '../services/jobService.js';
import { useHobbyLimit } from '../hooks/useHobbyLimit.js';
import { formatPrice } from '../utils/formatters.js';
import JobForm from '../components/jobs/JobForm.jsx';
import Alert from '../components/common/Alert.jsx';

export default function PostJobPage() {
  const navigate          = useNavigate();
  const { totalYear, isAt } = useHobbyLimit();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (form) => {
    setLoading(true);
    setError('');
    try {
      const job = await jobService.createJob(form);
      navigate(`/jobs/${job.id}`, { state: { created: true } });
    } catch (e) {
      setError(e.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  if (isAt) {
    return (
      <main style={{ padding: '60px 0' }}>
        <div className="container" style={{ maxWidth: 680 }}>
          <Alert type="error">
            <strong>Du har nått hobbyinkomstgränsen på 30 000 kr/år.</strong> Du kan inte publicera fler jobb förrän ett nytt kalenderår börjar. Läs mer på <a href="https://www.skatteverket.se" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--red)', fontWeight: 700 }}>Skatteverket.se</a>.
          </Alert>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Lägg upp ett jobb</h1>
          <p style={{ color: 'var(--muted)' }}>
            Beskriv jobbet tydligt — ju mer info, desto fler bra ansökningar.
          </p>
        </div>

        {error && <Alert type="error" style={{ marginBottom: 24 }}>{error}</Alert>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28, alignItems: 'start' }} className="postjob-layout">
          <div>
            <JobForm onSubmit={handleSubmit} loading={loading} totalYear={totalYear} />
          </div>

          {/* Tips sidebar */}
          <aside style={{ position: 'sticky', top: 88 }}>
            <div className="section" style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>💡 Tips för ett bra jobbinlägg</h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  'Var specifik — ange exakt vad som behöver göras',
                  'Ange helst ett datum eller tidsintervall',
                  'Beskriv om du behöver utrustning eller inte',
                  'Sätt ett rimligt pris — kolla liknande jobb',
                  'Lägg till plats för att nå lokala utförare',
                ].map((t, i) => (
                  <li key={i} style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', gap: 8 }}>
                    <span style={{ color: 'var(--blue)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span> {t}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ background: 'var(--blue-light)', border: '1px solid var(--blue-mid)', borderRadius: 10, padding: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue)', marginBottom: 6 }}>📊 Din inkomststatus</p>
              <p style={{ fontSize: 13, color: 'var(--ink)' }}>Intjänat i år: <strong>{formatPrice(totalYear)}</strong></p>
              <p style={{ fontSize: 13, color: 'var(--ink)' }}>Kvar: <strong>{formatPrice(Math.max(30_000 - totalYear, 0))}</strong></p>
            </div>
          </aside>
        </div>
      </div>

      <style>{`@media(max-width:900px){.postjob-layout{grid-template-columns:1fr!important}}`}</style>
    </main>
  );
}
