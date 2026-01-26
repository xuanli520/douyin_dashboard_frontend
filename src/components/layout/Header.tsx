'use client';

import { usePathname } from 'next/navigation';

const menuItems = [
  { id: 'dashboard', label: '首页', href: '/dashboard' },
  { id: 'data-analysis', label: '数据分析', href: '/data-analysis' },
  { id: 'task-schedule', label: '任务调度', href: '/task-schedule' },
  { id: 'reports', label: '定期报表', href: '/reports' },
  { id: 'risk-alert', label: '风险预警', href: '/risk-alert' },
  { id: 'data-source', label: '数据源管理', href: '/data-source' },
  { id: 'user-permission', label: '系统设置', href: '/user-permission' },
];

export function Header() {
  const pathname = usePathname();
  const currentItem = menuItems.find(item => pathname.startsWith(item.href));

  return (
    <header className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>首页</span>
        {currentItem && currentItem.id !== 'dashboard' && (
          <>
            <span>/</span>
            <span className="text-gray-900">{currentItem.label}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="搜索"
            className="w-[200px] px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        </div>
        <button className="relative p-2 hover:bg-gray-100 rounded">
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
      </div>
    </header>
  );
}
