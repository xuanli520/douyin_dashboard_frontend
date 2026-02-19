# Douyin Frontend

## 安装与启动

```bash
npm i
npm run dev
```

## 后端 Mock API 状态接入说明

后端会通过统一响应结构返回端点开发状态：

```json
{
  "code": 70001,
  "msg": "该功能正在开发中，当前返回演示数据",
  "data": {
    "mock": true,
    "expected_release": "2026-03-01",
    "data": {}
  }
}
```

状态码约定：

- `70001`：开发中（HTTP 200）
- `70002`：规划中（HTTP 501）
- `70003`：已弃用（HTTP 410，或软弃用 HTTP 200 + `X-Deprecated` 响应头）

## 前端实现位置

- 类型定义：`src/types/endpoint.ts`
- 端点元数据：`src/config/endpoint-meta.ts`
- 状态配置：`src/config/endpoint-config.ts`
- HTTP 拦截器：`src/lib/http/interceptors.ts`
- 错误解析 Hook：`src/hooks/useApiError.ts`
- 端点状态 Hook：`src/hooks/useEndpointStatus.ts`
- 状态组件：
  - `src/app/components/ui/dev-mode-badge.tsx`
  - `src/app/components/ui/dev-placeholder.tsx`
  - `src/app/components/ui/endpoint-status-wrapper.tsx`

## 在页面中接入

### 1) 发起请求

```ts
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/features/analytics/services/analyticsApi';

const query = useQuery({
  queryKey: ['analysis', 'overview'],
  queryFn: () => analyticsApi.getOverview(),
});
```

### 2) 透传响应给状态包装组件

```tsx
import { EndpointStatusWrapper } from '@/app/components/ui/endpoint-status-wrapper';
import { API_ENDPOINTS } from '@/config/api';
import { HttpError } from '@/lib/http/types';

const responseData =
  query.data ??
  ((query.error as HttpError | null)?.data as
    | { code?: number; data?: Record<string, unknown> }
    | undefined);

return (
  <EndpointStatusWrapper
    path={API_ENDPOINTS.ANALYSIS_OVERVIEW}
    responseData={responseData}
    placeholderProps={{ icon: '📊' }}
  >
    <div>正常页面内容</div>
  </EndpointStatusWrapper>
);
```

### 3) 全局 Toast

`httpClient` 已注册 `endpointStatusInterceptor`，命中开发状态时会自动提示：

- 开发中：提示演示数据与预计发布时间
- 规划中：提示预计上线时间
- 已弃用：提示替代接口和移除时间

## 已接入示例页面

- `src/app/components/DataAnalysisPage.tsx` -> `API_ENDPOINTS.ANALYSIS_OVERVIEW`
- `src/app/components/RiskAlertPage.tsx` -> `API_ENDPOINTS.ALERTS_LIST`

## 相关 API 常量

新增于 `src/config/api.ts`：

- `ANALYSIS_OVERVIEW`
- `ALERTS_LIST`
- `REPORTS_OVERVIEW`
- `SCHEDULES_LIST`
- `SHOPS_LIST`
- `SHOP_SCORE(shop_id)`
- `METRIC_DETAIL(metric_type)`
- `TASKS_LIST`
- `TASK_RUN(task_id)`
- `TASK_EXECUTIONS(task_id)`
- `TASK_STOP(task_id)`
