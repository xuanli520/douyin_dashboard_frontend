import { RequestInterceptor, ResponseInterceptor, HttpError, RequestConfig } from './types';
import { getAccessToken, setAccessToken, getRefreshToken, clearTokens } from '@/lib/auth';
import { API_ENDPOINTS } from '@/config/api';
import { ENDPOINT_CONFIG } from '@/config/endpoint-config';
import { ENDPOINT_STATUS_HTTP, EndpointStatus, getEndpointStatus } from '@/types/endpoint';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

const AUTH_SKIP_ENDPOINTS = new Set<string>([
  API_ENDPOINTS.JWT_LOGIN,
  API_ENDPOINTS.JWT_REFRESH,
]);

let refreshPromise: Promise<string> | null = null;
const toastTimeline: number[] = [];

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

function isAuthSkipped(url?: string) {
  if (!url) {
    return false;
  }
  return Array.from(AUTH_SKIP_ENDPOINTS).some((path) => url.includes(path));
}

function withBaseUrl(url?: string) {
  if (!url) {
    return '';
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${API_BASE}${url}`;
}

async function doRefreshToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  const refreshUrl = withBaseUrl(`${API_ENDPOINTS.JWT_REFRESH}?refresh_token=${encodeURIComponent(refreshToken)}`);
  const response = await fetch(refreshUrl, { method: 'POST' });

  if (!response.ok) {
    throw new Error('Refresh failed');
  }

  const result = await response.json();
  const newAccessToken = result?.data?.access_token;
  if (!newAccessToken) {
    throw new Error('Invalid refresh response');
  }

  setAccessToken(newAccessToken);
  return newAccessToken;
}

async function retryRequest(originalConfig: RequestConfig, token: string) {
  const retryConfig: RequestConfig = {
    ...originalConfig,
    headers: {
      ...originalConfig.headers,
      Authorization: `Bearer ${token}`,
    },
  };

  const res = await fetch(withBaseUrl(retryConfig.url!), retryConfig);
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`) as HttpError;
    err.status = res.status;
    err.config = retryConfig;
    throw err;
  }

  const data = await res.json();
  const err = new Error('Response interceptor returned non-error') as HttpError;
  err.status = res.status;
  err.config = retryConfig;
  err.data = data;
  return err;
}

function buildStatusDescription(
  status: EndpointStatus,
  message: string,
  data?: Record<string, unknown>
): string {
  switch (status) {
    case 'development': {
      const isMock = data?.mock === true;
      const mockLabel = isMock ? '（演示数据）' : '';
      const release = typeof data?.expected_release === 'string'
        ? `，预计 ${data.expected_release} 发布`
        : '';
      return `${message}${mockLabel}${release}`;
    }
    case 'planned': {
      const release = typeof data?.expected_release === 'string'
        ? `，预计 ${data.expected_release} 推出`
        : '';
      return `${message}${release}`;
    }
    case 'deprecated': {
      const alternative = typeof data?.alternative === 'string' ? data.alternative : '';
      const removalDate = typeof data?.removal_date === 'string' ? data.removal_date : '';
      let desc = message;
      if (alternative) {
        desc += `，请使用: ${alternative}`;
      }
      if (removalDate) {
        desc += `，将于 ${removalDate} 移除`;
      }
      return desc;
    }
  }
}

function canShowToast(): boolean {
  const now = Date.now();
  const from = now - 60_000;
  while (toastTimeline.length > 0 && toastTimeline[0] < from) {
    toastTimeline.shift();
  }
  if (toastTimeline.length >= ENDPOINT_CONFIG.maxToastsPerMinute) {
    return false;
  }
  toastTimeline.push(now);
  return true;
}

function scheduleEndpointToast(
  status: EndpointStatus,
  message: string,
  data?: Record<string, unknown>
) {
  if (typeof window === 'undefined') {
    return;
  }

  if (!canShowToast()) {
    return;
  }

  const labels: Record<EndpointStatus, string> = {
    development: '开发中',
    planned: '计划中',
    deprecated: '已弃用',
  };

  const description = buildStatusDescription(status, message, data);

  setTimeout(() => {
    void import('sonner').then(({ toast }) => {
      toast(labels[status], {
        description,
        duration: ENDPOINT_CONFIG.toastDuration,
        style: { maxWidth: 400 },
      });
    });
  }, ENDPOINT_CONFIG.toastDelay);
}

function shouldToastByHttp(status: EndpointStatus, httpStatus: number): boolean {
  if (status === 'development') {
    return httpStatus === ENDPOINT_STATUS_HTTP.IN_DEVELOPMENT;
  }
  if (status === 'planned') {
    return httpStatus === ENDPOINT_STATUS_HTTP.PLANNED;
  }
  return httpStatus === ENDPOINT_STATUS_HTTP.DEPRECATED_STRICT || httpStatus === ENDPOINT_STATUS_HTTP.DEPRECATED_SOFT;
}

function handleDeprecatedSoftResponse(
  response: { headers: Headers; status: number; data: unknown }
): boolean {
  const deprecated = response.headers.get('X-Deprecated');
  if (deprecated !== 'true' || response.status !== ENDPOINT_STATUS_HTTP.DEPRECATED_SOFT) {
    return false;
  }

  const payload: Record<string, unknown> = {};
  const alternative = response.headers.get('X-Deprecated-Alternative');
  const removalDate = response.headers.get('X-Deprecated-Removal-Date');
  if (alternative) {
    payload.alternative = alternative;
  }
  if (removalDate) {
    payload.removal_date = removalDate;
  }

  const message = isRecord(response.data) && typeof response.data.msg === 'string'
    ? response.data.msg
    : '该接口已弃用';

  scheduleEndpointToast('deprecated', message, payload);
  return true;
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

export const endpointStatusInterceptor: ResponseInterceptor = {
  async onResponse(response) {
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return response;
    }

    if (handleDeprecatedSoftResponse(response)) {
      return response;
    }

    if (!isRecord(response.data) || typeof response.data.code !== 'number') {
      return response;
    }

    const status = getEndpointStatus(response.data.code);
    if (!status || !shouldToastByHttp(status, response.status)) {
      return response;
    }

    const message = typeof response.data.msg === 'string' ? response.data.msg : '';
    const data = isRecord(response.data.data) ? response.data.data : undefined;

    scheduleEndpointToast(status, message, data);
    return response;
  },

  async onResponseError(error) {
    if (!isRecord(error.data) || typeof error.data.code !== 'number') {
      throw error;
    }

    const status = getEndpointStatus(error.data.code);
    if (!status || !shouldToastByHttp(status, error.status ?? 0)) {
      throw error;
    }

    const message = typeof error.data.msg === 'string' ? error.data.msg : '';
    const data = isRecord(error.data.data) ? error.data.data : undefined;

    scheduleEndpointToast(status, message, data);
    throw error;
  },
};
