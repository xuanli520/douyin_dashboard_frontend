export interface ApiResponse<T> {
  data: T;
  message?: string;
  code?: number;
}

export interface PaginatedResponse<T> {
  results: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PaginatedData<T> {
  results: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PageMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface HttpError extends Error {
  status: number;
  statusText: string;
  data?: unknown;
  headers?: Headers;
}

export interface HttpClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface RequestOptions extends Omit<HttpClientConfig, 'baseURL'> {
  params?: Record<string, string | number | boolean | undefined>;
  data?: unknown;
}
