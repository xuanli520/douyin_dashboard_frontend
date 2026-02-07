import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/app/components/ui/form';
import { Input } from '@/app/components/ui/input';

interface ApiConfigProps {
  form: UseFormReturn<any>;
}

export function ApiConfig({ form }: ApiConfigProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="config.url"
        rules={{ required: 'URL为必填项' }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>API URL</FormLabel>
            <FormControl>
              <Input placeholder="https://api.example.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="config.method"
        render={({ field }) => (
          <FormItem>
            <FormLabel>请求方法</FormLabel>
            <FormControl>
              <Input placeholder="GET" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="config.api_key"
        rules={{ required: 'API Key为必填项' }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>API Key</FormLabel>
            <FormControl>
              <Input type="password" placeholder="请输入API Key" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="config.api_secret"
        rules={{ required: 'API Secret为必填项' }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>API Secret</FormLabel>
            <FormControl>
              <Input type="password" placeholder="请输入API Secret" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
