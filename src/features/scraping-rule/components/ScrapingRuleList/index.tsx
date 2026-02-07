import React, { useState } from 'react';
import { RuleTable } from './RuleTable';
import { useScrapingRules } from '../../hooks/useScrapingRules';
import { useDeleteScrapingRule } from '../../hooks/useDeleteScrapingRule';
import { useActivateScrapingRule } from '../../hooks/useActivateScrapingRule';
import { Button } from '@/app/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/app/components/ui/input';
import { DeleteConfirmDialog } from '@/app/(main)/admin/_components/common/DeleteConfirmDialog';

export function ScrapingRuleList() {
  const router = useRouter();
  const { data, loading, error, refresh, filters, updateFilters } = useScrapingRules();
  const { remove } = useDeleteScrapingRule();
  const { activate } = useActivateScrapingRule();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<number | null>(null);

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-4">
        <Input
          placeholder="搜索规则..."
          value={filters.name || ''}
          onChange={(e) => updateFilters({ name: e.target.value })}
          className="w-[250px]"
        />
        <Button onClick={() => router.push('/scraping-rule/create')}>
          <Plus className="w-4 h-4 mr-2" />
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
    </div>
  );
}
