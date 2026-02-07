import { useState, useEffect, useCallback, useRef } from 'react';
import { dataSourceApi } from '../services/dataSourceApi';
import { DataSource, DataSourceFilter, PaginatedResponse } from '../services/types';

interface UseDataSourcesOptions {
  immediate?: boolean;
}

export function useDataSources(
  initialFilters?: DataSourceFilter,
  options: UseDataSourcesOptions = {}
) {
  const { immediate = true } = options;

  const [data, setData] = useState<PaginatedResponse<DataSource>>({
    list: [],
    total: 0,
    page: 1,
    pageSize: 10,
    pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<DataSourceFilter>(() => initialFilters || {
    page: 1,
    pageSize: 10,
  });

  // 使用 ref 来存储当前 filters
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  
  // 标记是否已经执行过初始获取
  const hasFetchedInitially = useRef(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dataSourceApi.getAll(filtersRef.current);
      setData(response);
    } catch (err) {
      console.error('Failed to fetch data sources:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 处理 immediate 获取
  useEffect(() => {
    if (immediate && !hasFetchedInitially.current) {
      hasFetchedInitially.current = true;
      fetchData();
    }
  }, [immediate, fetchData]);

  const updateFilters = useCallback((newFilters: Partial<DataSourceFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return {
    data,
    loading,
    error,
    filters,
    updateFilters,
    fetchData,
    refetch: fetchData,
  };
}
