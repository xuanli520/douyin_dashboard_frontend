'use client';

import React, { useState, useEffect } from 'react';
import { useDataSources } from '../../hooks/useDataSources';
import { useCreateDataSource } from '../../hooks/useCreateDataSource';
import { useUpdateDataSource } from '../../hooks/useUpdateDataSource';
import { useDeleteDataSource } from '../../hooks/useDeleteDataSource';
import { DataSourceTable } from './DataSourceTable';
import { DataSourceForm } from '../DataSourceForm';
import { NeonTitle } from '@/app/components/ui/neon-title';
import { Search, Database, Plus } from 'lucide-react';
import { DataSourceType, DataSourceStatus, DataSourceCreate, DataSource } from '../../services/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { DeleteConfirmDialog } from '@/app/(main)/admin/_components/common/DeleteConfirmDialog';
import { toast } from 'sonner';
import { useQueryState } from '@/app/(main)/admin/_components/common/QueryState';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';

interface DataSourceQuery {
  page: number;
  pageSize: number;
  name?: string;
  type?: string;
  status?: string;
}

const dataSourceQueryCodec = {
  parse: (sp: URLSearchParams) => ({
    page: Number(sp.get('page')) || 1,
    pageSize: Number(sp.get('pageSize')) || 10,
    name: sp.get('name') || undefined,
    type: sp.get('type') || 'all',
    status: sp.get('status') || 'all',
  }),
  serialize: (state: DataSourceQuery) => ({
    page: state.page?.toString(),
    pageSize: state.pageSize?.toString(),
    name: state.name,
    type: state.type === 'all' ? undefined : state.type,
    status: state.status === 'all' ? undefined : state.status,
  }),
  resetPageOnChangeKeys: ['name', 'type', 'status', 'pageSize'] as ('name' | 'type' | 'status' | 'pageSize')[]
};

export function DataSourceList() {
  const [query, setQuery] = useQueryState(dataSourceQueryCodec);
  const { data, loading, refetch } = useDataSources(query as any);
  const { create, loading: creating } = useCreateDataSource();
  const { update, loading: updating } = useUpdateDataSource();
  const { remove, loading: deleting } = useDeleteDataSource();

  const [searchText, setSearchText] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingSource, setEditingSource] = useState<DataSource | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    setQuery({ name: value, page: 1 });
  };

  const handleTypeChange = (value: string) => {
    updateFilters({ source_type: value === 'all' ? undefined : value as DataSourceType, page: 1 });
  };

  const handleStatusChange = (value: string) => {
    updateFilters({ status: value === 'all' ? undefined : value as DataSourceStatus, page: 1 });
  };

  const handleCreate = async (formData: DataSourceCreate) => {
    try {
      await create(formData);
      toast.success('数据源创建成功');
      setIsCreateOpen(false);
      refetch();
    } catch (error) {
      toast.error('创建数据源失败');
      console.error(error);
    }
  };

  const handleUpdate = async (formData: DataSourceCreate) => {
    if (!editingId) return;
    try {
      await update(editingId, formData);
      toast.success('数据源更新成功');
      setEditingId(null);
      setEditingSource(undefined);
      refetch();
    } catch (error) {
      toast.error('更新数据源失败');
      console.error(error);
    }
  };

  const handleEditClick = (id: number) => {
    const source = data?.items?.find(item => item.id === id);
    if (source) {
      setEditingSource(source);
      setEditingId(id);
    }
  };

  const handleDeleteClick = (id: number) => {
    setSourceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!sourceToDelete) return;
    try {
      await remove(sourceToDelete);
      toast.success('数据源删除成功');
      setDeleteDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error('删除数据源失败');
      console.error(error);
    }
  };

  const handlePageChange = (page: number) => {
    setQuery({ page });
  };

  const handleSizeChange = (size: number) => {
    updateFilters({ size, page: 1 });
  };

  return (
    <div className="bg-transparent text-foreground p-6 space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <NeonTitle icon={Database}>数据源管理</NeonTitle>
          <div className="flex items-center gap-2">
            <Select value={mounted ? (filters.source_type || 'all') : 'all'} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="全部类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="DOUYIN_API">抖音API</SelectItem>
                <SelectItem value="FILE_UPLOAD">文件上传</SelectItem>
                <SelectItem value="SELF_HOSTED">数据库</SelectItem>
                <SelectItem value="FILE_IMPORT">文件导入</SelectItem>
              </SelectContent>
            </Select>

            <Select value={mounted ? (filters.status || 'all') : 'all'} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="ACTIVE">活跃</SelectItem>
                <SelectItem value="INACTIVE">停用</SelectItem>
                <SelectItem value="ERROR">错误</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={16} />
            <input
              type="text"
              placeholder="搜索数据源..."
              value={searchText}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 w-[200px] bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-cyan-500/50 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all"
            />
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/50 rounded-lg hover:bg-cyan-600/30 transition-all shadow-[0_0_15px_rgba(34,211,238,0.15)] text-sm font-medium group"
          >
            <Plus size={16} className="group-hover:rotate-90 transition-transform" />
            添加数据源
          </button>
        </div>
      </div>

      <DataSourceTable
        data={data?.items || []}
        loading={loading || deleting}
        pagination={{ page: data?.meta?.page || 1, size: data?.meta?.size || 10, total: data?.meta?.total || 0 }}
        onPageChange={handlePageChange}
        onSizeChange={handleSizeChange}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>添加新数据源</DialogTitle>
          </DialogHeader>
          <DataSourceForm
            onSubmit={handleCreate}
            loading={creating}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>编辑数据源</DialogTitle>
          </DialogHeader>
          {editingSource && (
            <DataSourceForm
              initialData={editingSource}
              onSubmit={handleUpdate}
              loading={updating}
              onCancel={() => setEditingId(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        isLoading={deleting}
        title="确认删除数据源？"
        description="此操作无法撤销，将永久删除该数据源及其所有配置。"
      />
    </div>
  );
}
