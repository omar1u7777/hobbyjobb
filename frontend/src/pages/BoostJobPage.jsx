// git commit: "feat(s1): add BoostJobPage for Stripe boost payment"

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { paymentService } from '../services/paymentService.js';
import { jobService } from '../services/jobService.js';
import { formatPrice } from '../utils/formatters.js';
import Alert from '../components/common/Alert.jsx';
import Spinner from '../components/common/Spinner.jsx';

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || import.meta.env.VITE_STRIPE_PUBLIC_KEY
);

const PACKAGES = [
  { key: 'standard', price: 29, label: 'Standard Boost',  duration: '48 timmar', icon: '⚡' },
  { key: 'super',    price: 59, label: 'Super Boost',     duration: '7 dagar',   icon: '🚀' },
];

function BoostForm({ clientSecret, pkg, jobId }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');
    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message);
        setLoading(false);
        return;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: `${window.location.origin}/jobs/${jobId}` },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        try {
          await paymentService.confirmBoost(paymentIntent.id);
        } catch (syncErr) {
          console.warn('Backend boost confirm failed (webhook will update):', syncErr.message);
        }
        navigate(`/jobs/${jobId}`, {
          state: { boostSuccess: true, package: pkg.label },
        });
      } else {
        setError('Betalningen kunde inte slutföras.');
      }
    } catch (err) {
      setError('Ett fel uppstod. Försök igen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert type="error" style={{ marginBottom: 16 }}>{error}</Alert>}
      <div style={{ background: 'var(--white)', borderRadius: 'var(--r)', border: '1px solid var(--border)', padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>💳 Betalningsuppgifter</h3>
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>
      <button type="submit" disabled={!stripe || loading} className="btn btn-primary btn-lg btn-full">
        {loading ? (<><Spinner size={18} color="#fff" style={{ marginRight: 8 }} /> Bearbetar...</>) : `Betala ${formatPrice(pkg.price)}`}
      </button>
      <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', marginTop: 16 }}>🔒 Krypterad betalning via Stripe</p>
    </form>
  );
}

export default function BoostJobPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creatingPayment, setCreatingPayment] = useState(false);

  useEffect(() => {
    jobService.getJob(jobId)
      .then(setJob)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [jobId]);

  const selectPackage = async (pkg) => {
    setCreatingPayment(true);
    setError('');
    try {
      const data = await paymentService.createBoost(Number(jobId), pkg.key);
      setSelectedPkg(pkg);
      setClientSecret(data.clientSecret);
    } catch (e) {
      setError(e.message);
    } finally {
      setCreatingPayment(false);
    }
  };

  if (loading) {
    return <main style={{ padding: '60px 0', textAlign: 'center' }}><Spinner size={48} /></main>;
  }

  if (error) {
    return (
      <main style={{ padding: '60px 0' }}>
        <div className="container" style={{ maxWidth: 680 }}>
          <Alert type="error" style={{ marginBottom: 20 }}>{error}</Alert>
          <Link to={`/jobs/${jobId}`} className="btn btn-primary">← Tillbaka till jobb</Link>
        </div>
      </main>
    );
  }

  if (!job) return null;

  return (
    <main style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: 680 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>🚀 Boosta ditt jobb</h1>
          <p style={{ color: 'var(--muted)' }}>Lyft ditt jobb till toppen av sökresultaten</p>
        </div>

        {/* Job info */}
        <div style={{ background: 'var(--white)', borderRadius: 'var(--r)', border: '1px solid var(--border)', padding: 16, marginBottom: 24 }}>
          <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 4 }}>Jobb som boostas:</div>
          <div style={{ fontWeight: 700 }}>{job.title}</div>
          {job.is_boosted && job.boost_expires_at && (
            <Alert type="info" style={{ marginTop: 12 }}>
              Jobbet är redan boostat till {new Date(job.boost_expires_at).toLocaleString('sv-SE')}. 
              Nytt köp förlänger perioden.
            </Alert>
          )}
        </div>

        {!selectedPkg ? (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Välj Boost-paket</h2>
            <div style={{ display: 'grid', gap: 14 }}>
              {PACKAGES.map(pkg => (
                <button
                  key={pkg.key}
                  onClick={() => selectPackage(pkg)}
                  disabled={creatingPayment}
                  style={{
                    textAlign: 'left',
                    background: 'var(--white)',
                    border: '2px solid var(--border)',
                    borderRadius: 'var(--r)',
                    padding: '20px 24px',
                    cursor: creatingPayment ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    transition: 'all .15s',
                  }}
                  onMouseEnter={e => !creatingPayment && (e.currentTarget.style.borderColor = 'var(--blue)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <div style={{ fontSize: 40 }}>{pkg.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 4 }}>{pkg.label}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>Topplacering i {pkg.duration}</div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--blue)' }}>
                    {formatPrice(pkg.price)}
                  </div>
                </button>
              ))}
            </div>
            <Link to={`/jobs/${jobId}`} className="btn btn-ghost btn-full" style={{ marginTop: 20 }}>
              Avbryt
            </Link>
          </>
        ) : (
          <>
            <div style={{ background: 'var(--blue-light)', borderRadius: 'var(--r)', padding: 16, marginBottom: 20 }}>
              <div style={{ fontWeight: 700 }}>{selectedPkg.icon} {selectedPkg.label}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{selectedPkg.duration} · {formatPrice(selectedPkg.price)}</div>
            </div>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <BoostForm clientSecret={clientSecret} pkg={selectedPkg} jobId={jobId} />
            </Elements>
            <button
              onClick={() => { setSelectedPkg(null); setClientSecret(''); }}
              className="btn btn-ghost btn-full"
              style={{ marginTop: 16 }}
            >
              ← Välj ett annat paket
            </button>
          </>
        )}
      </div>
    </main>
  );
}
