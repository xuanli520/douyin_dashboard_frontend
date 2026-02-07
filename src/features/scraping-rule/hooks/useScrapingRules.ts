import { useState, useEffect, useCallback } from 'react';
import { scrapingRuleApi } from '../services/scrapingRuleApi';
import { ScrapingRule, ScrapingRuleFilter, PaginatedResponse } from '../services/types';

export function useScrapingRules(initialFilters?: ScrapingRuleFilter) {
  const [data, setData] = useState<PaginatedResponse<ScrapingRule>>({
    list: [],
    total: 0,
    page: 1,
    pageSize: 10,
    pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<ScrapingRuleFilter>(initialFilters || {
    page: 1,
    pageSize: 10,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await scrapingRuleApi.getAll(filters);
      setData(response);
    } catch (err) {
      console.error('Failed to fetch scraping rules:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateFilters = (newFilters: Partial<ScrapingRuleFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const refresh = () => {
    fetchData();
  };

  return {
    data,
    loading,
    error,
    filters,
    updateFilters,
    refresh
  };
}
