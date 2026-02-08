import { useState, useEffect, useCallback } from 'react';
import { dataSourceApi } from '../services/dataSourceApi';
import { DataSourceResponse, PaginatedData, PageMeta } from '@/types';

interface DataSourceFilter {
  name?: string;
  status?: string;
  source_type?: string;
  page?: number;
  size?: number;
}

interface PaginatedDataSourceResponse {
  items: DataSourceResponse[];
  meta: PageMeta;
}

export function useDataSources(initialFilters?: DataSourceFilter) {
  const [data, setData] = useState<PaginatedDataSourceResponse>({
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
  const [filters, setFilters] = useState<DataSourceFilter>(initialFilters || {
    page: 1,
    size: 10,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dataSourceApi.getAll(filters);
      setData(response);
    } catch (err) {
      console.error('Failed to fetch data sources:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateFilters = (newFilters: Partial<DataSourceFilter>) => {
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
