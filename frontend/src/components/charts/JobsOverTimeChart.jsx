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

const jobsOverTimeData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul'],
  datasets: [
    {
      label: 'Publicerade jobb',
      data: [42, 51, 57, 63, 71, 76, 84],
      borderColor: '#2563EB',
      backgroundColor: 'rgba(37, 99, 235, 0.14)',
      fill: true,
      tension: 0.35,
      pointRadius: 3,
      pointHoverRadius: 4,
    },
  ],
};

const FALLBACK_JOBS = {
  labels: jobsOverTimeData.labels,
  values: jobsOverTimeData.datasets[0].data,
};

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

export default function JobsOverTimeChart({ labels = [], values = [], apiLive = false, loading = false }) {
  const finalLabels = labels.length > 0 ? labels : FALLBACK_JOBS.labels;
  const finalValues = values.length > 0 ? values : FALLBACK_JOBS.values;

  const data = {
    labels: finalLabels,
    datasets: [
      {
        ...jobsOverTimeData.datasets[0],
        data: finalValues,
      },
    ],
  };

  return (
    <article className="card" style={{ padding: 16 }}>
      <div style={{ marginBottom: 10 }}>
        <h2 style={{ fontSize: 16, marginBottom: 4 }}>Jobb över tid</h2>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>
          {loading ? 'Laddar...' : apiLive ? 'Live-data senaste 6 manaderna' : 'Mock-data senaste 6 manaderna'}
        </p>
      </div>
      <div style={{ height: 240 }}>
        <Line options={jobsOverTimeOptions} data={data} />
      </div>
    </article>
  );
}
