'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/app/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/app/components/ui/form';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { RuleConfigFields } from './RuleConfigFields';
import { DataSource } from '@/features/data-source/services/types';

export const formSchema = z.object({
  name: z.string().min(2, {
    message: "名称至少需要2个字符。",
  }),
  description: z.string().optional(),
  rule_type: z.enum(['orders', 'products', 'users', 'comments']),
  data_source_id: z.coerce.number(),
  schedule_type: z.enum(['cron', 'interval', 'once']),
  schedule_value: z.string().min(1, "调度值为必填项"),
  config: z.object({
    target_url: z.string().url("必须是有效的URL").optional(),
    timeout: z.number().default(30000),
    retry_count: z.number().default(3),
    max_pages: z.number().optional(),
    selectors: z.record(z.string(), z.string()).optional(),
  }).passthrough(),
});

export type ScrapingRuleFormData = z.infer<typeof formSchema>;

export interface BaseFormProps {
  initialData?: any;
  dataSources?: DataSource[];
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
  isLoading?: boolean;
}

export function BaseForm({
  initialData,
  dataSources,
  onSubmit,
  onCancel,
  submitLabel,
  isLoading = false,
}: BaseFormProps) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      rule_type: "orders",
      schedule_type: "once",
      schedule_value: "0",
      config: {
        target_url: "",
        timeout: 30000,
        retry_count: 3,
        selectors: {},
      },
      ...initialData,
    },
  });

  const ruleType = form.watch("rule_type");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
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
                <Input placeholder="描述" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="rule_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>类型</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择类型" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="orders">订单</SelectItem>
                    <SelectItem value="products">商品</SelectItem>
                    <SelectItem value="users">用户</SelectItem>
                    <SelectItem value="comments">评论</SelectItem>
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
                <Select onValueChange={field.onChange} value={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择数据源" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {dataSources?.map((ds) => (
                      <SelectItem key={ds.id} value={ds.id.toString()}>
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="schedule_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>调度类型</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择调度类型" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="once">一次</SelectItem>
                    <SelectItem value="interval">间隔</SelectItem>
                    <SelectItem value="cron">Cron表达式</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="schedule_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>调度值</FormLabel>
                <FormControl>
                  <Input placeholder="例如: 3600 或 0 * * * *" {...field} />
                </FormControl>
                <FormDescription>间隔为秒数，Cron为Cron表达式。</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <RuleConfigFields form={form} type={ruleType} />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "处理中..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
