import JobsOverTimeChart from './JobsOverTimeChart.jsx';
import CategoryPieChart from './CategoryPieChart.jsx';
import IncomeBarChart from './IncomeBarChart.jsx';

export default function AdminStatsCharts() {
  return (
    <section className="admin-charts-grid" style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
      <div
        className="admin-charts-top"
        style={{
          display: 'grid',
          gridTemplateColumns: '1.3fr 1fr',
          gap: 12,
        }}
      >
        <JobsOverTimeChart />
        <CategoryPieChart />
      </div>

      <div className="admin-charts-bottom" style={{ display: 'grid', gridTemplateColumns: '1fr' }}>
        <IncomeBarChart />
      </div>
    </section>
  );
}
