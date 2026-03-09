export type TaskType = 'ETL_ORDERS' | 'ETL_PRODUCTS' | 'SHOP_DASHBOARD_COLLECTION';
export type TaskDefinitionStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED';
export type TaskExecutionStatus = 'QUEUED' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
export type TaskTriggerMode = 'MANUAL' | 'SCHEDULED' | 'SYSTEM';

export interface TaskListParams {
  page?: number;
  size?: number;
  status?: TaskDefinitionStatus;
  task_type?: TaskType;
}

export interface TaskDefinitionCreateRequest {
  name: string;
  task_type: TaskType;
  config?: Record<string, unknown>;
  schedule?: Record<string, unknown> | null;
  status?: TaskDefinitionStatus;
}

export interface TaskRunRequest {
  payload?: Record<string, unknown>;
}

export interface TaskDefinition {
  id: number;
  name: string;
  task_type: TaskType;
  status: TaskDefinitionStatus;
  config: Record<string, unknown> | null;
  schedule: Record<string, unknown> | null;
  created_by_id: number | null;
  updated_by_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface TaskExecution {
  id: number;
  task_id: number;
  queue_task_id: string | null;
  status: TaskExecutionStatus;
  trigger_mode: TaskTriggerMode;
  payload: Record<string, unknown> | null;
  started_at: string | null;
  completed_at: string | null;
  processed_rows: number;
  error_message: string | null;
  triggered_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface TaskListResponse {
  items: TaskDefinition[];
  meta: {
    page: number;
    size: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface TaskExecutionListResponse {
  task_id: number;
  items: TaskExecution[];
}

export interface ShopDashboardCollectionTriggerRequest {
  data_source_id: number;
  rule_id: number;
  execution_id?: string;
}

export interface ShopDashboardCollectionTriggerResult {
  task: TaskDefinition;
  execution: TaskExecution;
}

export interface ShopDashboardQueryRequest {
  shop_id: string;
  start_date: string;
  end_date: string;
  granularity?: 'day' | 'week' | 'month';
  limit?: number;
}

export interface ShopDashboardScores {
  overall: number;
  product: number;
  logistics: number;
  service: number;
  risk: number;
}

export interface ShopDashboardCommentSummary {
  total: number;
  negative_count: number;
  negative_rate: number;
  average_rating?: number;
}

export interface ShopDashboardViolationItem {
  id: string;
  level: string;
  type: string;
  title: string;
  description?: string;
  count: number;
  occurred_at?: string;
  status?: string;
}

export interface ShopDashboardMetricItem {
  key: string;
  label: string;
  value: number;
  trend?: number[];
  details?: Record<string, unknown>;
}

export interface ShopDashboardQueryResponse {
  shop_id: string;
  start_date: string;
  end_date: string;
  scores: ShopDashboardScores;
  comments: ShopDashboardCommentSummary;
  violations: ShopDashboardViolationItem[];
  metrics: ShopDashboardMetricItem[];
  raw: Record<string, unknown>;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : undefined;
  }
  return undefined;
}

function buildScores(payload: Record<string, unknown>): ShopDashboardScores {
  const scores = asRecord(payload.scores);
  const summary = asRecord(payload.summary);

  const overall =
    asNumber(scores.overall)
    ?? asNumber(scores.total)
    ?? asNumber(summary.overall)
    ?? asNumber(summary.total_score)
    ?? 0;

  const product =
    asNumber(scores.product)
    ?? asNumber(scores.product_score)
    ?? asNumber(payload.product_score)
    ?? 0;

  const logistics =
    asNumber(scores.logistics)
    ?? asNumber(scores.logistics_score)
    ?? asNumber(payload.logistics_score)
    ?? 0;

  const service =
    asNumber(scores.service)
    ?? asNumber(scores.service_score)
    ?? asNumber(payload.service_score)
    ?? 0;

  const risk =
    asNumber(scores.risk)
    ?? asNumber(scores.risk_score)
    ?? asNumber(payload.risk_score)
    ?? 0;

  return { overall, product, logistics, service, risk };
}

function buildCommentSummary(payload: Record<string, unknown>): ShopDashboardCommentSummary {
  const comments = asRecord(payload.comments);
  return {
    total: asNumber(comments.total) ?? asNumber(payload.comment_total) ?? 0,
    negative_count: asNumber(comments.negative_count) ?? asNumber(payload.comment_negative_count) ?? 0,
    negative_rate: asNumber(comments.negative_rate) ?? asNumber(payload.comment_negative_rate) ?? 0,
    average_rating: asNumber(comments.average_rating) ?? asNumber(payload.comment_average_rating),
  };
}

function buildViolations(payload: Record<string, unknown>): ShopDashboardViolationItem[] {
  return asArray(payload.violations).map((item, index) => {
    const row = asRecord(item);
    return {
      id: asString(row.id) || asString(row.violation_id) || `violation-${index + 1}`,
      level: asString(row.level) || 'P2',
      type: asString(row.type) || 'UNKNOWN',
      title: asString(row.title) || asString(row.name) || '未命名违规',
      description: asString(row.description),
      count: asNumber(row.count) ?? 0,
      occurred_at: asString(row.occurred_at) || asString(row.created_at),
      status: asString(row.status),
    };
  });
}

function mapMetricRow(key: string, value: unknown): ShopDashboardMetricItem {
  const metric = asRecord(value);
  return {
    key,
    label: asString(metric.label) || key,
    value: asNumber(metric.value) ?? asNumber(metric.score) ?? 0,
    trend: asArray(metric.trend)
      .map(point => asNumber(point))
      .filter((point): point is number => typeof point === 'number'),
    details: metric,
  };
}

function buildMetrics(payload: Record<string, unknown>, scores: ShopDashboardScores): ShopDashboardMetricItem[] {
  const metricsArray = asArray(payload.metrics);
  if (metricsArray.length > 0) {
    return metricsArray.map((item, index) => {
      const metric = asRecord(item);
      const key = asString(metric.key) || asString(metric.id) || `metric-${index + 1}`;
      return mapMetricRow(key, metric);
    });
  }

  const metricMap = asRecord(payload.metric_map);
  const metricEntries = Object.entries(metricMap);
  if (metricEntries.length > 0) {
    return metricEntries.map(([key, value]) => mapMetricRow(key, value));
  }

  return [
    { key: 'overall', label: '总分', value: scores.overall },
    { key: 'product', label: '商品体验', value: scores.product },
    { key: 'logistics', label: '物流体验', value: scores.logistics },
    { key: 'service', label: '服务体验', value: scores.service },
    { key: 'risk', label: '违规风险', value: scores.risk },
  ];
}

export function normalizeShopDashboardQueryResponse(
  payload: unknown,
  request: ShopDashboardQueryRequest
): ShopDashboardQueryResponse {
  const data = asRecord(payload);
  const scores = buildScores(data);

  return {
    shop_id: asString(data.shop_id) || request.shop_id,
    start_date: asString(data.start_date) || request.start_date,
    end_date: asString(data.end_date) || request.end_date,
    scores,
    comments: buildCommentSummary(data),
    violations: buildViolations(data),
    metrics: buildMetrics(data, scores),
    raw: data,
  };
}
