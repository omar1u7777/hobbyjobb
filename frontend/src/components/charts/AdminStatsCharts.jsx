import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService.js';
import JobsOverTimeChart from './JobsOverTimeChart.jsx';
import CategoryPieChart from './CategoryPieChart.jsx';
import IncomeBarChart from './IncomeBarChart.jsx';

const FALLBACK_CHARTS = {
  jobsOverTime: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul'],
    values: [42, 51, 57, 63, 71, 76, 84],
  },
  categoryDistribution: {
    labels: ['Handyman', 'Städning', 'Djur', 'Trädgård', 'Flytt'],
    values: [32, 19, 14, 22, 11],
  },
  incomeOverTime: {
    labels: ['Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul'],
    platformRevenue: [980, 1160, 1290, 1410, 1525, 1670],
    grossVolume: [9800, 11600, 12900, 14100, 15250, 16700],
  },
};

function sanitizeArray(input) {
  return Array.isArray(input) ? input : [];
}

function normalizeCharts(payload) {
  return {
    jobsOverTime: {
      labels: sanitizeArray(payload?.jobsOverTime?.labels),
      values: sanitizeArray(payload?.jobsOverTime?.values),
    },
    categoryDistribution: {
      labels: sanitizeArray(payload?.categoryDistribution?.labels),
      values: sanitizeArray(payload?.categoryDistribution?.values),
    },
    incomeOverTime: {
      labels: sanitizeArray(payload?.incomeOverTime?.labels),
      platformRevenue: sanitizeArray(payload?.incomeOverTime?.platformRevenue),
      grossVolume: sanitizeArray(payload?.incomeOverTime?.grossVolume),
    },
  };
}

export default function AdminStatsCharts() {
  const [charts, setCharts] = useState(FALLBACK_CHARTS);
  const [apiLive, setApiLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadCharts() {
      try {
        const apiCharts = await adminService.getCharts();
        if (cancelled || !apiCharts) return;

        const normalized = normalizeCharts(apiCharts);
        const hasCoreData = normalized.jobsOverTime.labels.length > 0;

        if (hasCoreData) {
          setCharts(normalized);
          setApiLive(true);
        }
      } catch (_) {
        // Keep fallback charts on failure
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCharts();
    return () => {
      cancelled = true;
    };
  }, []);

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
        <JobsOverTimeChart
          labels={charts.jobsOverTime.labels}
          values={charts.jobsOverTime.values}
          apiLive={apiLive}
          loading={loading}
        />
        <CategoryPieChart
          labels={charts.categoryDistribution.labels}
          values={charts.categoryDistribution.values}
          apiLive={apiLive}
          loading={loading}
        />
      </div>

      <div className="admin-charts-bottom" style={{ display: 'grid', gridTemplateColumns: '1fr' }}>
        <IncomeBarChart
          labels={charts.incomeOverTime.labels}
          platformRevenue={charts.incomeOverTime.platformRevenue}
          grossVolume={charts.incomeOverTime.grossVolume}
          apiLive={apiLive}
          loading={loading}
        />
      </div>
    </section>
  );
}
