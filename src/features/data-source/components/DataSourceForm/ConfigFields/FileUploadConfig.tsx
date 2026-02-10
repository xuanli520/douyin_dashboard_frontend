import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/app/components/ui/form';
import { Input } from '@/app/components/ui/input';

interface FileUploadConfigProps {
  form: UseFormReturn<any>;
}

export function FileUploadConfig({ form }: FileUploadConfigProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="config.upload_endpoint"
        rules={{ required: '上传端点为必填项' }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>上传端点</FormLabel>
            <FormControl>
              <Input placeholder="https://api.example.com/upload" value={field.value || ''} onChange={field.onChange} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="config.path"
        rules={{ required: '存储路径为必填项' }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>存储路径</FormLabel>
            <FormControl>
              <Input placeholder="/uploads/data" value={field.value || ''} onChange={field.onChange} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
