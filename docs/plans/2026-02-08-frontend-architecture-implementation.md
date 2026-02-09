# 前端响应架构实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 基于架构设计文档，实施高可用、高可扩展、高鲁棒性的前端响应架构（TanStack Query + Zustand + 统一错误处理）

**Architecture:** 采用 Feature-based 模块化架构，服务端状态使用 TanStack Query 管理（含自动缓存、重试、乐观更新），客户端状态使用 Zustand 管理，HTTP 层使用带拦截器的原生 Fetch 封装，全局统一错误处理。

**Tech Stack:** Next.js 16 + React 18 + TypeScript 5.9 + TanStack Query 5.x + Zustand 5.x + Tailwind CSS 4.x + Vitest

---

## Phase 1: 基础设施搭建

### Task 1: 安装依赖

**Files:**
- Modify: `package.json`

**Step 1: 安装 TanStack Query 和 Zustand**

```bash
npm install @tanstack/react-query@5 @tanstack/react-query-devtools@5 zustand@5
```

**Step 2: 安装测试依赖**

```bash
npm install -D @tanstack/react-query-test-utils msw@2
```

**Step 3: 提交**

```bash
git add package.json package-lock.json
git commit -m "chore: install tanstack query and zustand dependencies"
```

---

### Task 2: 创建 TanStack Query 核心配置

**Files:**
- Create: `src/lib/query/client.ts`
- Create: `src/lib/query/keys.ts`
- Create: `src/lib/query/options.ts`
- Create: `src/lib/query/index.ts`

**Step 1: 创建 QueryClient 配置**

```typescript
// src/lib/query/client.ts
import { QueryClient } from '@tanstack/react-query';
import { queryErrorHandler } from '@/lib/error/handler';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: (failureCount, error: any) => {
        if (error?.code === 'NETWORK_ERROR') {
          return failureCount < 3;
        }
        return false;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      throwOnError: false,
    },
    mutations: {
      retry: false,
    },
  },
});

export default queryClient;
```

**Step 2: 创建 Query Keys 管理**

```typescript
// src/lib/query/keys.ts
export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    permissions: () => [...queryKeys.auth.all, 'permissions'] as const,
  },
  dataSources: {
    all: ['dataSources'] as const,
    lists: () => [...queryKeys.dataSources.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => 
      [...queryKeys.dataSources.lists(), filters] as const,
    details: () => [...queryKeys.dataSources.all, 'detail'] as const,
    detail: (id: number) => 
      [...queryKeys.dataSources.details(), id] as const,
    rules: (id: number) => 
      [...queryKeys.dataSources.detail(id), 'rules'] as const,
  },
  dataImports: {
    all: ['dataImports'] as const,
    lists: () => [...queryKeys.dataImports.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => 
      [...queryKeys.dataImports.lists(), filters] as const,
    detail: (id: number) => 
      [...queryKeys.dataImports.all, 'detail', id] as const,
    progress: (id: number) => 
      [...queryKeys.dataImports.detail(id), 'progress'] as const,
  },
  scrapingRules: {
    all: ['scrapingRules'] as const,
    lists: () => [...queryKeys.scrapingRules.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => 
      [...queryKeys.scrapingRules.lists(), filters] as const,
    detail: (id: number) => 
      [...queryKeys.scrapingRules.all, 'detail', id] as const,
  },
  admin: {
    all: ['admin'] as const,
    users: {
      all: () => [...queryKeys.admin.all, 'users'] as const,
      list: (filters: Record<string, unknown>) => 
        [...queryKeys.admin.users.all(), 'list', filters] as const,
      stats: () => [...queryKeys.admin.users.all(), 'stats'] as const,
    },
    roles: {
      all: () => [...queryKeys.admin.all, 'roles'] as const,
      list: (filters: Record<string, unknown>) => 
        [...queryKeys.admin.roles.all(), 'list', filters] as const,
    },
    permissions: {
      all: () => [...queryKeys.admin.all, 'permissions'] as const,
      list: (filters: Record<string, unknown>) => 
        [...queryKeys.admin.permissions.all(), 'list', filters] as const,
    },
  },
  tasks: {
    all: ['tasks'] as const,
    list: () => [...queryKeys.tasks.all, 'list'] as const,
    executions: (id: number) => 
      [...queryKeys.tasks.all, 'executions', id] as const,
  },
} as const;

export type QueryKeys = typeof queryKeys;
```

**Step 3: 创建默认查询配置**

```typescript
// src/lib/query/options.ts
import { QueryOptions, MutationOptions } from '@tanstack/react-query';

export const defaultQueryOptions: QueryOptions = {
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
};

export const defaultMutationOptions: MutationOptions = {
  retry: false,
};
```

**Step 4: 创建索引文件**

```typescript
// src/lib/query/index.ts
export { queryClient } from './client';
export { queryKeys } from './keys';
export { defaultQueryOptions, defaultMutationOptions } from './options';
```

**Step 5: 提交**

```bash
git add src/lib/query/
git commit -m "feat: setup tanstack query core configuration"
```

---

### Task 3: 重构 HTTP 客户端层

**Files:**
- Create: `src/lib/http/types.ts`
- Create: `src/lib/http/interceptors.ts`
- Create: `src/lib/http/client.ts`
- Create: `src/lib/http/index.ts`
- Modify: `src/lib/api-client.ts` (迁移到新的 http 目录)

**Step 1: 创建 HTTP 类型定义**

```typescript
// src/lib/http/types.ts
export interface RequestConfig extends RequestInit {
  url?: string;
  params?: Record<string, string | number | boolean | undefined>;
  _retry?: boolean;
  _retryCount?: number;
}

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

export interface HttpError extends Error {
  status?: number;
  code?: string;
  data?: unknown;
  config?: RequestConfig;
}

export interface RequestInterceptor {
  onRequest?: (config: RequestConfig) => Promise<RequestConfig> | RequestConfig;
  onRequestError?: (error: HttpError) => Promise<HttpError> | HttpError;
}

export interface ResponseInterceptor {
  onResponse?: <T>(response: HttpResponse<T>) => Promise<HttpResponse<T>> | HttpResponse<T>;
  onResponseError?: (error: HttpError) => Promise<HttpError> | HttpError;
}

export interface HttpClientConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
}
```

**Step 2: 创建拦截器实现**

```typescript
// src/lib/http/interceptors.ts
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
          `${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.JWT_REFRESH}?refresh_token=${encodeURIComponent(refreshToken)}`,
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
        window.location.href = '/login?reason=session_expired';
        throw refreshError;
      }
    }
    
    throw error;
  },
};
```

**Step 3: 创建 HTTP 客户端**

```typescript
// src/lib/http/client.ts
import { 
  HttpClientConfig, 
  RequestConfig, 
  HttpResponse, 
  HttpError,
  RequestInterceptor,
  ResponseInterceptor 
} from './types';

class InterceptorManager<T> {
  private interceptors: T[] = [];
  
  use(interceptor: T) {
    this.interceptors.push(interceptor);
  }
  
  getAll(): T[] {
    return this.interceptors;
  }
}

export class HttpClient {
  private config: HttpClientConfig;
  private requestInterceptors = new InterceptorManager<RequestInterceptor>();
  private responseInterceptors = new InterceptorManager<ResponseInterceptor>();
  
  constructor(config: Partial<HttpClientConfig> = {}) {
    this.config = {
      baseURL: process.env.NEXT_PUBLIC_API_URL || '',
      timeout: 30000,
      retries: 3,
      retryDelay: 1000,
      ...config,
    };
  }
  
  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.use(interceptor);
  }
  
  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.use(interceptor);
  }
  
  private async applyRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let result = config;
    for (const interceptor of this.requestInterceptors.getAll()) {
      if (interceptor.onRequest) {
        result = await interceptor.onRequest(result);
      }
    }
    return result;
  }
  
  private async applyResponseInterceptors<T>(
    response: HttpResponse<T>
  ): Promise<HttpResponse<T>> {
    let result = response;
    for (const interceptor of this.responseInterceptors.getAll()) {
      if (interceptor.onResponse) {
        result = await interceptor.onResponse(result);
      }
    }
    return result;
  }
  
  private async applyResponseErrorInterceptors(error: HttpError): Promise<HttpError> {
    let result = error;
    for (const interceptor of this.responseInterceptors.getAll()) {
      if (interceptor.onResponseError) {
        result = await interceptor.onResponseError(result);
      }
    }
    return result;
  }
  
  private async executeRequest<T>(config: RequestConfig): Promise<HttpResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
    
    try {
      let url = config.url || '';
      if (config.params) {
        const params = new URLSearchParams();
        Object.entries(config.params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
        const queryString = params.toString();
        if (queryString) {
          url += (url.includes('?') ? '&' : '?') + queryString;
        }
      }
      
      const fullUrl = url.startsWith('http') ? url : `${this.config.baseURL}${url}`;
      
      const response = await fetch(fullUrl, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`) as HttpError;
        error.status = response.status;
        error.config = config;
        
        try {
          const data = await response.json();
          error.data = data;
          error.message = data.msg || data.message || error.message;
          error.code = data.code;
        } catch {
          // 非 JSON 响应
        }
        
        throw error;
      }
      
      const data = await response.json();
      
      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError = new Error('Request timeout') as HttpError;
        timeoutError.code = 'TIMEOUT';
        timeoutError.config = config;
        throw timeoutError;
      }
      
      throw error;
    }
  }
  
  private async requestWithRetry<T>(
    config: RequestConfig,
    retryCount = 0
  ): Promise<HttpResponse<T>> {
    try {
      const response = await this.executeRequest<T>(config);
      return await this.applyResponseInterceptors(response);
    } catch (error) {
      const httpError = error as HttpError;
      
      // 只重试网络错误
      if (
        httpError.code === 'NETWORK_ERROR' ||
        httpError.code === 'TIMEOUT'
      ) {
        if (retryCount < this.config.retries) {
          await this.delay(this.config.retryDelay * Math.pow(2, retryCount));
          return this.requestWithRetry(config, retryCount + 1);
        }
      }
      
      throw await this.applyResponseErrorInterceptors(httpError);
    }
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  
  async request<T = unknown>(config: RequestConfig): Promise<T> {
    const processedConfig = await this.applyRequestInterceptors(config);
    const response = await this.requestWithRetry<T>(processedConfig);
    return response.data;
  }
  
  async get<T = unknown>(url: string, config: Omit<RequestConfig, 'url' | 'method'> = {}): Promise<T> {
    return this.request<T>({ ...config, url, method: 'GET' });
  }
  
  async post<T = unknown>(url: string, data?: unknown, config: Omit<RequestConfig, 'url' | 'method' | 'body'> = {}): Promise<T> {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    const headers = data instanceof FormData 
      ? config.headers 
      : { 'Content-Type': 'application/json', ...config.headers };
    return this.request<T>({ ...config, url, method: 'POST', body, headers });
  }
  
  async put<T = unknown>(url: string, data?: unknown, config: Omit<RequestConfig, 'url' | 'method' | 'body'> = {}): Promise<T> {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    const headers = data instanceof FormData 
      ? config.headers 
      : { 'Content-Type': 'application/json', ...config.headers };
    return this.request<T>({ ...config, url, method: 'PUT', body, headers });
  }
  
  async patch<T = unknown>(url: string, data?: unknown, config: Omit<RequestConfig, 'url' | 'method' | 'body'> = {}): Promise<T> {
    const body = JSON.stringify(data);
    return this.request<T>({ 
      ...config, 
      url, 
      method: 'PATCH', 
      body, 
      headers: { 'Content-Type': 'application/json', ...config.headers } 
    });
  }
  
  async delete<T = unknown>(url: string, config: Omit<RequestConfig, 'url' | 'method'> = {}): Promise<T> {
    return this.request<T>({ ...config, url, method: 'DELETE' });
  }
}

// 创建默认实例
export const httpClient = new HttpClient();

// 添加默认拦截器
import { authInterceptor, tokenRefreshInterceptor } from './interceptors';
httpClient.addRequestInterceptor(authInterceptor);
httpClient.addResponseInterceptor(tokenRefreshInterceptor);
```

**Step 4: 创建索引文件**

```typescript
// src/lib/http/index.ts
export { HttpClient, httpClient } from './client';
export * from './types';
export * from './interceptors';
```

**Step 5: 提交**

```bash
git add src/lib/http/
git commit -m "feat: refactor http client with interceptors and retry logic"
```

---

### Task 4: 创建全局错误处理系统

**Files:**
- Create: `src/lib/error/types.ts`
- Create: `src/lib/error/codes.ts`
- Create: `src/lib/error/handler.ts`
- Create: `src/lib/error/boundary.tsx`
- Create: `src/lib/error/index.ts`

**Step 1: 创建错误类型定义**

```typescript
// src/lib/error/types.ts
export enum ErrorCategory {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  VALIDATION = 'VALIDATION',
  BUSINESS = 'BUSINESS',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  category: ErrorCategory;
  code: string;
  message: string;
  details?: Record<string, unknown>;
  originalError?: Error;
  status?: number;
}

export interface ErrorContext {
  component?: string;
  action?: string;
  form?: {
    setErrors: (errors: Record<string, unknown>) => void;
  };
  metadata?: Record<string, unknown>;
}

export interface ErrorReport {
  error: AppError;
  context?: ErrorContext;
  timestamp: string;
  userAgent: string;
  url: string;
}
```

**Step 2: 创建错误码定义**

```typescript
// src/lib/error/codes.ts
export const ErrorCodes = {
  // 网络错误
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  CONNECTION_REFUSED: 'CONNECTION_REFUSED',
  
  // 认证错误
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  NO_PERMISSION: 'NO_PERMISSION',
  
  // 验证错误
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // 业务错误
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  OPERATION_FAILED: 'OPERATION_FAILED',
  
  // 服务器错误
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  
  // 客户端错误
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
```

**Step 3: 创建错误处理器**

```typescript
// src/lib/error/handler.ts
import { toast } from 'sonner';
import { AppError, ErrorCategory, ErrorContext, ErrorReport } from './types';
import { ErrorCodes } from './codes';
import { HttpError } from '@/lib/http/types';

export function normalizeError(error: unknown): AppError {
  if (error instanceof Error) {
    // HTTP 错误
    const httpError = error as HttpError;
    if (httpError.status) {
      return normalizeHttpError(httpError);
    }
    
    // 网络错误
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return {
        category: ErrorCategory.NETWORK,
        code: ErrorCodes.NETWORK_ERROR,
        message: '网络连接失败，请检查网络设置',
        originalError: error,
      };
    }
    
    // 超时错误
    if (error.message.includes('timeout')) {
      return {
        category: ErrorCategory.NETWORK,
        code: ErrorCodes.TIMEOUT,
        message: '请求超时，请稍后重试',
        originalError: error,
      };
    }
    
    return {
      category: ErrorCategory.CLIENT,
      code: ErrorCodes.UNKNOWN_ERROR,
      message: error.message || '发生未知错误',
      originalError: error,
    };
  }
  
  return {
    category: ErrorCategory.UNKNOWN,
    code: ErrorCodes.UNKNOWN_ERROR,
    message: '发生未知错误',
    originalError: error instanceof Error ? error : undefined,
  };
}

function normalizeHttpError(error: HttpError): AppError {
  const status = error.status || 0;
  
  switch (status) {
    case 401:
      return {
        category: ErrorCategory.AUTH,
        code: error.code === 'TOKEN_EXPIRED' ? ErrorCodes.TOKEN_EXPIRED : ErrorCodes.UNAUTHORIZED,
        message: error.message || '未授权，请重新登录',
        status,
        originalError: error,
      };
    
    case 403:
      return {
        category: ErrorCategory.AUTH,
        code: ErrorCodes.NO_PERMISSION,
        message: error.message || '没有权限执行此操作',
        status,
        originalError: error,
      };
    
    case 404:
      return {
        category: ErrorCategory.BUSINESS,
        code: ErrorCodes.RESOURCE_NOT_FOUND,
        message: error.message || '请求的资源不存在',
        status,
        originalError: error,
      };
    
    case 422:
      return {
        category: ErrorCategory.VALIDATION,
        code: ErrorCodes.VALIDATION_ERROR,
        message: error.message || '输入数据验证失败',
        details: error.data,
        status,
        originalError: error,
      };
    
    case 500:
    case 502:
    case 503:
    case 504:
      return {
        category: ErrorCategory.SERVER,
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
        message: error.message || '服务器错误，请稍后重试',
        status,
        originalError: error,
      };
    
    default:
      return {
        category: ErrorCategory.UNKNOWN,
        code: ErrorCodes.UNKNOWN_ERROR,
        message: error.message || '发生未知错误',
        status,
        originalError: error,
      };
  }
}

export class GlobalErrorHandler {
  static handle(error: unknown, context?: ErrorContext) {
    const appError = normalizeError(error);
    
    console.error('[GlobalError]', appError, context);
    
    // 上报错误（生产环境）
    if (process.env.NODE_ENV === 'production') {
      this.reportError(appError, context);
    }
    
    switch (appError.category) {
      case ErrorCategory.AUTH:
        this.handleAuthError(appError, context);
        break;
      case ErrorCategory.VALIDATION:
        this.handleValidationError(appError, context);
        break;
      case ErrorCategory.NETWORK:
        this.handleNetworkError(appError, context);
        break;
      case ErrorCategory.SERVER:
        this.handleServerError(appError, context);
        break;
      case ErrorCategory.BUSINESS:
        this.handleBusinessError(appError, context);
        break;
      default:
        this.handleGenericError(appError, context);
    }
  }
  
  private static handleAuthError(error: AppError, context?: ErrorContext) {
    if (error.code === ErrorCodes.TOKEN_EXPIRED) {
      toast.error('登录已过期，请重新登录', {
        duration: 5000,
      });
      // 由 tokenRefreshInterceptor 处理重定向
    } else if (error.code === ErrorCodes.NO_PERMISSION) {
      toast.error('没有权限执行此操作');
    } else {
      toast.error(error.message);
    }
  }
  
  private static handleValidationError(error: AppError, context?: ErrorContext) {
    if (context?.form && error.details) {
      // 表单错误由表单处理
      context.form.setErrors(error.details);
    } else {
      toast.error(error.message);
    }
  }
  
  private static handleNetworkError(error: AppError, context?: ErrorContext) {
    toast.error(error.message, {
      duration: 5000,
      action: {
        label: '重试',
        onClick: () => {
          window.location.reload();
        },
      },
    });
  }
  
  private static handleServerError(error: AppError, context?: ErrorContext) {
    toast.error(error.message, {
      duration: 5000,
    });
  }
  
  private static handleBusinessError(error: AppError, context?: ErrorContext) {
    toast.error(error.message);
  }
  
  private static handleGenericError(error: AppError, context?: ErrorContext) {
    toast.error(error.message || '发生未知错误');
  }
  
  private static reportError(error: AppError, context?: ErrorContext) {
    const report: ErrorReport = {
      error,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
    
    // TODO: 发送到错误监控服务（如 Sentry）
    console.log('[ErrorReport]', report);
  }
}

// QueryClient 错误处理器
export const queryErrorHandler = (error: unknown) => {
  GlobalErrorHandler.handle(error);
};

// 用于 TanStack Query 的 mutation 错误处理器
export const mutationErrorHandler = (error: unknown, variables: unknown, context: unknown) => {
  GlobalErrorHandler.handle(error);
};
```

**Step 4: 创建 Error Boundary**

```tsx
// src/lib/error/boundary.tsx
'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { AppError, ErrorCategory } from './types';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
    this.props.onError?.(error, info);
    
    // 上报错误
    if (process.env.NODE_ENV === 'production') {
      // TODO: 发送到错误监控服务
      console.log('Reporting error to monitoring service:', {
        error,
        componentStack: info.componentStack,
        timestamp: new Date().toISOString(),
      });
    }
  }
  
  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };
  
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-foreground">
              页面出错了
            </h1>
            
            <p className="text-muted-foreground">
              抱歉，页面遇到了意外错误。请尝试刷新页面或返回首页。
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="text-left p-4 bg-muted rounded-lg overflow-auto max-h-48">
                <pre className="text-xs text-destructive whitespace-pre-wrap">
                  {this.state.error.message}
                  {'\n'}
                  {this.state.error.stack}
                </pre>
              </div>
            )}
            
            <div className="flex gap-3 justify-center">
              <Button 
                variant="outline" 
                onClick={this.handleReset}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                重试
              </Button>
              
              <Link href="/">
                <Button className="gap-2">
                  <Home className="w-4 h-4" />
                  返回首页
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// HOC 包装器
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  boundaryProps?: Omit<Props, 'children'>
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...boundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
```

**Step 5: 创建索引文件**

```typescript
// src/lib/error/index.ts
export * from './types';
export * from './codes';
export { GlobalErrorHandler, queryErrorHandler, mutationErrorHandler, normalizeError } from './handler';
export { ErrorBoundary, withErrorBoundary } from './boundary';
```

**Step 6: 提交**

```bash
git add src/lib/error/
git commit -m "feat: implement global error handling system with boundaries"
```

---

### Task 5: 更新 QueryClient 集成错误处理

**Files:**
- Modify: `src/lib/query/client.ts`

**Step 1: 更新 QueryClient 配置**

```typescript
// src/lib/query/client.ts
import { QueryClient } from '@tanstack/react-query';
import { queryErrorHandler } from '@/lib/error/handler';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: (failureCount, error: any) => {
        if (error?.category === 'NETWORK' || error?.code === 'TIMEOUT') {
          return failureCount < 3;
        }
        return false;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      throwOnError: false,
    },
    mutations: {
      retry: false,
      onError: queryErrorHandler,
    },
  },
});

export default queryClient;
```

**Step 2: 提交**

```bash
git add src/lib/query/client.ts
git commit -m "refactor: integrate error handler with query client"
```

---

### Task 6: 创建全局 Store (Zustand)

**Files:**
- Create: `src/stores/globalStore.ts`
- Create: `src/stores/themeStore.ts`
- Create: `src/stores/index.ts`

**Step 1: 创建全局状态 Store**

```typescript
// src/stores/globalStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ModalState {
  id: string | null;
  props?: Record<string, unknown>;
}

interface GlobalState {
  // UI 状态
  sidebarCollapsed: boolean;
  activeModal: ModalState | null;
  
  // 全局加载状态
  isLoading: boolean;
  loadingMessage: string | null;
  
  // 操作
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openModal: (id: string, props?: Record<string, unknown>) => void;
  closeModal: () => void;
  setLoading: (loading: boolean, message?: string) => void;
}

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      activeModal: null,
      isLoading: false,
      loadingMessage: null,
      
      toggleSidebar: () => 
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      
      setSidebarCollapsed: (collapsed) => 
        set({ sidebarCollapsed: collapsed }),
      
      openModal: (id, props) => 
        set({ activeModal: { id, props } }),
      
      closeModal: () => 
        set({ activeModal: null }),
      
      setLoading: (loading, message) => 
        set({ isLoading: loading, loadingMessage: message || null }),
    }),
    {
      name: 'global-storage',
      partialize: (state) => ({ 
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
```

**Step 2: 创建主题 Store**

```typescript
// src/stores/themeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';
type Language = 'zh' | 'en';

interface ThemeState {
  theme: Theme;
  language: Language;
  
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      language: 'zh',
      
      setTheme: (theme) => {
        set({ theme });
        // 应用主题到 document
        if (theme === 'system') {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
            ? 'dark' 
            : 'light';
          document.documentElement.classList.toggle('dark', systemTheme === 'dark');
        } else {
          document.documentElement.classList.toggle('dark', theme === 'dark');
        }
      },
      
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'theme-storage',
    }
  )
);
```

**Step 3: 创建索引文件**

```typescript
// src/stores/index.ts
export { useGlobalStore } from './globalStore';
export { useThemeStore } from './themeStore';
```

**Step 4: 提交**

```bash
git add src/stores/
git commit -m "feat: implement global and theme stores with zustand"
```

---

## Phase 2: Feature 模块迁移

### Task 7: 迁移 Data Source 模块

**Files:**
- Create: `src/features/data-source/services/dataSourceService.ts`
- Create: `src/features/data-source/hooks/useDataSources.ts`
- Create: `src/features/data-source/hooks/useDataSource.ts`
- Create: `src/features/data-source/hooks/useCreateDataSource.ts`
- Create: `src/features/data-source/hooks/useUpdateDataSource.ts`
- Create: `src/features/data-source/hooks/useDeleteDataSource.ts`
- Create: `src/features/data-source/hooks/index.ts`
- Modify: `src/features/data-source/services/dataSourceApi.ts`

**Step 1: 创建 DataSource Service**

```typescript
// src/features/data-source/services/dataSourceService.ts
import { queryKeys } from '@/lib/query/keys';
import { httpClient } from '@/lib/http/client';
import { queryClient } from '@/lib/query/client';
import { DataSource, DataSourceFilter, DataSourceCreateDTO, DataSourceUpdateDTO } from './types';
import { ApiResponse } from '@/lib/http/types';

const BASE_URL = '/api/v1/data-sources';

// Helper function to normalize data source types
function normalizeType(type: string): string {
  const mapping: Record<string, string> = {
    'DOUYIN_API': 'douyin_api',
    'FILE_UPLOAD': 'file_upload',
    'DATABASE': 'database',
    'WEBHOOK': 'webhook',
  };
  return mapping[type] || type.toLowerCase();
}

function normalizeStatus(status: string): string {
  return status.toLowerCase();
}

function normalizeDataSource(ds: DataSource): DataSource {
  return {
    ...ds,
    type: normalizeType(ds.type),
    status: normalizeStatus(ds.status),
  };
}

export const dataSourceService = {
  // 查询列表
  getListQuery: (filters: DataSourceFilter) => ({
    queryKey: queryKeys.dataSources.list(filters),
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters.name) params.name = filters.name;
      if (filters.type && filters.type !== 'all') params.source_type = filters.type.toUpperCase();
      if (filters.status && filters.status !== 'all') params.status = filters.status.toUpperCase();
      if (filters.page) params.page = filters.page.toString();
      if (filters.pageSize) params.size = filters.pageSize.toString();
      
      const response = await httpClient.get<ApiResponse<{
        items: DataSource[];
        total: number;
        page: number;
        size: number;
        pages: number;
      }>>(BASE_URL, { params });
      
      return {
        list: response.data.items.map(normalizeDataSource),
        total: response.data.total,
        page: response.data.page,
        pageSize: response.data.size,
        pages: response.data.pages,
      };
    },
  }),
  
  // 查询详情
  getDetailQuery: (id: number) => ({
    queryKey: queryKeys.dataSources.detail(id),
    queryFn: async () => {
      const response = await httpClient.get<ApiResponse<DataSource>>(`${BASE_URL}/${id}`);
      return normalizeDataSource(response.data);
    },
    enabled: !!id && id > 0,
  }),
  
  // 创建
  createMutation: {
    mutationFn: async (data: DataSourceCreateDTO) => {
      const payload = {
        ...data,
        type: data.type.toUpperCase(),
        status: data.status?.toUpperCase() || 'ACTIVE',
      };
      const response = await httpClient.post<ApiResponse<DataSource>>(BASE_URL, payload);
      return normalizeDataSource(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.dataSources.all 
      });
    },
  },
  
  // 更新
  updateMutation: {
    mutationFn: async ({ id, data }: { id: number; data: DataSourceUpdateDTO }) => {
      const payload: any = { ...data };
      if (data.type) payload.type = data.type.toUpperCase();
      if (data.status) payload.status = data.status.toUpperCase();
      
      const response = await httpClient.put<ApiResponse<DataSource>>(
        `${BASE_URL}/${id}`, 
        payload
      );
      return normalizeDataSource(response.data);
    },
    onSuccess: (_: unknown, variables: { id: number }) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.dataSources.detail(variables.id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.dataSources.all 
      });
    },
  },
  
  // 删除
  deleteMutation: {
    mutationFn: async (id: number) => {
      await httpClient.delete<ApiResponse<void>>(`${BASE_URL}/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.dataSources.all 
      });
    },
  },
  
  // 激活/停用
  activateMutation: {
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      const endpoint = active 
        ? `${BASE_URL}/${id}/activate`
        : `${BASE_URL}/${id}/deactivate`;
      const response = await httpClient.post<ApiResponse<DataSource>>(endpoint);
      return normalizeDataSource(response.data);
    },
    onSuccess: (_: unknown, variables: { id: number }) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.dataSources.detail(variables.id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.dataSources.all 
      });
    },
  },
  
  // 验证连接
  validateMutation: {
    mutationFn: async (id: number) => {
      const response = await httpClient.post<ApiResponse<{
        valid: boolean;
        message: string;
      }>>(`${BASE_URL}/${id}/validate`);
      return {
        success: response.data.valid,
        message: response.data.message,
      };
    },
  },
};
```

**Step 2: 创建 Hooks**

```typescript
// src/features/data-source/hooks/useDataSources.ts
import { useQuery } from '@tanstack/react-query';
import { dataSourceService } from '../services/dataSourceService';
import { DataSourceFilter } from '../services/types';

export function useDataSources(filters: DataSourceFilter = {}) {
  return useQuery({
    ...dataSourceService.getListQuery(filters),
    placeholderData: (previousData) => previousData,
  });
}
```

```typescript
// src/features/data-source/hooks/useDataSource.ts
import { useQuery } from '@tanstack/react-query';
import { dataSourceService } from '../services/dataSourceService';

export function useDataSource(id: number) {
  return useQuery(dataSourceService.getDetailQuery(id));
}
```

```typescript
// src/features/data-source/hooks/useCreateDataSource.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { dataSourceService } from '../services/dataSourceService';
import { DataSourceCreateDTO } from '../services/types';

export function useCreateDataSource() {
  const queryClient = useQueryClient();
  
  return useMutation({
    ...dataSourceService.createMutation,
    onSuccess: (data, variables, context) => {
      toast.success('数据源创建成功');
      dataSourceService.createMutation.onSuccess?.(data, variables, context);
    },
    onError: (error: any) => {
      toast.error(error.message || '创建失败');
    },
  });
}
```

```typescript
// src/features/data-source/hooks/useUpdateDataSource.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { dataSourceService } from '../services/dataSourceService';
import { DataSourceUpdateDTO } from '../services/types';

export function useUpdateDataSource() {
  const queryClient = useQueryClient();
  
  return useMutation({
    ...dataSourceService.updateMutation,
    onSuccess: (data, variables, context) => {
      toast.success('数据源更新成功');
      dataSourceService.updateMutation.onSuccess?.(data, variables, context);
    },
    onError: (error: any) => {
      toast.error(error.message || '更新失败');
    },
  });
}
```

```typescript
// src/features/data-source/hooks/useDeleteDataSource.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { dataSourceService } from '../services/dataSourceService';

export function useDeleteDataSource() {
  const queryClient = useQueryClient();
  
  return useMutation({
    ...dataSourceService.deleteMutation,
    onSuccess: (data, variables, context) => {
      toast.success('数据源删除成功');
      dataSourceService.deleteMutation.onSuccess?.(data, variables, context);
    },
    onError: (error: any) => {
      toast.error(error.message || '删除失败');
    },
  });
}
```

```typescript
// src/features/data-source/hooks/useActivateDataSource.ts
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { dataSourceService } from '../services/dataSourceService';

export function useActivateDataSource() {
  return useMutation({
    ...dataSourceService.activateMutation,
    onSuccess: (data, variables) => {
      toast.success(variables.active ? '数据源已激活' : '数据源已停用');
      dataSourceService.activateMutation.onSuccess?.(data, variables, undefined);
    },
    onError: (error: any) => {
      toast.error(error.message || '操作失败');
    },
  });
}
```

```typescript
// src/features/data-source/hooks/useValidateDataSource.ts
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { dataSourceService } from '../services/dataSourceService';

export function useValidateDataSource() {
  return useMutation({
    ...dataSourceService.validateMutation,
    onSuccess: (data) => {
      if (data.success) {
        toast.success('连接验证成功');
      } else {
        toast.error(`验证失败: ${data.message}`);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || '验证失败');
    },
  });
}
```

```typescript
// src/features/data-source/hooks/index.ts
export { useDataSources } from './useDataSources';
export { useDataSource } from './useDataSource';
export { useCreateDataSource } from './useCreateDataSource';
export { useUpdateDataSource } from './useUpdateDataSource';
export { useDeleteDataSource } from './useDeleteDataSource';
export { useActivateDataSource } from './useActivateDataSource';
export { useValidateDataSource } from './useValidateDataSource';
```

**Step 3: 提交**

```bash
git add src/features/data-source/services/dataSourceService.ts
git add src/features/data-source/hooks/
git commit -m "feat: migrate data-source module to tanstack query with new hooks"
```

---

### Task 8: 迁移 Auth 模块

**Files:**
- Create: `src/features/auth/services/authService.ts`
- Create: `src/features/auth/hooks/useLogin.ts`
- Create: `src/features/auth/hooks/useLogout.ts`
- Create: `src/features/auth/hooks/useCurrentUser.ts`
- Create: `src/features/auth/hooks/useRefreshToken.ts`
- Create: `src/features/auth/hooks/index.ts`

**Step 1: 创建 Auth Service**

```typescript
// src/features/auth/services/authService.ts
import { queryKeys } from '@/lib/query/keys';
import { httpClient } from '@/lib/http/client';
import { queryClient } from '@/lib/query/client';
import { setAccessToken, setRefreshToken, clearTokens, getRefreshToken } from '@/lib/auth';
import { ApiResponse } from '@/lib/http/types';
import { User } from '@/types/user';

interface LoginCredentials {
  username: string;
  password: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export const authService = {
  // 当前用户查询
  getCurrentUserQuery: () => ({
    queryKey: queryKeys.auth.user(),
    queryFn: async () => {
      const response = await httpClient.get<ApiResponse<User>>('/api/v1/auth/users/me');
      return response.data;
    },
    retry: false,
  }),
  
  // 登录
  loginMutation: {
    mutationFn: async (credentials: LoginCredentials) => {
      const formData = new URLSearchParams();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);
      
      const response = await httpClient.post<TokenResponse>(
        '/api/v1/auth/jwt/login',
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      
      setAccessToken(response.access_token);
      setRefreshToken(response.refresh_token);
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
  },
  
  // 登出
  logoutMutation: {
    mutationFn: async () => {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          await httpClient.post(
            `/api/v1/auth/jwt/logout?refresh_token=${encodeURIComponent(refreshToken)}`
          );
        } catch {
          // 忽略登出错误
        }
      }
      clearTokens();
      return true;
    },
    onSuccess: () => {
      queryClient.clear();
    },
  },
  
  // 刷新 Token
  refreshTokenMutation: {
    mutationFn: async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token');
      }
      
      const response = await httpClient.post<{ access_token: string; token_type: string }>(
        `/api/v1/auth/jwt/refresh?refresh_token=${encodeURIComponent(refreshToken)}`
      );
      
      setAccessToken(response.access_token);
      return response;
    },
  },
};
```

**Step 2: 创建 Hooks**

```typescript
// src/features/auth/hooks/useLogin.ts
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authService } from '../services/authService';

interface LoginParams {
  username: string;
  password: string;
}

export function useLogin() {
  const router = useRouter();
  
  return useMutation({
    ...authService.loginMutation,
    onSuccess: (data, variables, context) => {
      authService.loginMutation.onSuccess?.(data, variables, context);
      toast.success('登录成功');
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.message || '登录失败，请检查用户名和密码');
    },
  });
}
```

```typescript
// src/features/auth/hooks/useLogout.ts
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authService } from '../services/authService';

export function useLogout() {
  const router = useRouter();
  
  return useMutation({
    ...authService.logoutMutation,
    onSuccess: (data, variables, context) => {
      authService.logoutMutation.onSuccess?.(data, variables, context);
      toast.success('已安全退出');
      router.push('/login');
    },
    onError: () => {
      // 即使出错也清除本地状态
      toast.success('已安全退出');
      router.push('/login');
    },
  });
}
```

```typescript
// src/features/auth/hooks/useCurrentUser.ts
import { useQuery } from '@tanstack/react-query';
import { authService } from '../services/authService';

export function useCurrentUser() {
  return useQuery({
    ...authService.getCurrentUserQuery(),
    staleTime: 5 * 60 * 1000,
  });
}
```

```typescript
// src/features/auth/hooks/useRefreshToken.ts
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';

export function useRefreshToken() {
  return useMutation(authService.refreshTokenMutation);
}
```

```typescript
// src/features/auth/hooks/index.ts
export { useLogin } from './useLogin';
export { useLogout } from './useLogout';
export { useCurrentUser } from './useCurrentUser';
export { useRefreshToken } from './useRefreshToken';
```

**Step 3: 提交**

```bash
git add src/features/auth/services/authService.ts
git add src/features/auth/hooks/
git commit -m "feat: migrate auth module to tanstack query with new hooks"
```

---

### Task 9: 更新全局 Providers

**Files:**
- Modify: `src/app/providers.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: 更新 Providers**

```tsx
// src/app/providers.tsx
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/query/client';
import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        <Toaster 
          position="top-right"
          richColors
          closeButton
          duration={4000}
        />
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```

**Step 2: 更新 layout.tsx**

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import { Providers } from "./providers";
import { ErrorBoundary } from "@/lib/error/boundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Douyin Dashboard",
  description: "抖店罗盘管理系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <Providers>
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

**Step 3: 提交**

```bash
git add src/app/providers.tsx
git add src/app/layout.tsx
git commit -m "feat: integrate tanstack query providers and error boundary"
```

---

## Phase 3: 测试与优化

### Task 10: 创建测试工具

**Files:**
- Create: `src/test/setup.ts`
- Create: `src/test/utils.tsx`
- Modify: `vitest.config.ts`

**Step 1: 创建测试配置**

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

```typescript
// src/test/utils.tsx
import React from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 创建测试用的 QueryClient
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  });
}

// 渲染包装器
interface WrapperProps {
  children: React.ReactNode;
}

export function createWrapper() {
  const testQueryClient = createTestQueryClient();
  
  return function Wrapper({ children }: WrapperProps) {
    return (
      <QueryClientProvider client={testQueryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

// 自定义 render
export function render(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return rtlRender(ui, { wrapper: createWrapper(), ...options });
}

// 重新导出
export * from '@testing-library/react';
```

**Step 2: 更新 vitest 配置**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**Step 3: 提交**

```bash
git add src/test/
git add vitest.config.ts
git commit -m "chore: setup testing infrastructure for tanstack query"
```

---

### Task 11: 编写 Data Source Hooks 测试

**Files:**
- Create: `src/features/data-source/hooks/__tests__/useDataSources.test.ts`
- Create: `src/features/data-source/hooks/__tests__/useCreateDataSource.test.ts`

**Step 1: 创建测试文件**

```typescript
// src/features/data-source/hooks/__tests__/useDataSources.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@/test/utils';
import { useDataSources } from '../useDataSources';
import { httpClient } from '@/lib/http/client';

// Mock httpClient
vi.mock('@/lib/http/client', () => ({
  httpClient: {
    get: vi.fn(),
  },
}));

describe('useDataSources', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should fetch data sources successfully', async () => {
    const mockData = {
      code: 200,
      msg: 'success',
      data: {
        items: [
          { id: 1, name: 'Test 1', type: 'DOUYIN_API', status: 'ACTIVE' },
          { id: 2, name: 'Test 2', type: 'FILE_UPLOAD', status: 'INACTIVE' },
        ],
        total: 2,
        page: 1,
        size: 20,
        pages: 1,
      },
    };
    
    vi.mocked(httpClient.get).mockResolvedValueOnce(mockData);
    
    const { result } = renderHook(() => useDataSources({}));
    
    // 初始状态
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
    
    // 等待数据加载
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    
    // 验证结果
    expect(result.current.data?.list).toHaveLength(2);
    expect(result.current.data?.total).toBe(2);
    expect(httpClient.get).toHaveBeenCalledWith('/api/v1/data-sources', {
      params: {},
    });
  });
  
  it('should handle error state', async () => {
    const error = new Error('Network error');
    (error as any).code = 'NETWORK_ERROR';
    
    vi.mocked(httpClient.get).mockRejectedValueOnce(error);
    
    const { result } = renderHook(() => useDataSources({}));
    
    await waitFor(() => expect(result.current.isError).toBe(true));
    
    expect(result.current.error).toBeDefined();
  });
  
  it('should apply filters correctly', async () => {
    const mockData = {
      code: 200,
      msg: 'success',
      data: {
        items: [],
        total: 0,
        page: 1,
        size: 10,
        pages: 0,
      },
    };
    
    vi.mocked(httpClient.get).mockResolvedValueOnce(mockData);
    
    const filters = {
      name: 'test',
      type: 'douyin_api' as const,
      status: 'active' as const,
      page: 1,
      pageSize: 10,
    };
    
    const { result } = renderHook(() => useDataSources(filters));
    
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    
    expect(httpClient.get).toHaveBeenCalledWith('/api/v1/data-sources', {
      params: {
        name: 'test',
        source_type: 'DOUYIN_API',
        status: 'ACTIVE',
        page: '1',
        size: '10',
      },
    });
  });
});
```

```typescript
// src/features/data-source/hooks/__tests__/useCreateDataSource.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@/test/utils';
import { useCreateDataSource } from '../useCreateDataSource';
import { httpClient } from '@/lib/http/client';
import { queryClient } from '@/lib/query/client';

vi.mock('@/lib/http/client', () => ({
  httpClient: {
    post: vi.fn(),
  },
}));

describe('useCreateDataSource', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });
  
  it('should create data source successfully', async () => {
    const mockResponse = {
      code: 200,
      msg: 'success',
      data: {
        id: 1,
        name: 'New Source',
        type: 'DOUYIN_API',
        status: 'ACTIVE',
      },
    };
    
    vi.mocked(httpClient.post).mockResolvedValueOnce(mockResponse);
    
    const { result } = renderHook(() => useCreateDataSource());
    
    result.current.mutate({
      name: 'New Source',
      type: 'douyin_api',
      config: {},
    });
    
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    
    expect(result.current.data?.name).toBe('New Source');
    expect(httpClient.post).toHaveBeenCalledWith('/api/v1/data-sources', {
      name: 'New Source',
      type: 'DOUYIN_API',
      status: 'ACTIVE',
      config: {},
    });
  });
  
  it('should handle creation error', async () => {
    const error = new Error('Name already exists');
    (error as any).status = 400;
    
    vi.mocked(httpClient.post).mockRejectedValueOnce(error);
    
    const { result } = renderHook(() => useCreateDataSource());
    
    result.current.mutate({
      name: 'Existing',
      type: 'douyin_api',
      config: {},
    });
    
    await waitFor(() => expect(result.current.isError).toBe(true));
    
    expect(result.current.error).toBeDefined();
  });
});
```

**Step 2: 运行测试**

```bash
npm test -- src/features/data-source/hooks/__tests__
```

Expected: All tests should pass.

**Step 3: 提交**

```bash
git add src/features/data-source/hooks/__tests__/
git commit -m "test: add tests for data source hooks"
```

---

### Task 12: 创建 API 类型定义

**Files:**
- Create: `src/types/api.ts`

**Step 1: 创建通用 API 类型**

```typescript
// src/types/api.ts
// 后端统一响应格式
export interface ApiResponse<T = unknown> {
  code: number;
  msg: string;
  data: T;
}

// 分页响应
export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

// 分页元数据
export interface PageMeta {
  page: number;
  size: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 分页数据包装
export interface PaginatedData<T> {
  items: T[];
  meta: PageMeta;
}

// API 错误详情
export interface ApiErrorDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
}

// 验证错误响应
export interface ValidationErrorResponse {
  detail: ApiErrorDetail[];
}
```

**Step 2: 提交**

```bash
git add src/types/api.ts
git commit -m "feat: add common api types"
```

---

### Task 13: 创建性能优化 Hooks

**Files:**
- Create: `src/hooks/useDebounce.ts`
- Create: `src/hooks/useThrottle.ts`
- Create: `src/hooks/usePrefetch.ts`
- Modify: `src/hooks/index.ts`

**Step 1: 创建防抖 Hook**

```typescript
// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}
```

**Step 2: 创建节流 Hook**

```typescript
// src/hooks/useThrottle.ts
import { useState, useEffect, useRef } from 'react';

export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef(Date.now());
  
  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);
  
  return throttledValue;
}
```

**Step 3: 创建预取 Hook**

```typescript
// src/hooks/usePrefetch.ts
import { useCallback } from 'react';
import { useQueryClient, QueryFunction, QueryKey } from '@tanstack/react-query';

export function usePrefetch() {
  const queryClient = useQueryClient();
  
  const prefetch = useCallback(
    <T>(queryKey: QueryKey, queryFn: QueryFunction<T>, staleTime = 60 * 1000) => {
      queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime,
      });
    },
    [queryClient]
  );
  
  return { prefetch };
}
```

**Step 4: 更新索引**

```typescript
// src/hooks/index.ts
export { useTokenManager } from './useTokenManager';
export { useDebounce } from './useDebounce';
export { useThrottle } from './useThrottle';
export { usePrefetch } from './usePrefetch';
```

**Step 5: 提交**

```bash
git add src/hooks/useDebounce.ts
git add src/hooks/useThrottle.ts
git add src/hooks/usePrefetch.ts
git add src/hooks/index.ts
git commit -m "feat: add performance optimization hooks"
```

---

## Phase 4: 清理与文档

### Task 14: 迁移旧代码兼容层

**Files:**
- Modify: `src/lib/api-client.ts` (添加兼容层)

**Step 1: 保留兼容层**

```typescript
// src/lib/api-client.ts
// @deprecated: Use lib/http/client.ts instead
// This file is kept for backward compatibility during migration

import { httpClient } from './http/client';
import { ApiResponse } from './http/types';

export interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

// 兼容旧的 API
export { httpClient as authClient };
export { httpClient };

export async function authGet<T>(endpoint: string, options?: RequestInit): Promise<T> {
  console.warn('authGet is deprecated, use httpClient.get instead');
  return httpClient.get<T>(endpoint, options);
}

export async function authPost<T>(
  endpoint: string,
  data?: unknown,
  options?: RequestInit
): Promise<T> {
  console.warn('authPost is deprecated, use httpClient.post instead');
  return httpClient.post<T>(endpoint, data, options);
}

export async function authPatch<T>(
  endpoint: string,
  data?: unknown,
  options?: RequestInit
): Promise<T> {
  console.warn('authPatch is deprecated, use httpClient.patch instead');
  return httpClient.patch<T>(endpoint, data, options);
}

export async function authDel<T>(endpoint: string, options?: RequestInit): Promise<T> {
  console.warn('authDel is deprecated, use httpClient.delete instead');
  return httpClient.delete<T>(endpoint, options);
}

export async function authPut<T>(
  endpoint: string,
  data?: unknown,
  options?: RequestInit
): Promise<T> {
  console.warn('authPut is deprecated, use httpClient.put instead');
  return httpClient.put<T>(endpoint, data, options);
}
```

**Step 2: 提交**

```bash
git add src/lib/api-client.ts
git commit -m "chore: add compatibility layer for old api client"
```

---

### Task 15: 创建架构迁移指南

**Files:**
- Create: `docs/MIGRATION_GUIDE.md`

**Step 1: 创建迁移指南**

```markdown
# 前端架构迁移指南

## 概述

本项目已迁移到新的响应式架构（TanStack Query + Zustand）。本文档指导开发者如何使用新架构。

## 快速开始

### 1. 数据获取

**旧方式 (Context + useEffect):**
```tsx
const { dataSources, fetchDataSources, isLoading } = useDataSourceStore();

useEffect(() => {
  fetchDataSources();
}, []);
```

**新方式 (TanStack Query):**
```tsx
import { useDataSources } from '@/features/data-source/hooks';

function DataSourceList() {
  const { data, isLoading, error } = useDataSources({ page: 1 });
  
  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;
  
  return (
    <ul>
      {data?.list.map(ds => <li key={ds.id}>{ds.name}</li>)}
    </ul>
  );
}
```

### 2. 数据修改

**旧方式:**
```tsx
const { createDataSource } = useDataSourceStore();

const handleSubmit = async (data) => {
  try {
    await createDataSource(data);
    toast.success('创建成功');
  } catch (error) {
    toast.error(error.message);
  }
};
```

**新方式:**
```tsx
import { useCreateDataSource } from '@/features/data-source/hooks';

function CreateForm() {
  const createMutation = useCreateDataSource();
  
  const handleSubmit = (data) => {
    createMutation.mutate(data);
    // 成功/失败的消息由 hook 自动处理
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <button disabled={createMutation.isPending}>
        {createMutation.isPending ? '创建中...' : '创建'}
      </button>
    </form>
  );
}
```

### 3. HTTP 请求

**旧方式:**
```typescript
import { authGet } from '@/lib/api-client';
const response = await authGet('/api/v1/data-sources');
```

**新方式:**
```typescript
import { httpClient } from '@/lib/http/client';
const response = await httpClient.get('/api/v1/data-sources');
```

### 4. 全局状态

**旧方式 (Context):**
```tsx
const { sidebarCollapsed, toggleSidebar } = useGlobalContext();
```

**新方式 (Zustand):**
```tsx
import { useGlobalStore } from '@/stores';

function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useGlobalStore();
  // ...
}
```

## 最佳实践

1. **使用 Service 封装 API 逻辑**
2. **使用 Hooks 封装业务逻辑**
3. **使用 Query Keys 管理缓存**
4. **错误处理由全局处理器接管**

## 废弃 API

以下 API 已废弃，将在 v2.0 中移除：
- `useDataSourceStore` - 使用 `useDataSources` hook 代替
- `authGet/authPost/...` - 使用 `httpClient` 代替
- `UserContext` - 使用 `useCurrentUser` hook 代替
```

**Step 2: 提交**

```bash
git add docs/MIGRATION_GUIDE.md
git commit -m "docs: add migration guide for new architecture"
```

---

### Task 16: 最终验证

**Step 1: 运行所有测试**

```bash
npm test
```

Expected: All tests pass.

**Step 2: 类型检查**

```bash
npx tsc --noEmit
```

Expected: No type errors.

**Step 3: 构建验证**

```bash
npm run build
```

Expected: Build succeeds.

**Step 4: Lint 检查**

```bash
npm run lint
```

Expected: No lint errors.

**Step 5: 提交最终更改**

```bash
git add .
git commit -m "feat: complete frontend responsive architecture implementation

- Implement TanStack Query for server state management
- Add Zustand for client state management
- Create unified error handling system with boundaries
- Refactor HTTP client with interceptors and retry logic
- Migrate data-source and auth modules
- Add comprehensive test coverage
- Create migration guide and documentation"
```

---

## 总结

本实施计划完成了以下目标：

1. **高可用**: 自动重试、请求队列、乐观更新、预取数据
2. **高可扩展**: Feature-based 架构、模块化设计、清晰的职责分离
3. **高鲁棒性**: 全局错误边界、统一错误处理、优雅降级

新架构优势：
- 自动缓存和同步，减少冗余请求
- 内置乐观更新，提升用户体验
- 统一的错误处理，简化开发
- 类型安全，提升代码质量
- 完善的测试覆盖，确保稳定性
