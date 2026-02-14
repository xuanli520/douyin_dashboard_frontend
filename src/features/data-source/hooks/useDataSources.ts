import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { dataSourceApi } from '../services/dataSourceApi';
import { DataSourceResponse, PageMeta } from '@/types';

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
  const pathname = usePathname();
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

  const requestIdRef = useRef(0);

  const fetchData = useCallback(async (currentFilters: DataSourceFilter) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const response = await dataSourceApi.getAll(currentFilters);
      if (requestId === requestIdRef.current) {
        setData(response);
      }
      return response;
    } catch (err) {
      if (requestId === requestIdRef.current) {
        setError(err as Error);
      }
      console.error('Failed to fetch data sources:', err);
      throw err;
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    fetchData(filters).catch(err => {
      if (!isCancelled) {
        console.error(err);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [pathname, filters, fetchData]);

  const updateFilters = useCallback((newFilters: Partial<DataSourceFilter>) => {
    setFilters(prev => {
      const next = { ...prev, ...newFilters };
      const changed = Object.keys(next).some(
        key => prev[key as keyof DataSourceFilter] !== next[key as keyof DataSourceFilter],
      );
      return changed ? next : prev;
    });
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
