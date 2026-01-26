'use client';

import { usePathname } from 'next/navigation';
import { Activity } from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: '首页', href: '/dashboard' },
  { id: 'data-analysis', label: '数据分析', href: '/data-analysis' },
  { id: 'task-schedule', label: '任务调度', href: '/task-schedule' },
  { id: 'reports', label: '定期报表', href: '/reports' },
  { id: 'risk-alert', label: '风险预警', href: '/risk-alert' },
  { id: 'data-source', label: '数据源管理', href: '/data-source' },
  { id: 'user-permission', label: '用户管理', href: '/user-permission' },
  { id: 'profile', label: '个人信息', href: '/profile' },
  { id: 'system-settings', label: '系统设置', href: '/system-settings' },
];

export function Header() {
  const pathname = usePathname();
  const currentItem = menuItems.find(item => pathname.startsWith(item.href));

  return (
    <header className="h-[80px] px-8 flex items-center justify-between z-40 bg-transparent">
      {/* Dynamic Page Title - HUD Style */}
      <div className="flex flex-col">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-emerald-500 to-orange-400 dark:from-white dark:via-[#C8FDE6] dark:to-[#F4D5BD] drop-shadow-sm dark:drop-shadow-[0_0_10px_rgba(200,253,230,0.5)] font-mono uppercase">
            {currentItem?.label || 'DASHBOARD'}
          </h1>
          <div className="px-2 py-0.5 rounded-full bg-[#C8FDE6]/20 border border-[#C8FDE6]/30 text-[10px] text-emerald-700 dark:text-[#C8FDE6] font-mono tracking-widest">
            SYS.ONLINE
          </div>
        </div>
        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tracking-[0.2em] mt-1 pl-1">
          // ABYSSAL COMMAND DECK // V.2.0.4
        </div>
      </div>


      <div className="flex items-center gap-6">
        {/* Search Input - Cyberpunk Style */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#C8FDE6] to-[#F4D5BD] rounded-lg blur opacity-10 dark:opacity-20 group-hover:opacity-30 dark:group-hover:opacity-40 transition-opacity duration-300" />
          <input
            type="text"
            placeholder="SEARCH_DATA..."
            className="relative w-[240px] px-4 py-2 text-sm bg-white/80 dark:bg-[#0a101f]/80 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-[#C8FDE6]/50 focus:bg-white dark:focus:bg-[#0f172a] text-slate-800 dark:text-[#C8FDE6] placeholder-slate-400 dark:placeholder-slate-600 transition-all font-mono tracking-wide"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
           <button className="relative p-2.5 rounded-lg hover:bg-[#C8FDE6]/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-[#C8FDE6] transition-all duration-300 group border border-transparent hover:border-[#C8FDE6]/30">
            <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_8px_red] animate-pulse" />
            <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}