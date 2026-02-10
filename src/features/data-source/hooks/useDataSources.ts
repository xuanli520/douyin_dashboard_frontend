import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [filters, setFilters] = useState<DataSourceFilter>(() => initialFilters || {
    page: 1,
    size: 10,
  });

  // 使用 ref 来存储当前 filters
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  
  // 标记是否已经执行过初始获取
  const hasFetchedInitially = useRef(false);

  // 定义获取数据的函数
  const fetchData = useCallback(async (currentFilters: DataSourceFilter = filters) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dataSourceApi.getAll(currentFilters);
      setData(response);
    } catch (err) {
      console.error('Failed to fetch data sources:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    let isCancelled = false;
    
    if (immediate) {
      const doFetch = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await dataSourceApi.getAll(filters);
          if (!isCancelled) {
            setData(response);
          }
        } catch (err) {
          if (!isCancelled) {
            console.error('Failed to fetch data sources:', err);
            setError(err as Error);
          }
        } finally {
          if (!isCancelled) {
            setLoading(false);
          }
        }
      };
      
      doFetch();
    }
    
    return () => {
      isCancelled = true;
    };
  }, [immediate, filters.page, filters.pageSize, filters.name, filters.type, filters.status]);

  const updateFilters = useCallback((newFilters: Partial<DataSourceFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const refetch = useCallback(() => {
    return fetchData(filters);
  }, [fetchData, filters]);

  return {
    data,
    loading,
    error,
    filters,
    updateFilters,
    refetch,
  };
}
