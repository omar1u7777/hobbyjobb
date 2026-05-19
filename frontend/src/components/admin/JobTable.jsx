import { useEffect, useMemo, useState } from 'react';
import { adminService } from '../../services/adminService.js';

function statusLabel(status) {
  const map = { open: 'Öppet', in_progress: 'Pågående', completed: 'Slutfört', cancelled: 'Avbrutet' };
  return map[status] || status;
}

function statusStyle(status) {
  if (status === 'completed') {
    return { background: 'var(--green-light)', color: 'var(--green-text)' };
  }
  if (status === 'in_progress') {
    return { background: 'var(--blue-light)', color: 'var(--blue)' };
  }
  if (status === 'cancelled') {
    return { background: 'var(--red-light)', color: 'var(--red)' };
  }
  return { background: 'var(--yellow-light)', color: 'var(--yellow-text)' };
}

export default function JobTable() {
  const [jobs, setJobs] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await adminService.getJobs({ limit: 50 });
        if (!cancelled) setJobs(data);
      } catch (_) {
        // keep empty
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return jobs;

    return jobs.filter((job) => {
      const title = (job.title || '').toLowerCase();
      const category = (job.category?.name || '').toLowerCase();
      const status = statusLabel(job.status).toLowerCase();
      return title.includes(q) || category.includes(q) || status.includes(q);
    });
  }, [jobs, query]);

  return (
    <section className="section" style={{ marginBottom: 0 }}>
      <div className="section-hdr" style={{ marginBottom: 14 }}>
        <div>
          <h3>Jobböversikt</h3>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            {loading ? 'Laddar...' : `Live-data — ${jobs.length} jobb`}
          </p>
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Sök på titel, kategori eller status..."
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
              <th style={{ padding: '8px 6px' }}>Upplagd av</th>
              <th style={{ padding: '8px 6px' }}>Pris</th>
              <th style={{ padding: '8px 6px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((job) => (
              <tr key={job.id} style={{ borderTop: '1px solid var(--border-light)' }}>
                <td style={{ padding: '10px 6px', fontSize: 13, fontWeight: 600 }}>{job.title}</td>
                <td style={{ padding: '10px 6px', fontSize: 13 }}>{job.category?.name || '—'}</td>
                <td style={{ padding: '10px 6px', fontSize: 12, color: 'var(--muted)' }}>{job.poster?.name || '—'}</td>
                <td style={{ padding: '10px 6px', fontSize: 13 }}>{Number(job.price || 0).toLocaleString('sv-SE')} kr</td>
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
                    {statusLabel(job.status)}
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
