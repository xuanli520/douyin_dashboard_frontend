import { useState } from 'react';
import { scrapingRuleApi } from '../services/scrapingRuleApi';
import { ScrapingRule } from '../services/types';

export function useActivateScrapingRule() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const activate = async (id: number, active: boolean): Promise<ScrapingRule | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await scrapingRuleApi.activate(id, active);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { activate, loading, error };
}
