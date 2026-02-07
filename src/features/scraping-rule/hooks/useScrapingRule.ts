import { useState, useEffect, useCallback } from 'react';
import { scrapingRuleApi } from '../services/scrapingRuleApi';
import { ScrapingRule } from '../services/types';

export function useScrapingRule(id: number) {
  const [rule, setRule] = useState<ScrapingRule | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRule = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await scrapingRuleApi.getById(id);
      setRule(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRule();
  }, [fetchRule]);

  return { rule, loading, error, refresh: fetchRule };
}
