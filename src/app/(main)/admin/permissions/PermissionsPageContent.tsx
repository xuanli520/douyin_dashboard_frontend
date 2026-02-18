'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getPermissions, PermissionListParams } from '@/services/adminService';
import { PermissionRead } from '@/types';
import { CyberCard } from '@/components/ui/cyber/CyberCard';
import { CyberInput } from '@/components/ui/cyber/CyberInput';
import { CyberBadge } from '@/components/ui/cyber/CyberBadge';
import { DataTable, DataTableColumn } from '../_components/common/DataTable';
import { Search, Lock, Copy, Key } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryState, QueryCodec } from '../_components/common/QueryState';

const permissionQueryCodec: QueryCodec<PermissionListParams> = {
  parse: (sp) => ({
    page: Number(sp.get('page')) || 1,
    size: Number(sp.get('size')) || 10,
    name: sp.get('name') || undefined,
    module: sp.get('module') || undefined,
  }),
  serialize: (state) => ({
    page: state.page?.toString(),
    size: state.size?.toString(),
    name: state.name,
    module: state.module,
  }),
  resetPageOnChangeKeys: ['name', 'module', 'size']
};

export function PermissionsPageContent() {
  const [query, setQuery] = useQueryState(permissionQueryCodec);
  const [permissions, setPermissions] = useState<PermissionRead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPermissions(query);
      setPermissions(data.items || []);
      setTotal(data.meta?.total || 0);
    } catch (error) {
      toast.error('加载权限数据失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('已复制到剪贴板');
  };

  const handlePageChange = (newPage: number) => {
    setQuery({ page: newPage });
  };

  const handleSizeChange = (newSize: number) => {
    setQuery({ size: newSize, page: 1 });
  };

  const handleSearchChange = (value: string) => {
    setQuery({ name: value || undefined, page: 1 });
  };

  const columns: DataTableColumn<PermissionRead>[] = [
    {
      key: 'id',
      header: 'ID',
      render: (perm) => (
        <span className="text-slate-500 dark:text-slate-600">#{perm.id}</span>
      ),
    },
    {
      key: 'module',
      header: '模块',
      render: (perm) => (
        <CyberBadge variant="outline" className="uppercase tracking-wider text-[10px]">
          {perm.module || '系统'}
        </CyberBadge>
      ),
    },
    {
      key: 'code',
      header: '代码',
      render: (perm) => (
        <div className="flex items-center gap-2 font-mono text-cyan-600 dark:text-cyan-400">
          <span>{perm.code}</span>
          <button
            onClick={() => handleCopy(perm.code)}
            className="p-1 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 rounded transition-colors"
            title="复制"
          >
            <Copy size={14} />
          </button>
        </div>
      ),
    },
    {
      key: 'name',
      header: '名称',
      render: (perm) => (
        <span className="font-medium text-slate-900 dark:text-white">{perm.name}</span>
      ),
    },
    {
      key: 'description',
      header: '描述',
      render: (perm) => (
        <span className="text-slate-500 dark:text-slate-400">{perm.description || '-'}</span>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-muted-foreground dark:text-slate-400 mt-1 flex items-center gap-2">
            <Key className="w-4 h-4" />
            系统访问控制定义
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CyberCard className="p-4 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">权限总数</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{total}</p>
          </div>
        </CyberCard>

        <CyberCard className="md:col-span-2 p-4 flex items-center">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <CyberInput
              placeholder="搜索代码、名称或模块..."
              value={query.name || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </CyberCard>
      </div>

      <DataTable
        data={permissions}
        columns={columns}
        isLoading={loading}
        pagination={{ page: query.page || 1, size: query.size || 10, total }}
        onPageChange={handlePageChange}
        onSizeChange={handleSizeChange}
        rowKey={(perm) => perm.id}
      />
    </div>
  );
}
