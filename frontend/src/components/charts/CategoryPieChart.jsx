import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const FALLBACK_LABELS = ['Handyman', 'Städning', 'Djur', 'Trädgård', 'Flytt'];
const FALLBACK_VALUES = [32, 19, 14, 22, 11];
const PALETTE = ['#2563EB', '#0EA5E9', '#16A34A', '#D97706', '#DC2626', '#7C3AED', '#1D4ED8'];

const categoryPieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        boxWidth: 8,
      },
    },
  },
};

export default function CategoryPieChart({ labels = [], values = [], apiLive = false, loading = false }) {
  const chartLabels = labels.length > 0 ? labels : FALLBACK_LABELS;
  const chartValues = values.length > 0 ? values : FALLBACK_VALUES;

  const categoryPieData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Jobb per kategori',
        data: chartValues,
        backgroundColor: chartLabels.map((_, index) => PALETTE[index % PALETTE.length]),
        borderColor: '#FFFFFF',
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  return (
    <article className="card" style={{ padding: 16 }}>
      <div style={{ marginBottom: 10 }}>
        <h2 style={{ fontSize: 16, marginBottom: 4 }}>Kategori-fördelning</h2>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>
          {loading
            ? 'Laddar kategoridata...'
            : apiLive
              ? 'Live-data från /api/admin/charts'
              : 'Aktiva jobb i plattformen (mock)'}
        </p>
      </div>
      <div style={{ height: 240 }}>
        <Doughnut options={categoryPieOptions} data={categoryPieData} />
      </div>
    </article>
  );
}
