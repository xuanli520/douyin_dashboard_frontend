# 数据源管理页面实现规划

## 项目背景分析

基于提供的OpenAPI 3.1.0规范，需要实现以下功能模块：
1. **数据源管理模块** (data-source) - 完整CRUD + 状态管理
2. **采集规则模块** (scraping-rule) - 关联数据源的规则管理

## API接口详细分析

### Data Source模块接口

#### 1. 数据源列表查询
- **接口**: `GET /api/v1/data-sources`
- **认证**: OAuth2PasswordBearer
- **参数**:
  - `page` (query, int, default=1)
  - `size` (query, int, default=20, max=100)
  - `status` (query, enum: active|inactive|error, optional)
  - `source_type` (query, enum: douyin_api|file_upload|database|webhook, optional)
  - `name` (query, string, max=100, optional)
- **响应**: `Response_dict_str__Any__`
- **数据结构**:
  ```typescript
  interface DataSourceResponse {
    id: number;
    name: string;
    type: DataSourceType;
    config: Record<string, any>;
    status: DataSourceStatus;
    description?: string;
    created_at: string;  // ISO datetime
    updated_at: string;  // ISO datetime
  }
  
  interface ListResponse<T> {
    code: number;
    msg: string;
    data?: T;
  }
  ```

#### 2. 创建数据源
- **接口**: `POST /api/v1/data-sources`
- **请求体**: `DataSourceCreate`
  ```typescript
  interface DataSourceCreate {
    name: string;           // 1-100 chars
    type: DataSourceType;   // douyin_api | file_upload | database | webhook
    config: Record<string, any>;  // 连接配置
    status?: DataSourceStatus;   // default: active
    description?: string;    // max 500 chars
  }
  ```

#### 3. 获取单个数据源
- **接口**: `GET /api/v1/data-sources/{ds_id}`
- **路径参数**: `ds_id` (integer)

#### 4. 更新数据源
- **接口**: `PUT /api/v1/data-sources/{ds_id}`
- **请求体**: `DataSourceUpdate`
  ```typescript
  interface DataSourceUpdate {
    name?: string;
    config?: Record<string, any>;
    status?: DataSourceStatus;
    description?: string;
  }
  ```

#### 5. 删除数据源
- **接口**: `DELETE /api/v1/data-sources/{ds_id}`

#### 6. 数据源状态操作
- **激活**: `POST /api/v1/data-sources/{ds_id}/activate`
- **停用**: `POST /api/v1/data-sources/{ds_id}/deactivate`

#### 7. 连接验证
- **接口**: `POST /api/v1/data-sources/{ds_id}/validate`

#### 8. 获取关联采集规则
- **接口**: `GET /api/v1/data-sources/{ds_id}/scraping-rules`

### Scraping Rule模块接口

#### 1. 创建采集规则
- **接口**: `POST /api/v1/scraping-rules`
- **认证**: OAuth2PasswordBearer
- **请求体**: `ScrapingRuleCreate`
  ```typescript
  interface ScrapingRuleCreate {
    data_source_id: number;   // > 0
    name: string;             // 1-100 chars
    rule_type: ScrapingRuleType;  // orders | products | users | comments
    config: Record<string, any>;  // 规则配置
    schedule?: string;         // cron表达式, max 100 chars
    is_active?: boolean;       // default: true
    description?: string;     // max 500 chars
  }
  ```

#### 2. 获取采集规则
- **接口**: `GET /api/v1/scraping-rules/{rule_id}`

#### 3. 更新采集规则
- **接口**: `PUT /api/v1/scraping-rules/{rule_id}`
- **请求体**: `ScrapingRuleUpdate`
  ```typescript
  interface ScrapingRuleUpdate {
    name?: string;
    config?: Record<string, any>;
    schedule?: string;
    is_active?: boolean;
    description?: string;
  }
  ```

#### 4. 删除采集规则
- **接口**: `DELETE /api/v1/scraping-rules/{rule_id}`

## 前端技术栈建议

### 推荐方案
```yaml
框架: React 18 + TypeScript
状态管理: TanStack Query (React Query) + Zustand
UI组件库: Ant Design 5.x 或 Material-UI
HTTP客户端: Axios
表单处理: React Hook Form + Zod
路由: React Router v6
```

### 理由
1. **TanStack Query**: 专门处理服务端状态，自动缓存、后台刷新、乐观更新
2. **Axios**: 成熟的HTTP客户端，拦截器机制适合统一处理认证和错误
3. **React Hook Form**: 高性能表单库，支持复杂验证
4. **Zod**: 与TypeScript深度集成，运行时验证

## 目录结构规划

```
src/
├── features/
│   ├── data-source/
│   │   ├── components/
│   │   │   ├── DataSourceList/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── DataSourceTable.tsx
│   │   │   │   ├── FilterForm.tsx
│   │   │   │   └── types.ts
│   │   │   ├── DataSourceForm/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── CreateForm.tsx
│   │   │   │   ├── EditForm.tsx
│   │   │   │   └── ConfigFields/
│   │   │   ├── DataSourceDetail/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── InfoCard.tsx
│   │   │   │   ├── StatusBadge.tsx
│   │   │   │   └── AssociatedRules.tsx
│   │   │   └── common/
│   │   │       ├── TypeTag.tsx
│   │   │       ├── StatusTag.tsx
│   │   │       └── ActionButtons.tsx
│   │   ├── hooks/
│   │   │   ├── useDataSources.ts
│   │   │   ├── useDataSource.ts
│   │   │   ├── useCreateDataSource.ts
│   │   │   ├── useUpdateDataSource.ts
│   │   │   ├── useDeleteDataSource.ts
│   │   │   ├── useActivateDataSource.ts
│   │   │   ├── useValidateDataSource.ts
│   │   │   └── useDataSourceRules.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── dataSourceApi.ts
│   │   │   └── types.ts
│   │   └── index.ts
│   │
│   └── scraping-rule/
│       ├── components/
│       │   ├── ScrapingRuleList/
│       │   │   ├── index.tsx
│       │   │   ├── RuleTable.tsx
│       │   │   └── types.ts
│       │   ├── ScrapingRuleForm/
│       │   │   ├── index.tsx
│       │   │   ├── CreateForm.tsx
│       │   │   ├── EditForm.tsx
│       │   │   └── RuleConfigFields.tsx
│       │   └── common/
│       │       ├── RuleTypeTag.tsx
│       │       └── ScheduleDisplay.tsx
│       ├── hooks/
│       │   ├── useScrapingRules.ts
│       │   ├── useScrapingRule.ts
│       │   ├── useCreateScrapingRule.ts
│       │   ├── useUpdateScrapingRule.ts
│       │   └── useDeleteScrapingRule.ts
│       ├── services/
│       │   ├── api.ts
│       │   ├── scrapingRuleApi.ts
│       │   └── types.ts
│       └── index.ts
│
├── services/
│   ├── api-client.ts      # Axios实例配置
│   ├── request.ts         # 统一请求封装
│   └── response.ts        # 响应类型定义
│
├── hooks/
│   └── useAuth.ts         # 认证状态
│
├── types/
│   ├── api.ts            # 通用API类型
│   └── index.ts
│
└── pages/
    ├── DataSourceManagement/
    │   ├── index.tsx
    │   └── DataSourceDetailPage.tsx
    └── ScrapingRuleManagement/
        ├── index.tsx
        └── RuleDetailPage.tsx
```

## API服务层设计

### Axios实例配置
```typescript
// src/services/api-client.ts
import axios from 'axios';
import { message } from 'antd';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 - 统一错误处理
apiClient.interceptors.response.use(
  (response) => {
    const { code, msg, data } = response.data;
    if (code === 0 || code === 200) {
      return data;
    }
    message.error(msg || '请求失败');
    return Promise.reject(new Error(msg));
  },
  (error) => {
    const { response } = error;
    if (response) {
      switch (response.status) {
        case 401:
          message.error('未登录或登录已过期');
          // 跳转到登录页
          break;
        case 403:
          message.error('没有权限');
          break;
        case 404:
          message.error('资源不存在');
          break;
        case 422:
          message.error('参数验证失败');
          break;
        default:
          message.error(response.data?.msg || '请求失败');
      }
    } else {
      message.error('网络错误');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Data Source API封装
```typescript
// src/features/data-source/services/dataSourceApi.ts
import apiClient from '@/services/api-client';
import type {
  DataSource,
  DataSourceCreate,
  DataSourceUpdate,
  ListParams,
  ListResponse,
} from './types';

export const dataSourceApi = {
  // 获取数据源列表
  list: (params: ListParams) =>
    apiClient.get<ListResponse<DataSource[]>>('/data-sources', { params }),
  
  // 获取单个数据源
  getById: (dsId: number) =>
    apiClient.get<DataSource>(`/data-sources/${dsId}`),
  
  // 创建数据源
  create: (data: DataSourceCreate) =>
    apiClient.post<DataSource>('/data-sources', data),
  
  // 更新数据源
  update: (dsId: number, data: DataSourceUpdate) =>
    apiClient.put<DataSource>(`/data-sources/${dsId}`, data),
  
  // 删除数据源
  delete: (dsId: number) =>
    apiClient.delete(`/data-sources/${dsId}`),
  
  // 激活数据源
  activate: (dsId: number) =>
    apiClient.post<DataSource>(`/data-sources/${dsId}/activate`),
  
  // 停用数据源
  deactivate: (dsId: number) =>
    apiClient.post<DataSource>(`/data-sources/${dsId}/deactivate`),
  
  // 验证连接
  validate: (dsId: number) =>
    apiClient.post<{ valid: boolean; message?: string }>(
      `/data-sources/${dsId}/validate`
    ),
  
  // 获取关联的采集规则
  getScrapingRules: (dsId: number) =>
    apiClient.get(`/data-sources/${dsId}/scraping-rules`),
};
```

## 组件设计

### 1. 数据源列表页面
```tsx
// src/features/data-source/components/DataSourceList/index.tsx
import { useState } from 'react';
import { Table, Button, Space, Tag, Card } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useDataSources } from '../../hooks/useDataSources';
import { FilterForm } from './FilterForm';
import { StatusTag } from '../../common/StatusTag';
import { TypeTag } from '../../common/TypeTag';

export const DataSourceList = () => {
  const [filters, setFilters] = useState({});
  const { data, isLoading, refetch } = useDataSources(filters);

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: DataSource) => (
        <a onClick={() => navigate(`/data-sources/${record.id}`)}>
          {name}
        </a>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: DataSourceType) => <TypeTag type={type} />,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: DataSourceStatus) => <StatusTag status={status} />,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: DataSource) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleValidate(record.id)}>
            测试连接
          </Button>
          <Button type="link" size="small" onClick={() => navigate(`/data-sources/${record.id}/edit`)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除该数据源？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <FilterForm onSearch={setFilters} />
      <Table
        columns={columns}
        dataSource={data?.list}
        loading={isLoading}
        rowKey="id"
        pagination={{
          current: data?.page,
          pageSize: data?.size,
          total: data?.total,
          onChange: (page, size) => setFilters({ ...filters, page, size }),
        }}
      />
    </Card>
  );
};
```

### 2. 数据源表单组件
```tsx
// src/features/data-source/components/DataSourceForm/CreateForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Drawer, Form, Input, Select, Button, Spin } from 'antd';
import { useCreateDataSource } from '../../hooks/useCreateDataSource';
import type { DataSourceCreate, DataSourceType } from '../../services/types';
import { dataSourceSchema } from './schema';

interface Props {
  open: boolean;
  onClose: () => void;
}

const DATA_SOURCE_TYPES: { label: string; value: DataSourceType }[] = [
  { label: '抖音API', value: 'douyin_api' },
  { label: '文件上传', value: 'file_upload' },
  { label: '数据库', value: 'database' },
  { label: 'Webhook', value: 'webhook' },
];

export const CreateForm = ({ open, onClose }: Props) => {
  const form = useForm<DataSourceCreate>({
    resolver: zodResolver(dataSourceSchema),
    defaultValues: { status: 'active', is_active: true },
  });

  const { mutate: create, isPending } = useCreateDataSource({
    onSuccess: () => {
      message.success('创建成功');
      onClose();
      form.reset();
    },
  });

  const onSubmit = (data: DataSourceCreate) => create(data);

  return (
    <Drawer title="创建数据源" open={open} onClose={onClose} width={600}>
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="name"
          label="名称"
          rules={[{ required: true, message: '请输入名称' }]}
        >
          <Input placeholder="请输入数据源名称" />
        </Form.Item>

        <Form.Item
          name="type"
          label="类型"
          rules={[{ required: true, message: '请选择类型' }]}
        >
          <Select options={DATA_SOURCE_TYPES} placeholder="请选择数据源类型" />
        </Form.Item>

        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) => {
            const type = getFieldValue('type');
            return <ConfigFields type={type} form={form} />;
          }}
        </Form.Item>

        <Form.Item name="description" label="描述">
          <Input.TextArea rows={3} placeholder="请输入描述信息" />
        </Form.Item>

        <Form.Item style={{ marginTop: 24 }}>
          <Space>
            <Button type="primary" htmlType="submit" loading={isPending}>
              确定
            </Button>
            <Button onClick={onClose}>取消</Button>
          </Space>
        </Form.Item>
      </Form>
    </Drawer>
  );
};
```

## 状态管理钩子设计

### 使用TanStack Query封装
```typescript
// src/features/data-source/hooks/useDataSources.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataSourceApi } from '../services/dataSourceApi';
import { message } from 'antd';
import type { ListParams } from '../services/types';

export const useDataSources = (params: ListParams) => {
  return useQuery({
    queryKey: ['dataSources', params],
    queryFn: () => dataSourceApi.list(params),
    staleTime: 5 * 60 * 1000, // 5分钟内不重新请求
  });
};

export const useDataSource = (id: number) => {
  return useQuery({
    queryKey: ['dataSource', id],
    queryFn: () => dataSourceApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateDataSource = (options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => dataSourceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataSources'] });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      message.error(error.message || '创建失败');
      options?.onError?.(error);
    },
  });
};

export const useUpdateDataSource = (options?: {
  onSuccess?: () => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      dataSourceApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['dataSources'] });
      queryClient.invalidateQueries({ queryKey: ['dataSource', id] });
      message.success('更新成功');
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      message.error(error.message || '更新失败');
    },
  });
};

export const useDeleteDataSource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => dataSourceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataSources'] });
      message.success('删除成功');
    },
    onError: (error: Error) => {
      message.error(error.message || '删除失败');
    },
  });
};

export const useActivateDataSource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => dataSourceApi.activate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['dataSources'] });
      queryClient.invalidateQueries({ queryKey: ['dataSource', id] });
      message.success('已激活');
    },
    onError: (error: Error) => {
      message.error(error.message || '操作失败');
    },
  });
};

export const useValidateDataSource = () => {
  return useMutation({
    mutationFn: (id: number) => dataSourceApi.validate(id),
    onSuccess: (data) => {
      if (data.valid) {
        message.success('连接成功');
      } else {
        message.warning(data.message || '连接失败');
      }
    },
    onError: () => {
      message.error('连接验证失败');
    },
  });
};
```

## 路由配置

```typescript
// src/router/index.tsx
const routes = [
  {
    path: '/data-sources',
    name: '数据源管理',
    children: [
      {
        path: '',
        element: <DataSourceListPage />,
      },
      {
        path: ':id',
        element: <DataSourceDetailPage />,
      },
      {
        path: 'create',
        element: <CreateDataSourcePage />,
      },
      {
        path: ':id/edit',
        element: <EditDataSourcePage />,
      },
    ],
  },
  {
    path: '/scraping-rules',
    name: '采集规则管理',
    children: [
      {
        path: '',
        element: <ScrapingRuleListPage />,
      },
      {
        path: 'create',
        element: <CreateScrapingRulePage />,
      },
      {
        path: ':id',
        element: <ScrapingRuleDetailPage />,
      },
      {
        path: ':id/edit',
        element: <EditScrapingRulePage />,
      },
    ],
  },
];
```

## 实施任务分解

### 阶段一：基础框架搭建

1. **创建API类型定义文件**
   - 创建 `src/features/data-source/services/types.ts`
   - 创建 `src/features/scraping-rule/services/types.ts`
   - 定义所有接口对应的TypeScript类型

2. **配置Axios实例**
   - 创建 `src/services/api-client.ts`
   - 配置请求/响应拦截器
   - 统一错误处理

3. **封装API服务层**
   - 创建 `src/features/data-source/services/dataSourceApi.ts`
   - 创建 `src/features/scraping-rule/services/scrapingRuleApi.ts`
   - 实现所有接口的封装

### 阶段二：数据源模块实现

4. **实现数据源列表页**
   - 创建 `DataSourceList` 组件
   - 实现筛选表单（名称、类型、状态）
   - 实现表格展示（分页、排序）
   - 实现操作按钮（激活、停用、删除、验证）

5. **实现数据源表单页**
   - 创建 `CreateForm` 和 `EditForm` 组件
   - 实现动态表单（根据类型显示不同配置字段）
   - 实现表单验证

6. **实现数据源详情页**
   - 创建 `DataSourceDetail` 组件
   - 显示基本信息
   - 显示关联的采集规则列表

### 阶段三：采集规则模块实现

7. **实现采集规则列表页**
   - 创建 `ScrapingRuleList` 组件
   - 实现表格展示
   - 实现CRUD操作

8. **实现采集规则表单页**
   - 创建 `CreateForm` 和 `EditForm` 组件
   - 实现规则配置表单

9. **实现采集规则详情页**
   - 创建 `ScrapingRuleDetail` 组件
   - 显示规则详细信息

### 阶段四：优化与测试

10. **添加加载状态和错误处理**
    - 实现骨架屏
    - 实现错误边界
    - 实现重试机制

11. **性能优化**
    - 实现乐观更新
    - 添加缓存策略
    - 实现预加载

12. **单元测试**
    - 编写API封装测试
    - 编写组件测试
    - 编写钩子测试

## 依赖安装清单

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@tanstack/react-query": "^5.8.0",
    "axios": "^1.6.0",
    "antd": "^5.11.0",
    "@ant-design/icons": "^5.2.6",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0",
    "dayjs": "^1.11.0",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/lodash": "^4.14.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

## 注意事项

1. **认证处理**: 确保在请求头中正确添加Bearer Token
2. **错误处理**: 统一拦截器处理，避免每个请求都写try-catch
3. **类型安全**: 严格遵循OpenAPI定义的类型
4. **性能考虑**: 使用React Query的缓存机制减少请求
5. **用户体验**: 添加加载状态、确认对话框、操作反馈
6. **响应式设计**: 确保在不同屏幕尺寸下正常显示

## 验证步骤

1. 确保所有API接口调用成功
2. 确保分页、筛选功能正常工作
3. 确保乐观更新用户体验流畅
4. 确保错误提示信息清晰
5. 确保权限控制正确（未登录用户无法访问）
