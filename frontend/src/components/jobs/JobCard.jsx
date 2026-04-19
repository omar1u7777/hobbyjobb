// git commit: "feat(jobs): build JobCard component with title, price, location, and rating"

import { Link } from 'react-router-dom';
import { formatPrice, formatDate, formatDistance } from '../../utils/formatters.js';
import CategoryBadge, { getCategoryIcon } from './CategoryBadge.jsx';

export default function JobCard({ job }) {
  const isNew    = (new Date() - new Date(job.createdAt ?? job.created_at)) < 24 * 3600_000;
  const isToday  = job.date && new Date(job.date).toDateString() === new Date().toDateString();

  return (
    <Link to={`/jobs/${job.id}`} style={{
      background: 'var(--white)',
      borderRadius: 'var(--r)',
      border: '1px solid var(--border)',
      padding: '20px 22px',
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      textDecoration: 'none',
      color: 'inherit',
      transition: 'all .15s',
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow='var(--sh-lg)'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.borderColor='#CBD5E1'; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='none'; e.currentTarget.style.borderColor='var(--border)'; }}
    >
      {/* Icon */}
      <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
        {getCategoryIcon(job.category?.name)}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {job.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {job.location  && <span style={{ fontSize: 13, color: 'var(--muted)' }}>📍 {job.location}{job.distance_km != null ? ` · ${formatDistance(job.distance_km)}` : ''}</span>}
          {job.expires_at && <span style={{ fontSize: 13, color: 'var(--muted)' }}>📅 {formatDate(job.expires_at)}</span>}
          {job.category  && <CategoryBadge name={job.category.name} />}
          {isNew   && <span style={{ background: '#16A34A', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>Nytt</span>}
          {isToday && <span style={{ background: 'var(--blue)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>Idag</span>}
        </div>
        {job.poster?.name && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>👤 {job.poster.name}{job.poster.location ? ` · ${job.poster.location}` : ''}</span>
          </div>
        )}
      </div>

      {/* Price */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--blue)' }}>{formatPrice(job.price)}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{job.price_type === 'hourly' ? 'Per timme' : 'Fast pris'}</div>
      </div>
    </Link>
  );
}
