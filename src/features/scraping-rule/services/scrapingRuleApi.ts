import { authGet, authPost, authDel, authPut, ApiResponse } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import {
  ScrapingRule,
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

async function wrappedRequest<T>(promise: Promise<ApiResponse<T>>): Promise<T> {
  const response = await promise;
  if (![200, 201, 202, 203, 204, 205, 206, 207, 208, 209].includes(response.code)) {
    throw new Error(response.msg || `Request failed with code ${response.code}`);
  }
  return response.data;
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

    return wrappedRequest(
      authGet<ApiResponse<PaginatedScrapingRuleListItem>>(url)
    );
  },

  getById: async (id: number): Promise<ScrapingRuleResponse> => {
    return wrappedRequest(
      authGet<ApiResponse<ScrapingRuleResponse>>(API_ENDPOINTS.SCRAPING_RULE_DETAIL(id))
    );
  },

  create: async (data: ScrapingRuleCreate): Promise<ScrapingRuleResponse> => {
    return wrappedRequest(
      authPost<ApiResponse<ScrapingRuleResponse>>(API_ENDPOINTS.SCRAPING_RULES, data)
    );
  },

  update: async (id: number, data: ScrapingRuleUpdate): Promise<ScrapingRuleResponse> => {
    return wrappedRequest(
      authPut<ApiResponse<ScrapingRuleResponse>>(
        API_ENDPOINTS.SCRAPING_RULE_DETAIL(id),
        data
      )
    );
  },

  delete: async (id: number): Promise<void> => {
    await wrappedRequest(
      authDel<ApiResponse<void>>(API_ENDPOINTS.SCRAPING_RULE_DETAIL(id))
    );
  },

  activate: async (id: number): Promise<ScrapingRuleResponse> => {
    return wrappedRequest(
      authPut<ApiResponse<ScrapingRuleResponse>>(
        API_ENDPOINTS.SCRAPING_RULE_DETAIL(id),
        { is_active: true }
      )
    );
  },

  deactivate: async (id: number): Promise<ScrapingRuleResponse> => {
    return wrappedRequest(
      authPut<ApiResponse<ScrapingRuleResponse>>(
        API_ENDPOINTS.SCRAPING_RULE_DETAIL(id),
        { is_active: false }
      )
    );
  },
};
