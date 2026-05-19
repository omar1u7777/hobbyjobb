// git commit: "feat(jobs): build JobFilter sidebar with category, price range, and distance options"

import { useState, useEffect, useCallback } from 'react';
import { jobService } from '../../services/jobService.js';

const DISTANCES = [
  { label: '1 km',  value: 1  },
  { label: '5 km',  value: 5  },
  { label: '10 km', value: 10 },
  { label: '25 km', value: 25 },
  { label: 'Alla',  value: null },
];

export default function JobFilter({ params, onChange }) {
  const [categories, setCategories] = useState([]);
  const [minPrice, setMinPrice]     = useState(params.minPrice ?? '');
  const [maxPrice, setMaxPrice]     = useState(params.maxPrice ?? '');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    jobService.getCategories().then(setCategories).catch(() => {});
  }, []);

  const setDistance = (km) => onChange({ radius: km });

  // BUG FIX: Use callback to read freshest state instead of stale closure values
  const applyPrice = useCallback(() => {
    onChange({ minPrice: minPrice || null, maxPrice: maxPrice || null });
  }, [minPrice, maxPrice, onChange]);

  const handleSliderChange = (e) => {
    const val = e.target.value;
    setMaxPrice(val);
    onChange({ minPrice: minPrice || null, maxPrice: val || null });
  };

  const reset = () => {
    setMinPrice('');
    setMaxPrice('');
    onChange({ category: null, radius: null, minPrice: null, maxPrice: null, sort: null });
  };

  const filterContent = (
    <>
      {/* Category */}
      <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border-light)' }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Kategori</h4>
        {categories.map(c => {
          // params.category can be an ID (number) or a string name (from LandingPage URL)
          const active = params.category == c.id || params.category === c.name;
          const handleToggle = () => onChange({ category: active ? null : c.id });

          return (
            <button
              key={c.id}
              type="button"
              onClick={handleToggle}
              aria-pressed={active}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 10px', borderRadius: 7, cursor: 'pointer',
                background: active ? 'var(--blue-light)' : 'transparent',
                color: active ? 'var(--blue)' : 'inherit',
                border: 'none',
                font: 'inherit',
                textAlign: 'left',
                transition: 'background .12s',
                marginBottom: 2,
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500 }}>
                <span>{c.icon}</span> {c.name}
              </span>
              <span style={{ fontSize: 12, color: active ? '#93C5FD' : 'var(--muted)', fontWeight: 600 }}>
                {c.job_count ?? ''}
              </span>
            </button>
          );
        })}
      </div>

      {/* Price */}
      <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border-light)' }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Prisspann</h4>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <input
            type="number"
            placeholder="Min kr"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
            onBlur={applyPrice}
            min="0"
            style={{ flex: 1, padding: '6px 8px', border: '1.5px solid var(--border)', borderRadius: 7, fontSize: 13, outline: 'none', fontFamily: 'var(--font)', boxSizing: 'border-box', minWidth: 0 }}
          />
          <input
            type="number"
            placeholder="Max kr"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            onBlur={applyPrice}
            min="0"
            style={{ flex: 1, padding: '6px 8px', border: '1.5px solid var(--border)', borderRadius: 7, fontSize: 13, outline: 'none', fontFamily: 'var(--font)', boxSizing: 'border-box', minWidth: 0 }}
          />
        </div>
        <input
          type="range"
          min="0"
          max="5000"
          value={maxPrice || 5000}
          onChange={handleSliderChange}
          style={{ width: '100%', accentColor: 'var(--blue)' }}
        />
      </div>

      {/* Distance */}
      <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border-light)' }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Avstånd</h4>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {DISTANCES.map(d => {
            const active = params.radius === d.value;
            return (
              <button
                key={d.label}
                onClick={() => setDistance(d.value)}
                style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                  border: '1.5px solid', cursor: 'pointer', transition: 'all .15s',
                  borderColor: active ? 'var(--blue)' : 'var(--border)',
                  background: active ? 'var(--blue)' : 'none',
                  color: active ? '#fff' : 'var(--muted)',
                }}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort */}
      <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border-light)' }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Sortering</h4>
        <select
          value={params.sort ?? ''}
          onChange={e => onChange({ sort: e.target.value || null })}
          style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'var(--font)', background: 'var(--bg)' }}
        >
          <option value="distance">Närmast</option>
          <option value="newest">Nyast</option>
          <option value="price_asc">Pris (lägst)</option>
          <option value="price_desc">Pris (högst)</option>
        </select>
      </div>

      <button
        onClick={reset}
        style={{
          width: '100%', padding: 10, borderRadius: 8, fontSize: 14, fontWeight: 600,
          color: 'var(--muted)', background: 'var(--border-light)', border: 'none',
          cursor: 'pointer', transition: 'background .15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--border-light)'}
      >
        Rensa filter
      </button>
    </>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="filter-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          display: 'none',
          width: '100%', padding: '12px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600,
          color: 'var(--blue)', background: 'var(--blue-light)', border: '1.5px solid var(--blue-mid)',
          cursor: 'pointer', transition: 'all .15s', marginBottom: 16,
          alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        {mobileOpen ? '✕ Stäng filter' : '☰ Visa filter'}
      </button>

      <aside className="job-filter" style={{
        background: 'var(--white)',
        borderRadius: 'var(--r)',
        border: '1px solid var(--border)',
        padding: 24,
        position: 'sticky',
        top: 88,
        zIndex: 1,
        overflow: 'hidden',
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', marginBottom: 14 }}>
          Filter
        </h3>
        {filterContent}
      </aside>

      <style>{`
        @media(max-width:900px){
          .filter-toggle{display:flex!important}
          .job-filter{position:static!important;display:${mobileOpen ? 'block' : 'none'}!important}
        }
      `}</style>
    </>
  );
}
