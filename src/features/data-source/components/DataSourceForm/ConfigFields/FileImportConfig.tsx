import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/app/components/ui/form';
import { Input } from '@/app/components/ui/input';

interface FileImportConfigProps {
  form: UseFormReturn<any>;
}

export function FileImportConfig({ form }: FileImportConfigProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="config.file_path"
        rules={{ required: '文件路径为必填项' }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>文件路径</FormLabel>
            <FormControl>
              <Input placeholder="/imports/data.xlsx" value={field.value || ''} onChange={field.onChange} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="config.path"
        render={({ field }) => (
          <FormItem>
            <FormLabel>备选路径</FormLabel>
            <FormControl>
              <Input placeholder="/backup/imports" value={field.value || ''} onChange={field.onChange} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
