import { useState, useEffect, useCallback } from 'react';
import { dataSourceApi } from '../services/dataSourceApi';
import { ScrapingRule } from '@/features/scraping-rule/services/types';

export function useDataSourceRules(dataSourceId: number) {
  const [rules, setRules] = useState<ScrapingRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRules = useCallback(async () => {
    if (!dataSourceId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await dataSourceApi.getRules(dataSourceId);
      setRules(data);
    } catch (err) {
      console.error('Failed to fetch data source rules:', err);
      setError(err as Error);
      setRules([]); // Clear or keep previous? Clearing is safer on error.
    } finally {
      setLoading(false);
    }
  }, [dataSourceId]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  return { rules, loading, error, refresh: fetchRules };
}
