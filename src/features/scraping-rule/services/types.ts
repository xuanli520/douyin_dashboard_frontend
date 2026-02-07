export type ScrapingRuleType = 'orders' | 'products' | 'users' | 'comments';
export type DataSourceType = 'douyin_api' | 'file_upload' | 'database' | 'webhook';
export type DataSourceStatus = 'active' | 'inactive' | 'error';
export type RuleStatus = 'active' | 'inactive';
export type ScheduleType = 'cron' | 'interval' | 'once';

export interface ScrapingRuleConfig {
  target_url?: string;
  selectors?: Record<string, string>;
  max_pages?: number;
  concurrency?: number;
  retry_count?: number;
  timeout?: number;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
  [key: string]: any;
}

export interface ScrapingRule {
  id: number;
  name: string;
  description?: string;
  rule_type: ScrapingRuleType;
  status: RuleStatus;
  data_source_id: number;
  schedule_type: ScheduleType;
  schedule_value: string;
  config: ScrapingRuleConfig;
  is_active: boolean;
  last_run_at?: string;
  next_run_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ScrapingRuleCreateDTO {
  name: string;
  description?: string;
  rule_type: ScrapingRuleType;
  data_source_id: number;
  schedule_type: ScheduleType;
  schedule_value: string;
  config: ScrapingRuleConfig;
}

export type ScrapingRuleUpdateDTO = Partial<ScrapingRuleCreateDTO> & {
  status?: RuleStatus;
  is_active?: boolean;
};

export interface ScrapingRuleFilter {
  name?: string;
  rule_type?: ScrapingRuleType | 'all';
  status?: RuleStatus | 'all';
  data_source_id?: number;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
