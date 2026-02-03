'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { RiskLevelIcon } from '@/app/components/ui/RiskLevelIcon';
import { NeonTitle } from '@/app/components/ui/neon-title';

const alertsData = [
  { id: 1, level: 'P0', title: '近1小时销售额跌幅 > 20%', time: '10m ago', status: '待处理' },
  { id: 2, level: 'P1', title: '直播间推流中断 (Room: 882)', time: '32m ago', status: '处理中' },
  { id: 3, level: 'P2', title: '库存同步延迟 (SKU: 9920)', time: '2h ago', status: '已忽略' },
];

export default function RiskAlertsWidget() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <NeonTitle icon={ShieldAlert}>风险预警</NeonTitle>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 animate-pulse">
          3 warnings
        </span>
      </div>
      <div className="space-y-3 overflow-y-auto flex-1 pr-1">
        {alertsData.map((alert) => (
          <div
            key={alert.id}
            className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <RiskLevelIcon level={alert.level} width={32} height={32} />
              <div>
                <div className="text-sm text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {alert.title}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  触发时间: {alert.time}
                </div>
              </div>
            </div>
            <div className={`text-[10px] px-2 py-1 rounded font-mono ${
              alert.status === '待处理' ? 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/30' :
              alert.status === '处理中' ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-950/30' :
              'text-slate-500'
            }`}>
              {alert.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
