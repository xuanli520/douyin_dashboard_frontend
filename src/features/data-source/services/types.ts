export type DataSourceType = 'douyin_api' | 'file_upload' | 'database' | 'webhook';
export type DataSourceStatus = 'active' | 'inactive' | 'error';

export interface DataSourceConfig {
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  [key: string]: any;
}

export interface DataSource {
  id: number;
  name: string;
  type: DataSourceType;
  config: DataSourceConfig;
  status: DataSourceStatus;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface DataSourceCreateDTO {
  name: string;
  type: DataSourceType;
  config: DataSourceConfig;
  status?: DataSourceStatus;
  description?: string;
}

export type DataSourceUpdateDTO = Partial<DataSourceCreateDTO> & {
  status?: DataSourceStatus;
};

export interface DataSourceFilter {
  name?: string;
  type?: DataSourceType | 'all';
  status?: DataSourceStatus | 'all';
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}
