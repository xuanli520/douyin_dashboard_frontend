import { useState } from 'react';
import { dataSourceApi } from '../services/dataSourceApi';
import { buildDataSourceConfigSubmitPlan } from '../services/shopDashboardLoginState';
import { DataSourceUpdate, DataSourceResponse } from '@/types';

function toError(error: unknown, fallbackMessage: string): Error {
  if (error instanceof Error) {
    return error;
  }
  if (typeof error === 'string' && error.trim()) {
    return new Error(error);
  }
  return new Error(fallbackMessage);
}

export function useUpdateDataSource() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = async (id: number, data: DataSourceUpdate): Promise<DataSourceResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      if (!data.config) {
        return await dataSourceApi.update(id, data);
      }

      const plan = buildDataSourceConfigSubmitPlan(data.config, data.name);
      const updated = await dataSourceApi.update(id, {
        ...data,
        config: plan.nextConfig,
      });

      if (!plan.upload) {
        return updated;
      }

      try {
        return await dataSourceApi.uploadShopDashboardLoginState(id, plan.upload);
      } catch (uploadErr) {
        const uploadError = toError(uploadErr, '登录态上传失败');
        throw new Error(`配置更新成功但登录态上传失败: ${uploadError.message}`);
      }
    } catch (err) {
      const normalizedError = toError(err, '更新数据源失败');
      setError(normalizedError);
      throw normalizedError;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
}
