import { useState } from 'react';
import Alert from '../common/Alert.jsx';
import Spinner from '../common/Spinner.jsx';

export default function ReviewForm({ revieweeName, onSubmit, loading }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');
    if (rating < 1 || rating > 5) {
      setLocalError('Välj ett betyg mellan 1 och 5 stjärnor.');
      return;
    }
    onSubmit({ rating, comment: comment.trim() });
  };

  return (
    <form onSubmit={handleSubmit}>
      {localError && <Alert type="error" style={{ marginBottom: 16 }}>{localError}</Alert>}

      <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 14 }}>
        Hur var din upplevelse med <strong style={{ color: 'var(--dark)' }}>{revieweeName}</strong>?
      </p>

      <div style={{ display: 'flex', gap: 4, marginBottom: 18, justifyContent: 'center' }}>
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = n <= (hover || rating);
          return (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              aria-label={`${n} stjärnor`}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 36,
                color: filled ? '#F59E0B' : 'var(--border)',
                padding: '0 4px',
                lineHeight: 1,
                transition: 'color .1s',
              }}
            >
              ★
            </button>
          );
        })}
      </div>

      <div className="form-group">
        <label htmlFor="review-comment">Kommentar (valfritt)</label>
        <textarea
          id="review-comment"
          rows={4}
          maxLength={500}
          placeholder="Berätta om din upplevelse..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <p className="hint">{comment.length}/500 tecken</p>
      </div>

      <button type="submit" className="btn btn-primary btn-full" disabled={loading || rating === 0}>
        {loading ? <Spinner size={18} color="#fff" /> : 'Skicka recension'}
      </button>
    </form>
  );
}
