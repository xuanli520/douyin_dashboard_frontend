import React, { useState } from 'react';
import { Clock3, Gauge, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ROUTES } from '@/config/routes';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { shopDashboardApi } from '@/features/shop-dashboard/services/shopDashboardApi';
import { ScrapingRule } from '../services/types';
import { RuleStatusTag } from './common/RuleStatusTag';
import { RuleTypeTag } from './common/RuleTypeTag';
import { ScheduleDisplay } from './common/ScheduleDisplay';

interface ScrapingRuleDetailProps {
  rule: ScrapingRule;
}

export function ScrapingRuleDetail({ rule }: ScrapingRuleDetailProps) {
  const router = useRouter();
  const [triggering, setTriggering] = useState(false);

  const handleTrigger = async () => {
    setTriggering(true);
    try {
      const result = await shopDashboardApi.triggerShopDashboardCollection({
        data_source_id: rule.data_source_id,
        rule_id: rule.id,
      });
      toast.success(`触发成功，执行ID: ${result.execution.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '触发采集失败');
    } finally {
      setTriggering(false);
    }
  };

  const handleConfigureSchedule = () => {
    const params = new URLSearchParams({
      task_type: 'SHOP_DASHBOARD_COLLECTION',
      data_source_id: String(rule.data_source_id),
      rule_id: String(rule.id),
    });
    router.push(`${ROUTES.TASK_SCHEDULE_COLLECTION_JOBS}?${params.toString()}`);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <RuleTypeTag type={rule.target_type} />
          <RuleStatusTag isActive={rule.is_active} />
          <div>
            <CardTitle className="text-xl font-bold">{rule.name}</CardTitle>
            {rule.description && <p className="mt-1 text-sm text-muted-foreground">{rule.description}</p>}
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handleConfigureSchedule}>
            <Clock3 className="mr-2 h-4 w-4" />
            配置定时任务
          </Button>
          <Button variant="outline" size="sm" onClick={handleTrigger} disabled={triggering}>
            <Gauge className="mr-2 h-4 w-4" />
            {triggering ? '触发中...' : '立即采集'}
          </Button>
          <Button size="sm" onClick={() => router.push(`/scraping-rule/${rule.id}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            编辑规则
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <h4 className="mb-1 text-sm font-medium text-muted-foreground">调度</h4>
              <ScheduleDisplay schedule={rule.schedule} />
            </div>
            <div>
              <h4 className="mb-1 text-sm font-medium text-muted-foreground">数据源</h4>
              <p className="font-mono">{rule.data_source_name || rule.data_source_id}</p>
            </div>
            <div>
              <h4 className="mb-1 text-sm font-medium text-muted-foreground">最后运行</h4>
              <p className="font-mono">{rule.last_run_at ? new Date(rule.last_run_at).toLocaleString() : '从未运行'}</p>
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-medium text-muted-foreground">配置</h4>
            <div className="overflow-x-auto rounded-lg bg-slate-950 p-3">
              <pre className="text-xs font-mono text-slate-50">{JSON.stringify(rule.config, null, 2)}</pre>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
