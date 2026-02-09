import { queryKeys } from '@/lib/query/keys';
import { httpClient } from '@/lib/http/client';
import { queryClient } from '@/lib/query/client';
import { DataSource, DataSourceCreate, DataSourceUpdate, DataSourceResponse, ScrapingRuleListItem } from '@/types';
import { ApiResponse, PaginatedData } from '@/lib/http/types';
import { API_ENDPOINTS } from '@/config/api';

export interface DataSourceFilter {
  name?: string;
  type?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

// Helper function to normalize data source types
function normalizeType(type: string): string {
  const mapping: Record<string, string> = {
    'DOUYIN_API': 'douyin_api',
    'FILE_UPLOAD': 'file_upload',
    'DATABASE': 'database',
    'WEBHOOK': 'webhook',
  };
  return mapping[type] || type.toLowerCase();
}

function normalizeStatus(status: string): string {
  return status.toLowerCase();
}

function normalizeDataSource(ds: DataSourceResponse): DataSourceResponse {
  return {
    ...ds,
    type: normalizeType(ds.type) as DataSource['type'],
    status: normalizeStatus(ds.status) as DataSource['status'],
  };
}

export const dataSourceService = {
  // 查询列表
  getListQuery: (filters: DataSourceFilter) => ({
    queryKey: queryKeys.dataSources.list(filters as Record<string, unknown>),
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters.name) params.name = filters.name;
      if (filters.type && filters.type !== 'all') params.source_type = filters.type.toUpperCase();
      if (filters.status && filters.status !== 'all') params.status = filters.status.toUpperCase();
      if (filters.page) params.page = filters.page.toString();
      if (filters.pageSize) params.size = filters.pageSize.toString();
      
      const response = await httpClient.get<ApiResponse<PaginatedData<DataSourceResponse>>>(
        API_ENDPOINTS.DATA_SOURCES, 
        { params }
      );
      
      return {
        items: response.data.items.map(normalizeDataSource),
        meta: response.data.meta,
      };
    },
  }),
  
  // 查询详情
  getDetailQuery: (id: number) => ({
    queryKey: queryKeys.dataSources.detail(id),
    queryFn: async () => {
      const response = await httpClient.get<ApiResponse<DataSourceResponse>>(
        API_ENDPOINTS.DATA_SOURCE_DETAIL(id)
      );
      return normalizeDataSource(response.data);
    },
    enabled: !!id && id > 0,
  }),
  
  // 创建
  createMutation: {
    mutationFn: async (data: DataSourceCreate) => {
      const payload = {
        ...data,
        status: data.status?.toUpperCase() || 'ACTIVE',
      };
      const response = await httpClient.post<ApiResponse<DataSourceResponse>>(
        API_ENDPOINTS.DATA_SOURCES, 
        payload
      );
      return normalizeDataSource(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.dataSources.all 
      });
    },
  },
  
  // 更新
  updateMutation: {
    mutationFn: async ({ id, data }: { id: number; data: DataSourceUpdate }) => {
      const payload: any = { ...data };
      if (data.status) payload.status = data.status.toUpperCase();
      
      const response = await httpClient.put<ApiResponse<DataSourceResponse>>(
        API_ENDPOINTS.DATA_SOURCE_DETAIL(id), 
        payload
      );
      return normalizeDataSource(response.data);
    },
    onSuccess: (_: unknown, variables: { id: number }) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.dataSources.detail(variables.id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.dataSources.all 
      });
    },
  },
  
  // 删除
  deleteMutation: {
    mutationFn: async (id: number) => {
      await httpClient.delete<ApiResponse<void>>(
        API_ENDPOINTS.DATA_SOURCE_DETAIL(id)
      );
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.dataSources.all 
      });
    },
  },
  
  // 激活/停用
  activateMutation: {
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      const endpoint = active 
        ? API_ENDPOINTS.DATA_SOURCE_ACTIVATE(id)
        : API_ENDPOINTS.DATA_SOURCE_DEACTIVATE(id);
      const response = await httpClient.post<ApiResponse<DataSourceResponse>>(endpoint);
      return normalizeDataSource(response.data);
    },
    onSuccess: (_: unknown, variables: { id: number }) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.dataSources.detail(variables.id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.dataSources.all 
      });
    },
  },
  
  // 验证连接
  validateMutation: {
    mutationFn: async (id: number) => {
      const response = await httpClient.post<ApiResponse<{
        valid: boolean;
        message: string;
      }>>(API_ENDPOINTS.DATA_SOURCE_VALIDATE(id));
      return {
        success: response.data.valid,
        message: response.data.message,
      };
    },
  },
  
  // 获取抓取规则
  getRulesQuery: (id: number) => ({
    queryKey: queryKeys.dataSources.rules(id),
    queryFn: async () => {
      const response = await httpClient.get<ApiResponse<ScrapingRuleListItem[]>>(
        API_ENDPOINTS.DATA_SOURCE_SCRAPING_RULES(id)
      );
      return response.data;
    },
    enabled: !!id && id > 0,
  }),
};
