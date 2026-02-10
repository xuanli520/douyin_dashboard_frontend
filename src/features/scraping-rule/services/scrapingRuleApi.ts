import { httpClient } from '@/lib/http/client';
import { ApiResponse } from '@/lib/http/types';
import { API_ENDPOINTS } from '@/config/api';
import {
  ScrapingRuleResponse,
  ScrapingRuleListItem,
  ScrapingRuleCreate,
  ScrapingRuleUpdate,
  PaginatedScrapingRuleListItem,
} from '@/types';

export interface ScrapingRuleFilter {
  name?: string;
  target_type?: string;
  status?: string;
  data_source_id?: number;
  page?: number;
  size?: number;
}

export const scrapingRuleApi = {
  getAll: async (params?: ScrapingRuleFilter): Promise<PaginatedScrapingRuleListItem> => {
    const query = new URLSearchParams();
    if (params) {
      if (params.name) query.append('name', params.name);
      if (params.target_type) query.append('target_type', params.target_type);
      if (params.status) query.append('status', params.status);
      if (params.data_source_id) query.append('data_source_id', params.data_source_id.toString());
      if (params.page) query.append('page', params.page.toString());
      if (params.size) query.append('size', params.size.toString());
    }

    const queryString = query.toString();
    const url = queryString
      ? `${API_ENDPOINTS.SCRAPING_RULES}?${queryString}`
      : API_ENDPOINTS.SCRAPING_RULES;

    const response = await httpClient.get<ApiResponse<PaginatedScrapingRuleListItem>>(url);
    return response.data;
  },

  getById: async (id: number): Promise<ScrapingRuleResponse> => {
    const response = await httpClient.get<ApiResponse<ScrapingRuleResponse>>(
      API_ENDPOINTS.SCRAPING_RULE_DETAIL(id)
    );
    return response.data;
  },

  create: async (data: ScrapingRuleCreate): Promise<ScrapingRuleResponse> => {
    const response = await httpClient.post<ApiResponse<ScrapingRuleResponse>>(
      API_ENDPOINTS.SCRAPING_RULES,
      data
    );
    return response.data;
  },

  update: async (id: number, data: ScrapingRuleUpdate): Promise<ScrapingRuleResponse> => {
    const response = await httpClient.put<ApiResponse<ScrapingRuleResponse>>(
      API_ENDPOINTS.SCRAPING_RULE_DETAIL(id),
      data
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await httpClient.delete<ApiResponse<void>>(
      API_ENDPOINTS.SCRAPING_RULE_DETAIL(id)
    );
  },

  activate: async (id: number): Promise<ScrapingRuleResponse> => {
    const response = await httpClient.put<ApiResponse<ScrapingRuleResponse>>(
      API_ENDPOINTS.SCRAPING_RULE_DETAIL(id),
      { is_active: true }
    );
    return response.data;
  },

  deactivate: async (id: number): Promise<ScrapingRuleResponse> => {
    const response = await httpClient.put<ApiResponse<ScrapingRuleResponse>>(
      API_ENDPOINTS.SCRAPING_RULE_DETAIL(id),
      { is_active: false }
    );
    return response.data;
  },
};
