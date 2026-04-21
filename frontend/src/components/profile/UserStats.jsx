export default function UserStats({ profile, reviews, avgRating }) {
  const items = [
    { value: profile?.jobs_completed ?? 0, label: 'Slutförda jobb' },
    { value: avgRating ?? '—',             label: 'Snittbetyg' },
    { value: profile?.jobs_active ?? 0,    label: 'Aktiva jobb' },
    { value: reviews?.length ?? 0,         label: 'Recensioner' },
  ];

  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}
      className="stats-grid"
    >
      {items.map(s => (
        <div
          key={s.label}
          style={{
            textAlign: 'center',
            background: 'var(--bg)',
            borderRadius: 8,
            padding: 16,
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 800 }}>{s.value}</div>
          <div style={{
            fontSize: 11,
            color: 'var(--muted)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '.04em',
            marginTop: 2,
          }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
