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

const incomeBarData = {
  labels: ['Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul'],
  datasets: [
    {
      label: 'Intakt (SEK)',
      data: [9800, 11600, 12900, 14100, 15250, 16700],
      backgroundColor: ['#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8'],
      borderRadius: 6,
      borderSkipped: false,
    },
  ],
};

const incomeBarOptions = {
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
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: '#F1F5F9',
      },
      ticks: {
        callback: (value) => `${value.toLocaleString('sv-SE')} kr`,
      },
    },
  },
};

export default function IncomeBarChart() {
  return (
    <article className="card" style={{ padding: 16 }}>
      <div style={{ marginBottom: 10 }}>
        <h2 style={{ fontSize: 16, marginBottom: 4 }}>Intakt per manad</h2>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>Plattformens intakt under senaste halvaret</p>
      </div>
      <div style={{ height: 220 }}>
        <Bar options={incomeBarOptions} data={incomeBarData} />
      </div>
    </article>
  );
}
