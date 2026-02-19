import { RequestInterceptor, ResponseInterceptor, HttpError, HttpResponse, RequestConfig } from './types';
import { buildRefreshTokenUrl, clearTokens, getAccessToken, normalizeTokenResponse, setAccessToken } from '@/lib/auth';
import { API_ENDPOINTS } from '@/config/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

const AUTH_SKIP_ENDPOINTS = new Set<string>([
  API_ENDPOINTS.JWT_LOGIN,
  API_ENDPOINTS.JWT_REFRESH,
]);

let refreshPromise: Promise<string> | null = null;

function isAuthSkipped(url?: string) {
  if (!url) return false;
  return Array.from(AUTH_SKIP_ENDPOINTS).some((path) => url.includes(path));
}

function withBaseUrl(url?: string) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE}${url}`;
}

async function doRefreshToken(): Promise<string> {
  const refreshUrl = withBaseUrl(buildRefreshTokenUrl(API_ENDPOINTS.JWT_REFRESH));
  const response = await fetch(refreshUrl, { method: 'POST', credentials: 'include' });

  if (!response.ok) {
    throw new Error('Refresh failed');
  }

  const result = await response.json();
  const tokenData = normalizeTokenResponse<{ access_token: string }>(result);
  const newAccessToken = tokenData.access_token;
  if (!newAccessToken) {
    throw new Error('Invalid refresh response');
  }

  setAccessToken(newAccessToken);
  return newAccessToken;
}

async function retryRequest(originalConfig: RequestConfig, token: string): Promise<HttpResponse<unknown>> {
  const retryConfig: RequestConfig = {
    ...originalConfig,
    headers: {
      ...originalConfig.headers,
      Authorization: `Bearer ${token}`,
    },
  };

  const res = await fetch(withBaseUrl(retryConfig.url!), {
    ...retryConfig,
    credentials: 'include',
  });
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`) as HttpError;
    err.status = res.status;
    err.config = retryConfig;
    throw err;
  }

  const contentType = res.headers.get('content-type');
  const data = contentType?.includes('application/json')
    ? await res.json()
    : await res.text();

  return {
    data,
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  };
}

export const authInterceptor: RequestInterceptor = {
  onRequest(config) {
    const token = getAccessToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  },
};

export const requestTimingInterceptor: RequestInterceptor = {
  onRequest(config) {
    config.headers = {
      ...config.headers,
      'X-Request-Start': Date.now().toString(),
    };
    return config;
  },
};

export const tokenRefreshInterceptor: ResponseInterceptor = {
  async onResponseError(error) {
    const originalConfig = error.config;

    if (
      error.status === 401 &&
      originalConfig &&
      !originalConfig._retry &&
      !isAuthSkipped(originalConfig.url)
    ) {
      originalConfig._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = doRefreshToken().finally(() => {
            refreshPromise = null;
          });
        }

        const newToken = await refreshPromise;
        return retryRequest(originalConfig, newToken);
      } catch (refreshError) {
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login?reason=session_expired';
        }
        throw refreshError;
      }
    }

    throw error;
  },
};
