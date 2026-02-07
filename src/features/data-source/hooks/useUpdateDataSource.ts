import { useState } from 'react';
import { dataSourceApi } from '../services/dataSourceApi';
import { DataSourceUpdateDTO, DataSource } from '../services/types';

export function useUpdateDataSource() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = async (id: number, data: DataSourceUpdateDTO): Promise<DataSource | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await dataSourceApi.update(id, data);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
}
