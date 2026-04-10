import { useState, useEffect } from 'react';
import { useAuth } from './useAuth.js';
import { userService } from '../services/userService.js';
export function useHobbyLimit() {
  const { user } = useAuth();
  const [totalYear, setTotalYear] = useState(user?.hobby_total_year ?? 0);
  const [loading, setLoading] = useState(false);
  useEffect(() => { if (!user) return; setLoading(true); userService.getMyIncome().then(d => setTotalYear(d.income?.totalEarned ?? d.totalYear ?? 0)).catch(() => {}).finally(() => setLoading(false)); }, [user?.id]);
  const pct = Math.min((totalYear / 30000) * 100, 100);
  return { totalYear, pct, isNear: totalYear >= 25000, isAt: totalYear >= 30000, remaining: Math.max(30000 - totalYear, 0), loading };
}
