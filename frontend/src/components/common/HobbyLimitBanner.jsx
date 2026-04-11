// git commit: "feat(common): add HobbyLimitBanner warning shown when user nears 30,000 kr income limit"

import { Link } from 'react-router-dom';
import { useHobbyLimit } from '../../hooks/useHobbyLimit.js';

export default function HobbyLimitBanner() {
  const { totalYear, isNear, isAt } = useHobbyLimit();
  if (!isNear && !isAt) return null;

  const pct     = Math.min((totalYear / 30_000) * 100, 100);
  const blocked = isAt;

  return (
    <div style={{
      background: blocked ? 'var(--red-light)' : 'var(--yellow-light)',
      borderBottom: `2px solid ${blocked ? 'var(--red)' : '#FCD34D'}`,
      padding: '10px 0',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>{blocked ? '🚫' : '⚠️'}</span>
          <div>
            <strong style={{ fontSize: 14, color: blocked ? 'var(--red)' : 'var(--yellow-text)' }}>
              {blocked
                ? 'Du har nått hobbyinkomstgränsen på 30 000 kr/år — annonsering inaktiverad.'
                : `Varning: Du har tjänat ${totalYear.toLocaleString('sv-SE')} kr av 30 000 kr (${Math.round(pct)}%).`
              }
            </strong>
            {!blocked && <p style={{ fontSize: 12, color: 'var(--yellow-text)', marginTop: 2 }}>Hobbyinkomst gräns är 30 000 kr/år. Läs mer om reglerna.</p>}
          </div>
        </div>
        <Link to="/hobbyinfo" style={{ fontSize: 13, fontWeight: 600, color: blocked ? 'var(--red)' : 'var(--yellow-text)', textDecoration: 'underline', whiteSpace: 'nowrap' }}>
          Läs mer →
        </Link>
      </div>
    </div>
  );
}
