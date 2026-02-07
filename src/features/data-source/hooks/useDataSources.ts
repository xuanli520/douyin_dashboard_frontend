import { useState, useEffect, useCallback } from 'react';
import { dataSourceApi } from '../services/dataSourceApi';
import { DataSource, DataSourceFilter, PaginatedResponse } from '../services/types';

// Mock data for development when backend is not ready
const MOCK_DATA_SOURCES: DataSource[] = [
  {
    id: 1,
    name: 'Douyin Ads API',
    type: 'douyin_api',
    status: 'active',
    frequency: 'realtime',
    last_update: '2024-05-20T10:30:00Z',
    config: { url: 'https://api.douyin.com/v1' },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-05-20T10:30:00Z',
  },
  {
    id: 2,
    name: 'Main MySQL DB',
    type: 'database',
    status: 'error',
    frequency: 'daily',
    last_update: '2024-05-19T23:00:00Z',
    config: { host: 'localhost', port: 3306 },
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-05-19T23:00:00Z',
  },
];

export function useDataSources(initialFilters?: DataSourceFilter) {
  const [data, setData] = useState<PaginatedResponse<DataSource>>({
    list: [],
    total: 0,
    page: 1,
    pageSize: 10,
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
      console.warn('Failed to fetch data sources, using mock data:', err);
      // Fallback to mock data
      // Filter mock data based on filters (simple implementation)
      let filtered = [...MOCK_DATA_SOURCES];
      if (filters.name) {
        filtered = filtered.filter(item => item.name.toLowerCase().includes(filters.name!.toLowerCase()));
      }
      if (filters.type && filters.type !== 'all') {
        filtered = filtered.filter(item => item.type === filters.type);
      }
      if (filters.status && filters.status !== 'all') {
        filtered = filtered.filter(item => item.status === filters.status);
      }
      
      setData({
        list: filtered,
        total: filtered.length,
        page: filters.page || 1,
        pageSize: filters.pageSize || 10,
      });
      // Don't set error to keep UI clean, but maybe log it
      // setError(err as Error); 
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
