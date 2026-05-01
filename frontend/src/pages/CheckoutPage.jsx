// git commit: "feat(s1): add CheckoutPage with Stripe Elements integration"

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { paymentService } from '../services/paymentService.js';
import { jobService } from '../services/jobService.js';
import { formatPrice } from '../utils/formatters.js';
import Alert from '../components/common/Alert.jsx';
import Spinner from '../components/common/Spinner.jsx';

// Initialize Stripe (public key from environment)
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || import.meta.env.VITE_STRIPE_PUBLIC_KEY
);

// Checkout Form Component (inside Stripe Elements)
function CheckoutForm({ job, clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

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
        confirmParams: {
          return_url: `${window.location.origin}/betalning-klar`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Sync status with backend (webhook fallback for localhost dev)
        try {
          await paymentService.confirmPayment(paymentIntent.id);
        } catch (syncErr) {
          console.warn('Backend confirm failed (webhook may update later):', syncErr.message);
        }
        navigate('/betalning-klar', {
          state: {
            success: true,
            jobId: job.id,
            amount: job.price,
          },
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
      {error && <Alert type="error" style={{ marginBottom: 20 }}>{error}</Alert>}
      
      <div style={{ background: 'var(--white)', borderRadius: 'var(--r)', border: '1px solid var(--border)', padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>💳 Betalningsuppgifter</h3>
        <PaymentElement 
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: {
                name: '',
              },
            },
          }}
        />
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="btn btn-primary btn-lg btn-full"
        style={{ marginTop: 16 }}
      >
        {loading ? (
          <>
            <Spinner size={18} color="#fff" style={{ marginRight: 8 }} />
            Bearbetar...
          </>
        ) : (
          `Betala ${formatPrice(job.price)}`
        )}
      </button>

      <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', marginTop: 16 }}>
        🔒 Din betalning är säker och krypterad av Stripe
      </p>
    </form>
  );
}

// Main Checkout Page
export default function CheckoutPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCheckout() {
      try {
        // Load job details
        const jobData = await jobService.getJob(jobId);
        
        if (!jobData) {
          setError('Jobbet kunde inte hittas');
          setLoading(false);
          return;
        }

        setJob(jobData);

        // Create checkout session
        const checkoutData = await paymentService.createCheckout(
          Number(jobId), 
          jobData.price
        );
        
        setClientSecret(checkoutData.clientSecret);
      } catch (err) {
        setError(err.message || 'Kunde inte initiera betalning');
      } finally {
        setLoading(false);
      }
    }

    loadCheckout();
  }, [jobId]);

  if (loading) {
    return (
      <main style={{ padding: '60px 0' }}>
        <div className="container" style={{ maxWidth: 680, textAlign: 'center' }}>
          <Spinner size={48} />
          <p style={{ marginTop: 20, color: 'var(--muted)' }}>Förbereder betalning...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ padding: '60px 0' }}>
        <div className="container" style={{ maxWidth: 680 }}>
          <Alert type="error" style={{ marginBottom: 20 }}>
            {error}
          </Alert>
          <Link to={`/jobs/${jobId}`} className="btn btn-primary">
            ← Tillbaka till jobb
          </Link>
        </div>
      </main>
    );
  }

  if (!job || !clientSecret) {
    return (
      <main style={{ padding: '60px 0' }}>
        <div className="container" style={{ maxWidth: 680 }}>
          <Alert type="error">Något gick fel. Försök igen.</Alert>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: 680 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Betala för jobb</h1>
          <p style={{ color: 'var(--muted)' }}>Slutför din betalning säkert med Stripe</p>
        </div>

        {/* Job Summary */}
        <div style={{ background: 'var(--white)', borderRadius: 'var(--r)', border: '1px solid var(--border)', padding: 20, marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>📋 Sammanfattning</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: 'var(--muted)' }}>Jobb:</span>
            <span style={{ fontWeight: 600 }}>{job.title}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: 'var(--muted)' }}>Pris:</span>
            <span style={{ fontWeight: 600 }}>{formatPrice(job.price)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: 'var(--muted)' }}>Plattformsavgift (8%):</span>
            <span style={{ fontWeight: 600 }}>{formatPrice(job.price * 0.08)}</span>
          </div>
          <div style={{ borderTop: '1px solid var(--border-light)', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700 }}>Totalt att betala:</span>
            <span style={{ fontWeight: 800, color: 'var(--blue)', fontSize: 18 }}>{formatPrice(job.price)}</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
            Utföraren får {formatPrice(job.price * 0.92)} efter plattformsavgift
          </p>
        </div>

        {/* Stripe Checkout */}
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm job={job} clientSecret={clientSecret} />
        </Elements>

        <Link 
          to={`/jobs/${jobId}`} 
          className="btn btn-ghost btn-full"
          style={{ marginTop: 16 }}
        >
          ← Avbryt och gå tillbaka
        </Link>
      </div>
    </main>
  );
}
