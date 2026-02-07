'use client';

import { useState } from 'react';
import { Play, Edit, Copy, X, Terminal, Clock, Activity, CheckCircle, XCircle, Search, Plus } from 'lucide-react';
import { NeonTitle } from '@/app/components/ui/neon-title';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/app/components/ui/table';

const tasks = [
  {
    id: 1,
    name: '数据同步任务 (Data Sync)',
    lastStatus: '成功',
    lastRun: '2023-17-03 18:00:38',
    duration: '04ms'
  },
  {
    id: 2,
    name: '库存校准 (Inventory Check)',
    lastStatus: '成功',
    lastRun: '2023-17-03 14:03:39',
    duration: '96ms'
  },
  {
    id: 3,
    name: '报表生成 (Report Gen)',
    lastStatus: '失败',
    lastRun: '2023-17-03 14:50:37',
    duration: '03ms'
  },
  {
    id: 4,
    name: '用户行为分析 (User Analytics)',
    lastStatus: '成功',
    lastRun: '2023-17-03 14:50:30',
    duration: '03ms'
  },
  {
    id: 5,
    name: '日志清理 (Log Cleanup)',
    lastStatus: '失败',
    lastRun: '2023-17-08 14:50:39',
    duration: '03ms'
  },
  {
    id: 6,
    name: '系统备份 (Backup)',
    lastStatus: '成功',
    lastRun: '2023-17-03 14:50:37',
    duration: '03ms'
  },
];

const logContent = `> [SYSTEM] Initializing process 2770...
> [SYSTEM] Connecting to database shard-01... OK
> [WARN] Latency spike detected (120ms)
> [INFO] Syncing batch #44920...
> [ERROR] Connection timeout at 12:38:35:03
> [RETRY] Attempting retry 1/3...
> [INFO] Connection re-established
> [SUCCESS] Batch #44920 completed
> [SYSTEM] Process terminated with exit code 0`;

export default function TaskSchedulePage() {
  const [showLog, setShowLog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const handleViewLog = (task: any) => {
    setSelectedTask(task);
    setShowLog(true);
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground p-6 relative flex flex-col gap-6">
      
      <div className="flex items-center justify-between">
           <NeonTitle icon={Clock}>任务调度中心 (Cron Command)</NeonTitle>
          
           <div className="flex gap-3">
              <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={14} />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        className="pl-9 pr-4 py-1.5 w-[200px] bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-cyan-500/50 text-xs text-slate-700 dark:text-slate-200"
                    />
                </div>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-cyan-600/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/50 rounded-lg hover:bg-cyan-600/30 transition-all text-xs font-medium">
                <Plus size={14} />
                Create Task
              </button>
           </div>
      </div>

      {/* 任务表格 */}
      <div className="flex-1 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {['任务名称', '运行状态', '上次运行', '耗时', '操作'].map((h) => (
                  <TableHead key={h}>
                      {h}
                  </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                    <div className="flex items-center gap-3">
                        <Activity size={16} className="text-slate-600 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white font-mono">{task.name}</span>
                    </div>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono border ${ 
                    task.lastStatus === '成功' 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]'
                  }`}>
                     {task.lastStatus === '成功' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                    {task.lastStatus === '成功' ? 'SUCCESS' : 'FAILED'}
                  </span>
                </TableCell>
                <TableCell>{task.lastRun}</TableCell>
                <TableCell>{task.duration}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleViewLog(task)}
                      className="p-1.5 hover:bg-cyan-500/10 text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 rounded transition-colors"
                      title="View Logs"
                    >
                      <Terminal size={14} />
                    </button>
                    <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 rounded transition-colors" title="Edit">
                      <Edit size={14} />
                    </button>
                    <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 rounded transition-colors" title="Clone">
                      <Copy size={14} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Terminal Log Modal */}
      {showLog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={() => setShowLog(false)}>
          <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            {/* Terminal Header */}
            <div className="px-4 py-2 bg-[#1a1a1a] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                      <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                  </div>
                  <span className="ml-3 text-xs text-slate-400 font-mono">root@system:~/logs/{selectedTask?.id}.log</span>
              </div>
              <button 
                onClick={() => setShowLog(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Terminal Content */}
            <div className="flex-1 p-6 overflow-auto font-mono text-xs leading-relaxed selection:bg-green-500/30">
              {logContent.split('\n').map((line, i) => (
                  <div key={i} className={`${line.includes('[ERROR]') ? 'text-red-400' : line.includes('[WARN]') ? 'text-yellow-400' : 'text-emerald-500'}`}>
                      {line}
                  </div>
              ))}
              <div className="text-emerald-500 animate-pulse mt-2">_</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}