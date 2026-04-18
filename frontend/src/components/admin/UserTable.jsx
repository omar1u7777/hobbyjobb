import { useMemo, useState } from 'react';

const MOCK_USERS = [
  { id: 1, name: 'Anna Lindgren', hobbyTotal: 28900, status: 'Nara grans', jobsMonth: 12 },
  { id: 2, name: 'Bjorn Karlsson', hobbyTotal: 14120, status: 'OK', jobsMonth: 7 },
  { id: 3, name: 'Maria Svensson', hobbyTotal: 30000, status: 'Sparrad', jobsMonth: 21 },
  { id: 4, name: 'Erik Magnusson', hobbyTotal: 18450, status: 'OK', jobsMonth: 9 },
  { id: 5, name: 'Sofia Berg', hobbyTotal: 24980, status: 'Nara grans', jobsMonth: 16 },
  { id: 6, name: 'David Holm', hobbyTotal: 9020, status: 'OK', jobsMonth: 4 },
];

function statusStyle(status) {
  if (status === 'Sparrad') {
    return { background: 'var(--red-light)', color: 'var(--red)' };
  }

  if (status === 'Nara grans') {
    return { background: 'var(--yellow-light)', color: 'var(--yellow-text)' };
  }

  return { background: 'var(--green-light)', color: 'var(--green-text)' };
}

export default function UserTable({ users = MOCK_USERS }) {
  const [query, setQuery] = useState('');

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;

    return users.filter((user) => {
      const name = user.name.toLowerCase();
      const status = user.status.toLowerCase();
      return name.includes(q) || status.includes(q);
    });
  }, [users, query]);

  return (
    <section className="section" style={{ marginBottom: 0 }}>
      <div className="section-hdr" style={{ marginBottom: 14 }}>
        <div>
          <h3>Anvandaroversikt</h3>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            Sokbar mock-tabell for hobbystatus
          </p>
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Sok pa namn eller status..."
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
              <th style={{ padding: '8px 6px' }}>Hobby totalt</th>
              <th style={{ padding: '8px 6px' }}>Jobb/manad</th>
              <th style={{ padding: '8px 6px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} style={{ borderTop: '1px solid var(--border-light)' }}>
                <td style={{ padding: '10px 6px', fontSize: 13, fontWeight: 600 }}>{user.name}</td>
                <td style={{ padding: '10px 6px', fontSize: 13 }}>{user.hobbyTotal.toLocaleString('sv-SE')} kr</td>
                <td style={{ padding: '10px 6px', fontSize: 13 }}>{user.jobsMonth}</td>
                <td style={{ padding: '10px 6px' }}>
                  <span
                    style={{
                      ...statusStyle(user.status),
                      borderRadius: 999,
                      padding: '4px 10px',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {user.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
