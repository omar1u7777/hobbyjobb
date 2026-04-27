// git commit: "feat(jobs): build JobListPage with search bar, filter sidebar, results grid, and pagination"

import { Fragment, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useJobs } from '../hooks/useJobs.js';
import JobList from '../components/jobs/JobList.jsx';
import JobFilter from '../components/jobs/JobFilter.jsx';

export default function JobListPage() {
  const [urlParams] = useSearchParams();
  const initialSearch = urlParams.get('search') || '';
  const initialLocation = urlParams.get('location') || '';
  const [search, setSearch] = useState(initialSearch);
  const [location, setLocation] = useState(initialLocation);
  const { jobs, total, pages, page, setPage, loading, error, params, updateParams } = useJobs({
    limit: 20,
    search: initialSearch || null,
    location: initialLocation || null,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    updateParams({ search: search || null, location: location || null });
  };

  return (
    <main>
      {/* Search bar */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '20px 0' }}>
        <div className="container">
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '0 16px', gap: 10, transition: 'border .15s' }}
              onFocusCapture={e => e.currentTarget.style.borderColor='var(--blue)'}
              onBlurCapture={e => e.currentTarget.style.borderColor='var(--border)'}
            >
              <span style={{ fontSize: 17, color: 'var(--muted)' }}>🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Sök jobb – t.ex. gräsklippning, flytt..."
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: 'var(--dark)', flex: 1, padding: '13px 0' }}
              />
            </div>
            <div style={{ width: 200, display: 'flex', alignItems: 'center', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '0 16px', gap: 10 }}
              className="loc-input"
            >
              <span style={{ fontSize: 16 }}>📍</span>
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Stad eller postnummer"
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: 'var(--dark)', width: '100%' }}
              />
            </div>
            <button type="submit" className="btn btn-primary">Sök</button>
          </form>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '32px 0 64px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 28, alignItems: 'start' }} className="list-layout">

            {/* Sidebar filter */}
            <JobFilter params={params} onChange={updateParams} />

            {/* Results */}
            <section style={{ zIndex: 2 }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <p style={{ fontSize: 15, color: 'var(--muted)' }}>
                  Visar <strong style={{ color: 'var(--dark)' }}>{total} jobb</strong>
                  {params.search ? ` för "${params.search}"` : ' nära dig'}
                </p>
              </div>

              <JobList jobs={jobs} loading={loading} error={error} />

              {/* Pagination */}
              {pages > 1 && (
                <div className="pagination">
                  {page > 1 && (
                    <button className="page-btn" onClick={() => setPage(p => p - 1)}>‹</button>
                  )}
                    {Array.from({ length: pages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === pages || Math.abs(p - page) <= 2)
                      .map((p, idx, arr) => (
                        <Fragment key={p}>
                          {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ padding: '0 4px', color: 'var(--muted)' }}>…</span>}
                          <button
                            className={`page-btn${page === p ? ' active' : ''}`}
                            onClick={() => setPage(p)}
                          >
                            {p}
                          </button>
                        </Fragment>
                    ))}
                  {page < pages && (
                    <button className="page-btn" onClick={() => setPage(p => p + 1)}>›</button>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:900px){.list-layout{grid-template-columns:1fr!important}}
        @media(max-width:600px){.loc-input{display:none!important}}
      `}</style>
    </main>
  );
}
