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
      label: 'Intäkt (SEK)',
      data: [9800, 11600, 12900, 14100, 15250, 16700],
      backgroundColor: ['#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8'],
      borderRadius: 6,
      borderSkipped: false,
    },
  ],
};

const FALLBACK_INCOME = {
  labels: incomeBarData.labels,
  platformValues: incomeBarData.datasets[0].data,
  grossValues: [46000, 55200, 61100, 68800, 73400, 80200],
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

export default function IncomeBarChart({
  labels = [],
  platformValues = [],
  grossValues = [],
  apiLive = false,
  loading = false,
}) {
  const finalLabels = labels.length > 0 ? labels : FALLBACK_INCOME.labels;
  const finalPlatformValues = platformValues.length > 0 ? platformValues : FALLBACK_INCOME.platformValues;
  const finalGrossValues = grossValues.length > 0 ? grossValues : FALLBACK_INCOME.grossValues;

  const data = {
    labels: finalLabels,
    datasets: [
      {
        label: 'Plattformsintakt (SEK)',
        data: finalPlatformValues,
        backgroundColor: ['#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8'],
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Bruttovolym (SEK)',
        data: finalGrossValues,
        backgroundColor: ['#FDE68A', '#FCD34D', '#FBBF24', '#F59E0B', '#D97706', '#B45309'],
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    ...incomeBarOptions,
    plugins: {
      ...incomeBarOptions.plugins,
      legend: {
        display: true,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
        },
      },
    },
    scales: {
      ...incomeBarOptions.scales,
      y: {
        ...incomeBarOptions.scales.y,
        ticks: {
          callback: (value) => `${Number(value).toLocaleString('sv-SE')} kr`,
        },
      },
    },
  };

  return (
    <article className="card" style={{ padding: 16 }}>
      <div style={{ marginBottom: 10 }}>
        <h2 style={{ fontSize: 16, marginBottom: 4 }}>Intäkt per månad</h2>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>
          {loading ? 'Laddar...' : apiLive ? 'Live-data: plattform + brutto' : 'Mock-data: plattform + brutto'}
        </p>
      </div>
      <div style={{ height: 220 }}>
        <Bar options={options} data={data} />
      </div>
    </article>
  );
}
