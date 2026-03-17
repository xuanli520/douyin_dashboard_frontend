import {
  ScrapingRuleConfig,
  ScrapingRuleDataLatency,
  ScrapingRuleGranularity,
  ScrapingRuleIncrementalMode,
  TargetType,
} from '@/types';

export interface RuleConfigFormValues {
  granularity: ScrapingRuleGranularity | '';
  timezone: string;
  time_range_json: string;
  incremental_mode: ScrapingRuleIncrementalMode | '';
  backfill_last_n_days: string;
  filters_json: string;
  dimensions_text: string;
  metrics_text: string;
  dedupe_key: string;
  rate_limit_json: string;
  data_latency: ScrapingRuleDataLatency | '';
  top_n: string;
  sort_by: string;
  include_long_tail: boolean;
  session_level: boolean;
}

export const targetTypeOptions: Array<{ value: TargetType; label: string }> = [
  { value: 'SHOP_OVERVIEW', label: '店铺概览' },
  { value: 'TRAFFIC', label: '流量' },
  { value: 'PRODUCT', label: '商品' },
  { value: 'LIVE', label: '直播' },
  { value: 'CONTENT_VIDEO', label: '短视频' },
  { value: 'ORDER_FULFILLMENT', label: '订单履约' },
  { value: 'AFTERSALE_REFUND', label: '售后退款' },
  { value: 'CUSTOMER', label: '客户' },
  { value: 'ADS', label: '广告' },
];

export const granularityOptions: Array<{ value: ScrapingRuleGranularity; label: string }> = [
  { value: 'HOUR', label: '小时' },
  { value: 'DAY', label: '天' },
  { value: 'WEEK', label: '周' },
  { value: 'MONTH', label: '月' },
];

export const incrementalModeOptions: Array<{ value: ScrapingRuleIncrementalMode; label: string }> = [
  { value: 'BY_DATE', label: '按日期' },
  { value: 'BY_CURSOR', label: '按游标' },
];

export const dataLatencyOptions: Array<{ value: ScrapingRuleDataLatency; label: string }> = [
  { value: 'REALTIME', label: '实时' },
  { value: 'T+1', label: 'T+1' },
  { value: 'T+2', label: 'T+2' },
  { value: 'T+3', label: 'T+3' },
];

function toJsonText(value: unknown): string {
  if (value === undefined) {
    return '';
  }
  return JSON.stringify(value, null, 2);
}

function parseJsonField(value: string, fieldName: string): Record<string, unknown> {
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    throw new Error(`${fieldName} 不是合法 JSON`);
  }
}

function parseOptionalNumber(value: string, fieldName: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${fieldName} 不是合法数字`);
  }
  return parsed;
}

function parseListField(value: string): string[] {
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

export function buildRuleConfigFormDefaults(config?: ScrapingRuleConfig): RuleConfigFormValues {
  return {
    granularity: config?.granularity || '',
    timezone: config?.timezone || '',
    time_range_json: toJsonText(config?.time_range),
    incremental_mode: config?.incremental_mode || '',
    backfill_last_n_days: config?.backfill_last_n_days !== undefined ? String(config.backfill_last_n_days) : '',
    filters_json: toJsonText(config?.filters),
    dimensions_text: config?.dimensions?.join(', ') || '',
    metrics_text: config?.metrics?.join(', ') || '',
    dedupe_key: config?.dedupe_key || '',
    rate_limit_json: toJsonText(config?.rate_limit),
    data_latency: config?.data_latency || '',
    top_n: config?.top_n !== undefined ? String(config.top_n) : '',
    sort_by: config?.sort_by || '',
    include_long_tail: config?.include_long_tail ?? false,
    session_level: config?.session_level ?? false,
  };
}

export function buildRuleConfigFromForm(values: RuleConfigFormValues): ScrapingRuleConfig {
  const config: ScrapingRuleConfig = {
    include_long_tail: values.include_long_tail,
    session_level: values.session_level,
  };

  if (values.granularity) {
    config.granularity = values.granularity;
  }
  if (values.timezone.trim()) {
    config.timezone = values.timezone.trim();
  }
  if (values.time_range_json.trim()) {
    config.time_range = parseJsonField(values.time_range_json, 'time_range');
  }
  if (values.incremental_mode) {
    config.incremental_mode = values.incremental_mode;
  }

  const backfillLastNDays = parseOptionalNumber(values.backfill_last_n_days, 'backfill_last_n_days');
  if (backfillLastNDays !== undefined) {
    config.backfill_last_n_days = backfillLastNDays;
  }

  if (values.filters_json.trim()) {
    config.filters = parseJsonField(values.filters_json, 'filters');
  }

  const dimensions = parseListField(values.dimensions_text);
  if (dimensions.length > 0) {
    config.dimensions = dimensions;
  }

  const metrics = parseListField(values.metrics_text);
  if (metrics.length > 0) {
    config.metrics = metrics;
  }

  if (values.dedupe_key.trim()) {
    config.dedupe_key = values.dedupe_key.trim();
  }

  if (values.rate_limit_json.trim()) {
    config.rate_limit = parseJsonField(values.rate_limit_json, 'rate_limit');
  }

  if (values.data_latency) {
    config.data_latency = values.data_latency;
  }

  const topN = parseOptionalNumber(values.top_n, 'top_n');
  if (topN !== undefined) {
    config.top_n = topN;
  }

  if (values.sort_by.trim()) {
    config.sort_by = values.sort_by.trim();
  }

  return config;
}
