'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useCreateScrapingRule } from '../../hooks/useCreateScrapingRule';
import { useDataSources } from '@/features/data-source/hooks/useDataSources';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/app/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { RuleConfigFields } from './RuleConfigFields';
import {
  RuleConfigFormValues,
  buildRuleConfigFromForm,
  buildRuleConfigFormDefaults,
  targetTypeOptions,
} from './BaseForm';
import { TargetType } from '@/types';

interface CreateRuleFormValues extends RuleConfigFormValues {
  name: string;
  description: string;
  target_type: TargetType;
  data_source_id: string;
  schedule: string;
  is_active: boolean;
}

export function CreateForm({ onSuccess, onCancel }: { onSuccess?: () => void; onCancel?: () => void }) {
  const router = useRouter();
  const { create, loading } = useCreateScrapingRule();
  const { data: dataSources } = useDataSources({ size: 100 });

  const form = useForm<CreateRuleFormValues>({
    defaultValues: {
      name: '',
      description: '',
      target_type: 'SHOP_OVERVIEW',
      data_source_id: '',
      schedule: '',
      is_active: true,
      ...buildRuleConfigFormDefaults(),
    },
  });

  const setConfigError = (message: string) => {
    if (message.startsWith('time_range')) {
      form.setError('time_range_json', { type: 'validate', message });
      return;
    }
    if (message.startsWith('filters')) {
      form.setError('filters_json', { type: 'validate', message });
      return;
    }
    if (message.startsWith('rate_limit')) {
      form.setError('rate_limit_json', { type: 'validate', message });
      return;
    }
    if (message.startsWith('backfill_last_n_days')) {
      form.setError('backfill_last_n_days', { type: 'validate', message });
      return;
    }
    if (message.startsWith('top_n')) {
      form.setError('top_n', { type: 'validate', message });
      return;
    }
    form.setError('schedule', { type: 'validate', message });
  };

  async function onSubmit(values: CreateRuleFormValues) {
    if (!values.data_source_id) {
      form.setError('data_source_id', { type: 'required', message: '请选择数据源' });
      return;
    }
    if (!values.schedule.trim()) {
      form.setError('schedule', { type: 'required', message: '调度表达式必填' });
      return;
    }

    try {
      const config = buildRuleConfigFromForm(values);
      await create({
        name: values.name,
        description: values.description || undefined,
        target_type: values.target_type,
        data_source_id: Number(values.data_source_id),
        schedule: values.schedule,
        is_active: values.is_active,
        config,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/scraping-rule');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '创建失败';
      setConfigError(message);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          rules={{ required: '名称必填' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>名称</FormLabel>
              <FormControl>
                <Input placeholder="规则名称" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>描述</FormLabel>
              <FormControl>
                <Input placeholder="可选描述" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="target_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>目标类型</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择目标类型" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {targetTypeOptions.map(option => (
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
            name="data_source_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>数据源</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择数据源" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {dataSources?.items?.map(ds => (
                      <SelectItem key={ds.id} value={String(ds.id)}>
                        {ds.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="schedule"
            render={({ field }) => (
              <FormItem>
                <FormLabel>调度表达式</FormLabel>
                <FormControl>
                  <Input placeholder="0 */2 * * *" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem>
                <FormLabel>状态</FormLabel>
                <Select onValueChange={value => field.onChange(value === 'true')} value={field.value ? 'true' : 'false'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">启用</SelectItem>
                    <SelectItem value="false">停用</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <RuleConfigFields form={form} />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel || (() => router.back())}>
            取消
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? '创建中...' : '创建规则'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
