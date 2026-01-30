// 带拦截器的 API 客户端
import { baseRequest, API_BASE_URL, createRequestOptions, REQUEST_TIMEOUT } from './request';
import { getAccessToken, setAccessToken, clearTokens, getRefreshToken } from './auth';
import { post } from './api';
import { API_ENDPOINTS } from '@/config/api';

/**
 * 后端统一响应格式
 */
interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

interface RequestOptions extends RequestInit {
  _retry?: boolean;
}

/**
 * 创建带认证拦截的请求函数
 */
export function createAuthenticatedClient() {
  let isRefreshing = false;
  let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
  }> = [];

  // 处理刷新队列
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

  /**
   * 带认证的请求函数
   */
  async function authRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAccessToken();

    // 添加认证头
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

      // 401 处理：尝试刷新 token
      if (response.status === 401 && !options._retry) {
        // 如果已经在刷新，等待刷新完成
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (token: string) => {
                // 重新请求，使用新 token
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
          // 直接调用刷新端点
          const refreshTokenValue = getRefreshToken();
          if (!refreshTokenValue) {
            throw new Error('No refresh token available');
          }

          const refreshResponse = await post<ApiResponse<{ access_token: string; token_type: string }>>(
            `${API_ENDPOINTS.JWT_REFRESH}?refresh_token=${encodeURIComponent(refreshTokenValue)}`
          );

          setAccessToken(refreshResponse.data.access_token);

          // 处理等待刷新的请求
          processQueue(refreshResponse.access_token, null);

          // 重新执行原请求
          const retryConfig: RequestOptions = {
            ...options,
            _retry: true,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${refreshResponse.access_token}`,
            },
          };

          return authRequest<T>(endpoint, retryConfig);
        } catch (refreshError) {
          // 刷新失败，清除所有等待的请求
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
      throw error;
    }
  }

  return { authRequest };
}

/**
 * 默认认证客户端实例
 */
export const authClient = createAuthenticatedClient();

// 便捷方法
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

  // 设置正确的 Content-Type
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

  // 如果发送的是 JSON 对象，自动设置 Content-Type
  const headers = { ...options?.headers };
  if (typeof data === 'object' && data !== null && !(data instanceof URLSearchParams) && !(data instanceof FormData)) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  return authClient.authRequest<T>(endpoint, { method: 'PATCH', body, headers, ...options });
}

export async function authDel<T>(endpoint: string, options?: RequestInit): Promise<T> {
  return authClient.authRequest<T>(endpoint, { method: 'DELETE', ...options });
}
