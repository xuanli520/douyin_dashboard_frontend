import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { dataSourceApi, DataSourceFilter } from '../services/dataSourceApi';
import { DataSourceResponse, PageMeta } from '@/types';

interface PaginatedDataSourceResponse {
  items: DataSourceResponse[];
  meta: PageMeta;
}

function normalizeFilters(filters?: DataSourceFilter): DataSourceFilter {
  return {
    page: filters?.page ?? 1,
    size: filters?.size ?? 10,
    name: filters?.name,
    status: filters?.status,
    source_type: filters?.source_type,
  };
}

function isSameFilter(a: DataSourceFilter, b: DataSourceFilter): boolean {
  return (
    a.page === b.page
    && a.size === b.size
    && a.name === b.name
    && a.status === b.status
    && a.source_type === b.source_type
  );
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
  const [filters, setFilters] = useState<DataSourceFilter>(() => normalizeFilters(initialFilters));

  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!initialFilters) {
      return;
    }
    const next = normalizeFilters(initialFilters);
    setFilters(prev => (isSameFilter(prev, next) ? prev : next));
  }, [
    initialFilters?.name,
    initialFilters?.status,
    initialFilters?.source_type,
    initialFilters?.page,
    initialFilters?.size,
  ]);

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
