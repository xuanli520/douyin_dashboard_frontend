import { useState } from 'react';
import { dataSourceApi } from '../services/dataSourceApi';

export function useDeleteDataSource() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const remove = async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await dataSourceApi.delete(id);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { remove, loading, error };
}
