import { useState } from 'react';
import { dataSourceApi } from '../services/dataSourceApi';
import { DataSourceCreateDTO, DataSource } from '../services/types';

export function useCreateDataSource() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = async (data: DataSourceCreateDTO): Promise<DataSource | null> => {
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
