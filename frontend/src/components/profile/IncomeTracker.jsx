// git commit: "feat(profile): build IncomeTracker with progress bar and warning levels"

import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatters.js';
import { HOBBY_ANNUAL_LIMIT, HOBBY_WARNING_THRESH } from '../../utils/hobbyLimits.js';

export default function IncomeTracker({ totalYear = 0, pct = 0, isNear = false, compact = false }) {
  const isAt      = totalYear >= HOBBY_ANNUAL_LIMIT;
  const barColor  = isAt ? 'var(--red)' : isNear ? 'var(--yellow)' : 'linear-gradient(90deg,var(--blue),#60A5FA)';
  const remaining = Math.max(HOBBY_ANNUAL_LIMIT - totalYear, 0);

  return (
    <div style={{ background: 'var(--white)', borderRadius: 14, padding: compact ? 16 : 24, boxShadow: 'var(--sh-lg)', border: '1px solid var(--border)' }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>💰 Hobbyinkomst {new Date().getFullYear()}</h3>

      <div style={{ fontSize: compact ? 26 : 34, fontWeight: 900, marginBottom: 2 }}>{formatPrice(totalYear)}</div>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 18 }}>av max {formatPrice(HOBBY_ANNUAL_LIMIT)}/år</p>

      {/* Bar */}
      <div style={{ background: 'var(--border)', height: 12, borderRadius: 6, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: barColor,
          borderRadius: 6, transition: 'width .5s',
        }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginBottom: 16 }}>
        <span>0 kr</span>
        <span style={{ color: 'var(--yellow)', fontWeight: 600 }}>⚠️ {formatPrice(HOBBY_WARNING_THRESH)}</span>
        <span>{formatPrice(HOBBY_ANNUAL_LIMIT)}</span>
      </div>

      {/* Status badges */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <span style={{ background: isAt ? 'var(--red-light)' : isNear ? 'var(--yellow-light)' : 'var(--green-light)', color: isAt ? 'var(--red)' : isNear ? 'var(--yellow-text)' : 'var(--green-text)', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 700 }}>
          {isAt ? '🚫 Gräns nådd' : isNear ? '⚠️ Nära gränsen' : '✅ OK'}
        </span>
        {!isAt && <span style={{ background: 'var(--border-light)', color: 'var(--muted)', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600 }}>
          Kvar: {formatPrice(remaining)}
        </span>}
      </div>

      {/* Breakdown */}
      {!compact && (
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 14 }}>
          {[
            { label: 'Intjänat i år', value: formatPrice(totalYear), color: '#16A34A' },
            { label: 'Kvar av gräns', value: formatPrice(remaining), color: isNear ? 'var(--yellow)' : 'var(--muted)' },
            { label: `${Math.round(pct)}% av gränsen`, value: '', color: 'var(--muted)' },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: 'var(--muted)' }}>{r.label}</span>
              <span style={{ fontWeight: 700, color: r.color }}>{r.value}</span>
            </div>
          ))}
        </div>
      )}

      <Link
        to="/hobbyinfo"
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--blue-light)', borderRadius: 8, padding: '12px 14px',
          textDecoration: 'none', color: 'var(--dark)', border: '1px solid var(--blue-mid)',
          fontSize: 13, fontWeight: 500, marginTop: 14,
          transition: 'border .15s',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor='var(--blue)'}
        onMouseLeave={e => e.currentTarget.style.borderColor='var(--blue-mid)'}
      >
        <span>📋</span>
        <span>Läs om hobbyverksamhetsgränser på Skatteverket</span>
      </Link>
    </div>
  );
}
