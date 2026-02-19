'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ShieldAlert, Zap, Clock, CheckCircle, XCircle } from 'lucide-react';
import { GlassCard } from '@/app/components/ui/glass-card';
import { NeonTitle } from '@/app/components/ui/neon-title';
import { RiskLevelIcon } from '@/app/components/ui/RiskLevelIcon';
import { EndpointStatusWrapper } from '@/app/components/ui/endpoint-status-wrapper';
import { riskApi } from '@/features/risk/services/riskApi';
import { API_ENDPOINTS } from '@/config/api';

export default function RiskAlertPage() {
  const query = useQuery({
    queryKey: ['alerts', 'list'],
    queryFn: () => riskApi.getAlerts(),
  });
  
  // Access nested data: response.data.data
  const apiData = query.data?.data?.data;
  const alerts = apiData?.alerts || [];
  const summary = apiData?.summary || { critical: 0, warning: 0, info: 0, total: 0, unread: 0 };

  return (
    <EndpointStatusWrapper
      path={API_ENDPOINTS.ALERTS_LIST}
      responseData={query.data}
      placeholderProps={{ icon: <ShieldAlert size={48} className="text-rose-500" /> }}
    >
    <div className="min-h-screen bg-transparent text-foreground p-6 space-y-6">
      
      <GlassCard className="min-h-[80vh] flex flex-col p-0">
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
             <NeonTitle icon={ShieldAlert}>风险预警中心 (Risk Command)</NeonTitle>
             <div className="flex gap-2 text-xs font-mono items-center">
                 <div className="w-2 h-2 rounded-full bg-rose-500 dark:bg-rose-400 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                 <span className="text-rose-500 dark:text-rose-400 font-bold tracking-wider">LIVE MONITORING</span>
             </div>
        </div>

        <div className="flex flex-1">
            {/* Sidebar Stats */}
            <div className="w-64 border-r border-slate-200 dark:border-white/10 p-6 space-y-6">
                 <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 relative overflow-hidden group flex items-center justify-between">
                    <div>
                        <div className="text-4xl font-bold text-rose-500 mb-1 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)] font-mono">{summary.critical}</div>
                        <div className="text-xs text-rose-600 dark:text-rose-300 uppercase tracking-wider font-medium">Critical (P0)</div>
                    </div>
                    <RiskLevelIcon level="P0" width={60} height={60} className="drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]" />
                </div>

                <div className="p-5 rounded-2xl bg-orange-500/10 border border-orange-500/30 relative overflow-hidden group flex items-center justify-between">
                    <div>
                        <div className="text-4xl font-bold text-orange-500 mb-1 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)] font-mono">{summary.warning}</div>
                        <div className="text-xs text-orange-600 dark:text-orange-300 uppercase tracking-wider font-medium">Warning</div>
                    </div>
                    <RiskLevelIcon level="P1" width={60} height={60} className="drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]" />
                </div>

                 <div className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 relative overflow-hidden group flex items-center justify-between">
                    <div>
                        <div className="text-4xl font-bold text-cyan-500 mb-1 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)] font-mono">{summary.info}</div>
                        <div className="text-xs text-cyan-600 dark:text-cyan-300 uppercase tracking-wider font-medium">Info</div>
                    </div>
                     <div className="p-2 bg-cyan-500/20 rounded-full">
                        <ShieldAlert className="text-cyan-500" size={32} />
                     </div>
                </div>

                <div className="mt-8">
                    <h4 className="text-xs font-mono text-slate-500 uppercase mb-4">Quick Filters</h4>
                    <div className="space-y-2">
                        <button className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:border-white/5">
                            全部预警 ({summary.total})
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm text-rose-500 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg transition-colors">
                            待处理 ({summary.unread})
                        </button>
                    </div>
                </div>
            </div>

            {/* Alert List */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-3">
                {alerts.map((alert: any) => (
                  <div key={alert.id} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 hover:border-cyan-500/30 rounded-xl transition-all group relative overflow-hidden shadow-sm hover:shadow-md dark:shadow-none backdrop-blur-sm">
                    {/* Subtle Gradient Hover Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-50/30 to-transparent dark:via-cyan-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="flex-1 grid grid-cols-12 gap-4 items-center relative z-10">
                      <div className="col-span-6">
                        <div className="flex items-center gap-4 mb-1">
                             <RiskLevelIcon level={alert.level} width={48} height={48} className="drop-shadow-md" />
                             <span className="text-base font-medium text-slate-800 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors tracking-tight">{alert.title}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono flex items-center gap-3 ml-[64px]">
                          <span className="flex items-center gap-1"><Clock size={10}/> {alert.time}</span>
                          {/* Mock data doesn't have duration, removing or hiding */}
                        </div>
                      </div>

                      <div className="col-span-2">
                        <span className={`inline-flex items-center justify-center gap-2 px-3 py-1 rounded-md text-xs font-medium border ${
                          alert.status === '待处理' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' :
                          alert.status === '处理中' ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20 animate-pulse' :
                          'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        }`}>
                          {alert.status === '待处理' && <AlertTriangle size={12} />}
                          {alert.status === '处理中' && <Zap size={12} />}
                          {alert.status === '已解决' && <CheckCircle size={12} />}
                          {alert.status}
                        </span>
                      </div>

                      <div className="col-span-4 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                        <button className="px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 text-xs rounded transition-colors">
                          指派
                        </button>
                        {alert.status !== '已解决' && (
                             <button className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-emerald-500/20 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-white/10 hover:border-emerald-500/30 text-xs rounded transition-colors">
                              标记解决
                            </button>
                        )}
                         <button className="px-3 py-1.5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 rounded transition-colors">
                             <XCircle size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {alerts.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        暂无预警记录
                    </div>
                )}
              </div>
            </div>
        </div>
      </GlassCard>
    </div>
    </EndpointStatusWrapper>
  );
}
