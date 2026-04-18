import { useMemo, useState } from 'react';

const MOCK_JOBS = [
  { id: 301, title: 'Grassklippning och kantskarning', category: 'Hem & Tradgard', price: 650, status: 'Aktivt' },
  { id: 302, title: 'IKEA-montering av 3 mobler', category: 'Handyman', price: 850, status: 'Aktivt' },
  { id: 303, title: 'Hundpromenad 2 ganger i veckan', category: 'Djur & Husdjur', price: 300, status: 'Aktivt' },
  { id: 304, title: 'Storstadning 3 rum och kok', category: 'Stadning', price: 900, status: 'Flaggat' },
  { id: 305, title: 'Hjalp med mindre flytt', category: 'Flytt & Transport', price: 1200, status: 'Pausat' },
  { id: 306, title: 'Montering av hyllor', category: 'Handyman', price: 500, status: 'Aktivt' },
];

function statusStyle(status) {
  if (status === 'Flaggat') {
    return { background: 'var(--red-light)', color: 'var(--red)' };
  }

  if (status === 'Pausat') {
    return { background: 'var(--yellow-light)', color: 'var(--yellow-text)' };
  }

  return { background: 'var(--green-light)', color: 'var(--green-text)' };
}

export default function JobTable({ jobs = MOCK_JOBS }) {
  const [query, setQuery] = useState('');

  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return jobs;

    return jobs.filter((job) => {
      const title = job.title.toLowerCase();
      const category = job.category.toLowerCase();
      const status = job.status.toLowerCase();
      return title.includes(q) || category.includes(q) || status.includes(q);
    });
  }, [jobs, query]);

  return (
    <section className="section" style={{ marginBottom: 0 }}>
      <div className="section-hdr" style={{ marginBottom: 14 }}>
        <div>
          <h3>Jobboversikt</h3>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            Sokbar mock-tabell for jobbhantering
          </p>
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Sok pa titel, kategori eller status..."
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
              <th style={{ padding: '8px 6px' }}>Titel</th>
              <th style={{ padding: '8px 6px' }}>Kategori</th>
              <th style={{ padding: '8px 6px' }}>Pris</th>
              <th style={{ padding: '8px 6px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((job) => (
              <tr key={job.id} style={{ borderTop: '1px solid var(--border-light)' }}>
                <td style={{ padding: '10px 6px', fontSize: 13, fontWeight: 600 }}>{job.title}</td>
                <td style={{ padding: '10px 6px', fontSize: 13 }}>{job.category}</td>
                <td style={{ padding: '10px 6px', fontSize: 13 }}>{job.price.toLocaleString('sv-SE')} kr</td>
                <td style={{ padding: '10px 6px' }}>
                  <span
                    style={{
                      ...statusStyle(job.status),
                      borderRadius: 999,
                      padding: '4px 10px',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {job.status}
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
