'use client';

import React, { useState } from 'react';
import { RuleTable } from './RuleTable';
import { useScrapingRules } from '../../hooks/useScrapingRules';
import { useDeleteScrapingRule } from '../../hooks/useDeleteScrapingRule';
import { useActivateScrapingRule } from '../../hooks/useActivateScrapingRule';
import { Button } from '@/app/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { DeleteConfirmDialog } from '@/app/(main)/admin/_components/common/DeleteConfirmDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { CreateForm } from '../ScrapingRuleForm/CreateForm';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { ScrapingRuleType } from '../../services/types';

export function ScrapingRuleList() {
  const { data, loading, error, refresh, filters, updateFilters } = useScrapingRules();
  const { remove } = useDeleteScrapingRule();
  const { activate } = useActivateScrapingRule();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleDelete = (id: number) => {
    setRuleToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (ruleToDelete === null) return;
    await remove(ruleToDelete);
    refresh();
    setDeleteDialogOpen(false);
  };

  const handleToggleActive = async (id: number, active: boolean) => {
    await activate(id, active);
    refresh();
  };

  const handleCreateSuccess = () => {
    setIsCreateOpen(false);
    refresh();
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page });
  };

  const handleSizeChange = (size: number) => {
    updateFilters({ pageSize: size, page: 1 });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <Input
              placeholder="搜索规则..."
              value={filters.name || ''}
              onChange={(e) => updateFilters({ name: e.target.value, page: 1 })}
              className="pl-9 w-[200px]"
            />
          </div>
          <Select
            value={filters.rule_type || 'all'}
            onValueChange={(value) => updateFilters({ rule_type: value as ScrapingRuleType | 'all', page: 1 })}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="全部类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="orders">订单</SelectItem>
              <SelectItem value="products">商品</SelectItem>
              <SelectItem value="users">用户</SelectItem>
              <SelectItem value="comments">评论</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/50 rounded-lg hover:bg-cyan-600/30 transition-all shadow-[0_0_15px_rgba(34,211,238,0.15)] text-sm font-medium group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          创建规则
        </Button>
      </div>

      {loading && <div className="text-left py-8">加载中...</div>}
      {error && <div className="text-left text-red-500 py-8">错误: {error.message}</div>}

      {!loading && !error && (
        <RuleTable
          data={data.list}
          loading={loading}
          pagination={{ page: data.page || 1, size: filters.pageSize || 10, total: data.total || 0 }}
          onPageChange={handlePageChange}
          onSizeChange={handleSizeChange}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />
      )}

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        description="确定要删除此规则吗？此操作无法撤销。"
      />

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>创建采集规则</DialogTitle>
          </DialogHeader>
          <CreateForm onSuccess={handleCreateSuccess} onCancel={() => setIsCreateOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
