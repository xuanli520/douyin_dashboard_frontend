import { useState } from 'react';
import { scrapingRuleApi } from '../services/scrapingRuleApi';
import { ScrapingRuleResponse } from '@/types';

export function useActivateScrapingRule() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const setActive = async (id: number, active: boolean): Promise<ScrapingRuleResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = active
        ? await scrapingRuleApi.activate(id)
        : await scrapingRuleApi.deactivate(id);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { setActive, loading, error };
}
