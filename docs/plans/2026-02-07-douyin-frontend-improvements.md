# Douyin 前端项目改进实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 根据代码审查报告系统性修复所有问题，提升代码质量、测试覆盖率和安全性

**Architecture:** 按优先级分4个阶段实施，每个阶段解决特定级别的问题，确保核心功能稳定性

**Tech Stack:** Next.js 16, React 18, TypeScript 5, Vitest, MUI 7, Tailwind CSS 4

---

## 前置任务

### Task 0: 项目结构检查

**Files:**
- Check: `src/services/userService.ts`
- Check: `src/features/data-source/` 
- Check: `src/features/scraping-rule/`
- Check: `next.config.mjs`
- Check: `src/middleware.ts`

**Step 1: 确认项目结构存在**

```bash
ls -la src/features/data-source/
ls -la src/features/scraping-rule/
ls -la src/services/
```

Expected: 目录结构完整

**Step 2: 确认测试框架**

```bash
cat package.json | grep -A 5 "vitest"
```

Expected: vitest 已安装配置

---

## Phase 1: Critical Issues（1-2周）

### Task 1.1: 修复 userService.ts switch 类型安全问题

**Files:**
- Modify: `src/services/userService.ts:94-128`
- Test: `src/services/userService.test.ts`

**Step 1: 编写测试验证 switch 缺陷**

```typescript
// src/services/userService.test.ts
import { describe, it, expect } from 'vitest';
import { authenticatedRequest } from './userService';

describe('authenticatedRequest', () => {
  it('should throw error for invalid HTTP method', async () => {
    await expect(
      authenticatedRequest('INVALID' as any, '/test')
    ).rejects.toThrow('Invalid HTTP method: INVALID');
  });
});
```

**Step 2: 运行测试确认失败**

```bash
npm test src/services/userService.test.ts
```

Expected: FAIL - 未抛出错误

**Step 3: 添加 default 分支**

```typescript
// src/services/userService.ts
switch (method) {
  case 'GET':
    response = await authGet<ApiResponse<T>>(url, options);
    break;
  case 'POST':
    response = await authPost<ApiResponse<T>>(url, data, options);
    break;
  case 'PUT':
    response = await authPut<ApiResponse<T>>(url, data, options);
    break;
  case 'DELETE':
    response = await authDelete<ApiResponse<T>>(url, options);
    break;
  case 'PATCH':
    response = await authPatch<ApiResponse<T>>(url, data, options);
    break;
  default:
    throw new Error(`Invalid HTTP method: ${method}`);
}
```

**Step 4: 运行测试确认通过**

```bash
npm test src/services/userService.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/services/userService.ts src/services/userService.test.ts
git commit -m "fix: add default branch to switch statement for type safety"
```

---

### Task 1.2: 为 data-source 模块添加测试覆盖

**Files:**
- Create: `src/features/data-source/services/__tests__/dataSourceApi.test.ts`
- Create: `src/features/data-source/hooks/__tests__/useDataSources.test.ts`
- Create: `src/features/data-source/components/__tests__/DataSourceList.test.tsx`

**Step 1: 创建 dataSourceApi 测试**

```typescript
// src/features/data-source/services/__tests__/dataSourceApi.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dataSourceApi } from '../dataSourceApi';
import * as userService from '@/services/userService';

vi.mock('@/services/userService');

describe('dataSourceApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch data sources list', async () => {
    const mockResponse = {
      data: {
        items: [{ id: 1, name: 'Test Source', type: 'DOUYIN_API' }],
        total: 1
      }
    };
    vi.mocked(userService.authenticatedRequest).mockResolvedValue(mockResponse);

    const result = await dataSourceApi.getDataSources();
    
    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe('Test Source');
  });

  it('should create data source', async () => {
    const mockData = { name: 'New Source', type: 'douyin_api', config: {} };
    const mockResponse = { data: { id: 1, ...mockData } };
    vi.mocked(userService.authenticatedRequest).mockResolvedValue(mockResponse);

    const result = await dataSourceApi.createDataSource(mockData);
    
    expect(result.id).toBe(1);
  });
});
```

**Step 2: 运行测试确认失败**

```bash
npm test src/features/data-source/services/__tests__/dataSourceApi.test.ts
```

Expected: FAIL - 文件不存在

**Step 3: 确认 API 实现完整**

检查 `src/features/data-source/services/dataSourceApi.ts` 实现是否完整

**Step 4: 运行测试确认通过**

```bash
npm test src/features/data-source/services/__tests__/dataSourceApi.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/features/data-source/services/__tests__/
git commit -m "test: add unit tests for dataSourceApi"
```

---

### Task 1.3: 为 scraping-rule 模块添加测试覆盖

**Files:**
- Create: `src/features/scraping-rule/services/__tests__/scrapingRuleApi.test.ts`
- Create: `src/features/scraping-rule/hooks/__tests__/useScrapingRules.test.ts`

**Step 1: 创建 scrapingRuleApi 测试**

```typescript
// src/features/scraping-rule/services/__tests__/scrapingRuleApi.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scrapingRuleApi } from '../scrapingRuleApi';
import * as userService from '@/services/userService';

vi.mock('@/services/userService');

describe('scrapingRuleApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch scraping rules', async () => {
    const mockResponse = {
      data: {
        items: [{ id: 1, name: 'Test Rule', status: 'active' }],
        total: 1
      }
    };
    vi.mocked(userService.authenticatedRequest).mockResolvedValue(mockResponse);

    const result = await scrapingRuleApi.getScrapingRules();
    
    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe('Test Rule');
  });

  it('should update rule status', async () => {
    const mockResponse = { data: { id: 1, status: 'inactive' } };
    vi.mocked(userService.authenticatedRequest).mockResolvedValue(mockResponse);

    const result = await scrapingRuleApi.updateRuleStatus(1, 'inactive');
    
    expect(result.status).toBe('inactive');
  });
});
```

**Step 2: 运行测试确认失败**

```bash
npm test src/features/scraping-rule/services/__tests__/scrapingRuleApi.test.ts
```

Expected: FAIL - 文件不存在

**Step 3: 确认 API 实现**

检查 `src/features/scraping-rule/services/scrapingRuleApi.ts` 实现

**Step 4: 运行测试确认通过**

```bash
npm test src/features/scraping-rule/services/__tests__/scrapingRuleApi.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/features/scraping-rule/services/__tests__/
git commit -m "test: add unit tests for scrapingRuleApi"
```

---

## Phase 2: Important Issues（1-2周）

### Task 2.1: 统一组件文件组织方式

**Files:**
- Create: `src/features/data-source/components/DataSourceList/index.tsx`
- Move: `src/features/data-source/components/DataSourceList.tsx` → `src/features/data-source/components/DataSourceList/DataSourceList.tsx`
- Create: `src/features/data-source/components/DataSourceList/index.ts`

**Step 1: 检查当前结构**

```bash
ls -la src/features/data-source/components/
```

Expected: 混合结构（目录和文件并存）

**Step 2: 重构 DataSourceList 为目录结构**

```typescript
// src/features/data-source/components/DataSourceList/DataSourceList.tsx
// 将现有 DataSourceList.tsx 内容移动到此文件

export function DataSourceList() {
  // 组件实现
}
```

```typescript
// src/features/data-source/components/DataSourceList/index.ts
export { DataSourceList } from './DataSourceList';
```

**Step 3: 更新引用路径**

```typescript
// 更新所有导入 DataSourceList 的文件
// 例如: src/app/(main)/data-source/page.tsx
import { DataSourceList } from '@/features/data-source/components/DataSourceList';
```

**Step 4: 验证构建**

```bash
npm run build
```

Expected: 构建成功，无错误

**Step 5: Commit**

```bash
git add src/features/data-source/components/
git commit -m "refactor: unify component file organization to directory pattern"
```

---

### Task 2.2: API 端点使用环境变量

**Files:**
- Create: `.env.local.example`
- Modify: `next.config.mjs`
- Modify: `src/config/api.ts`

**Step 1: 创建环境变量模板**

```bash
# .env.local.example
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

**Step 2: 更新 next.config.mjs**

```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiBaseUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
```

**Step 3: 移除硬编码地址**

```typescript
// src/config/api.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
```

**Step 4: 验证环境变量加载**

```bash
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1" > .env.local
npm run dev
```

Expected: 服务启动，API 请求正常

**Step 5: Commit**

```bash
git add .env.local.example next.config.mjs src/config/api.ts
git commit -m "security: use environment variables for API endpoints"
```

---

### Task 2.3: 完善 Cookie 安全属性

**Files:**
- Modify: `src/middleware.ts:30-50`

**Step 1: 检查当前 Cookie 配置**

```bash
grep -A 10 "cookies.set" src/middleware.ts
```

**Step 2: 添加安全属性**

```typescript
// src/middleware.ts
// 在设置 cookie 时添加安全属性
const isProduction = process.env.NODE_ENV === 'production';

// 设置 auth_token cookie
response.cookies.set('auth_token', token, {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'strict',
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: '/',
});

// 设置 refresh_token cookie
response.cookies.set('refresh_token', refreshToken, {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'strict',
  maxAge: 60 * 60 * 24 * 30, // 30 days
  path: '/',
});
```

**Step 3: 运行类型检查**

```bash
npm run typecheck
```

Expected: 无类型错误

**Step 4: Commit**

```bash
git add src/middleware.ts
git commit -m "security: add secure attributes to auth cookies"
```

---

## Phase 3: Medium Issues（2-3周）

### Task 3.1: 优化 useDataSources Hook 添加请求控制

**Files:**
- Modify: `src/features/data-source/hooks/useDataSources.ts`
- Test: `src/features/data-source/hooks/__tests__/useDataSources.test.ts`

**Step 1: 添加 immediate 选项**

```typescript
// src/features/data-source/hooks/useDataSources.ts
interface UseDataSourcesOptions {
  immediate?: boolean;
  debounceMs?: number;
}

export function useDataSources(options: UseDataSourcesOptions = {}) {
  const { immediate = true, debounceMs = 300 } = options;
  // ... 现有代码
  
  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate]);
  
  return {
    data,
    loading,
    error,
    fetchData, // 暴露手动触发方法
    refetch: fetchData,
  };
}
```

**Step 2: 添加防抖处理**

```typescript
import { useCallback, useRef } from 'react';

export function useDataSources(options: UseDataSourcesOptions = {}) {
  const { debounceMs = 300 } = options;
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const fetchData = useCallback(async () => {
    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // 设置新的防抖定时器
    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await dataSourceApi.getDataSources(filters);
        setData(response);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }, debounceMs);
  }, [filters, debounceMs]);
  
  // 清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
}
```

**Step 3: 运行测试**

```bash
npm test src/features/data-source/hooks/__tests__/useDataSources.test.ts
```

Expected: PASS

**Step 4: Commit**

```bash
git add src/features/data-source/hooks/useDataSources.ts
git commit -m "feat: add debounce and immediate options to useDataSources hook"
```

---

### Task 3.2: 为表格组件添加虚拟滚动

**Files:**
- Install: `@tanstack/react-virtual`
- Modify: `src/features/data-source/components/DataSourceTable.tsx`
- Modify: `src/features/scraping-rule/components/RuleTable.tsx`

**Step 1: 安装虚拟滚动库**

```bash
npm install @tanstack/react-virtual
```

**Step 2: 重构 DataSourceTable**

```typescript
// src/features/data-source/components/DataSourceTable.tsx
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

interface DataSourceTableProps {
  data: DataSource[];
  rowHeight?: number;
  tableHeight?: number;
}

export function DataSourceTable({ 
  data, 
  rowHeight = 48, 
  tableHeight = 600 
}: DataSourceTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
  });
  
  return (
    <div ref={parentRef} style={{ height: tableHeight, overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const row = data[virtualRow.index];
          return (
            <div
              key={row.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {/* 行内容 */}
              <DataSourceRow data={row} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 3: 运行构建检查**

```bash
npm run build
```

Expected: 构建成功

**Step 4: Commit**

```bash
git add src/features/data-source/components/DataSourceTable.tsx
git commit -m "perf: add virtual scrolling to DataSourceTable for large datasets"
```

---

### Task 3.3: 重构 Create/Edit 表单组件复用

**Files:**
- Create: `src/features/scraping-rule/components/ScrapingRuleForm/BaseForm.tsx`
- Modify: `src/features/scraping-rule/components/ScrapingRuleForm/CreateForm.tsx`
- Modify: `src/features/scraping-rule/components/ScrapingRuleForm/EditForm.tsx`

**Step 1: 创建基础表单组件**

```typescript
// src/features/scraping-rule/components/ScrapingRuleForm/BaseForm.tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const scrapingRuleSchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  description: z.string().optional(),
  sourceType: z.string().min(1, '请选择数据源类型'),
  rules: z.array(z.object({
    field: z.string(),
    selector: z.string(),
    type: z.string(),
  })).min(1, '至少配置一个规则'),
});

type ScrapingRuleFormData = z.infer<typeof scrapingRuleSchema>;

interface BaseFormProps {
  initialData?: Partial<ScrapingRuleFormData>;
  onSubmit: (data: ScrapingRuleFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
  isLoading?: boolean;
}

export function BaseForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel,
  isLoading = false,
}: BaseFormProps) {
  const form = useForm<ScrapingRuleFormData>({
    resolver: zodResolver(scrapingRuleSchema),
    defaultValues: {
      name: '',
      description: '',
      sourceType: '',
      rules: [],
      ...initialData,
    },
  });
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* 表单字段 */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>规则名称</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* 其他字段... */}
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? '保存中...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
```

**Step 2: 重构 CreateForm**

```typescript
// src/features/scraping-rule/components/ScrapingRuleForm/CreateForm.tsx
import { BaseForm } from './BaseForm';
import { scrapingRuleApi } from '../../services/scrapingRuleApi';

export function CreateForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (data: ScrapingRuleFormData) => {
    setIsLoading(true);
    try {
      await scrapingRuleApi.createRule(data);
      router.push('/scraping-rule');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <BaseForm
      onSubmit={handleSubmit}
      onCancel={() => router.push('/scraping-rule')}
      submitLabel="创建规则"
      isLoading={isLoading}
    />
  );
}
```

**Step 3: 重构 EditForm**

```typescript
// src/features/scraping-rule/components/ScrapingRuleForm/EditForm.tsx
import { BaseForm } from './BaseForm';
import { scrapingRuleApi } from '../../services/scrapingRuleApi';

interface EditFormProps {
  ruleId: string;
}

export function EditForm({ ruleId }: EditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [initialData, setInitialData] = useState<Partial<ScrapingRuleFormData>>();
  
  useEffect(() => {
    scrapingRuleApi.getRuleById(ruleId).then(rule => {
      setInitialData(rule);
    });
  }, [ruleId]);
  
  const handleSubmit = async (data: ScrapingRuleFormData) => {
    setIsLoading(true);
    try {
      await scrapingRuleApi.updateRule(ruleId, data);
      router.push('/scraping-rule');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!initialData) {
    return <div>加载中...</div>;
  }
  
  return (
    <BaseForm
      initialData={initialData}
      onSubmit={handleSubmit}
      onCancel={() => router.push('/scraping-rule')}
      submitLabel="保存修改"
      isLoading={isLoading}
    />
  );
}
```

**Step 4: 运行测试**

```bash
npm test src/features/scraping-rule/components/ScrapingRuleForm/
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/features/scraping-rule/components/ScrapingRuleForm/
git commit -m "refactor: extract shared BaseForm component for Create/Edit forms"
```

---

## Phase 4: Minor Issues（1周）

### Task 4.1: 建立统一的类型导出入口

**Files:**
- Create: `src/types/index.ts`
- Modify: 各模块类型文件添加导出

**Step 1: 创建统一类型入口**

```typescript
// src/types/index.ts
// 用户模块类型
export type { User, UserRole, Permission } from './user';

// 数据源模块类型
export type {
  DataSource,
  DataSourceType,
  DataSourceConfig,
  DataSourceFilters,
} from '@/features/data-source/types/dataSource';

// 爬虫规则模块类型
export type {
  ScrapingRule,
  RuleConfig,
  RuleStatus,
} from '@/features/scraping-rule/types/scrapingRule';

// API 通用类型
export interface ApiResponse<T> {
  data: T;
  message?: string;
  code: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

**Step 2: 更新模块类型文件**

确保每个模块的类型文件都有明确的导出：

```typescript
// src/features/data-source/types/dataSource.ts
export interface DataSource {
  id: number;
  name: string;
  type: DataSourceType;
  config: DataSourceConfig;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export type DataSourceType = 'DOUYIN_API' | 'DOUYIN_SHOP' | 'CSV' | 'EXCEL';

export interface DataSourceConfig {
  apiKey?: string;
  apiSecret?: string;
  endpoint?: string;
  // ... 其他配置
}

export interface DataSourceFilters {
  type?: DataSourceType;
  status?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}
```

**Step 3: 更新项目引用**

```typescript
// 之前
import { DataSource } from '@/features/data-source/types/dataSource';
import { User } from '@/types/user';

// 之后
import { DataSource, User } from '@/types';
```

**Step 4: 运行类型检查**

```bash
npm run typecheck
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/types/
git commit -m "chore: establish unified type exports via src/types/index.ts"
```

---

### Task 4.2: 重命名 Cyber 组件为语义化名称

**Files:**
- Rename: `src/components/ui/cyber/` → `src/components/ui/dashboard/`
- Modify: 所有引用 Cyber 组件的文件

**Step 1: 重命名目录和组件**

```bash
mv src/components/ui/cyber src/components/ui/dashboard
```

**Step 2: 更新组件文件**

```typescript
// src/components/ui/dashboard/DashboardCard.tsx
// 之前: CyberCard
export function DashboardCard({ children, className }: DashboardCardProps) {
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-lg ${className}`}>
      {children}
    </div>
  );
}

// src/components/ui/dashboard/StatusBadge.tsx
// 之前: CyberBadge
export function StatusBadge({ status, children }: StatusBadgeProps) {
  const statusColors = {
    active: 'bg-green-500/20 text-green-400',
    inactive: 'bg-gray-500/20 text-gray-400',
    error: 'bg-red-500/20 text-red-400',
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-sm ${statusColors[status]}`}>
      {children}
    </span>
  );
}
```

**Step 3: 创建 barrel 导出**

```typescript
// src/components/ui/dashboard/index.ts
export { DashboardCard } from './DashboardCard';
export { StatusBadge } from './StatusBadge';
export { DashboardButton } from './DashboardButton';
// ... 其他组件
```

**Step 4: 全局替换引用**

```bash
# 使用 sed 或手动替换所有文件中的引用
# 之前
import { CyberCard } from '@/components/ui/cyber';

// 之后
import { DashboardCard } from '@/components/ui/dashboard';
```

**Step 5: 运行构建检查**

```bash
npm run build
```

Expected: 构建成功

**Step 6: Commit**

```bash
git add src/components/ui/dashboard/
git commit -m "refactor: rename Cyber components to semantic Dashboard components"
```

---

### Task 4.3: 修复 validateConnection 类型定义

**Files:**
- Modify: `src/features/data-source/services/dataSourceApi.ts:157`

**Step 1: 添加验证配置类型**

```typescript
// src/features/data-source/services/dataSourceApi.ts

export interface ValidateConnectionConfig {
  timeout?: number;
  retryCount?: number;
  testQuery?: string;
}

export interface ValidateConnectionResult {
  success: boolean;
  message: string;
  latency?: number;
  details?: Record<string, unknown>;
}

// 更新函数签名
validateConnection: async (
  id: number, 
  config?: ValidateConnectionConfig
): Promise<ValidateConnectionResult> => {
  const response = await authenticatedRequest<ApiResponse<ValidateConnectionResult>>(
    'POST',
    `${API_ENDPOINTS.DATA_SOURCES}/${id}/validate`,
    config
  );
  return response.data;
}
```

**Step 2: 运行类型检查**

```bash
npm run typecheck
```

Expected: PASS

**Step 3: Commit**

```bash
git add src/features/data-source/services/dataSourceApi.ts
git commit -m "types: add explicit types for validateConnection config parameter"
```

---

## 验证清单

### Phase 1 完成检查
- [ ] userService switch 语句有 default 分支
- [ ] data-source 模块测试覆盖率 > 80%
- [ ] scraping-rule 模块测试覆盖率 > 80%

### Phase 2 完成检查
- [ ] 所有组件使用统一的目录组织方式
- [ ] API 端点从环境变量读取
- [ ] Cookie 配置了 httpOnly, secure, sameSite

### Phase 3 完成检查
- [ ] useDataSources 支持 immediate 和 debounce 选项
- [ ] DataSourceTable 实现虚拟滚动
- [ ] Create/Edit 表单复用 BaseForm 组件

### Phase 4 完成检查
- [ ] src/types/index.ts 统一导出所有类型
- [ ] Cyber 组件已重命名为 Dashboard 组件
- [ ] validateConnection 有明确的类型定义

---

## 执行命令

**启动开发服务器:**
```bash
npm run dev
```

**运行测试:**
```bash
npm test
```

**类型检查:**
```bash
npm run typecheck
```

**构建:**
```bash
npm run build
```

**代码检查:**
```bash
npm run lint
```
