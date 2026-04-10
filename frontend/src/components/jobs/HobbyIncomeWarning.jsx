import { formatPrice } from '../../utils/formatters.js';
export default function HobbyIncomeWarning({ totalYear, jobPrice = 0 }) {
  if (totalYear <= 0) return null;
  const projected = totalYear + Number(jobPrice); const isBlocked = totalYear >= 30000; const isWarning = projected >= 25000;
  return <div style={{ background: isBlocked ? 'var(--red-light)' : 'var(--yellow-light)', border: '1.5px solid ' + (isBlocked ? 'var(--red)' : '#FCD34D'), borderRadius: 8, padding: 16, marginBottom: 20 }}><strong style={{ fontSize: 14, color: isBlocked ? 'var(--red)' : 'var(--yellow-text)' }}>{isBlocked ? 'Inkomstgransen nadd (30 000 kr/ar)' : 'Varning: nara gransen'}</strong><p style={{ fontSize: 13, color: isBlocked ? 'var(--red)' : 'var(--yellow-text)', marginTop: 4 }}>{isBlocked ? 'Du kan inte publicera fler jobb.' : 'Tjanat: ' + formatPrice(totalYear) + '. Kvar: ' + formatPrice(30000 - totalYear)}</p></div>;
}
