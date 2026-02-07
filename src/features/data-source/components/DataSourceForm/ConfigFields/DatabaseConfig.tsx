import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/app/components/ui/form';
import { Input } from '@/app/components/ui/input';

interface DatabaseConfigProps {
  form: UseFormReturn<any>;
}

export function DatabaseConfig({ form }: DatabaseConfigProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="config.host"
          rules={{ required: '主机为必填项' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>主机</FormLabel>
              <FormControl>
                <Input placeholder="localhost" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="config.port"
          rules={{ required: '端口为必填项' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>端口</FormLabel>
              <FormControl>
                <Input type="number" placeholder="3306" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="config.username"
        rules={{ required: '用户名为必填项' }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>用户名</FormLabel>
            <FormControl>
              <Input placeholder="root" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="config.password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>密码</FormLabel>
            <FormControl>
              <Input type="password" placeholder="******" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="config.database"
        rules={{ required: '数据库名称为必填项' }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>数据库名称</FormLabel>
            <FormControl>
              <Input placeholder="my_db" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
