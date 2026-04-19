// git commit: "feat(jobs): add HobbyIncomeWarning shown inline when posting a job near income limit"

import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatters.js';
import { HOBBY_ANNUAL_LIMIT } from '../../utils/hobbyLimits.js';

export default function HobbyIncomeWarning({ totalYear, jobPrice = 0 }) {
  const projectedTotal = totalYear + Number(jobPrice);
  const pct            = Math.min((projectedTotal / HOBBY_ANNUAL_LIMIT) * 100, 100);
  const remaining      = Math.max(HOBBY_ANNUAL_LIMIT - totalYear, 0);

  if (totalYear <= 0) return null;

  const isBlocked = totalYear >= HOBBY_ANNUAL_LIMIT;
  const isWarning = projectedTotal >= 25_000;

  if (!isBlocked && !isWarning) return null;

  return (
    <div style={{
      background: isBlocked ? 'var(--red-light)' : 'var(--yellow-light)',
      border: `1.5px solid ${isBlocked ? 'var(--red)' : '#FCD34D'}`,
      borderRadius: 8,
      padding: 16,
      marginBottom: 20,
    }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>{isBlocked ? '🚫' : '⚠️'}</span>
        <div style={{ flex: 1 }}>
          <strong style={{ fontSize: 14, color: isBlocked ? 'var(--red)' : 'var(--yellow-text)', display: 'block', marginBottom: 4 }}>
            {isBlocked
              ? 'Du har nått inkomstgränsen för hobbyverksamhet (30 000 kr/år)'
              : `Varning: detta jobb tar dig nära inkomstgränsen`}
          </strong>
          <p style={{ fontSize: 13, color: isBlocked ? 'var(--red)' : 'var(--yellow-text)', lineHeight: 1.5 }}>
            {isBlocked
              ? 'Du kan inte publicera fler jobb förrän ett nytt kalenderår börjar.'
              : `Du har tjänat ${formatPrice(totalYear)} hittills. Kvar: ${formatPrice(remaining)}.`}
          </p>

          {/* Progress bar */}
          <div style={{ background: 'rgba(0,0,0,.1)', height: 8, borderRadius: 4, overflow: 'hidden', margin: '10px 0 6px' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: isBlocked ? 'var(--red)' : 'var(--yellow)', borderRadius: 4, transition: 'width .4s' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: isBlocked ? 'var(--red)' : 'var(--yellow-text)' }}>
            <span>{formatPrice(projectedTotal)}</span>
            <span>{formatPrice(HOBBY_ANNUAL_LIMIT)} max</span>
          </div>
        </div>
      </div>
      <Link to="/hobbyinfo" style={{ fontSize: 13, color: isBlocked ? 'var(--red)' : 'var(--yellow-text)', fontWeight: 600, marginTop: 10, display: 'inline-block', textDecoration: 'underline' }}>
        Läs om hobbyreglerna →
      </Link>
    </div>
  );
}
