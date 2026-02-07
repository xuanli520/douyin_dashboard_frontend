import { useState } from 'react';
import { dataSourceApi } from '../services/dataSourceApi';
import { DataSource } from '../services/types';

export function useActivateDataSource() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const activate = async (id: number, active: boolean): Promise<DataSource | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await dataSourceApi.activate(id, active);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { activate, loading, error };
}
