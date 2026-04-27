import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService.js';
import JobsOverTimeChart from './JobsOverTimeChart.jsx';
import CategoryPieChart from './CategoryPieChart.jsx';
import IncomeBarChart from './IncomeBarChart.jsx';

const FALLBACK_CHARTS = {
  jobsOverTime: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun'],
    values: [42, 51, 57, 63, 71, 76],
  },
  incomeOverTime: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun'],
    platformValues: [9800, 11600, 12900, 14100, 15250, 16700],
    grossValues: [46000, 55200, 61100, 68800, 73400, 80200],
  },
  categoryDistribution: {
    labels: ['Handyman', 'Stadning', 'Djur', 'Tradgard', 'Flytt'],
    values: [32, 19, 14, 22, 11],
  },
};

const sanitizeArray = (value) => (Array.isArray(value) ? value : []);

const sanitizeNumberArray = (value) => sanitizeArray(value).map((n) => Number(n) || 0);

const sanitizeLabelArray = (value) => sanitizeArray(value).map((label) => String(label || ''));

function normalizeCharts(payload) {
  const source = payload && typeof payload === 'object' ? payload : {};
  const jobs = source.jobsOverTime || {};
  const income = source.incomeOverTime || {};
  const category = source.categoryDistribution || {};

  return {
    jobsOverTime: {
      labels: sanitizeLabelArray(jobs.labels),
      values: sanitizeNumberArray(jobs.values),
    },
    incomeOverTime: {
      labels: sanitizeLabelArray(income.labels),
      platformValues: sanitizeNumberArray(income.platformValues),
      grossValues: sanitizeNumberArray(income.grossValues),
    },
    categoryDistribution: {
      labels: sanitizeLabelArray(category.labels),
      values: sanitizeNumberArray(category.values),
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
        const payload = await adminService.getCharts();
        if (cancelled) return;

        const normalized = normalizeCharts(payload);
        setCharts({
          jobsOverTime:
            normalized.jobsOverTime.labels.length > 0 && normalized.jobsOverTime.values.length > 0
              ? normalized.jobsOverTime
              : FALLBACK_CHARTS.jobsOverTime,
          incomeOverTime:
            normalized.incomeOverTime.labels.length > 0 && normalized.incomeOverTime.platformValues.length > 0
              ? normalized.incomeOverTime
              : FALLBACK_CHARTS.incomeOverTime,
          categoryDistribution:
            normalized.categoryDistribution.labels.length > 0 && normalized.categoryDistribution.values.length > 0
              ? normalized.categoryDistribution
              : FALLBACK_CHARTS.categoryDistribution,
        });
        setApiLive(true);
      } catch (_) {
        // Keep fallback charts
      } finally {
        if (!cancelled) setLoading(false);
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
        <JobsOverTimeChart labels={charts.jobsOverTime.labels} values={charts.jobsOverTime.values} apiLive={apiLive} loading={loading} />
        <CategoryPieChart labels={charts.categoryDistribution.labels} values={charts.categoryDistribution.values} apiLive={apiLive} loading={loading} />
      </div>

      <div className="admin-charts-bottom" style={{ display: 'grid', gridTemplateColumns: '1fr' }}>
        <IncomeBarChart
          labels={charts.incomeOverTime.labels}
          platformValues={charts.incomeOverTime.platformValues}
          grossValues={charts.incomeOverTime.grossValues}
          apiLive={apiLive}
          loading={loading}
        />
      </div>
    </section>
  );
}
