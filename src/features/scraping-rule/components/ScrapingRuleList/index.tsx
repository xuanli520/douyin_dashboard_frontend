import React, { useState } from 'react';
import { RuleTable } from './RuleTable';
import { useScrapingRules } from '../../hooks/useScrapingRules';
import { useDeleteScrapingRule } from '../../hooks/useDeleteScrapingRule';
import { useActivateScrapingRule } from '../../hooks/useActivateScrapingRule';
import { Button } from '@/app/components/ui/button';
import { Plus } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { DeleteConfirmDialog } from '@/app/(main)/admin/_components/common/DeleteConfirmDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { CreateForm } from '../ScrapingRuleForm/CreateForm';

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-4">
        <Input
          placeholder="搜索规则..."
          value={filters.name || ''}
          onChange={(e) => updateFilters({ name: e.target.value })}
          className="w-[250px]"
        />
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/50 rounded-lg hover:bg-cyan-600/30 transition-all shadow-[0_0_15px_rgba(34,211,238,0.15)] text-sm font-medium group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          创建规则
        </Button>
      </div>

      {loading && <div className="text-left">加载中...</div>}
      {error && <div className="text-left text-red-500">错误: {error.message}</div>}
      
      {!loading && !error && (
        <RuleTable
          data={data.list}
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
