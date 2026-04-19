import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const categoryPieData = {
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

export default function CategoryPieChart() {
  return (
    <article className="card" style={{ padding: 16 }}>
      <div style={{ marginBottom: 10 }}>
        <h2 style={{ fontSize: 16, marginBottom: 4 }}>Kategori-fordelning</h2>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>Aktiva jobb i plattformen</p>
      </div>
      <div style={{ height: 240 }}>
        <Doughnut options={categoryPieOptions} data={categoryPieData} />
      </div>
    </article>
  );
}
