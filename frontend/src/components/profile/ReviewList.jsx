import { formatDate } from '../../utils/formatters.js';

export default function ReviewList({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return (
      <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 40 }}>
        Inga recensioner ännu.
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {reviews.map(r => (
        <div
          key={r.id}
          style={{
            background: 'var(--bg)',
            borderRadius: 8,
            border: '1px solid var(--border)',
            padding: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>
              {r.reviewer?.name ?? r.reviewer_name ?? 'Användare'}
            </span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ color: '#F59E0B', fontSize: 14 }}>
                {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
              </span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                {formatDate(r.created_at)}
              </span>
            </div>
          </div>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>{r.comment}</p>
        </div>
      ))}
    </div>
  );
}
