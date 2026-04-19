// git commit: "feat(hooks): add useJobs hook with filter params, loading, and error state"

import { useState, useEffect, useCallback } from 'react';
import { jobService } from '../services/jobService.js';

export function useJobs(initialParams = {}) {
  const [jobs, setJobs]     = useState([]);
  const [total, setTotal]   = useState(0);
  const [pages, setPages]   = useState(1);
  const [page, setPage]     = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchJobs = useCallback(async (p = params) => {
    setLoading(true);
    setError(null);
    try {
      const res = await jobService.getJobs({ ...p, page });
      const nextJobs = Array.isArray(res?.jobs)
        ? res.jobs
        : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];
      setJobs(nextJobs);
      setTotal(res?.total ?? res?.pagination?.total ?? nextJobs.length);
      setPages(res?.pages ?? res?.pagination?.totalPages ?? 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [params, page]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const updateParams = useCallback((next) => {
    setPage(1);
    setParams(prev => ({ ...prev, ...next }));
  }, []);

  return { jobs, total, pages, page, setPage, loading, error, params, updateParams, refetch: fetchJobs };
}
