import React, { useEffect, useState, useMemo } from 'react';
import { useDataSourceRules } from '../../hooks/useDataSourceRules';
import { RuleTable } from '@/features/scraping-rule/components/ScrapingRuleList/RuleTable';
import { useDeleteScrapingRule } from '@/features/scraping-rule/hooks/useDeleteScrapingRule';
import { useActivateScrapingRule } from '@/features/scraping-rule/hooks/useActivateScrapingRule';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/app/components/ui/pagination';
import { ScrapingRule } from '@/features/scraping-rule/services/types';

interface AssociatedRulesProps {
  dataSourceId: number;
}

export function AssociatedRules({ dataSourceId }: AssociatedRulesProps) {
  const { rules, loading, error, refresh } = useDataSourceRules(dataSourceId);
  const { remove } = useDeleteScrapingRule();
  const { activate } = useActivateScrapingRule();
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const paginatedRules = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rules.slice(start, start + pageSize);
  }, [rules, page]);

  const totalPages = Math.ceil(rules.length / pageSize);

  const handleDelete = async (id: number) => {
    if (confirm('确定要删除此规则吗？')) {
      await remove(id);
      refresh();
      setPage(1);
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
        <CardTitle>关联的采集规则 ({rules.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <RuleTable 
          data={paginatedRules} 
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />

        {!loading && rules.length > 0 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700 mt-4">
            <div className="text-sm text-slate-500">
              共 <span className="font-medium">{rules.length}</span> 条规则
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage(Math.max(1, page - 1))}
                    className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setPage(pageNum)}
                        isActive={page === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                {totalPages > 5 && (
                  <PaginationItem>
                    <span className="px-2">...</span>
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    className={page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
