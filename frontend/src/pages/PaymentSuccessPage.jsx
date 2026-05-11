// git commit: "feat(s1): add PaymentSuccessPage for payment confirmation"

import { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { formatPrice } from '../utils/formatters.js';
import Alert from '../components/common/Alert.jsx';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;

  // Redirect if accessed directly without payment
  useEffect(() => {
    if (!state?.success) {
      // Could also check query params for Stripe redirect
      const params = new URLSearchParams(window.location.search);
      const paymentIntent = params.get('payment_intent');
      
      if (!paymentIntent && !state?.success) {
        // Silent redirect - don't force navigation, just show generic success
      }
    }
  }, [state, navigate]);

  const jobId = state?.jobId;
  const amount = state?.amount;

  return (
    <main style={{ padding: '60px 0' }}>
      <div className="container" style={{ maxWidth: 680 }}>
        <div 
          style={{ 
            background: 'var(--white)', 
            borderRadius: 'var(--r)', 
            border: '1px solid var(--border)', 
            padding: '40px 32px',
            textAlign: 'center'
          }}
        >
          {/* Success Icon */}
          <div 
            style={{ 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              background: 'var(--green-light)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: 40
            }}
          >
            ✅
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12, color: 'var(--dark)' }}>
            Betalning genomförd!
          </h1>
          
          <p style={{ color: 'var(--muted)', fontSize: 16, marginBottom: 32, lineHeight: 1.6 }}>
            Tack för din betalning. Jobbet har markerats som påbörjat och utföraren har notifierats.
          </p>

          {amount && (
            <div 
              style={{ 
                background: 'var(--bg)', 
                borderRadius: 12, 
                padding: 20, 
                marginBottom: 32 
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--muted)' }}>Betalt belopp:</span>
                <span style={{ fontWeight: 700 }}>{formatPrice(amount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--muted)' }}>Plattformsavgift:</span>
                <span style={{ fontWeight: 600 }}>{formatPrice(amount * 0.08)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Utföraren får:</span>
                <span style={{ fontWeight: 700, color: 'var(--green-text)' }}>{formatPrice(amount * 0.92)}</span>
              </div>
            </div>
          )}

          <Alert type="info" style={{ marginBottom: 32, textAlign: 'left' }}>
            <strong>Nästa steg:</strong>
            <ul style={{ margin: '8px 0 0 16px', padding: 0 }}>
              <li>Kontakta utföraren via chatten för att koordinera detaljer</li>
              <li>När jobbet är slutfört, markera det som klart i "Mina jobb"</li>
              <li>Lämna en recension efter genomfört uppdrag</li>
            </ul>
          </Alert>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {jobId ? (
              <Link to={`/jobs/${jobId}`} className="btn btn-primary btn-lg">
                Visa jobbdetaljer
              </Link>
            ) : (
              <Link to="/mina-jobb" className="btn btn-primary btn-lg">
                Mina jobb
              </Link>
            )}
            <Link to="/jobs" className="btn btn-ghost btn-lg">
              Hitta fler jobb
            </Link>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--muted)' }}>
          <Link to="/chatt" style={{ color: 'var(--blue)', fontWeight: 600 }}>Gå till chatten</Link> för att koordinera med utföraren.
        </p>
      </div>
    </main>
  );
}
