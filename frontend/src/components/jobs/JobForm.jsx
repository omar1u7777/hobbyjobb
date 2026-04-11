// git commit: "feat(jobs): build reusable JobForm used by PostJobPage for create and edit"

import { useState, useEffect } from 'react';
import { jobService } from '../../services/jobService.js';
import { validators } from '../../utils/validators.js';
import HobbyIncomeWarning from './HobbyIncomeWarning.jsx';
import Spinner from '../common/Spinner.jsx';

const INITIAL = {
  title: '', description: '', categoryId: '', location: '',
  date: '', price: '', priceType: 'fixed', hobbyType: 'one-time',
};

export default function JobForm({ initial = {}, onSubmit, loading, totalYear = 0 }) {
  const [form, setForm]         = useState({ ...INITIAL, ...initial });
  const [errors, setErrors]     = useState({});
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    jobService.getCategories().then(setCategories).catch(() => {});
  }, []);

  const change = (field) => (e) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    e.title       = validators.required(form.title);
    e.description = validators.run(form.description, validators.required, validators.minLength(30));
    e.categoryId  = validators.required(form.categoryId);
    e.location    = validators.required(form.location);
    e.price       = validators.price(form.price);
    setErrors(e);
    return !Object.values(e).some(Boolean);
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    // Convert camelCase to snake_case for API
    const payload = {
      title: form.title,
      description: form.description,
      price: form.price,
      category_id: form.categoryId,
      location: form.location,
      lat: form.lat,
      lng: form.lng,
      hobby_type: form.hobbyType,
      date: form.date,
      time: form.time,
      price_type: form.priceType,
    };
    onSubmit(payload);
  };

  const fieldStyle = (key) => errors[key] ? { borderColor: 'var(--red)' } : {};

  return (
    <form onSubmit={handleSubmit} noValidate>
      <HobbyIncomeWarning totalYear={totalYear} jobPrice={form.price} />

      {/* Basic info */}
      <div style={{ background: 'var(--white)', borderRadius: 'var(--r)', border: '1px solid var(--border)', padding: 28, marginBottom: 20 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--border-light)' }}>
          📝 Grundläggande information
        </h2>

        <div className="form-group">
          <label htmlFor="jf-title">Jobbtitel *</label>
          <input
            id="jf-title" type="text" maxLength={80}
            placeholder="t.ex. Gräsklippning och kantskärning"
            value={form.title} onChange={change('title')} style={fieldStyle('title')}
          />
          <p className="hint">{form.title.length}/80 tecken</p>
          {errors.title && <p className="error">{errors.title}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="jf-desc">Beskrivning *</label>
          <textarea
            id="jf-desc" rows={5}
            placeholder="Beskriv vad som ska göras, hur lång tid det tar, vilken utrustning som behövs..."
            value={form.description} onChange={change('description')} style={fieldStyle('description')}
          />
          {errors.description && <p className="error">{errors.description}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="jf-category">Kategori *</label>
          <select id="jf-category" value={form.categoryId} onChange={change('categoryId')} style={fieldStyle('categoryId')}>
            <option value="">Välj kategori...</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          {errors.categoryId && <p className="error">{errors.categoryId}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="jf-type">Jobbtyp</label>
          <select id="jf-type" value={form.hobbyType} onChange={change('hobbyType')}>
            <option value="one-time">Engångsjobb</option>
            <option value="recurring">Återkommande</option>
            <option value="flexible">Flexibelt</option>
          </select>
        </div>
      </div>

      {/* Location & date */}
      <div style={{ background: 'var(--white)', borderRadius: 'var(--r)', border: '1px solid var(--border)', padding: 28, marginBottom: 20 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--border-light)' }}>
          📍 Plats & datum
        </h2>

        <div className="form-group">
          <label htmlFor="jf-location">Plats *</label>
          <input
            id="jf-location" type="text"
            placeholder="t.ex. Östermalm, Stockholm eller Ringvägen 10"
            value={form.location} onChange={change('location')} style={fieldStyle('location')}
          />
          {errors.location && <p className="error">{errors.location}</p>}
        </div>

        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="jf-date">Datum</label>
            <input id="jf-date" type="date" value={form.date} onChange={change('date')} min={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="jf-time">Tid (valfritt)</label>
            <input id="jf-time" type="time" value={form.time ?? ''} onChange={change('time')} />
          </div>
        </div>
      </div>

      {/* Price */}
      <div style={{ background: 'var(--white)', borderRadius: 'var(--r)', border: '1px solid var(--border)', padding: 28, marginBottom: 28 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--border-light)' }}>
          💰 Ersättning
        </h2>

        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="jf-price">Pris (kr) *</label>
            <input id="jf-price" type="number" placeholder="0" min="0" max="30000"
              value={form.price} onChange={change('price')} style={fieldStyle('price')} />
            {errors.price && <p className="error">{errors.price}</p>}
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="jf-pricetype">Pristyp</label>
            <select id="jf-pricetype" value={form.priceType} onChange={change('priceType')}>
              <option value="fixed">Fast pris</option>
              <option value="hourly">Per timme</option>
              <option value="negotiable">Förhandlingsbart</option>
            </select>
          </div>
        </div>

        <div style={{ background: 'var(--blue-light)', borderRadius: 8, padding: '12px 14px', marginTop: 16, fontSize: 13, color: 'var(--blue)' }}>
          ℹ️ HobbyJobb tar <strong>8% provision</strong> vid genomfört uppdrag. Du får <strong>{form.price ? Math.round(form.price * 0.92) : '—'} kr</strong> om priset är {form.price || '—'} kr.
        </div>
      </div>

      <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
        {loading ? <Spinner size={18} color="#fff" /> : (initial.id ? '💾 Spara ändringar' : '🚀 Publicera jobb')}
      </button>
    </form>
  );
}
