export type ShopDashboardTaskStatus =
  | 'PENDING'
  | 'QUEUED'
  | 'STARTED'
  | 'SUCCESS'
  | 'FAILURE'
  | 'RETRY'
  | 'REVOKED'
  | 'UNKNOWN';

export interface BatchTriggerRequest {
  shop_id?: string;
  rule_ids?: number[];
  start_date?: string;
  end_date?: string;
  force?: boolean;
}

export interface BatchTriggerResponse {
  task_id: string;
  status?: string;
  message?: string;
  accepted_at?: string;
  raw: Record<string, unknown>;
}

export interface TaskStatusResponse {
  task_id: string;
  status: ShopDashboardTaskStatus;
  progress?: number;
  created_at?: string;
  started_at?: string;
  finished_at?: string;
  error_message?: string;
  result?: Record<string, unknown> | null;
  raw: Record<string, unknown>;
}

export interface ShopDashboardStatusResponse extends TaskStatusResponse {
  step?: string;
  traceback?: string;
  logs?: string[];
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

const TASK_STATUS_SET: ReadonlySet<string> = new Set([
  'PENDING',
  'QUEUED',
  'STARTED',
  'SUCCESS',
  'FAILURE',
  'RETRY',
  'REVOKED',
]);

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

function asStringArray(value: unknown): string[] {
  return asArray(value)
    .map(item => (typeof item === 'string' ? item : ''))
    .filter(Boolean);
}

function pickTaskId(payload: Record<string, unknown>, fallbackTaskId?: string): string {
  const candidate = asString(payload.task_id) || asString(payload.id) || fallbackTaskId;
  if (candidate) {
    return candidate;
  }
  return 'unknown-task';
}

function pickTaskStatus(payload: Record<string, unknown>): ShopDashboardTaskStatus {
  const rawStatus = asString(payload.status) || asString(payload.task_status) || asString(payload.state);
  if (!rawStatus) {
    return 'UNKNOWN';
  }
  const upperStatus = rawStatus.toUpperCase();
  if (TASK_STATUS_SET.has(upperStatus)) {
    return upperStatus as ShopDashboardTaskStatus;
  }
  return 'UNKNOWN';
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

export function normalizeBatchTriggerResponse(payload: unknown): BatchTriggerResponse {
  const data = asRecord(payload);
  return {
    task_id: pickTaskId(data),
    status: asString(data.status),
    message: asString(data.message) || asString(data.detail),
    accepted_at: asString(data.accepted_at) || asString(data.created_at),
    raw: data,
  };
}

export function normalizeTaskStatusResponse(payload: unknown, fallbackTaskId?: string): TaskStatusResponse {
  const data = asRecord(payload);
  const result = asRecord(data.result);

  return {
    task_id: pickTaskId(data, fallbackTaskId),
    status: pickTaskStatus(data),
    progress: asNumber(data.progress),
    created_at: asString(data.created_at),
    started_at: asString(data.started_at),
    finished_at: asString(data.finished_at) || asString(data.completed_at),
    error_message: asString(data.error_message) || asString(data.error),
    result: Object.keys(result).length > 0 ? result : null,
    raw: data,
  };
}

export function normalizeShopDashboardStatusResponse(
  payload: unknown,
  fallbackTaskId?: string
): ShopDashboardStatusResponse {
  const base = normalizeTaskStatusResponse(payload, fallbackTaskId);
  const data = asRecord(payload);

  return {
    ...base,
    step: asString(data.step),
    traceback: asString(data.traceback),
    logs: asStringArray(data.logs),
  };
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
