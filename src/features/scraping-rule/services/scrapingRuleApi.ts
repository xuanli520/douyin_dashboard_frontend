import { authGet, authPost, authPatch, authDel, ApiResponse } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import {
  ScrapingRule,
  ScrapingRuleCreateDTO,
  ScrapingRuleUpdateDTO,
  ScrapingRuleFilter,
  PaginatedResponse,
  ScrapingRuleType
} from './types';

const RULE_TYPE_MAPPING: Record<string, string> = {
  'orders': 'ORDERS',
  'products': 'PRODUCTS',
  'users': 'USERS',
  'comments': 'COMMENTS'
};

const RULE_TYPE_MAPPING_REVERSE: Record<string, string> = Object.entries(RULE_TYPE_MAPPING).reduce((acc, [k, v]) => {
  acc[v] = k;
  return acc;
}, {} as Record<string, string>);

function toUpperCaseRuleType(type: ScrapingRuleType): string {
  return RULE_TYPE_MAPPING[type] || type.toUpperCase();
}

function toLowerCaseRuleType(type: string): ScrapingRuleType {
  return (RULE_TYPE_MAPPING_REVERSE[type] || type.toLowerCase()) as ScrapingRuleType;
}

function normalizeScrapingRule(rule: ScrapingRule): ScrapingRule {
  return {
    ...rule,
    rule_type: toLowerCaseRuleType(rule.rule_type)
  } as ScrapingRule;
}

export const scrapingRuleApi = {
  /**
    * Get list of scraping rules
    */
getAll: async (params?: ScrapingRuleFilter): Promise<PaginatedResponse<ScrapingRule>> => {
      const query = new URLSearchParams();
      if (params) {
        if (params.name) query.append('name', params.name);
        if (params.rule_type && params.rule_type !== 'all') query.append('rule_type', params.rule_type);
        if (params.data_source_id) query.append('data_source_id', params.data_source_id.toString());
        if (params.page) query.append('page', params.page.toString());
        if (params.pageSize) query.append('page_size', params.pageSize.toString());
      }
     
     const queryString = query.toString();
     const url = queryString 
       ? `${API_ENDPOINTS.SCRAPING_RULES}?${queryString}`
       : API_ENDPOINTS.SCRAPING_RULES;

     const response = await authGet<ApiResponse<{ items: ScrapingRule[]; total: number; page: number; size: number; pages: number }>>(url);
     return {
       list: response.data.items.map(normalizeScrapingRule),
       total: response.data.total,
       page: response.data.page,
       pageSize: response.data.size,
       pages: response.data.pages
     } as PaginatedResponse<ScrapingRule>;
   },

  /**
    * Get single scraping rule details
    */
   getById: async (id: number): Promise<ScrapingRule> => {
     const response = await authGet<ApiResponse<ScrapingRule>>(API_ENDPOINTS.SCRAPING_RULE_DETAIL(id));
     return normalizeScrapingRule(response.data);
   },

  /**
    * Create new scraping rule
    */
   create: async (data: ScrapingRuleCreateDTO): Promise<ScrapingRule> => {
     const payload = {
       ...data,
       rule_type: toUpperCaseRuleType(data.rule_type)
     };
     const response = await authPost<ApiResponse<ScrapingRule>>(API_ENDPOINTS.SCRAPING_RULES, payload);
     return normalizeScrapingRule(response.data);
   },

  /**
    * Update scraping rule
    */
   update: async (id: number, data: ScrapingRuleUpdateDTO): Promise<ScrapingRule> => {
     const payload = {
       ...data,
       rule_type: data.rule_type ? toUpperCaseRuleType(data.rule_type) : undefined
     };
     const response = await authPatch<ApiResponse<ScrapingRule>>(API_ENDPOINTS.SCRAPING_RULE_DETAIL(id), payload);
     return normalizeScrapingRule(response.data);
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
     return normalizeScrapingRule(response.data);
   }
};
