import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const FALLBACK_LABELS = ['Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul'];
const FALLBACK_PLATFORM = [980, 1160, 1290, 1410, 1525, 1670];
const FALLBACK_GROSS = [9800, 11600, 12900, 14100, 15250, 16700];

const incomeBarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        usePointStyle: true,
        boxWidth: 8,
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: '#F1F5F9',
      },
      ticks: {
        callback: (value) => `${Number(value).toLocaleString('sv-SE')} kr`,
      },
    },
  },
};

export default function IncomeBarChart({
  labels = [],
  platformRevenue = [],
  grossVolume = [],
  apiLive = false,
  loading = false,
}) {
  const chartLabels = labels.length > 0 ? labels : FALLBACK_LABELS;
  const platformValues = platformRevenue.length > 0 ? platformRevenue : FALLBACK_PLATFORM;
  const grossValues = grossVolume.length > 0 ? grossVolume : FALLBACK_GROSS;

  const incomeBarData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Plattformsintäkt (SEK)',
        data: platformValues,
        backgroundColor: '#2563EB',
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Bruttovolym (SEK)',
        data: grossValues,
        backgroundColor: '#93C5FD',
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  return (
    <article className="card" style={{ padding: 16 }}>
      <div style={{ marginBottom: 10 }}>
        <h2 style={{ fontSize: 16, marginBottom: 4 }}>Intäkt per månad</h2>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>
          {loading
            ? 'Laddar intäktsdata...'
            : apiLive
              ? 'Live-data från /api/admin/charts'
              : 'Plattformens intäkt under senaste halvåret (mock)'}
        </p>
      </div>
      <div style={{ height: 220 }}>
        <Bar options={incomeBarOptions} data={incomeBarData} />
      </div>
    </article>
  );
}
