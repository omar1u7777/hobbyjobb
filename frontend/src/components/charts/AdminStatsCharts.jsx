import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul'];

const revenueData = {
  labels: MONTHS,
  datasets: [
    {
      label: 'Plattformsintakt (SEK)',
      data: [8500, 9800, 11600, 12900, 14100, 15250, 16700],
      borderColor: '#2563EB',
      backgroundColor: 'rgba(37, 99, 235, 0.15)',
      fill: true,
      tension: 0.35,
      pointRadius: 3,
      pointHoverRadius: 4,
    },
  ],
};

const revenueOptions = {
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
        callback: (value) => `${value.toLocaleString('sv-SE')} kr`,
      },
    },
  },
};

const categoryData = {
  labels: ['Handyman', 'Stadning', 'Djur', 'Tradgard', 'Flytt'],
  datasets: [
    {
      label: 'Jobb per kategori',
      data: [32, 19, 14, 22, 11],
      backgroundColor: ['#2563EB', '#0EA5E9', '#16A34A', '#D97706', '#DC2626'],
      borderColor: '#FFFFFF',
      borderWidth: 2,
      hoverOffset: 6,
    },
  ],
};

const categoryOptions = {
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

export default function AdminStatsCharts() {
  return (
    <section
      className="admin-charts-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: '1.3fr 1fr',
        gap: 12,
        marginBottom: 16,
      }}
    >
      <article className="card" style={{ padding: 16 }}>
        <div style={{ marginBottom: 10 }}>
          <h2 style={{ fontSize: 16, marginBottom: 4 }}>Intakt per manad</h2>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>Mockad utveckling senaste 7 manaderna</p>
        </div>
        <div style={{ height: 250 }}>
          <Line options={revenueOptions} data={revenueData} />
        </div>
      </article>

      <article className="card" style={{ padding: 16 }}>
        <div style={{ marginBottom: 10 }}>
          <h2 style={{ fontSize: 16, marginBottom: 4 }}>Fordelning per kategori</h2>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>Aktiva jobb i systemet</p>
        </div>
        <div style={{ height: 250 }}>
          <Doughnut options={categoryOptions} data={categoryData} />
        </div>
      </article>
    </section>
  );
}
