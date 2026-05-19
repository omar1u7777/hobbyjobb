import { useEffect, useMemo, useState } from 'react';
import { adminService } from '../../services/adminService.js';

function resolveStatus(user) {
  if (user.hobbyLimitReached || user.limitPercent >= 100) return 'Spärrad';
  if (user.hobbyWarned || user.limitPercent >= 80) return 'Nära gräns';
  return 'OK';
}

function statusStyle(status) {
  if (status === 'Spärrad') {
    return { background: 'var(--red-light)', color: 'var(--red)' };
  }

  if (status === 'Nära gräns') {
    return { background: 'var(--yellow-light)', color: 'var(--yellow-text)' };
  }

  return { background: 'var(--green-light)', color: 'var(--green-text)' };
}

export default function UserTable() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await adminService.getUsers({ limit: 50 });
        if (!cancelled) setUsers(data);
      } catch (_) {
        // keep empty
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;

    return users.filter((user) => {
      const name = (user.name || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      const status = resolveStatus(user).toLowerCase();
      return name.includes(q) || email.includes(q) || status.includes(q);
    });
  }, [users, query]);

  return (
    <section className="section" style={{ marginBottom: 0 }}>
      <div className="section-hdr" style={{ marginBottom: 14 }}>
        <div>
          <h3>Användaröversikt</h3>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            {loading ? 'Laddar...' : `Live-data — ${users.length} användare`}
          </p>
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Sök på namn, e-post eller status..."
          style={{
            width: '100%',
            border: '1.5px solid var(--border)',
            borderRadius: 8,
            padding: '9px 12px',
            fontSize: 13,
            fontFamily: 'var(--font)',
            outline: 'none',
            background: 'var(--bg)',
          }}
        />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', fontSize: 12, color: 'var(--muted)' }}>
              <th style={{ padding: '8px 6px' }}>Namn</th>
              <th style={{ padding: '8px 6px' }}>E-post</th>
              <th style={{ padding: '8px 6px' }}>Hobbyinkomst</th>
              <th style={{ padding: '8px 6px' }}>Gräns %</th>
              <th style={{ padding: '8px 6px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => {
              const status = resolveStatus(user);
              return (
                <tr key={user.id} style={{ borderTop: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '10px 6px', fontSize: 13, fontWeight: 600 }}>{user.name}</td>
                  <td style={{ padding: '10px 6px', fontSize: 12, color: 'var(--muted)' }}>{user.email}</td>
                  <td style={{ padding: '10px 6px', fontSize: 13 }}>
                    {Number(user.hobbyTotalYear || 0).toLocaleString('sv-SE')} kr
                  </td>
                  <td style={{ padding: '10px 6px', fontSize: 13 }}>
                    {user.limitPercent ?? 0}%
                  </td>
                  <td style={{ padding: '10px 6px' }}>
                    <span
                      style={{
                        ...statusStyle(status),
                        borderRadius: 999,
                        padding: '4px 10px',
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
