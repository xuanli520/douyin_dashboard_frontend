import { useState, useEffect, useCallback } from 'react';
import { scrapingRuleApi } from '../services/scrapingRuleApi';
import { ScrapingRuleListItem, PaginatedData, PageMeta } from '@/types';

interface ScrapingRuleFilter {
  name?: string;
  target_type?: string;
  status?: string;
  data_source_id?: number;
  page?: number;
  size?: number;
}

interface PaginatedScrapingRuleResponse {
  items: ScrapingRuleListItem[];
  meta: PageMeta;
}

export function useScrapingRules(initialFilters?: ScrapingRuleFilter) {
  const [data, setData] = useState<PaginatedScrapingRuleResponse>({
    items: [],
    meta: {
      page: 1,
      size: 10,
      total: 0,
      pages: 0,
      has_next: false,
      has_prev: false,
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<ScrapingRuleFilter>(initialFilters || {
    page: 1,
    size: 10,
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
