'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useUpdateScrapingRule } from '../../hooks/useUpdateScrapingRule';
import { useScrapingRule } from '../../hooks/useScrapingRule';
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
} from './BaseForm';

interface EditRuleFormValues extends RuleConfigFormValues {
  name: string;
  description: string;
  is_active: boolean;
}

interface EditFormProps {
  id: number;
}

export function EditForm({ id }: EditFormProps) {
  const router = useRouter();
  const { rule, loading: loadingRule } = useScrapingRule(id);
  const { update, loading: saving } = useUpdateScrapingRule();

  const form = useForm<EditRuleFormValues>({
    defaultValues: {
      name: '',
      description: '',
      is_active: true,
      ...buildRuleConfigFormDefaults(),
    },
  });

  useEffect(() => {
    if (!rule) {
      return;
    }

    form.reset({
      name: rule.name,
      description: rule.description || '',
      is_active: rule.is_active,
      ...buildRuleConfigFormDefaults(rule.config),
    });
  }, [form, rule]);

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
    form.setError('name', { type: 'validate', message });
  };

  async function onSubmit(values: EditRuleFormValues) {

    try {
      const config = buildRuleConfigFromForm(values);
      await update(id, {
        name: values.name,
        description: values.description || undefined,
        is_active: values.is_active,
        config,
      });
      router.push('/scraping-rule');
    } catch (error) {
      const message = error instanceof Error ? error.message : '保存失败';
      setConfigError(message);
    }
  }

  if (loadingRule) {
    return <div>加载中...</div>;
  }

  if (!rule) {
    return <div>未找到规则</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-2xl space-y-8">
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
          <FormItem>
            <FormLabel>数据源 ID</FormLabel>
            <FormControl>
              <Input value={String(rule.data_source_id)} disabled />
            </FormControl>
          </FormItem>

          <FormItem>
            <FormLabel>目标类型</FormLabel>
            <FormControl>
              <Input value={rule.target_type} disabled />
            </FormControl>
          </FormItem>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
          <Button type="button" variant="outline" onClick={() => router.back()}>
            取消
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? '保存中...' : '保存更改'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
