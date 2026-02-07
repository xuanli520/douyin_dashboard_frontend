import { authGet, authPost, authPatch, authDel, ApiResponse } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import { 
  DataSource, 
  DataSourceCreateDTO, 
  DataSourceUpdateDTO, 
  DataSourceFilter,
  PaginatedResponse 
} from './types';
import { ScrapingRule } from '@/features/scraping-rule/services/types';

export const dataSourceApi = {
  /**
   * Get list of data sources
   */
  getAll: async (params?: DataSourceFilter): Promise<PaginatedResponse<DataSource>> => {
    // Construct query string
    const query = new URLSearchParams();
    if (params) {
      if (params.name) query.append('name', params.name);
      if (params.type && params.type !== 'all') query.append('type', params.type);
      if (params.status && params.status !== 'all') query.append('status', params.status);
      if (params.page) query.append('page', params.page.toString());
      if (params.pageSize) query.append('page_size', params.pageSize.toString());
    }

    const queryString = query.toString();
    const url = queryString
      ? `${API_ENDPOINTS.DATA_SOURCES}?${queryString}`
      : API_ENDPOINTS.DATA_SOURCES;

    const response = await authGet<ApiResponse<{ items: DataSource[]; total: number }>>(url);
    return {
      list: response.data.items,
      total: response.data.total,
      page: params?.page || 1,
      pageSize: params?.pageSize || 10,
    };
  },

  /**
   * Get single data source details
   */
  getById: async (id: number): Promise<DataSource> => {
    const response = await authGet<ApiResponse<DataSource>>(API_ENDPOINTS.DATA_SOURCE_DETAIL(id));
    return response.data;
  },

  /**
   * Create new data source
   */
  create: async (data: DataSourceCreateDTO): Promise<DataSource> => {
    const response = await authPost<ApiResponse<DataSource>>(API_ENDPOINTS.DATA_SOURCES, data);
    return response.data;
  },

  /**
   * Update data source
   */
  update: async (id: number, data: DataSourceUpdateDTO): Promise<DataSource> => {
    const response = await authPatch<ApiResponse<DataSource>>(API_ENDPOINTS.DATA_SOURCE_DETAIL(id), data);
    return response.data;
  },

  /**
   * Delete data source
   */
  delete: async (id: number): Promise<void> => {
    await authDel<ApiResponse<void>>(API_ENDPOINTS.DATA_SOURCE_DETAIL(id));
  },

  /**
   * Activate/Deactivate data source
   */
  activate: async (id: number, active: boolean): Promise<DataSource> => {
    const response = await authPost<ApiResponse<DataSource>>(API_ENDPOINTS.DATA_SOURCE_ACTIVATE(id), { active });
    return response.data;
  },

  /**
   * Get rules associated with data source
   */
  getRules: async (id: number): Promise<ScrapingRule[]> => {
    const response = await authGet<ApiResponse<ScrapingRule[]>>(API_ENDPOINTS.DATA_SOURCE_RULES(id));
    return response.data;
  },

  /**
   * Validate connection
   */
  validateConnection: async (config: any): Promise<{ success: boolean; message: string }> => {
    const response = await authPost<ApiResponse<{ success: boolean; message: string }>>(API_ENDPOINTS.DATA_SOURCE_VALIDATE, config);
    return response.data;
  }
};