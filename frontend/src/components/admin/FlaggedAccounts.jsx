import { useEffect, useMemo, useState } from 'react';
import { adminService } from '../../services/adminService.js';

const RISK_LABEL_SV = { high: 'Hög', medium: 'Medel', low: 'Låg' };
const RISK_SV_TO_KEY = { 'Hög': 'high', 'Medel': 'medium', 'Låg': 'low', 'Alla': 'all' };

function mapApiAccount(apiAccount) {
  const riskKey = typeof apiAccount.risk === 'string' ? apiAccount.risk.toLowerCase() : 'low';
  const reason = apiAccount.hobbyLimitReached
    ? 'Gräns nådd'
    : `Över ${apiAccount.limitPercent ?? 0}% av gränsen`;

  return {
    id: apiAccount.id,
    name: apiAccount.name,
    hobbyIncome: Number(apiAccount.hobbyTotalYear ?? 0),
    risk: RISK_LABEL_SV[riskKey] || 'Låg',
    reason,
    status: apiAccount.hobbyLimitReached ? 'Låst' : 'Öppen',
  };
}

const INITIAL_ACCOUNTS = [
  { id: 101, name: 'Lina Holm', hobbyIncome: 29200, risk: 'Hög', reason: 'Över 97% av gränsen', status: 'Öppen' },
  { id: 102, name: 'Mikael Sand', hobbyIncome: 27100, risk: 'Medel', reason: 'Många jobb samma månad', status: 'Öppen' },
  { id: 103, name: 'Sara Nyberg', hobbyIncome: 30000, risk: 'Hög', reason: 'Gräns nådd', status: 'Låst' },
  { id: 104, name: 'Oskar Lind', hobbyIncome: 24850, risk: 'Låg', reason: 'Snabb ökning senaste veckan', status: 'Öppen' },
  { id: 105, name: 'Emma Berg', hobbyIncome: 28800, risk: 'Hög', reason: 'Flera flaggade jobb', status: 'Öppen' },
];

function riskStyle(risk) {
  if (risk === 'Hög') {
    return { background: 'var(--red-light)', color: 'var(--red)' };
  }

  if (risk === 'Medel') {
    return { background: 'var(--yellow-light)', color: 'var(--yellow-text)' };
  }

  return { background: 'var(--green-light)', color: 'var(--green-text)' };
}

function statusStyle(status) {
  if (status === 'Låst') {
    return { background: 'var(--red-light)', color: 'var(--red)' };
  }

  if (status === 'Klar') {
    return { background: 'var(--green-light)', color: 'var(--green-text)' };
  }

  return { background: 'var(--blue-light)', color: 'var(--blue)' };
}

export default function FlaggedAccounts() {
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [query, setQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('Alla');
  const [apiLive, setApiLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadAccounts() {
      try {
        const apiAccounts = await adminService.getFlaggedAccounts({
          search: query,
          risk: RISK_SV_TO_KEY[riskFilter] || 'all',
        });
        if (cancelled) return;

        if (Array.isArray(apiAccounts)) {
          setAccounts(apiAccounts.map(mapApiAccount));
          setApiLive(true);
        }
      } catch (_) {
        // Keep mock data on failure
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    // Debounce so we do not fire one request per keystroke while the admin
    // is typing. The backend does an N+1 Payment.sum per flagged user which
    // would otherwise amplify search-input traffic.
    const timer = setTimeout(loadAccounts, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, riskFilter]);

  const filteredAccounts = useMemo(() => {
    const q = query.trim().toLowerCase();

    return accounts.filter((account) => {
      const nameMatch = account.name.toLowerCase().includes(q);
      const reasonMatch = account.reason.toLowerCase().includes(q);
      const matchesText = !q || nameMatch || reasonMatch;
      const matchesRisk = riskFilter === 'Alla' || account.risk === riskFilter;
      return matchesText && matchesRisk;
    });
  }, [accounts, query, riskFilter]);

  function markResolved(accountId) {
    setError('');

    const applyLocal = () => {
      setAccounts((current) =>
        current.map((account) => (account.id === accountId ? { ...account, status: 'Klar' } : account))
      );
    };

    if (!apiLive) {
      applyLocal();
      return;
    }

    adminService
      .updateFlaggedAccountStatus(accountId, { action: 'resolve' })
      .then(() => applyLocal())
      .catch((apiError) => {
        setError(apiError.message || 'Kunde inte uppdatera kontot.');
      });
  }

  function lockAccount(accountId) {
    setError('');

    const applyLocal = () => {
      setAccounts((current) =>
        current.map((account) => (account.id === accountId ? { ...account, status: 'Låst' } : account))
      );
    };

    if (!apiLive) {
      applyLocal();
      return;
    }

    adminService
      .updateFlaggedAccountStatus(accountId, { action: 'lock' })
      .then(() => applyLocal())
      .catch((apiError) => {
        setError(apiError.message || 'Kunde inte låsa kontot.');
      });
  }

  return (
    <section className="section" style={{ marginBottom: 16 }}>
      <div className="section-hdr" style={{ marginBottom: 12 }}>
        <div>
          <h3>Flaggade konton</h3>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            {loading ? 'Laddar från admin-API…' : apiLive ? 'Live-data från admin-API.' : 'Mock-data — admin-API ej tillgängligt.'}
          </p>
          {error ? <p style={{ marginTop: 6, fontSize: 12, color: 'var(--red)' }}>{error}</p> : null}
        </div>
      </div>

      <div
        className="flagged-filters"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 170px',
          gap: 8,
          marginBottom: 10,
        }}
      >
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Sök på namn eller orsak..."
          style={{
            border: '1.5px solid var(--border)',
            borderRadius: 8,
            padding: '9px 12px',
            fontSize: 13,
            fontFamily: 'var(--font)',
            background: 'var(--bg)',
          }}
        />
        <select
          value={riskFilter}
          onChange={(event) => setRiskFilter(event.target.value)}
          style={{
            border: '1.5px solid var(--border)',
            borderRadius: 8,
            padding: '9px 12px',
            fontSize: 13,
            fontFamily: 'var(--font)',
            background: 'var(--white)',
          }}
        >
          <option value="Alla">Alla risknivåer</option>
          <option value="Hög">Hög</option>
          <option value="Medel">Medel</option>
          <option value="Låg">Låg</option>
        </select>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', fontSize: 12, color: 'var(--muted)' }}>
              <th style={{ padding: '8px 6px' }}>Användare</th>
              <th style={{ padding: '8px 6px' }}>Hobbyinkomst</th>
              <th style={{ padding: '8px 6px' }}>Risk</th>
              <th style={{ padding: '8px 6px' }}>Status</th>
              <th style={{ padding: '8px 6px' }}>Åtgärd</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map((account) => (
              <tr key={account.id} style={{ borderTop: '1px solid var(--border-light)' }}>
                <td style={{ padding: '10px 6px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{account.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{account.reason}</div>
                </td>
                <td style={{ padding: '10px 6px', fontSize: 13 }}>
                  {account.hobbyIncome.toLocaleString('sv-SE')} kr
                </td>
                <td style={{ padding: '10px 6px' }}>
                  <span
                    style={{
                      ...riskStyle(account.risk),
                      borderRadius: 999,
                      padding: '4px 10px',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {account.risk}
                  </span>
                </td>
                <td style={{ padding: '10px 6px' }}>
                  <span
                    style={{
                      ...statusStyle(account.status),
                      borderRadius: 999,
                      padding: '4px 10px',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {account.status}
                  </span>
                </td>
                <td style={{ padding: '10px 6px', whiteSpace: 'nowrap' }}>
                  <button
                    type="button"
                    onClick={() => markResolved(account.id)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--blue)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      marginRight: 10,
                    }}
                  >
                    Markera klar
                  </button>
                  <button
                    type="button"
                    onClick={() => lockAccount(account.id)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--red)',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Lås konto
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
