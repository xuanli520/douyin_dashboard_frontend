import { API_ENDPOINTS } from '@/config/api';
import { httpClient } from '@/lib/http/client';
import { ApiResponse } from '@/lib/http/types';
import {
  BatchTriggerRequest,
  BatchTriggerResponse,
  ShopDashboardQueryRequest,
  ShopDashboardQueryResponse,
  ShopDashboardStatusResponse,
  TaskStatusResponse,
  normalizeBatchTriggerResponse,
  normalizeShopDashboardQueryResponse,
  normalizeShopDashboardStatusResponse,
  normalizeTaskStatusResponse,
} from './types';

function buildQueryString(params: ShopDashboardQueryRequest): string {
  const query = new URLSearchParams();
  query.append('shop_id', params.shop_id);
  query.append('start_date', params.start_date);
  query.append('end_date', params.end_date);

  if (params.granularity) {
    query.append('granularity', params.granularity);
  }

  if (typeof params.limit === 'number') {
    query.append('limit', String(params.limit));
  }

  return query.toString();
}

function toTaskId(taskId: string | number): string {
  return String(taskId).trim();
}

export const shopDashboardApi = {
  async batchTrigger(payload: BatchTriggerRequest): Promise<BatchTriggerResponse> {
    const response = await httpClient.post<ApiResponse<Record<string, unknown>>>(
      API_ENDPOINTS.SHOP_DASHBOARD_BATCH_TRIGGER,
      payload
    );

    return normalizeBatchTriggerResponse(response.data);
  },

  async getTaskStatus(taskId: string | number): Promise<TaskStatusResponse> {
    const normalizedTaskId = toTaskId(taskId);
    const response = await httpClient.get<ApiResponse<Record<string, unknown>>>(
      API_ENDPOINTS.TASK_STATUS(normalizedTaskId)
    );

    return normalizeTaskStatusResponse(response.data, normalizedTaskId);
  },

  async getShopDashboardStatus(taskId: string | number): Promise<ShopDashboardStatusResponse> {
    const normalizedTaskId = toTaskId(taskId);
    const response = await httpClient.get<ApiResponse<Record<string, unknown>>>(
      API_ENDPOINTS.SHOP_DASHBOARD_STATUS(normalizedTaskId)
    );

    return normalizeShopDashboardStatusResponse(response.data, normalizedTaskId);
  },

  async queryResults(params: ShopDashboardQueryRequest): Promise<ShopDashboardQueryResponse> {
    const queryString = buildQueryString(params);
    const url = `${API_ENDPOINTS.SHOP_DASHBOARD_QUERY}?${queryString}`;

    const response = await httpClient.get<ApiResponse<Record<string, unknown>>>(url);
    return normalizeShopDashboardQueryResponse(response.data, params);
  },
};
