import React, { useEffect } from 'react';
import { useDataSourceRules } from '../../hooks/useDataSourceRules';
import { RuleTable } from '@/features/scraping-rule/components/ScrapingRuleList/RuleTable';
import { useDeleteScrapingRule } from '@/features/scraping-rule/hooks/useDeleteScrapingRule';
import { useActivateScrapingRule } from '@/features/scraping-rule/hooks/useActivateScrapingRule';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';

interface AssociatedRulesProps {
  dataSourceId: number;
}

export function AssociatedRules({ dataSourceId }: AssociatedRulesProps) {
  const { rules, loading, error, refresh } = useDataSourceRules(dataSourceId);
  const { remove } = useDeleteScrapingRule();
  const { activate } = useActivateScrapingRule();

  const handleDelete = async (id: number) => {
    if (confirm('确定要删除此规则吗？')) {
      await remove(id);
      refresh();
    }
  };

  const handleToggleActive = async (id: number, active: boolean) => {
    await activate(id, active);
    refresh();
  };

  if (loading) return <div>加载规则中...</div>;
  if (error) return <div className="text-red-500">加载规则错误: {error.message}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>关联的采集规则</CardTitle>
      </CardHeader>
      <CardContent>
        <RuleTable 
          data={rules} 
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />
      </CardContent>
    </Card>
  );
}
