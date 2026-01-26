'use client';

import { FileText, MoreVertical, FileSpreadsheet, Download, Clock } from 'lucide-react';
import { GlassCard } from '@/app/components/ui/glass-card';
import { NeonTitle } from '@/app/components/ui/neon-title';

const reports = [
  { id: 1, name: '2023年10月销售月报', date: '2023-11-01 10:00', type: 'pdf' },
  { id: 2, name: '2023年Q3运营周报', date: '2023-11-01 10:00', type: 'excel' },
  { id: 3, name: '2023年10月销售月报', date: '2023-11-01 10:00', type: 'pdf' },
  { id: 4, name: '2023年Q3运营周报', date: '2023-11-01 10:00', type: 'excel' },
];

const downloadFiles = [
  { name: '2023年10月销售月报 - Exc...', size: '36.9 MB', status: '生成中' },
  { name: '2023年Q3运营周报 - 2023...', size: '38.9 MB', status: '已完成' },
  { name: '2023年10月销售月报 - Exc...', size: '32.8 MB', status: '已完成' },
  { name: '2023年10月销售月报 - Exc...', size: '36.0 MB', status: '已完成' },
  { name: '2023年Q3运营周报 - 2023...', size: '3.92 MB', status: '已过期' },
];

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-[#050714] text-slate-200 p-6 space-y-6">
      
      {/* 标签页 */}
      <div className="mb-6 border-b border-white/10">
        <div className="flex gap-8">
          <button className="pb-3 text-sm font-mono font-medium text-cyan-400 border-b-2 border-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
            定期报表 (Regular)
          </button>
          <button className="pb-3 text-sm font-mono font-medium text-slate-500 hover:text-slate-300 transition-colors">
            自定义导出 (Custom)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* 报表卡片区域 */}
        <div className="xl:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((report) => (
              <GlassCard key={report.id} className="p-6 hover:bg-[#0f172a]/60 transition-all group border-l-2 border-l-transparent hover:border-l-cyan-400">
                <div className="flex flex-col items-center text-center relative z-10">
                  <div className="w-16 h-20 mb-4 flex items-center justify-center relative">
                    {/* Glowing Backdrop for Icon */}
                    <div className={`absolute inset-0 blur-[30px] opacity-20 ${report.type === 'pdf' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                    
                    {report.type === 'pdf' ? (
                      <div className="w-12 h-16 bg-rose-500/20 border border-rose-500/50 rounded flex items-center justify-center text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                        <FileText size={24} />
                      </div>
                    ) : (
                      <div className="w-12 h-16 bg-emerald-500/20 border border-emerald-500/50 rounded flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        <FileSpreadsheet size={24} />
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-sm font-medium text-slate-200 mb-2 group-hover:text-cyan-400 transition-colors">{report.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4 font-mono">
                    <Clock size={12} />
                    {report.date}
                  </div>
                  
                  <button className="px-6 py-2 bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-400 text-xs font-mono rounded-full transition-all flex items-center gap-2">
                    <Download size={14} />
                    Download
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* 文件下载中心 */}
        <GlassCard className="h-fit">
          <div className="p-6 border-b border-white/10">
             <NeonTitle icon={Download}>文件下载中心</NeonTitle>
          </div>

          <div className="divide-y divide-white/5">
            <div className="px-6 py-3 bg-white/[0.02] grid grid-cols-3 gap-4 text-[10px] font-mono font-medium text-slate-500 uppercase tracking-wider">
              <div>Filename</div>
              <div>Size</div>
              <div className="text-right">Status</div>
            </div>

            {downloadFiles.map((file, index) => (
              <div key={index} className="px-6 py-4 grid grid-cols-3 gap-4 text-xs hover:bg-white/[0.04] transition-colors group">
                <div className="text-slate-300 truncate flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-400 transition-colors" />
                    {file.name}
                </div>
                <div className="text-slate-500 font-mono">{file.size}</div>
                <div className="flex items-center justify-end gap-3">
                  <span className={`font-mono text-[10px] px-2 py-0.5 rounded ${
                    file.status === '生成中' ? 'text-yellow-400 bg-yellow-950/30' :
                    file.status === '已完成' ? 'text-emerald-400 bg-emerald-950/30' :
                    'text-slate-500 bg-slate-800/50'
                  }`}>
                    {file.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
           <div className="p-4 border-t border-white/10 text-center">
                <button className="text-xs text-slate-500 hover:text-cyan-400 font-mono transition-colors">View All History &rarr;</button>
           </div>
        </GlassCard>
      </div>
    </div>
  );
}
