// git commit: "feat(jobs): add CategoryBadge component for job category display"

const CATEGORY_COLORS = {
  'Hem & Trädgård':   { bg: '#D1FAE5', color: '#065F46' },
  'Djur & Husdjur':   { bg: '#FEF3C7', color: '#92400E' },
  'Flytt & Transport':{ bg: '#DBEAFE', color: '#1E40AF' },
  'Handyman':         { bg: '#EDE9FE', color: '#5B21B6' },
  'IT & Teknik':      { bg: '#ECFDF5', color: '#064E3B' },
  'Städning':         { bg: '#FDF4FF', color: '#6B21A8' },
  'Ärenden':          { bg: '#FFF7ED', color: '#9A3412' },
  'Kreativt':         { bg: '#FDF2F8', color: '#9D174D' },
  'Undervisning':     { bg: '#F0FDF4', color: '#14532D' },
  'Träning & Hälsa':  { bg: '#F0F9FF', color: '#0C4A6E' },
};

const ICONS = {
  'Hem & Trädgård':   '🌿',
  'Djur & Husdjur':   '🐶',
  'Flytt & Transport':'🚛',
  'Handyman':         '🔧',
  'IT & Teknik':      '💻',
  'Städning':         '🧹',
  'Ärenden':          '🛍️',
  'Kreativt':         '🎨',
  'Undervisning':     '📚',
  'Träning & Hälsa':  '🏋️',
};

export function getCategoryIcon(name) { return ICONS[name] ?? '📌'; }

export default function CategoryBadge({ name, size = 'sm' }) {
  const colors = CATEGORY_COLORS[name] ?? { bg: 'var(--blue-light)', color: 'var(--blue)' };
  return (
    <span style={{
      background: colors.bg,
      color: colors.color,
      borderRadius: 4,
      padding: size === 'sm' ? '2px 8px' : '4px 12px',
      fontSize: size === 'sm' ? 11 : 13,
      fontWeight: 700,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
    }}>
      {getCategoryIcon(name)} {name}
    </span>
  );
}
