import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/app/components/ui/form';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { ScrapingRuleType } from '../../services/types';

interface RuleConfigFieldsProps {
  form: UseFormReturn<any>;
  type: ScrapingRuleType;
}

export function RuleConfigFields({ form, type }: RuleConfigFieldsProps) {
  return (
    <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
      <h3 className="font-medium mb-2">规则配置</h3>
      
      <FormField
        control={form.control}
        name="config.target_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>目标URL</FormLabel>
            <FormControl>
              <Input placeholder="https://..." {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {type === 'products' && (
        <>
          <FormField
            control={form.control}
            name="config.selectors.item"
            render={({ field }) => (
              <FormItem>
                <FormLabel>元素选择器 (CSS)</FormLabel>
                <FormControl>
                  <Input placeholder=".item-card" {...field} value={field.value || ''} />
                </FormControl>
                <FormDescription>列表中每个元素的CSS选择器</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="config.max_pages"
            render={({ field }) => (
              <FormItem>
                <FormLabel>最大页数</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

      {(type === 'products' || type === 'orders') && (
        <FormField
          control={form.control}
          name="config.selectors.title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>标题选择器</FormLabel>
              <FormControl>
                <Input placeholder="h1.title" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="config.timeout"
          render={({ field }) => (
            <FormItem>
              <FormLabel>超时时间 (毫秒)</FormLabel>
              <FormControl>
                <Input type="number" {...field} value={field.value || 30000} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="config.retry_count"
          render={({ field }) => (
            <FormItem>
              <FormLabel>重试次数</FormLabel>
              <FormControl>
                <Input type="number" {...field} value={field.value || 3} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
