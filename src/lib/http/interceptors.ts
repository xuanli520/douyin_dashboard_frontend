import { RequestInterceptor, ResponseInterceptor, HttpError, RequestConfig } from './types';
import { getAccessToken, setAccessToken, getRefreshToken, clearTokens } from '@/lib/auth';
import { API_ENDPOINTS } from '@/config/api';

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
    
    if (error.status === 401 && originalConfig && !originalConfig._retry) {
      originalConfig._retry = true;
      
      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token');
        }
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || ''}${API_ENDPOINTS.JWT_REFRESH}?refresh_token=${encodeURIComponent(refreshToken)}`,
          { method: 'POST' }
        );
        
        if (!response.ok) {
          throw new Error('Refresh failed');
        }
        
        const result = await response.json();
        setAccessToken(result.data.access_token);
        
        // 重试原请求
        originalConfig.headers = {
          ...originalConfig.headers,
          Authorization: `Bearer ${result.data.access_token}`,
        };
        
        return fetch(originalConfig.url!, originalConfig).then(async (res) => {
          if (!res.ok) {
            const err = new Error(`HTTP ${res.status}`) as HttpError;
            err.status = res.status;
            throw err;
          }
          return {
            data: await res.json(),
            status: res.status,
            statusText: res.statusText,
            headers: res.headers,
          };
        });
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
