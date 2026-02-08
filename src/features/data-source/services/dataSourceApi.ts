import { authGet, authPost, authPut, authDel, ApiResponse, PaginatedData } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import {
  DataSource,
  DataSourceCreate,
  DataSourceUpdate,
  DataSourceResponse,
  PaginatedDataSourceResponse,
  ScrapingRuleListItem,
} from '@/types';

export interface DataSourceFilter {
  name?: string;
  status?: string;
  source_type?: string;
  page?: number;
  size?: number;
}

async function wrappedRequest<T>(promise: Promise<ApiResponse<T>>): Promise<T> {
  const response = await promise;
  if (![200, 201, 202, 203, 204, 205, 206, 207, 208, 209].includes(response.code)) {
    throw new Error(response.msg || `Request failed with code ${response.code}`);
  }
  return response.data;
}

export const dataSourceApi = {
  getAll: async (params?: DataSourceFilter): Promise<PaginatedDataSourceResponse> => {
    const query = new URLSearchParams();
    if (params) {
      if (params.name) query.append('name', params.name);
      if (params.status) query.append('status', params.status);
      if (params.source_type) query.append('source_type', params.source_type);
      if (params.page) query.append('page', params.page.toString());
      if (params.size) query.append('size', params.size.toString());
    }

    const queryString = query.toString();
    const url = queryString
      ? `${API_ENDPOINTS.DATA_SOURCES}?${queryString}`
      : API_ENDPOINTS.DATA_SOURCES;

    return wrappedRequest(
      authGet<ApiResponse<PaginatedDataSourceResponse>>(url)
    );
  },

  getById: async (id: number): Promise<DataSourceResponse> => {
    return wrappedRequest(
      authGet<ApiResponse<DataSourceResponse>>(API_ENDPOINTS.DATA_SOURCE_DETAIL(id))
    );
  },

  create: async (data: DataSourceCreate): Promise<DataSourceResponse> => {
    return wrappedRequest(
      authPost<ApiResponse<DataSourceResponse>>(API_ENDPOINTS.DATA_SOURCES, data)
    );
  },

  update: async (id: number, data: DataSourceUpdate): Promise<DataSourceResponse> => {
    return wrappedRequest(
      authPut<ApiResponse<DataSourceResponse>>(API_ENDPOINTS.DATA_SOURCE_DETAIL(id), data)
    );
  },

  delete: async (id: number): Promise<void> => {
    await wrappedRequest(
      authDel<ApiResponse<void>>(API_ENDPOINTS.DATA_SOURCE_DETAIL(id))
    );
  },

  activate: async (id: number): Promise<DataSourceResponse> => {
    return wrappedRequest(
      authPost<ApiResponse<DataSourceResponse>>(API_ENDPOINTS.DATA_SOURCE_ACTIVATE(id))
    );
  },

  deactivate: async (id: number): Promise<DataSourceResponse> => {
    return wrappedRequest(
      authPost<ApiResponse<DataSourceResponse>>(API_ENDPOINTS.DATA_SOURCE_DEACTIVATE(id))
    );
  },

  validate: async (id: number): Promise<Record<string, unknown>> => {
    const response = await authPost<ApiResponse<Record<string, unknown>>>(
      API_ENDPOINTS.DATA_SOURCE_VALIDATE(id)
    );
    return wrappedRequest(Promise.resolve(response));
  },

  getScrapingRules: async (id: number): Promise<ScrapingRuleListItem[]> => {
    const response = await authGet<ApiResponse<ScrapingRuleListItem[]>>(
      API_ENDPOINTS.DATA_SOURCE_SCRAPING_RULES(id)
    );
    return wrappedRequest(Promise.resolve(response));
  },
};
