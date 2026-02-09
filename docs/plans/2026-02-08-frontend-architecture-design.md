# 前端响应架构设计文档

> **项目**: Douyin Dashboard Frontend  
> **日期**: 2026-02-08  
> **目标**: 构建高可用、高可扩展、高鲁棒性的前端响应架构  

---

## 1. 架构总览

### 1.1 核心理念

本架构基于 **"关注点分离 + 响应式数据流"** 的设计理念，通过以下核心策略实现目标：

| 特性 | 实现策略 | 收益 |
|------|----------|------|
| **高可用** | TanStack Query 缓存 + 自动重试 + 乐观更新 | 减少不必要请求，提升用户体验 |
| **高可扩展** | Feature-based 模块化 + 插件化 API 客户端 | 新功能快速集成，低耦合高内聚 |
| **高鲁棒性** | 统一错误边界 + 请求队列 + 离线支持 | 优雅降级，容错能力强 |

### 1.2 技术栈

```
框架: Next.js 16 (App Router)
语言: TypeScript 5.9
样式: Tailwind CSS 4.x + Radix UI
状态管理:
  - 服务端状态: TanStack Query 5.x
  - 客户端状态: Zustand 5.x
验证: Zod 3.x
API: 原生 Fetch + 自定义拦截器
测试: Vitest + React Testing Library
```

---

## 2. 架构层设计

### 2.1 四层架构模型

```
┌─────────────────────────────────────────┐
│         PRESENTATION LAYER              │
│    (Components / Pages / Layouts)       │
├─────────────────────────────────────────┤
│          BUSINESS LAYER                 │
│    (Hooks / Stores / Validators)        │
├─────────────────────────────────────────┤
│            DATA LAYER                   │
│    (Services / Repositories / Cache)    │
├─────────────────────────────────────────┤
│         INFRASTRUCTURE LAYER            │
│    (HTTP Client / Storage / Utils)      │
└─────────────────────────────────────────┘
```

**依赖规则**: 上层可以调用下层，下层不能调用上层。

### 2.2 数据流方向

```
User Action → Component → Hook → Service → API → Server
     ↑                                            ↓
     └───────── State Update ←── TanStack Query ←─┘
```

---

## 3. 目录结构设计

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 认证路由组
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (main)/                   # 主应用路由组
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── data-sources/page.tsx
│   │   └── ...
│   ├── api/                      # Next.js API Routes (可选)
│   ├── layout.tsx                # Root Layout
│   └── providers.tsx             # 全局 Provider
│
├── features/                     # 功能模块 (核心)
│   ├── auth/
│   │   ├── components/           # 认证相关组件
│   │   ├── hooks/                # useAuth, useLogin
│   │   ├── services/             # authApi.ts
│   │   ├── stores/               # authStore.ts
│   │   ├── types.ts              # Auth 类型定义
│   │   └── index.ts              # 模块导出
│   ├── data-source/
│   │   ├── components/
│   │   │   ├── DataSourceList.tsx
│   │   │   ├── DataSourceForm.tsx
│   │   │   └── DataSourceCard.tsx
│   │   ├── hooks/
│   │   │   ├── useDataSources.ts
│   │   │   ├── useCreateDataSource.ts
│   │   │   └── useUpdateDataSource.ts
│   │   ├── services/
│   │   │   ├── dataSourceApi.ts
│   │   │   ├── dataSourceCache.ts
│   │   │   └── types.ts
│   │   ├── stores/
│   │   │   └── dataSourceStore.ts
│   │   ├── validators/
│   │   │   └── dataSourceSchema.ts
│   │   └── index.ts
│   ├── data-import/
│   ├── scraping-rule/
│   ├── admin/
│   └── task/
│
├── components/                   # 全局共享组件
│   ├── ui/                       # 基础 UI 组件 (Button, Input...)
│   ├── common/                   # 通用业务组件 (ErrorBoundary...)
│   ├── layout/                   # 布局组件 (Header, Sidebar...)
│   └── dashboard/                # 仪表板专用组件
│
├── lib/                          # 基础设施层
│   ├── http/                     # HTTP 客户端
│   │   ├── client.ts             # 核心 HTTP 客户端
│   │   ├── interceptors.ts       # 请求/响应拦截器
│   │   ├── retry.ts              # 重试策略
│   │   └── types.ts              # HTTP 类型
│   ├── query/                    # TanStack Query 配置
│   │   ├── client.ts             # QueryClient 配置
│   │   ├── keys.ts               # 全局 Query Keys
│   │   └── options.ts            # 默认查询配置
│   ├── error/                    # 错误处理
│   │   ├── handler.ts            # 全局错误处理器
│   │   ├── boundary.tsx          # React Error Boundary
│   │   ├── codes.ts              # 错误码定义
│   │   └── types.ts              # 错误类型
│   ├── storage/                  # 存储封装
│   │   ├── local.ts              # localStorage
│   │   ├── session.ts            # sessionStorage
│   │   └── cookies.ts            # cookies
│   ├── utils/                    # 工具函数
│   │   ├── format.ts             # 格式化
│   │   ├── validate.ts           # 验证工具
│   │   └── async.ts              # 异步工具
│   └── config/                   # 全局配置
│       ├── api.ts                # API 端点配置
│       ├── constants.ts          # 常量
│       └── env.ts                # 环境变量
│
├── hooks/                        # 全局共享 Hooks
│   ├── useAuth.ts
│   ├── usePermission.ts
│   ├── useToast.ts
│   └── useDebounce.ts
│
├── types/                        # 全局类型定义
│   ├── api.ts                    # API 通用类型
│   ├── common.ts                 # 通用类型
│   └── index.ts
│
├── stores/                       # 全局状态 (Zustand)
│   ├── globalStore.ts            # 应用级状态
│   ├── themeStore.ts             # 主题状态
│   └── index.ts
│
└── test/                         # 测试配置
    ├── setup.ts
    └── mocks/
```

---

## 4. 核心模块设计

### 4.1 HTTP 客户端层 (`lib/http/`)

**设计目标**: 统一、可扩展、可配置的 HTTP 客户端

```typescript
// lib/http/client.ts
export interface HttpClientConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
}

export class HttpClient {
  private config: HttpClientConfig;
  private interceptors: InterceptorManager;
  
  constructor(config: HttpClientConfig) {
    this.config = config;
    this.interceptors = new InterceptorManager();
  }
  
  async request<T>(config: RequestConfig): Promise<T> {
    // 1. 请求拦截
    config = await this.interceptors.request.execute(config);
    
    // 2. 执行请求 (带重试)
    const response = await this.executeWithRetry(config);
    
    // 3. 响应拦截
    return this.interceptors.response.execute(response);
  }
  
  private async executeWithRetry(config: RequestConfig): Promise<Response> {
    // 实现指数退避重试
  }
}

// 单例导出
export const httpClient = new HttpClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
});
```

**拦截器设计**:

```typescript
// lib/http/interceptors.ts
export const authInterceptor: RequestInterceptor = {
  async onRequest(config) {
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
};

export const errorInterceptor: ResponseInterceptor = {
  async onError(error) {
    if (error.status === 401) {
      // Token 刷新逻辑
      return refreshAndRetry(error.config);
    }
    throw error;
  },
};
```

### 4.2 TanStack Query 层 (`lib/query/`)

**设计目标**: 统一的数据获取、缓存、同步策略

```typescript
// lib/query/client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // 5分钟过期
      gcTime: 10 * 60 * 1000,          // 10分钟垃圾回收
      retry: (failureCount, error) => {
        // 只重试网络错误，业务错误不重试
        if (error.code === 'NETWORK_ERROR') {
          return failureCount < 3;
        }
        return false;
      },
      refetchOnWindowFocus: false,     // 窗口聚焦不重取
      refetchOnReconnect: true,        // 重连后重取
    },
    mutations: {
      retry: false,
    },
  },
});

// lib/query/keys.ts
export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    permissions: () => [...queryKeys.auth.all, 'permissions'] as const,
  },
  dataSources: {
    all: ['dataSources'] as const,
    list: (filters: DataSourceFilter) => 
      [...queryKeys.dataSources.all, 'list', filters] as const,
    detail: (id: number) => 
      [...queryKeys.dataSources.all, 'detail', id] as const,
  },
  // ... 其他模块
};
```

**Service 层封装**:

```typescript
// features/data-source/services/dataSourceService.ts
import { queryClient } from '@/lib/query/client';
import { queryKeys } from '@/lib/query/keys';
import { httpClient } from '@/lib/http/client';

export const dataSourceService = {
  // 查询
  getList: (filters: DataSourceFilter) => ({
    queryKey: queryKeys.dataSources.list(filters),
    queryFn: async () => {
      const response = await httpClient.get('/api/v1/data-sources', {
        params: filters,
      });
      return response.data;
    },
  }),
  
  getDetail: (id: number) => ({
    queryKey: queryKeys.dataSources.detail(id),
    queryFn: async () => {
      const response = await httpClient.get(`/api/v1/data-sources/${id}`);
      return response.data;
    },
    enabled: !!id,
  }),
  
  // 修改 (乐观更新)
  update: {
    mutationFn: async ({ id, data }: { id: number; data: UpdateDTO }) => {
      return httpClient.patch(`/api/v1/data-sources/${id}`, data);
    },
    onMutate: async ({ id, data }) => {
      // 乐观更新
      await queryClient.cancelQueries({ queryKey: queryKeys.dataSources.detail(id) });
      const previous = queryClient.getQueryData(queryKeys.dataSources.detail(id));
      queryClient.setQueryData(queryKeys.dataSources.detail(id), (old) => ({ ...old, ...data }));
      return { previous };
    },
    onError: (err, vars, context) => {
      // 回滚
      queryClient.setQueryData(queryKeys.dataSources.detail(vars.id), context?.previous);
    },
    onSettled: (data, error, vars) => {
      // 重新验证
      queryClient.invalidateQueries({ queryKey: queryKeys.dataSources.detail(vars.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dataSources.all });
    },
  },
};
```

### 4.3 Hooks 层设计

**设计目标**: 业务逻辑的复用和封装

```typescript
// features/data-source/hooks/useDataSources.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataSourceService } from '../services/dataSourceService';

// 列表查询 Hook
export function useDataSources(filters: DataSourceFilter) {
  return useQuery({
    ...dataSourceService.getList(filters),
    select: (data) => ({
      ...data,
      items: data.items.map(normalizeDataSource),
    }),
  });
}

// 创建 Hook
export function useCreateDataSource() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  
  return useMutation({
    mutationFn: dataSourceService.create.mutationFn,
    onSuccess: () => {
      showSuccess('数据源创建成功');
      queryClient.invalidateQueries({ queryKey: ['dataSources'] });
    },
    onError: (error) => {
      showError(error.message || '创建失败');
    },
  });
}

// 无限滚动 Hook (用于大量数据)
export function useInfiniteDataSources(filters: DataSourceFilter) {
  return useInfiniteQuery({
    queryKey: ['dataSources', 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => 
      dataSourceService.getList({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => 
      lastPage.hasNext ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });
}
```

### 4.4 状态管理策略

**服务端状态**: TanStack Query
- 列表数据、详情数据
- 自动缓存、同步、重试

**客户端状态**: Zustand
- 用户偏好、UI 状态
- 主题、侧边栏展开状态
- 表单草稿状态

```typescript
// stores/globalStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GlobalState {
  // UI 状态
  sidebarCollapsed: boolean;
  activeModal: string | null;
  
  // 用户偏好
  theme: 'light' | 'dark' | 'system';
  language: 'zh' | 'en';
  
  // 操作
  toggleSidebar: () => void;
  setTheme: (theme: Theme) => void;
  openModal: (id: string) => void;
  closeModal: () => void;
}

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      activeModal: null,
      theme: 'system',
      language: 'zh',
      
      toggleSidebar: () => 
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setTheme: (theme) => set({ theme }),
      openModal: (id) => set({ activeModal: id }),
      closeModal: () => set({ activeModal: null }),
    }),
    {
      name: 'global-storage',
      partialize: (state) => ({ 
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        language: state.language,
      }),
    }
  )
);
```

---

## 5. 错误处理设计

### 5.1 错误分类

```typescript
// lib/error/types.ts
export enum ErrorCategory {
  NETWORK = 'NETWORK',           // 网络错误 (超时、断网)
  AUTH = 'AUTH',                 // 认证错误 (401、403)
  VALIDATION = 'VALIDATION',     // 验证错误 (400、422)
  BUSINESS = 'BUSINESS',         // 业务错误 (特定业务规则)
  SERVER = 'SERVER',             // 服务器错误 (500+)
  CLIENT = 'CLIENT',             // 客户端错误 (JS 异常)
}

export interface AppError {
  category: ErrorCategory;
  code: string;
  message: string;
  details?: Record<string, unknown>;
  originalError?: Error;
}
```

### 5.2 全局错误处理

```typescript
// lib/error/handler.ts
import { toast } from 'sonner';

export class GlobalErrorHandler {
  static handle(error: AppError, context?: ErrorContext) {
    console.error('[Error]', error, context);
    
    switch (error.category) {
      case ErrorCategory.AUTH:
        this.handleAuthError(error);
        break;
      case ErrorCategory.VALIDATION:
        this.handleValidationError(error, context);
        break;
      case ErrorCategory.NETWORK:
        this.handleNetworkError(error);
        break;
      case ErrorCategory.SERVER:
        this.handleServerError(error);
        break;
      default:
        this.handleGenericError(error);
    }
  }
  
  private static handleAuthError(error: AppError) {
    if (error.code === 'TOKEN_EXPIRED') {
      toast.error('登录已过期，请重新登录');
      window.location.href = '/login?reason=expired';
    } else if (error.code === 'NO_PERMISSION') {
      toast.error('没有权限执行此操作');
    }
  }
  
  private static handleNetworkError(error: AppError) {
    toast.error('网络连接失败，请检查网络', {
      action: {
        label: '重试',
        onClick: () => window.location.reload(),
      },
    });
  }
  
  private static handleServerError(error: AppError) {
    toast.error('服务器繁忙，请稍后重试');
    // 上报错误
    this.reportError(error);
  }
  
  private static handleValidationError(error: AppError, context?: ErrorContext) {
    if (context?.form) {
      // 表单错误由表单处理
      context.form.setErrors(error.details);
    } else {
      toast.error(error.message);
    }
  }
}

// QueryClient 错误处理
export const queryErrorHandler = (error: unknown) => {
  const appError = normalizeError(error);
  GlobalErrorHandler.handle(appError);
};
```

### 5.3 React Error Boundary

```typescript
// lib/error/boundary.tsx
'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorFallback } from '@/components/common/ErrorFallback';

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
    reportError({
      error,
      componentStack: info.componentStack,
      timestamp: new Date().toISOString(),
    });
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallback error={this.state.error!} />;
    }
    
    return this.props.children;
  }
}
```

---

## 6. 性能优化策略

### 6.1 数据获取优化

```typescript
// 1. 并行请求
function useDashboardData() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchStats,
  });
  
  const { data: alerts } = useQuery({
    queryKey: ['dashboard', 'alerts'],
    queryFn: fetchAlerts,
  });
  
  const { data: trends } = useQuery({
    queryKey: ['dashboard', 'trends'],
    queryFn: fetchTrends,
  });
  
  // 使用 useQueries 同时发起
  const results = useQueries({
    queries: [
      { queryKey: ['stats'], queryFn: fetchStats },
      { queryKey: ['alerts'], queryFn: fetchAlerts },
      { queryKey: ['trends'], queryFn: fetchTrends },
    ],
  });
  
  return { stats, alerts, trends };
}

// 2. 预取数据
function DataSourceList() {
  const queryClient = useQueryClient();
  
  const handleMouseEnter = (id: number) => {
    // 鼠标悬停时预取详情
    queryClient.prefetchQuery({
      queryKey: ['dataSource', id],
      queryFn: () => fetchDataSourceDetail(id),
      staleTime: 60 * 1000,
    });
  };
  
  return (
    <div>
      {dataSources.map(ds => (
        <Card 
          key={ds.id} 
          onMouseEnter={() => handleMouseEnter(ds.id)}
        />
      ))}
    </div>
  );
}

// 3. 虚拟列表
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualizedDataSourceList({ items }: { items: DataSource[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // 每项高度
    overscan: 5, // 预渲染数量
  });
  
  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <DataSourceCard data={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 6.2 代码分割与懒加载

```typescript
// 1. 组件懒加载
const DataSourceDetail = lazy(() => 
  import('@/features/data-source/components/DataSourceDetail')
);

// 2. 路由级别分割
export default function DataSourcePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DataSourceDetail />
    </Suspense>
  );
}

// 3. 动态导入 API
async function loadHeavyComponent() {
  const { HeavyChart } = await import('@/components/charts/HeavyChart');
  return HeavyChart;
}
```

---

## 7. 测试策略

### 7.1 测试金字塔

```
        /\
       /  \
      / E2E \           (Playwright) - 关键流程
     /--------\
    /    Integration   (RTL + MSW) - API 交互
   /----------------\  
  /      Unit         (Vitest) - 业务逻辑、工具函数
 /--------------------\
```

### 7.2 关键测试场景

```typescript
// features/data-source/hooks/__tests__/useDataSources.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDataSources } from '../useDataSources';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

describe('useDataSources', () => {
  it('应该正确获取数据源列表', async () => {
    const { result } = renderHook(() => useDataSources({}), {
      wrapper: createWrapper(),
    });
    
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    
    expect(result.current.data).toHaveLength(3);
  });
  
  it('应该处理错误状态', async () => {
    server.use(
      http.get('/api/v1/data-sources', () => {
        return HttpResponse.error();
      })
    );
    
    const { result } = renderHook(() => useDataSources({}), {
      wrapper: createWrapper(),
    });
    
    await waitFor(() => expect(result.current.isError).toBe(true));
    
    expect(result.current.error).toBeDefined();
  });
});

// lib/http/__tests__/client.test.ts
describe('HttpClient', () => {
  it('应该自动重试网络错误', async () => {
    let attempts = 0;
    server.use(
      http.get('/api/test', () => {
        attempts++;
        if (attempts < 3) {
          return HttpResponse.error();
        }
        return HttpResponse.json({ success: true });
      })
    );
    
    const result = await httpClient.get('/api/test');
    
    expect(attempts).toBe(3);
    expect(result).toEqual({ success: true });
  });
});
```

---

## 8. 安全考虑

### 8.1 XSS 防护

```typescript
// 1. 输入清理
import DOMPurify from 'dompurify';

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input);
}

// 2. 安全的 dangerouslySetInnerHTML
export function SafeHTML({ html }: { html: string }) {
  const clean = useMemo(() => sanitizeInput(html), [html]);
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
```

### 8.2 CSRF 防护

```typescript
// lib/http/interceptors.ts
export const csrfInterceptor: RequestInterceptor = {
  async onRequest(config) {
    const csrfToken = getCsrfToken();
    if (csrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method)) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    return config;
  },
};
```

---

## 9. 实施路线图

### Phase 1: 基础设施 (Week 1-2)
- [ ] 搭建 TanStack Query 基础配置
- [ ] 重构 HTTP 客户端层
- [ ] 实现全局错误处理
- [ ] 创建 Query Keys 管理

### Phase 2: Feature 迁移 (Week 3-4)
- [ ] 迁移 data-source 模块
- [ ] 迁移 auth 模块
- [ ] 迁移 data-import 模块
- [ ] 添加乐观更新

### Phase 3: 优化与测试 (Week 5)
- [ ] 性能优化（预取、虚拟列表）
- [ ] 完善错误边界
- [ ] 编写测试用例
- [ ] 添加监控和日志

---

## 10. 关键决策记录

| 决策 | 方案 | 理由 |
|------|------|------|
| 状态管理 | TanStack Query + Zustand | 服务端/客户端状态分离，职责清晰 |
| 数据获取 | React Query | 内置缓存、重试、乐观更新 |
| 错误处理 | 集中式 | 统一用户体验，便于监控 |
| 架构模式 | Feature-based | 与现有结构兼容，易于扩展 |
| HTTP 客户端 | 原生 Fetch + 封装 | 轻量，无额外依赖，完全可控 |

---

**文档版本**: 1.0  
**最后更新**: 2026-02-08
