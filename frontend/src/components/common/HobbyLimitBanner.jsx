import { useHobbyLimit } from '../../hooks/useHobbyLimit.js';
export default function HobbyLimitBanner() {
  const { totalYear, isNear, isAt } = useHobbyLimit();
  return <div style={{ background: isAt ? 'var(--red-light)' : 'var(--yellow-light)', borderBottom: '2px solid ' + (isAt ? 'var(--red)' : '#FCD34D'), padding: '10px 0' }}><div className="container" style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span>{isAt ? '🚫' : '⚠️'}</span><strong style={{ fontSize: 14, color: isAt ? 'var(--red)' : 'var(--yellow-text)' }}>{isAt ? 'Hobbyinkomstgransen nadd (30 000 kr/ar)' : 'Varning: Du har tjanat ' + totalYear.toLocaleString('sv-SE') + ' kr av 30 000 kr'}</strong></div></div>;
}
