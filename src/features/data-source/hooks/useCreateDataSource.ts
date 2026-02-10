import { useState } from 'react';
import { dataSourceApi } from '../services/dataSourceApi';
import { DataSourceCreate, DataSourceResponse } from '@/types';

export function useCreateDataSource() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = async (data: DataSourceCreate): Promise<DataSourceResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await dataSourceApi.create(data);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
}
