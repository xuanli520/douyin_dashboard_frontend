'use client';

import React, { useState } from 'react';
import { useDataSources } from '../../hooks/useDataSources';
import { useCreateDataSource } from '../../hooks/useCreateDataSource';
import { useUpdateDataSource } from '../../hooks/useUpdateDataSource';
import { useDeleteDataSource } from '../../hooks/useDeleteDataSource';
import { DataSourceTable } from './DataSourceTable';
import { DataSourceForm } from '../DataSourceForm';
import { GlassCard } from '@/app/components/ui/glass-card';
import { NeonTitle } from '@/app/components/ui/neon-title';
import { DataSourceSelect } from '@/app/components/ui/styled-select';
import { SelectItem } from '@/app/components/ui/select';
import { Search, Database, Plus } from 'lucide-react';
import { DataSourceType, DataSourceStatus, DataSourceCreateDTO, DataSource } from '../../services/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { DeleteConfirmDialog } from '@/app/(main)/admin/_components/common/DeleteConfirmDialog';
import { toast } from 'sonner';

export default function DataSourceList() {
  const { data, loading, filters, updateFilters, refresh } = useDataSources();
  const { create, loading: creating } = useCreateDataSource();
  const { update, loading: updating } = useUpdateDataSource();
  const { remove, loading: deleting } = useDeleteDataSource();

  const [searchText, setSearchText] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingSource, setEditingSource] = useState<DataSource | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState<number | null>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    // Debounce can be added here
    updateFilters({ name: e.target.value });
  };

  const handleTypeChange = (value: string) => {
    updateFilters({ type: value as DataSourceType | 'all' });
  };

  const handleStatusChange = (value: string) => {
    updateFilters({ status: value as DataSourceStatus | 'all' });
  };

  const handleCreate = async (data: DataSourceCreateDTO) => {
    try {
      await create(data);
      toast.success('数据源创建成功');
      setIsCreateOpen(false);
      refresh();
    } catch (error) {
      toast.error('创建数据源失败');
      console.error(error);
    }
  };

  const handleUpdate = async (data: DataSourceCreateDTO) => {
    if (!editingId) return;
    try {
      await update(editingId, data as any);
      toast.success('数据源更新成功');
      setEditingId(null);
      setEditingSource(undefined);
      refresh();
    } catch (error) {
      toast.error('更新数据源失败');
      console.error(error);
    }
  };

  const handleEditClick = (id: number) => {
    const source = data?.list?.find(item => item.id === id);
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
      refresh();
    } catch (error) {
      toast.error('删除数据源失败');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground p-6 space-y-6">
      <GlassCard className="min-h-[600px] flex flex-col">
        {/* Header & Controls */}
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <NeonTitle icon={Database}>数据源管理</NeonTitle>
            <div className="flex items-center gap-2">
              <DataSourceSelect onValueChange={handleTypeChange} defaultValue="all">
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="database">数据库</SelectItem>
                <SelectItem value="file">文件</SelectItem>
              </DataSourceSelect>

              <DataSourceSelect onValueChange={handleStatusChange} defaultValue="all">
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">活跃</SelectItem>
                <SelectItem value="inactive">停用</SelectItem>
                <SelectItem value="error">错误</SelectItem>
              </DataSourceSelect>
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
                className="pl-10 pr-4 py-2 w-[240px] bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-cyan-500/50 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all"
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

        {/* Data Table */}
        <DataSourceTable 
          data={data?.list || []} 
          loading={loading || deleting} 
          onEdit={handleEditClick} 
          onDelete={handleDeleteClick} 
        />

        {/* Pagination */}
        <div className="mt-auto p-4 border-t border-slate-200 dark:border-white/10 flex justify-end w-full">
          <div className="flex gap-2">
            <button
              disabled={data.page <= 1}
              onClick={() => updateFilters({ page: data.page - 1 })}
              className="px-3 py-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 disabled:opacity-50"
            >
              上一页
            </button>
            <button className="px-3 py-1 text-xs text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-950/30 border border-cyan-500/30 rounded">
              {data.page}
            </button>
            <button
               disabled={(data?.list?.length || 0) < data.pageSize}
               onClick={() => updateFilters({ page: data.page + 1 })}
               className="px-3 py-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
            >
              下一页
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Create Dialog */}
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

      {/* Edit Dialog */}
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

      {/* Delete Dialog */}
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
