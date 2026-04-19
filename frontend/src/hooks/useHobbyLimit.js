// git commit: "feat(hooks): add useHobbyLimit hook to fetch and expose income limit state"

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth.js';
import { userService } from '../services/userService.js';
import { calcPct, isNearLimit, isAtLimit, remainingAmount } from '../utils/hobbyLimits.js';

export function useHobbyLimit() {
  const { user } = useAuth();
  const userId = user?.id;
  const [totalYear, setTotalYear] = useState(user?.hobby_total_year ?? 0);
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    userService.getMyIncome()
      .then((income) => {
        const total = income?.total ?? income?.totalEarned ?? income?.totalYear ?? income?.total_year ?? 0;
        setTotalYear(Number(total) || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  return {
    totalYear,
    pct:       calcPct(totalYear),
    isNear:    isNearLimit(totalYear),
    isAt:      isAtLimit(totalYear),
    remaining: remainingAmount(totalYear),
    loading,
  };
}
