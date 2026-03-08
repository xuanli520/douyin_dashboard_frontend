import React, { useState } from 'react';
import { ScrapingRule } from '../services/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { RuleTypeTag } from './common/RuleTypeTag';
import { RuleStatusTag } from './common/RuleStatusTag';
import { ScheduleDisplay } from './common/ScheduleDisplay';
import { Pencil, ArrowLeft, Gauge } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { shopDashboardApi } from '@/features/shop-dashboard/services/shopDashboardApi';

interface ScrapingRuleDetailProps {
  rule: ScrapingRule;
}

export function ScrapingRuleDetail({ rule }: ScrapingRuleDetailProps) {
  const router = useRouter();
  const [triggering, setTriggering] = useState(false);

  const handleTrigger = async () => {
    setTriggering(true);
    try {
      const result = await shopDashboardApi.batchTrigger({ rule_ids: [rule.id] });
      toast.success(`触发成功，任务ID: ${result.task_id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '触发采集失败');
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleTrigger} disabled={triggering}>
            <Gauge className="w-4 h-4 mr-2" />
            {triggering ? '触发中...' : '立即采集'}
          </Button>
          <Button onClick={() => router.push(`/scraping-rule/${rule.id}/edit`)}>
            <Pencil className="w-4 h-4 mr-2" />
            编辑规则
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-4">
            <RuleTypeTag type={rule.target_type} />
            <div>
              <CardTitle className="text-xl font-bold">{rule.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{rule.description || '暂无描述'}</p>
            </div>
          </div>
          <RuleStatusTag isActive={rule.is_active} />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mt-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1 text-muted-foreground">调度</h4>
                <ScheduleDisplay schedule={rule.schedule} />
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1 text-muted-foreground">数据源</h4>
                <p className="font-mono">{rule.data_source_name || rule.data_source_id}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1 text-muted-foreground">最后运行</h4>
                <p className="font-mono">{rule.last_run_at ? new Date(rule.last_run_at).toLocaleString() : '从未运行'}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2 text-muted-foreground">配置</h4>
              <div className="rounded-lg bg-slate-950 p-3 overflow-x-auto">
                <pre className="text-xs font-mono text-slate-50">{JSON.stringify(rule.config, null, 2)}</pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
