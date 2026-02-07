import { useState } from 'react';
import { dataSourceApi } from '../services/dataSourceApi';

export function useValidateDataSource() {
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ success: boolean; message: string } | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const validate = async (config: any) => {
    setValidating(true);
    setValidationResult(null);
    setError(null);
    try {
      const result = await dataSourceApi.validateConnection(config);
      setValidationResult(result);
      return result;
    } catch (err) {
      setError(err as Error);
      return { success: false, message: (err as Error).message };
    } finally {
      setValidating(false);
    }
  };

  return { validate, validating, validationResult, error };
}
