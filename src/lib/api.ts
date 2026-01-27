// 便捷 API 调用方法
import { baseRequest, API_BASE_URL } from './request';

// 封装 GET 请求
export async function get<T = unknown>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  return baseRequest<T>(endpoint, {
    method: 'GET',
    ...options,
  });
}

// 封装 POST 请求
export async function post<T = unknown>(
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

  return baseRequest<T>(endpoint, {
    method: 'POST',
    body,
    ...options,
  });
}

// 封装 PUT 请求
export async function put<T = unknown>(
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

  return baseRequest<T>(endpoint, {
    method: 'PUT',
    body,
    ...options,
  });
}

// 封装 PATCH 请求
export async function patch<T = unknown>(
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

  return baseRequest<T>(endpoint, {
    method: 'PATCH',
    body,
    ...options,
  });
}

// 封装 DELETE 请求
export async function del<T = unknown>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  return baseRequest<T>(endpoint, {
    method: 'DELETE',
    ...options,
  });
}

// 导出基础 URL，可用于图片等静态资源
export { API_BASE_URL };
