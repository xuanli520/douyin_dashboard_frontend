import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { DataSourceCreateDTO, DataSource } from '../../services/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/app/components/ui/form';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Button } from '@/app/components/ui/button';
import { ApiConfig } from './ConfigFields/ApiConfig';
import { DatabaseConfig } from './ConfigFields/DatabaseConfig';

interface DataSourceFormProps {
  initialData?: DataSource;
  onSubmit: (data: DataSourceCreateDTO) => Promise<void>;
  loading?: boolean;
  onCancel?: () => void;
}

export function DataSourceForm({ initialData, onSubmit, loading, onCancel }: DataSourceFormProps) {
  const form = useForm<DataSourceCreateDTO>({
    defaultValues: initialData ? {
      name: initialData.name,
      type: initialData.type,
      description: initialData.description,
      config: initialData.config,
      status: initialData.status,
    } : {
      name: '',
      type: 'douyin_api',
      description: '',
      config: {},
      status: 'active',
    },
  });

  const type = useWatch({
    control: form.control,
    name: 'type',
  });

  useEffect(() => {
    if (!initialData) {
    }
  }, [type, initialData, form]);

  const renderConfigFields = () => {
    switch (type) {
      case 'douyin_api':
        return <ApiConfig form={form} />;
      case 'database':
        return <DatabaseConfig form={form} />;
      default:
        return <div className="text-sm text-slate-500">No configuration needed for this type.</div>;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          rules={{ required: '名称为必填项' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>名称</FormLabel>
              <FormControl>
                <Input placeholder="数据源名称" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            rules={{ required: 'Type is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>类型</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!initialData}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择类型" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="douyin_api">抖音API</SelectItem>
                    <SelectItem value="database">数据库</SelectItem>
                    <SelectItem value="file_upload">文件上传</SelectItem>
                    <SelectItem value="webhook">Webhook</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

        <div className="border-t border-slate-200 dark:border-white/10 pt-4 mt-4">
          <h3 className="text-sm font-medium mb-4">配置</h3>
          <div className="space-y-4">
            {renderConfigFields()}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              取消
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? '保存中...' : '保存'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
