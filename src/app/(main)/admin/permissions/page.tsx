'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getPermissions, Permission } from '@/services/adminService';
import { CyberCard } from '@/components/ui/cyber/CyberCard';
import { CyberInput } from '@/components/ui/cyber/CyberInput';
import { CyberBadge } from '@/components/ui/cyber/CyberBadge';
import { DataTable, DataTableColumn } from '../_components/common/DataTable';
import { Shield, Search, Lock, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const data = await getPermissions();
      setPermissions(data);
    } catch (error) {
      toast.error('加载权限数据失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('已复制到剪贴板');
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const filteredPermissions = useMemo(() => {
    return permissions.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.module?.toLowerCase().includes(search.toLowerCase())
    );
  }, [permissions, search]);

  const currentPageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPermissions.slice(start, start + pageSize);
  }, [filteredPermissions, page, pageSize]);

  const columns: DataTableColumn<Permission>[] = [
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
            <Shield className="w-4 h-4" />
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
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{permissions.length}</p>
          </div>
        </CyberCard>

        <CyberCard className="md:col-span-2 p-4 flex items-center">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <CyberInput
              placeholder="搜索代码、名称或模块..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
        </CyberCard>
      </div>

      <DataTable
        data={currentPageData}
        columns={columns}
        isLoading={loading}
        pagination={{ page, size: pageSize, total: filteredPermissions.length }}
        onPageChange={handlePageChange}
        onSizeChange={handleSizeChange}
        rowKey={(perm) => perm.id}
      />
    </div>
  );
}
