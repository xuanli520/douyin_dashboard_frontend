import { API_ENDPOINTS } from '@/config/api';
import { httpClient } from '@/lib/http/client';
import { ApiResponse } from '@/lib/http/types';
import {
  ShopDashboardCollectionTriggerRequest,
  ShopDashboardCollectionTriggerResult,
  ShopDashboardQueryRequest,
  ShopDashboardQueryResponse,
  TaskDefinition,
  TaskDefinitionCreateRequest,
  TaskExecution,
  TaskExecutionListResponse,
  TaskListParams,
  TaskListResponse,
  TaskRunRequest,
  normalizeShopDashboardQueryResponse,
} from './types';

const SHOP_DASHBOARD_TASK_NAME = 'shop-dashboard-collection';

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

function buildTaskQueryString(params: TaskListParams): string {
  const query = new URLSearchParams();

  if (typeof params.page === 'number') {
    query.append('page', String(params.page));
  }
  if (typeof params.size === 'number') {
    query.append('size', String(params.size));
  }
  if (params.status) {
    query.append('status', params.status);
  }
  if (params.task_type) {
    query.append('task_type', params.task_type);
  }

  return query.toString();
}

function toTaskId(taskId: string | number): number {
  const normalized = Number(taskId);
  if (!Number.isInteger(normalized) || normalized <= 0) {
    throw new Error('任务 ID 无效');
  }
  return normalized;
}

async function findShopDashboardTask(): Promise<TaskDefinition | null> {
  const active = await shopDashboardApi.listTasks({
    page: 1,
    size: 20,
    status: 'ACTIVE',
    task_type: 'SHOP_DASHBOARD_COLLECTION',
  });
  if (active.items.length > 0) {
    return active.items[0];
  }

  const all = await shopDashboardApi.listTasks({
    page: 1,
    size: 20,
    task_type: 'SHOP_DASHBOARD_COLLECTION',
  });

  const availableTask = all.items.find(item => item.status !== 'CANCELLED') ?? null;
  return availableTask;
}

export const shopDashboardApi = {
  async listTasks(params: TaskListParams = {}): Promise<TaskListResponse> {
    const queryString = buildTaskQueryString(params);
    const url = queryString ? `${API_ENDPOINTS.TASKS_LIST}?${queryString}` : API_ENDPOINTS.TASKS_LIST;

    const response = await httpClient.get<ApiResponse<TaskListResponse>>(url);
    return response.data;
  },

  async createTask(payload: TaskDefinitionCreateRequest): Promise<TaskDefinition> {
    const response = await httpClient.post<ApiResponse<TaskDefinition>>(API_ENDPOINTS.TASKS_LIST, payload);
    return response.data;
  },

  async getTask(taskId: string | number): Promise<TaskDefinition> {
    const normalizedTaskId = toTaskId(taskId);
    const response = await httpClient.get<ApiResponse<TaskDefinition>>(API_ENDPOINTS.TASK_DETAIL(normalizedTaskId));
    return response.data;
  },

  async runTask(taskId: string | number, payload: TaskRunRequest = {}): Promise<TaskExecution> {
    const normalizedTaskId = toTaskId(taskId);
    const response = await httpClient.post<ApiResponse<TaskExecution>>(API_ENDPOINTS.TASK_RUN(normalizedTaskId), payload);
    return response.data;
  },

  async cancelTask(taskId: string | number): Promise<TaskDefinition> {
    const normalizedTaskId = toTaskId(taskId);
    const response = await httpClient.post<ApiResponse<TaskDefinition>>(API_ENDPOINTS.TASK_CANCEL(normalizedTaskId));
    return response.data;
  },

  async listTaskExecutions(taskId: string | number): Promise<TaskExecutionListResponse> {
    const normalizedTaskId = toTaskId(taskId);
    const response = await httpClient.get<ApiResponse<TaskExecutionListResponse>>(
      API_ENDPOINTS.TASK_EXECUTIONS(normalizedTaskId)
    );
    return response.data;
  },

  async triggerShopDashboardCollection(
    payload: ShopDashboardCollectionTriggerRequest
  ): Promise<ShopDashboardCollectionTriggerResult> {
    let task = await findShopDashboardTask();

    if (!task) {
      task = await shopDashboardApi.createTask({
        name: SHOP_DASHBOARD_TASK_NAME,
        task_type: 'SHOP_DASHBOARD_COLLECTION',
        config: {},
      });
    }

    const runPayload: Record<string, unknown> = {
      data_source_id: payload.data_source_id,
      rule_id: payload.rule_id,
    };
    if (payload.execution_id) {
      runPayload.execution_id = payload.execution_id;
    }

    const execution = await shopDashboardApi.runTask(task.id, { payload: runPayload });
    return { task, execution };
  },

  async queryResults(params: ShopDashboardQueryRequest): Promise<ShopDashboardQueryResponse> {
    const queryString = buildQueryString(params);
    const url = `${API_ENDPOINTS.SHOP_DASHBOARD_QUERY}?${queryString}`;

    const response = await httpClient.get<ApiResponse<Record<string, unknown>>>(url);
    return normalizeShopDashboardQueryResponse(response.data, params);
  },
};
