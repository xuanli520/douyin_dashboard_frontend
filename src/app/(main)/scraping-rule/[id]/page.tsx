'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useScrapingRule } from '@/features/scraping-rule/hooks/useScrapingRule';
import { ScrapingRuleDetail } from '@/features/scraping-rule/components/ScrapingRuleDetail';

export default function ScrapingRuleDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { rule, loading, error } = useScrapingRule(id);

  if (loading) return <div className="p-6">加载中...</div>;
  if (error) return <div className="p-6 text-red-500">错误: {error.message}</div>;
  if (!rule) return <div className="p-6">未找到规则。</div>;

  return (
    <div className="py-6">
      <ScrapingRuleDetail rule={rule} />
    </div>
  );
}
