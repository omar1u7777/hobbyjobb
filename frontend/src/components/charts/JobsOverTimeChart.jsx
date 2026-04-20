import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

const jobsOverTimeOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      grid: {
        color: '#F1F5F9',
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: '#F1F5F9',
      },
      ticks: {
        precision: 0,
      },
    },
  },
};

const FALLBACK_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul'];
const FALLBACK_VALUES = [42, 51, 57, 63, 71, 76, 84];

export default function JobsOverTimeChart({ labels = [], values = [], apiLive = false, loading = false }) {
  const chartLabels = labels.length > 0 ? labels : FALLBACK_LABELS;
  const chartValues = values.length > 0 ? values : FALLBACK_VALUES;

  const jobsOverTimeData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Publicerade jobb',
        data: chartValues,
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.14)',
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 4,
      },
    ],
  };

  return (
    <article className="card" style={{ padding: 16 }}>
      <div style={{ marginBottom: 10 }}>
        <h2 style={{ fontSize: 16, marginBottom: 4 }}>Jobb över tid</h2>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>
          {loading
            ? 'Laddar trenddata...'
            : apiLive
              ? 'Live-data från /api/admin/charts'
              : 'Mockad trend för senaste månaderna'}
        </p>
      </div>
      <div style={{ height: 240 }}>
        <Line options={jobsOverTimeOptions} data={jobsOverTimeData} />
      </div>
    </article>
  );
}
