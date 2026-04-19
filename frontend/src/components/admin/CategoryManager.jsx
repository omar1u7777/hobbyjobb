import { useMemo, useState } from 'react';

const INITIAL_CATEGORIES = [
  { id: 1, name: 'Handyman', maxPrice: 1500, status: 'Aktiv', description: 'Montering, enklare reparationer och fix' },
  { id: 2, name: 'Stadning', maxPrice: 1200, status: 'Aktiv', description: 'Hemstadning och storstadning' },
  { id: 3, name: 'Djurpassning', maxPrice: 900, status: 'Aktiv', description: 'Hundpromenad, kattpassning och tillsyn' },
  { id: 4, name: 'Flytt & Transport', maxPrice: 2200, status: 'Pausad', description: 'Mindre flyttar och lokal transport' },
];

function chipStyle(status) {
  if (status === 'Pausad') {
    return { background: 'var(--yellow-light)', color: 'var(--yellow-text)' };
  }

  return { background: 'var(--green-light)', color: 'var(--green-text)' };
}

const EMPTY_FORM = {
  name: '',
  maxPrice: '',
  status: 'Aktiv',
  description: '',
};

export default function CategoryManager() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;

    return categories.filter((category) => {
      const name = category.name.toLowerCase();
      const status = category.status.toLowerCase();
      const description = category.description.toLowerCase();
      return name.includes(q) || status.includes(q) || description.includes(q);
    });
  }, [categories, query]);

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      name: form.name.trim(),
      maxPrice: Number(form.maxPrice),
      status: form.status,
      description: form.description.trim(),
    };

    if (!payload.name || !payload.maxPrice || !payload.description) {
      return;
    }

    if (editingId) {
      setCategories((current) => current.map((category) => (category.id === editingId ? { ...category, ...payload } : category)));
      resetForm();
      return;
    }

    setCategories((current) => [{ id: Date.now(), ...payload }, ...current]);
    resetForm();
  }

  function handleDelete(categoryId) {
    setCategories((current) => current.filter((category) => category.id !== categoryId));
    if (editingId === categoryId) {
      resetForm();
    }
  }

  function handleEdit(category) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      maxPrice: String(category.maxPrice),
      status: category.status,
      description: category.description,
    });
  }

  return (
    <section className="section" style={{ marginBottom: 16 }}>
      <div className="section-hdr" style={{ marginBottom: 12 }}>
        <div>
          <h3>Kategorihantering</h3>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            Mockad admin-CRUD tills /api/admin/categories kopplas in
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 150px 130px', gap: 8, marginBottom: 10 }}>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
          placeholder="Kategorinamn"
          style={{ border: '1.5px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontSize: 13, fontFamily: 'var(--font)' }}
        />
        <input
          type="number"
          min="1"
          value={form.maxPrice}
          onChange={(e) => setForm((current) => ({ ...current, maxPrice: e.target.value }))}
          placeholder="Maxpris"
          style={{ border: '1.5px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontSize: 13, fontFamily: 'var(--font)' }}
        />
        <select
          value={form.status}
          onChange={(e) => setForm((current) => ({ ...current, status: e.target.value }))}
          style={{ border: '1.5px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontSize: 13, fontFamily: 'var(--font)', background: 'var(--white)' }}
        >
          <option value="Aktiv">Aktiv</option>
          <option value="Pausad">Pausad</option>
        </select>

        <textarea
          rows={2}
          value={form.description}
          onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
          placeholder="Kort beskrivning"
          style={{ gridColumn: '1 / -1', border: '1.5px solid var(--border)', borderRadius: 8, padding: '10px 12px', fontSize: 13, fontFamily: 'var(--font)', resize: 'vertical' }}
        />

        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
          <button
            type="submit"
            style={{ border: 'none', borderRadius: 8, padding: '9px 12px', fontWeight: 700, cursor: 'pointer', color: 'var(--white)', background: 'var(--blue)' }}
          >
            {editingId ? 'Spara andringar' : 'Lagg till kategori'}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontWeight: 700, cursor: 'pointer', color: 'var(--ink)', background: 'var(--white)' }}
            >
              Avbryt
            </button>
          ) : null}
        </div>
      </form>

      <div style={{ marginBottom: 10 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Sok kategori..."
          style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontSize: 13, fontFamily: 'var(--font)' }}
        />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', fontSize: 12, color: 'var(--muted)' }}>
              <th style={{ padding: '8px 6px' }}>Namn</th>
              <th style={{ padding: '8px 6px' }}>Maxpris</th>
              <th style={{ padding: '8px 6px' }}>Status</th>
              <th style={{ padding: '8px 6px' }}>Handling</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map((category) => (
              <tr key={category.id} style={{ borderTop: '1px solid var(--border-light)' }}>
                <td style={{ padding: '10px 6px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{category.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{category.description}</div>
                </td>
                <td style={{ padding: '10px 6px', fontSize: 13 }}>{category.maxPrice.toLocaleString('sv-SE')} kr</td>
                <td style={{ padding: '10px 6px' }}>
                  <span
                    style={{
                      ...chipStyle(category.status),
                      borderRadius: 999,
                      padding: '4px 10px',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {category.status}
                  </span>
                </td>
                <td style={{ padding: '10px 6px', whiteSpace: 'nowrap' }}>
                  <button
                    type="button"
                    onClick={() => handleEdit(category)}
                    style={{ border: 'none', background: 'transparent', color: 'var(--blue)', fontWeight: 700, cursor: 'pointer', marginRight: 10 }}
                  >
                    Redigera
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(category.id)}
                    style={{ border: 'none', background: 'transparent', color: 'var(--red)', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Ta bort
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
