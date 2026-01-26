// 全局请求配置
// 服务器地址 (通过 Next.js 代理转发，/api/* 路径会被 rewrite 到后端)
export const API_BASE_URL = '/api';

// 全局请求头
export const GLOBAL_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// 请求超时时间 (毫秒)
export const REQUEST_TIMEOUT = 10000;

/**
 * 创建带全局请求头的请求配置
 */
export function createRequestOptions(options: RequestInit = {}): RequestInit {
  return {
    ...options,
    headers: {
      ...GLOBAL_HEADERS,
      ...options.headers,
    },
  };
}

/**
 * 基础请求函数
 */
export async function baseRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = createRequestOptions({
    ...options,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
  });

  const response = await fetch(url, config);

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
    if (typeof error.detail !== 'undefined') {
      err.detail = error.detail;
    }
    throw err;
  }

  return response.json();
}
