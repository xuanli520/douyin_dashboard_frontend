import { authGet, authPost, authPatch, authDel, ApiResponse } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import { 
  ScrapingRule, 
  ScrapingRuleCreateDTO, 
  ScrapingRuleUpdateDTO, 
  ScrapingRuleFilter,
  PaginatedResponse 
} from './types';

export const scrapingRuleApi = {
  /**
   * Get list of scraping rules
   */
  getAll: async (params?: ScrapingRuleFilter): Promise<PaginatedResponse<ScrapingRule>> => {
    // Construct query string
    const query = new URLSearchParams();
    if (params) {
      if (params.name) query.append('name', params.name);
      if (params.rule_type && params.rule_type !== 'all') query.append('rule_type', params.rule_type);
      if (params.status && params.status !== 'all') query.append('status', params.status);
      if (params.data_source_id) query.append('data_source_id', params.data_source_id.toString());
      if (params.page) query.append('page', params.page.toString());
      if (params.pageSize) query.append('page_size', params.pageSize.toString());
    }
    
    const queryString = query.toString();
    const url = queryString 
      ? `${API_ENDPOINTS.SCRAPING_RULES}?${queryString}`
      : API_ENDPOINTS.SCRAPING_RULES;

    const response = await authGet<ApiResponse<PaginatedResponse<ScrapingRule>>>(url);
    return response.data;
  },

  /**
   * Get single scraping rule details
   */
  getById: async (id: number): Promise<ScrapingRule> => {
    const response = await authGet<ApiResponse<ScrapingRule>>(API_ENDPOINTS.SCRAPING_RULE_DETAIL(id));
    return response.data;
  },

  /**
   * Create new scraping rule
   */
  create: async (data: ScrapingRuleCreateDTO): Promise<ScrapingRule> => {
    const response = await authPost<ApiResponse<ScrapingRule>>(API_ENDPOINTS.SCRAPING_RULES, data);
    return response.data;
  },

  /**
   * Update scraping rule
   */
  update: async (id: number, data: ScrapingRuleUpdateDTO): Promise<ScrapingRule> => {
    const response = await authPatch<ApiResponse<ScrapingRule>>(API_ENDPOINTS.SCRAPING_RULE_DETAIL(id), data);
    return response.data;
  },

  /**
   * Delete scraping rule
   */
  delete: async (id: number): Promise<void> => {
    await authDel<ApiResponse<void>>(API_ENDPOINTS.SCRAPING_RULE_DETAIL(id));
  },

  /**
   * Activate/Deactivate scraping rule
   */
  activate: async (id: number, active: boolean): Promise<ScrapingRule> => {
    const response = await authPost<ApiResponse<ScrapingRule>>(API_ENDPOINTS.SCRAPING_RULE_ACTIVATE(id), { active });
    return response.data;
  }
};
