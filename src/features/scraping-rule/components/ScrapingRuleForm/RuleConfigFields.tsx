import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/app/components/ui/form';
import { Input } from '@/app/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Switch } from '@/app/components/ui/switch';
import { Textarea } from '@/app/components/ui/textarea';
import {
  RuleConfigFormValues,
  dataLatencyOptions,
  granularityOptions,
  incrementalModeOptions,
  validateOptionalJsonText,
  validateOptionalNonNegativeIntegerText,
} from './BaseForm';

const EMPTY_SELECT_VALUE = '__EMPTY__';

interface RuleConfigFieldsProps {
  form: UseFormReturn<RuleConfigFormValues>;
}

export function RuleConfigFields({ form }: RuleConfigFieldsProps) {
  const toOptionalSelectValue = (value: string) => value || EMPTY_SELECT_VALUE;
  const fromOptionalSelectValue = (value: string) => (
    value === EMPTY_SELECT_VALUE ? '' : value
  );

  return (
    <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
      <h3 className="font-medium">规则配置</h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="granularity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>粒度</FormLabel>
              <Select
                onValueChange={value => field.onChange(fromOptionalSelectValue(value))}
                value={toOptionalSelectValue(field.value)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择粒度" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={EMPTY_SELECT_VALUE}>未设置</SelectItem>
                  {granularityOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>时区</FormLabel>
              <FormControl>
                <Input placeholder="Asia/Shanghai" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="time_range_json"
        rules={{ validate: validateOptionalJsonText }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>time_range (JSON)</FormLabel>
            <FormControl>
              <Textarea
                className="min-h-[100px] font-mono text-xs"
                placeholder='{"start": "2026-03-01", "end": "2026-03-08"}'
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="incremental_mode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>增量模式</FormLabel>
              <Select
                onValueChange={value => field.onChange(fromOptionalSelectValue(value))}
                value={toOptionalSelectValue(field.value)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择增量模式" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={EMPTY_SELECT_VALUE}>未设置</SelectItem>
                  {incrementalModeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="backfill_last_n_days"
          rules={{ validate: validateOptionalNonNegativeIntegerText }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>补采最近 N 天</FormLabel>
              <FormControl>
                <Input
                  inputMode="numeric"
                  min={0}
                  placeholder="7"
                  step={1}
                  type="number"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="filters_json"
        rules={{ validate: validateOptionalJsonText }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>filters (JSON)</FormLabel>
            <FormControl>
              <Textarea
                className="min-h-[100px] font-mono text-xs"
                placeholder='{"shop_id": ["123"]}'
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="dimensions_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>dimensions (逗号分隔)</FormLabel>
              <FormControl>
                <Input placeholder="date, shop_id" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="metrics_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>metrics (逗号分隔)</FormLabel>
              <FormControl>
                <Input placeholder="gmv, order_count" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="dedupe_key"
          render={({ field }) => (
            <FormItem>
              <FormLabel>去重键</FormLabel>
              <FormControl>
                <Input placeholder="order_id" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="data_latency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>数据延迟</FormLabel>
              <Select
                onValueChange={value => field.onChange(fromOptionalSelectValue(value))}
                value={toOptionalSelectValue(field.value)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择数据延迟" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={EMPTY_SELECT_VALUE}>未设置</SelectItem>
                  {dataLatencyOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="rate_limit_json"
        rules={{ validate: validateOptionalJsonText }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>rate_limit (JSON)</FormLabel>
            <FormControl>
              <Textarea
                className="min-h-[100px] font-mono text-xs"
                placeholder='{"qps": 10}'
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="top_n"
          rules={{ validate: validateOptionalNonNegativeIntegerText }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Top N</FormLabel>
              <FormControl>
                <Input
                  inputMode="numeric"
                  min={0}
                  placeholder="100"
                  step={1}
                  type="number"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sort_by"
          render={({ field }) => (
            <FormItem>
              <FormLabel>排序字段</FormLabel>
              <FormControl>
                <Input placeholder="gmv" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="include_long_tail"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between rounded-md border bg-background px-3 py-2">
                <FormLabel>包含长尾</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="session_level"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between rounded-md border bg-background px-3 py-2">
                <FormLabel>会话级别</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
