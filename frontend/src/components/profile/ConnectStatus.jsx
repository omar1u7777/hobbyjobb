import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { connectService } from '../../services/connectService.js';
import Alert from '../common/Alert.jsx';
import Spinner from '../common/Spinner.jsx';

export default function ConnectStatus() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('none');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [onboardLoading, setOnboardLoading] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  // Reload status when returning from Stripe onboarding
  useEffect(() => {
    if (searchParams.get('connect') === 'success') {
      loadStatus();
    }
  }, [searchParams]);

  const loadStatus = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await connectService.getStatus();
      setStatus(data.stripe_account_status || 'none');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboard = async () => {
    setOnboardLoading(true);
    setError('');
    try {
      const data = await connectService.onboard();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      setError(e.message);
      setOnboardLoading(false);
    }
  };

  const handleRefresh = async () => {
    setOnboardLoading(true);
    setError('');
    try {
      const data = await connectService.refresh();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      setError(e.message);
      setOnboardLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px 0' }}>
        <Spinner size={20} />
      </div>
    );
  }

  return (
    <div>
      {error && <Alert type="error" style={{ marginBottom: 12 }}>{error}</Alert>}

      {status === 'none' && (
        <div>
          <p style={{ marginBottom: 12, color: 'var(--muted)', fontSize: 14 }}>
            För att ta emot utbetalningar behöver du koppla ett Stripe-konto.
          </p>
          <button
            className="btn btn-primary"
            onClick={handleOnboard}
            disabled={onboardLoading}
            style={{ width: '100%' }}
          >
            {onboardLoading ? <Spinner size={16} color="#fff" /> : 'Koppla Stripe-konto för utbetalningar'}
          </button>
        </div>
      )}

      {status === 'pending' && (
        <div>
          <Alert type="info" style={{ marginBottom: 12 }}>
            Stripe-konto skapades. Klicka nedan för att slutföra verifiering.
          </Alert>
          <button
            className="btn btn-primary"
            onClick={handleRefresh}
            disabled={onboardLoading}
            style={{ width: '100%' }}
          >
            {onboardLoading ? <Spinner size={16} color="#fff" /> : 'Fortsätt verifiering'}
          </button>
        </div>
      )}

      {status === 'active' && (
        <Alert type="success">
          Utbetalningar aktiverade
        </Alert>
      )}

      {status === 'restricted' && (
        <Alert type="error">
          ⚠️ Kontot begränsat – kontakta support.
        </Alert>
      )}
    </div>
  );
}
