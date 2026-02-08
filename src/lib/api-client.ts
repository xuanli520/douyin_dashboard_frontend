import { baseRequest, API_BASE_URL, REQUEST_TIMEOUT } from './request';
import { getAccessToken, setAccessToken, clearTokens, getRefreshToken } from './auth';
import { post as apiPost } from './api';
import { API_ENDPOINTS } from '@/config/api';

export interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

export interface PageMeta {
  page: number;
  size: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PaginatedData<T> {
  items: T[];
  meta: PageMeta;
}

interface RequestOptions extends RequestInit {
  _retry?: boolean;
}

export class ApiError extends Error {
  code?: number;
  data?: unknown;

  constructor(message: string, code?: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.data = data;
  }
}

export class NetworkError extends Error {
  constructor(message: string = '网络请求失败，请检查网络连接') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string = '请求超时，请稍后重试') {
    super(message);
    this.name = 'TimeoutError';
  }
}

function createAuthenticatedClient() {
  let isRefreshing = false;
  let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
  }> = [];

  const processQueue = (token: string | null, error: Error | null) => {
    failedQueue.forEach((promise) => {
      if (token) {
        promise.resolve(token);
      } else {
        promise.reject(error!);
      }
    });
    failedQueue = [];
  };

  async function authRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAccessToken();

    const config: RequestOptions = {
      ...options,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
      headers: {
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401 && !options._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (token: string) => {
                const retryConfig = {
                  ...options,
                  _retry: true,
                  headers: {
                    ...options.headers,
                    Authorization: `Bearer ${token}`,
                  },
                };
                authRequest<T>(endpoint, retryConfig).then(resolve).catch(reject);
              },
              reject: (error: Error) => reject(error),
            });
          });
        }

        isRefreshing = true;

        try {
          const refreshTokenValue = getRefreshToken();
          if (!refreshTokenValue) {
            throw new Error('No refresh token available');
          }

          const refreshResponse = await apiPost<ApiResponse<{ access_token: string; token_type: string }>>(
            `${API_ENDPOINTS.JWT_REFRESH}?refresh_token=${encodeURIComponent(refreshTokenValue)}`
          );

          setAccessToken(refreshResponse.data.access_token);
          processQueue(refreshResponse.data.access_token, null);

          const retryConfig: RequestOptions = {
            ...options,
            _retry: true,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${refreshResponse.data.access_token}`,
            },
          };

          return authRequest<T>(endpoint, retryConfig);
        } catch (refreshError) {
          processQueue(null, refreshError as Error);
          clearTokens();
          throw new Error('会话已过期，请重新登录');
        } finally {
          isRefreshing = false;
        }
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const message = error.msg || error.message || `请求失败: ${response.status}`;
        const err: any = new Error(message);
        if (typeof error.code !== 'undefined') {
          err.code = error.code;
        }
        if (typeof error.data !== 'undefined') {
          err.data = error.data;
        }
        throw err;
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new TimeoutError();
      }
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new NetworkError();
      }
      throw error;
    }
  }

  return { authRequest };
}

export const authClient = createAuthenticatedClient();

export async function authGet<T>(endpoint: string, options?: RequestInit): Promise<T> {
  return authClient.authRequest<T>(endpoint, { method: 'GET', ...options });
}

export async function authPost<T>(
  endpoint: string,
  data?: unknown,
  options?: RequestInit
): Promise<T> {
  const body =
    data instanceof URLSearchParams ||
    data instanceof FormData ||
    typeof data === 'string'
      ? data
      : data === undefined
      ? undefined
      : JSON.stringify(data);

  const headers = { ...options?.headers };
  if (data instanceof URLSearchParams) {
    (headers as Record<string, string>)['Content-Type'] = 'application/x-www-form-urlencoded';
  } else if (typeof data === 'object' && data !== null && !(data instanceof FormData)) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  return authClient.authRequest<T>(endpoint, { method: 'POST', body, headers, ...options });
}

export async function authPatch<T>(
  endpoint: string,
  data?: unknown,
  options?: RequestInit
): Promise<T> {
  const body =
    data instanceof URLSearchParams ||
    data instanceof FormData ||
    typeof data === 'string'
      ? data
      : data === undefined
      ? undefined
      : JSON.stringify(data);

  const headers = { ...options?.headers };
  if (typeof data === 'object' && data !== null && !(data instanceof URLSearchParams) && !(data instanceof FormData)) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  return authClient.authRequest<T>(endpoint, { method: 'PATCH', body, headers, ...options });
}

export async function authDel<T>(endpoint: string, options?: RequestInit): Promise<T> {
  return authClient.authRequest<T>(endpoint, { method: 'DELETE', ...options });
}

export async function authPut<T>(
  endpoint: string,
  data?: unknown,
  options?: RequestInit
): Promise<T> {
  const body =
    data instanceof URLSearchParams ||
    data instanceof FormData ||
    typeof data === 'string'
      ? data
      : data === undefined
      ? undefined
      : JSON.stringify(data);

  const headers = { ...options?.headers };
  if (data instanceof URLSearchParams) {
    (headers as Record<string, string>)['Content-Type'] = 'application/x-www-form-urlencoded';
  } else if (typeof data === 'object' && data !== null && !(data instanceof FormData)) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  return authClient.authRequest<T>(endpoint, { method: 'PUT', body, headers, ...options });
}

export async function get<T>(endpoint: string, options?: RequestInit): Promise<T> {
  return baseRequest<T>(endpoint, { method: 'GET', ...options });
}

export async function post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
  const body =
    data instanceof URLSearchParams ||
    data instanceof FormData ||
    typeof data === 'string'
      ? data
      : data === undefined
      ? undefined
      : JSON.stringify(data);

  const headers = { ...options?.headers };
  if (data instanceof URLSearchParams) {
    (headers as Record<string, string>)['Content-Type'] = 'application/x-www-form-urlencoded';
  } else if (data instanceof FormData) {
  }

  return baseRequest<T>(endpoint, { method: 'POST', body, headers, ...options });
}

export async function put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
  const body =
    data instanceof URLSearchParams ||
    data instanceof FormData ||
    typeof data === 'string'
      ? data
      : data === undefined
      ? undefined
      : JSON.stringify(data);

  return baseRequest<T>(endpoint, { method: 'PUT', body, ...options });
}

export async function del<T>(endpoint: string, options?: RequestInit): Promise<T> {
  return baseRequest<T>(endpoint, { method: 'DELETE', ...options });
}
