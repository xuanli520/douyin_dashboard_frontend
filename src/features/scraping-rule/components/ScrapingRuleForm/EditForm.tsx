'use client';

import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BaseForm } from './BaseForm';
import { useUpdateScrapingRule } from '../../hooks/useUpdateScrapingRule';
import { useScrapingRule } from '../../hooks/useScrapingRule';
import { useDataSources } from '@/features/data-source/hooks/useDataSources';
import { useRouter } from 'next/navigation';
import { ScrapingRule } from '../../services/types';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
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

const formSchema = z.object({
  name: z.string().min(2, {
    message: "名称至少需要2个字符。",
  }),
  description: z.string().optional(),
  target_type: z.enum([
    'SHOP_OVERVIEW', 'TRAFFIC', 'PRODUCT', 'LIVE', 'CONTENT_VIDEO',
    'ORDER_FULFILLMENT', 'AFTERSALE_REFUND', 'CUSTOMER', 'ADS'
  ]).optional(),
  data_source_id: z.coerce.number(),
  schedule_type: z.enum(['cron', 'interval', 'once']),
  schedule_value: z.string().min(1, "调度值为必填项"),
  is_active: z.boolean().default(true),
  config: z.object({
    target_url: z.string().url("必须是有效的URL").optional(),
    timeout: z.number().default(30000),
    retry_count: z.number().default(3),
    max_pages: z.number().optional(),
    selectors: z.record(z.string(), z.string()).optional(),
  }).passthrough(),
});

interface EditFormProps {
  id: number;
}

export function EditForm({ id }: EditFormProps) {
  const router = useRouter();
  const { rule, loading: loadingRule } = useScrapingRule(id);
  const { update, loading: saving } = useUpdateScrapingRule();
  const { data: dataSources } = useDataSources({ size: 100 });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      target_type: "SHOP_OVERVIEW",
      schedule_type: "once",
      schedule_value: "0",
      is_active: true,
      config: {
        target_url: "",
        timeout: 30000,
        retry_count: 3,
        selectors: {},
      },
    },
  });

  useEffect(() => {
    if (rule) {
      form.reset({
        name: rule.name,
        description: rule.description,
        target_type: rule.target_type,
        data_source_id: rule.data_source_id.toString() as any,
        schedule_type: rule.schedule_type,
        schedule_value: rule.schedule_value,
        is_active: rule.is_active,
        config: rule.config,
      });
    }
  }, [rule]);

  const targetType = form.watch("target_type") || "SHOP_OVERVIEW";

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const apiData = {
        name: values.name,
        description: values.description,
        target_type: values.target_type,
        data_source_id: values.data_source_id,
        schedule: values.schedule_type === 'cron'
          ? values.schedule_value
          : values.schedule_type === 'interval'
            ? values.schedule_value
            : undefined,
        is_active: values.is_active,
        config: values.config,
      };
      await update(id, apiData);
      router.push('/scraping-rule');
    } catch (error) {
      console.error(error);
    }
  }

  if (loadingRule) return <div>加载中...</div>;
  if (!rule) return <div>未找到规则</div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto">
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
            name="target_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>目标类型</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择目标类型" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SHOP_OVERVIEW">店铺概览</SelectItem>
                    <SelectItem value="TRAFFIC">流量</SelectItem>
                    <SelectItem value="PRODUCT">商品</SelectItem>
                    <SelectItem value="LIVE">直播</SelectItem>
                    <SelectItem value="CONTENT_VIDEO">短视频</SelectItem>
                    <SelectItem value="ORDER_FULFILLMENT">订单履约</SelectItem>
                    <SelectItem value="AFTERSALE_REFUND">售后退款</SelectItem>
                    <SelectItem value="CUSTOMER">客户</SelectItem>
                    <SelectItem value="ADS">广告</SelectItem>
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
                    {dataSources?.items?.map((ds) => (
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

        <RuleConfigFields form={form} type={targetType} />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>取消</Button>
          <Button type="submit" disabled={saving}>
            {saving ? "保存中..." : "保存更改"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
