import React from 'react';
import { ScrapingRule } from '../services/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { RuleTypeTag } from './common/RuleTypeTag';
import { RuleStatusTag } from './common/RuleStatusTag';
import { ScheduleDisplay } from './common/ScheduleDisplay';
import { Pencil, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ScrapingRuleDetailProps {
  rule: ScrapingRule;
}

export function ScrapingRuleDetail({ rule }: ScrapingRuleDetailProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <Button onClick={() => router.push(`/scraping-rule/${rule.id}/edit`)}>
          <Pencil className="w-4 h-4 mr-2" />
          编辑规则
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-4">
            <RuleTypeTag type={rule.rule_type} />
            <div>
              <CardTitle className="text-xl font-bold">{rule.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{rule.description || '暂无描述'}</p>
            </div>
          </div>
          <RuleStatusTag status={rule.status} />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-4">
               <div>
                <h4 className="text-sm font-medium mb-1 text-muted-foreground">调度</h4>
                <ScheduleDisplay type={rule.schedule_type} value={rule.schedule_value} />
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1 text-muted-foreground">数据源ID</h4>
                <p className="font-mono">{rule.data_source_id}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1 text-muted-foreground">最后运行</h4>
                <p className="font-mono">{rule.last_run_at ? new Date(rule.last_run_at).toLocaleString() : '从未运行'}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">配置</h4>
                <div className="bg-slate-950 rounded-lg p-3 overflow-x-auto">
                  <pre className="text-xs text-slate-50 font-mono">
                    {JSON.stringify(rule.config, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
