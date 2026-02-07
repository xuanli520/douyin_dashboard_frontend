import { useState, useEffect, useCallback } from 'react';
import { dataSourceApi } from '../services/dataSourceApi';
import { DataSource, DataSourceFilter, PaginatedResponse } from '../services/types';

export function useDataSources(initialFilters?: DataSourceFilter) {
  const [data, setData] = useState<PaginatedResponse<DataSource>>({
    list: [],
    total: 0,
    page: 1,
    pageSize: 10,
    pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<DataSourceFilter>(initialFilters || {
    page: 1,
    pageSize: 10,
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
