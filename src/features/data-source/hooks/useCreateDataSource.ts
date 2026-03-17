import { useState } from 'react';
import { dataSourceApi } from '../services/dataSourceApi';
import { buildDataSourceConfigSubmitPlan } from '../services/shopDashboardLoginState';
import { DataSourceCreate, DataSourceResponse } from '@/types';

function toError(error: unknown, fallbackMessage: string): Error {
  if (error instanceof Error) {
    return error;
  }
  if (typeof error === 'string' && error.trim()) {
    return new Error(error);
  }
  return new Error(fallbackMessage);
}

export function useCreateDataSource() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = async (data: DataSourceCreate): Promise<DataSourceResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const plan = buildDataSourceConfigSubmitPlan(data.config, data.name);
      const created = await dataSourceApi.create({
        ...data,
        config: plan.nextConfig,
      });

      if (!plan.upload) {
        return created;
      }

      try {
        return await dataSourceApi.uploadShopDashboardLoginState(created.id, plan.upload);
      } catch (uploadErr) {
        const uploadError = toError(uploadErr, '登录态上传失败');

        try {
          await dataSourceApi.delete(created.id);
        } catch (deleteErr) {
          const deleteError = toError(deleteErr, '回滚删除失败');
          throw new Error(`数据源创建成功但登录态上传失败，且回滚删除失败: ${uploadError.message}; ${deleteError.message}`);
        }

        throw new Error(`数据源创建成功但登录态上传失败，已回滚创建: ${uploadError.message}`);
      }
    } catch (err) {
      const normalizedError = toError(err, '创建数据源失败');
      setError(normalizedError);
      throw normalizedError;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
}
