import {
  ScrapingRuleConfig,
  ScrapingRuleDataLatency,
  ScrapingRuleGranularity,
  ScrapingRuleIncrementalMode,
  TargetType,
} from '@/types';
import type { HttpError } from '@/lib/http/types';
import type { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form';

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

const scrapingRuleErrorFieldMap = [
  ['time_range', 'time_range_json'],
  ['filters', 'filters_json'],
  ['rate_limit', 'rate_limit_json'],
  ['backfill_last_n_days', 'backfill_last_n_days'],
  ['top_n', 'top_n'],
  ['name', 'name'],
  ['description', 'description'],
  ['data_source_id', 'data_source_id'],
  ['target_type', 'target_type'],
  ['is_active', 'is_active'],
] as const;

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

function parseOptionalNonNegativeInteger(value: string, fieldName: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  if (!/^\d+$/.test(trimmed)) {
    throw new Error(`${fieldName} 必须是非负整数`);
  }
  return Number(trimmed);
}

function parseListField(value: string): string[] {
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readErrorMessage(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }
  return null;
}

function resolveScrapingRuleErrorField(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const matchedField = scrapingRuleErrorFieldMap.find(([sourceField]) => (
    trimmed === sourceField ||
    trimmed.startsWith(`${sourceField} `) ||
    trimmed.startsWith(`${sourceField}:`)
  ));

  return matchedField?.[1] ?? null;
}

function extractStructuredErrors(error: unknown): Array<{ field?: string; message: string }> {
  const payloads: Record<string, unknown>[] = [];
  const httpError = error as HttpError | undefined;

  if (isRecord(httpError?.data)) {
    payloads.push(httpError.data);
    if (isRecord(httpError.data.data)) {
      payloads.push(httpError.data.data);
    }
  }

  for (const payload of payloads) {
    if (Array.isArray(payload.errors)) {
      const errors = payload.errors.flatMap(item => {
        if (!isRecord(item)) {
          return [];
        }

        const message = readErrorMessage(item.message) ?? readErrorMessage(item.msg);
        if (!message) {
          return [];
        }

        const field = readErrorMessage(item.field);
        return [{ field: field ?? undefined, message }];
      });

      if (errors.length > 0) {
        return errors;
      }
    }

    const field = readErrorMessage(payload.field);
    const message = readErrorMessage(payload.message) ?? readErrorMessage(payload.msg);
    if (field && message) {
      return [{ field, message }];
    }
  }

  return [];
}

export function validateOptionalJsonText(value: string): true | string {
  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }

  try {
    JSON.parse(trimmed);
    return true;
  } catch {
    return 'JSON 格式错误';
  }
}

export function validateOptionalNonNegativeIntegerText(value: string): true | string {
  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }

  return /^\d+$/.test(trimmed) ? true : '请输入非负整数';
}

export function applyScrapingRuleFormError<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  error: unknown,
  fallbackField: FieldPath<TFieldValues>,
  fallbackMessage: string,
) {
  const values = form.getValues();
  const structuredErrors = extractStructuredErrors(error);

  if (structuredErrors.length > 0) {
    let applied = false;

    for (const structuredError of structuredErrors) {
      const resolvedField = structuredError.field
        ? resolveScrapingRuleErrorField(structuredError.field)
        : null;

      if (resolvedField && resolvedField in values) {
        form.setError(resolvedField as FieldPath<TFieldValues>, {
          type: 'server',
          message: structuredError.message,
        });
        applied = true;
        continue;
      }

      if (!applied) {
        form.setError(fallbackField, { type: 'server', message: structuredError.message });
        applied = true;
      }
    }

    if (applied) {
      return;
    }
  }

  const message =
    readErrorMessage(error instanceof Error ? error.message : error) ??
    fallbackMessage;
  const resolvedField = resolveScrapingRuleErrorField(message);

  if (resolvedField && resolvedField in values) {
    form.setError(resolvedField as FieldPath<TFieldValues>, { type: 'server', message });
    return;
  }

  form.setError(fallbackField, { type: 'server', message });
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

  const backfillLastNDays = parseOptionalNonNegativeInteger(values.backfill_last_n_days, 'backfill_last_n_days');
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

  const topN = parseOptionalNonNegativeInteger(values.top_n, 'top_n');
  if (topN !== undefined) {
    config.top_n = topN;
  }

  if (values.sort_by.trim()) {
    config.sort_by = values.sort_by.trim();
  }

  return config;
}
