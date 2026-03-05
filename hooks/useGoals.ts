import { useState, useEffect } from 'react';
import { get } from '@/lib/api';
import type { GetGoalsResponse } from '@/types/api';
import type { SavingsGoalRow } from '@/types/database';

export function useGoals() {
  const [goals, setGoals] = useState<SavingsGoalRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    void loadGoals();
  }, []);

  const loadGoals = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await get<GetGoalsResponse>('/goals');
      setGoals(response.goals);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    goals,
    isLoading,
    error,
    refreshGoals: loadGoals,
  };
}
