import { EndpointStatus } from '@/types/endpoint';

export interface EndpointMeta {
  status: EndpointStatus;
  expectedRelease?: string;
  alternative?: string;
  removalDate?: string;
  description?: string;
}

export const ENDPOINT_META: Record<string, EndpointMeta> = {
  '/api/v1/analysis': {
    status: 'development',
    expectedRelease: '2026-03-01',
    description: '数据分析能力开发中',
  },
  '/api/v1/alerts': {
    status: 'development',
    expectedRelease: '2026-03-01',
    description: '风险预警能力开发中',
  },
  '/api/v1/reports': {
    status: 'development',
    expectedRelease: '2026-03-01',
    description: '报表能力开发中',
  },
  '/api/v1/schedules': {
    status: 'development',
    expectedRelease: '2026-03-01',
    description: '调度能力开发中',
  },
  '/api/v1/shops': {
    status: 'development',
    expectedRelease: '2026-03-01',
    description: '店铺相关能力开发中',
  },
  '/api/v1/shops/:shop_id/score': {
    status: 'development',
    expectedRelease: '2026-03-01',
    description: '店铺评分能力开发中',
  },
  '/api/v1/metrics/:metric_type': {
    status: 'development',
    expectedRelease: '2026-03-01',
    description: '指标能力开发中',
  },
  '/api/v1/tasks': {
    status: 'development',
    expectedRelease: '2026-03-01',
    description: '任务管理能力开发中',
  },
  '/api/v1/tasks/:task_id/run': {
    status: 'development',
    expectedRelease: '2026-03-01',
    description: '任务执行能力开发中',
  },
  '/api/v1/tasks/:task_id/executions': {
    status: 'development',
    expectedRelease: '2026-03-01',
    description: '任务执行记录能力开发中',
  },
  '/api/v1/tasks/:task_id/stop': {
    status: 'development',
    expectedRelease: '2026-03-01',
    description: '任务停止能力开发中',
  },
};

function normalizeEndpointPath(path: string): string {
  return path
    .replace(/\/\d+(?=\/|$)/g, '/:id')
    .replace(
      /\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}(?=\/|$)/g,
      '/:id'
    );
}

function resolveDynamicMeta(path: string): EndpointMeta | undefined {
  if (ENDPOINT_META[path]) {
    return ENDPOINT_META[path];
  }

  const normalized = normalizeEndpointPath(path);

  for (const [key, value] of Object.entries(ENDPOINT_META)) {
    if (!key.includes(':')) {
      continue;
    }
    const keyPattern = key
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/:([A-Za-z_]\w*)/g, '[^/]+');
    const matcher = new RegExp(`^${keyPattern}$`);
    if (matcher.test(path) || matcher.test(normalized)) {
      return value;
    }
  }

  return undefined;
}

export function getEndpointMeta(path: string): EndpointMeta | undefined {
  return ENDPOINT_META[path] ?? resolveDynamicMeta(path);
}

export function isDevEndpoint(path: string): boolean {
  return getEndpointMeta(path)?.status === 'development';
}

export function isPlannedEndpoint(path: string): boolean {
  return getEndpointMeta(path)?.status === 'planned';
}

export function isDeprecatedEndpoint(path: string): boolean {
  return getEndpointMeta(path)?.status === 'deprecated';
}
