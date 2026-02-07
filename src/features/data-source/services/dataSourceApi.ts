import { authGet, authPost, authPatch, authDel, ApiResponse } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import { 
  DataSource, 
  DataSourceCreateDTO, 
  DataSourceUpdateDTO, 
  DataSourceFilter,
  PaginatedResponse,
  DataSourceType,
  DataSourceStatus
} from './types';
import { ScrapingRule } from '@/features/scraping-rule/services/types';

const TYPE_MAPPING: Record<string, string> = {
  'douyin_api': 'DOUYIN_API',
  'file_upload': 'FILE_UPLOAD',
  'database': 'DATABASE',
  'webhook': 'WEBHOOK'
};

const STATUS_MAPPING: Record<string, string> = {
  'active': 'ACTIVE',
  'inactive': 'INACTIVE',
  'error': 'ERROR'
};

const TYPE_MAPPING_REVERSE: Record<string, string> = Object.entries(TYPE_MAPPING).reduce((acc, [k, v]) => {
  acc[v] = k;
  return acc;
}, {} as Record<string, string>);

const STATUS_MAPPING_REVERSE: Record<string, string> = Object.entries(STATUS_MAPPING).reduce((acc, [k, v]) => {
  acc[v] = k;
  return acc;
}, {} as Record<string, string>);

function toUpperCaseType(type: DataSourceType): string {
  return TYPE_MAPPING[type] || type.toUpperCase();
}

function toUpperCaseStatus(status?: DataSourceStatus): string | undefined {
  if (!status) return undefined;
  return STATUS_MAPPING[status] || status.toUpperCase();
}

function toLowerCaseType(type: string): DataSourceType {
  return (TYPE_MAPPING_REVERSE[type] || type.toLowerCase()) as DataSourceType;
}

function toLowerCaseStatus(status: string): DataSourceStatus {
  return (STATUS_MAPPING_REVERSE[status] || status.toLowerCase()) as DataSourceStatus;
}

function normalizeDataSource(ds: DataSource): DataSource {
  return {
    ...ds,
    type: toLowerCaseType(ds.type),
    status: toLowerCaseStatus(ds.status)
  };
}

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
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    return {
      list: response.data.items.map(normalizeDataSource),
      total: response.data.total,
      page,
      pageSize,
      pages: Math.ceil(response.data.total / pageSize)
    };
  },

  /**
    * Get single data source details
    */
   getById: async (id: number): Promise<DataSource> => {
     const response = await authGet<ApiResponse<DataSource>>(API_ENDPOINTS.DATA_SOURCE_DETAIL(id));
     return normalizeDataSource(response.data);
   },

  /**
     * Create new data source
     */
    create: async (data: DataSourceCreateDTO): Promise<DataSource> => {
      const payload = {
        ...data,
        type: toUpperCaseType(data.type),
        status: data.status ? toUpperCaseStatus(data.status) : undefined
      };
      const response = await authPost<ApiResponse<DataSource>>(API_ENDPOINTS.DATA_SOURCES, payload);
      return normalizeDataSource(response.data);
    },

  /**
    * Update data source
    */
   update: async (id: number, data: DataSourceUpdateDTO): Promise<DataSource> => {
     const payload = {
       ...data,
       type: data.type ? toUpperCaseType(data.type) : undefined,
       status: data.status ? toUpperCaseStatus(data.status) : undefined
     };
     const response = await authPatch<ApiResponse<DataSource>>(API_ENDPOINTS.DATA_SOURCE_DETAIL(id), payload);
     return normalizeDataSource(response.data);
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
      const endpoint = active 
        ? API_ENDPOINTS.DATA_SOURCE_ACTIVATE(id) 
        : API_ENDPOINTS.DATA_SOURCE_DEACTIVATE(id);
      const response = await authPost<ApiResponse<DataSource>>(endpoint);
      return normalizeDataSource(response.data);
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
   validateConnection: async (id: number, config: any): Promise<{ success: boolean; message: string }> => {
     const response = await authPost<ApiResponse<{ valid: boolean; message: string }>>(API_ENDPOINTS.DATA_SOURCE_VALIDATE(id));
     return { success: response.data.valid, message: response.data.message };
   }
};