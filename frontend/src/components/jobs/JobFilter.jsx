import { useState, useEffect } from 'react';
import { jobService } from '../../services/jobService.js';
export default function JobFilter({ params, onChange }) {
  const [categories, setCategories] = useState([]);
  const [minP, setMinP] = useState(''); const [maxP, setMaxP] = useState('');
  useEffect(() => { jobService.getCategories().then(setCategories).catch(() => {}); }, []);
  return <aside style={{ background: 'var(--white)', borderRadius: 'var(--r)', border: '1px solid var(--border)', padding: 24, position: 'sticky', top: 88 }}><h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>Filter</h3><div style={{ marginBottom: 24 }}><h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Kategori</h4>{categories.map(c => <div key={c.id} onClick={() => onChange({ category: c.id === params.category ? null : c.id })} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 7, cursor: 'pointer', background: params.category === c.id ? 'var(--blue-light)' : 'transparent', color: params.category === c.id ? 'var(--blue)' : 'inherit', fontSize: 14, fontWeight: 500, marginBottom: 2 }}><span>{c.icon}</span> {c.name}</div>)}</div><button onClick={() => { setMinP(''); setMaxP(''); onChange({ category: null, minPrice: null, maxPrice: null, sort: null }); }} style={{ width: '100%', padding: 10, borderRadius: 8, fontSize: 14, fontWeight: 600, color: 'var(--muted)', background: 'var(--border-light)', border: 'none', cursor: 'pointer' }}>Rensa filter</button></aside>;
}
