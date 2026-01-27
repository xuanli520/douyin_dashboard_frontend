'use client';

import { AlertTriangle, ShieldAlert, Zap, Clock, CheckCircle, XCircle } from 'lucide-react';
import { GlassCard } from '@/app/components/ui/glass-card';
import { NeonTitle } from '@/app/components/ui/neon-title';
import { RiskLevelIcon } from '@/app/components/ui/RiskLevelIcon';

const alerts = [
  { 
    id: 1, 
    level: 'P0', 
    title: 'GMV 跌幅超过 20%', 
    time: '2021-11-24 09:07',
    duration: '1秒',
    status: '待处理',
    color: 'red'
  },
  { 
    id: 2, 
    level: 'P1', 
    title: '服务器负载过高', 
    time: '2021-11-24 09:07',
    duration: '1秒',
    status: '处理中',
    color: 'orange'
  },
  { 
    id: 3, 
    level: 'P1', 
    title: '服务器负载过高', 
    time: '2021-11-24 09:07',
    duration: '1秒',
    status: '待处理',
    color: 'orange'
  },
  { 
    id: 4, 
    level: 'P1', 
    title: '服务器负载过高', 
    time: '2021-11-24 09:07',
    duration: '1秒',
    status: '待处理',
    color: 'orange'
  },
  { 
    id: 5, 
    level: 'P1', 
    title: '服务器负载过高', 
    time: '2021-11-24 09:07',
    duration: '1秒',
    status: '处理中',
    color: 'orange'
  },
  { 
    id: 6, 
    level: 'P1', 
    title: 'GMV 跌幅超过 20%', 
    time: '2021-11-24 09:07',
    duration: '1秒',
    status: '已解决',
    color: 'orange'
  },
  { 
    id: 7, 
    level: 'P1', 
    title: '服务器负载过高', 
    time: '2021-11-24 09:07',
    duration: '1秒',
    status: '已解决',
    color: 'orange'
  },
];

export default function RiskAlertPage() {
  return (
    <div className="min-h-screen bg-transparent text-foreground p-6 space-y-6">
      
      <GlassCard className="min-h-[80vh] flex flex-col p-0">
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
             <NeonTitle icon={ShieldAlert}>风险预警中心 (Risk Command)</NeonTitle>
             <div className="flex gap-2 text-xs font-mono">
                 <span className="text-rose-500 dark:text-rose-400 animate-pulse">● LIVE MONITORING</span>
             </div>
        </div>

        <div className="flex flex-1">
            {/* Sidebar Stats */}
            <div className="w-64 border-r border-slate-200 dark:border-white/10 p-6 space-y-6">
                 <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 relative overflow-hidden group flex items-center justify-between">
                    <div>
                        <div className="text-4xl font-bold text-rose-500 mb-1 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)] font-mono">1</div>
                        <div className="text-xs text-rose-600 dark:text-rose-300 uppercase tracking-wider font-medium">P0 严重预警</div>
                    </div>
                    <RiskLevelIcon level="P0" width={80} height={80} className="drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]" />
                </div>

                <div className="p-5 rounded-2xl bg-orange-500/10 border border-orange-500/30 relative overflow-hidden group flex items-center justify-between">
                    <div>
                        <div className="text-4xl font-bold text-orange-500 mb-1 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)] font-mono">6</div>
                        <div className="text-xs text-orange-600 dark:text-orange-300 uppercase tracking-wider font-medium">P1 重要预警</div>
                    </div>
                    <RiskLevelIcon level="P1" width={80} height={80} className="drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]" />
                </div>

                <div className="mt-8">
                    <h4 className="text-xs font-mono text-slate-500 uppercase mb-4">Quick Filters</h4>
                    <div className="space-y-2">
                        <button className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/5">全部预警</button>
                        <button className="w-full text-left px-4 py-2 text-sm text-rose-500 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg transition-colors">待处理 (3)</button>
                        <button className="w-full text-left px-4 py-2 text-sm text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors border border-transparent hover:border-cyan-500/20">处理中 (2)</button>
                    </div>
                </div>
            </div>

            {/* Alert List */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 hover:border-cyan-500/50 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-all group relative overflow-hidden shadow-sm dark:shadow-none backdrop-blur-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                    {/* Subtle Gradient Hover Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="flex-1 grid grid-cols-12 gap-4 items-center relative z-10">
                      <div className="col-span-5">
                        <div className="flex items-center gap-5 mb-1">
                             <RiskLevelIcon level={alert.level} width={72} height={72} className="drop-shadow-md" />
                             <span className="text-lg font-medium text-slate-800 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors tracking-tight">{alert.title}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono flex items-center gap-3">
                          <span className="flex items-center gap-1"><Clock size={10}/> {alert.time}</span>
                          <span>Duration: {alert.duration}</span>
                        </div>
                      </div>

                      <div className="col-span-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono border ${
                          alert.status === '待处理' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' :
                          alert.status === '处理中' ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20 animate-pulse' :
                          'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        }`}>
                          {alert.status === '待处理' && <AlertTriangle size={10} />}
                          {alert.status === '处理中' && <Zap size={10} />}
                          {alert.status === '已解决' && <CheckCircle size={10} />}
                          {alert.status}
                        </span>
                      </div>

                      <div className="col-span-5 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
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
              </div>
            </div>
        </div>
      </GlassCard>
    </div>
  );
}