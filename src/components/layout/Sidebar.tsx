'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart3, Settings, FileText, AlertTriangle, Calendar, Database } from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: '首页', icon: Home, href: '/dashboard' },
  { id: 'data-analysis', label: '数据分析', icon: BarChart3, href: '/data-analysis' },
  { id: 'task-schedule', label: '任务调度', icon: Calendar, href: '/task-schedule' },
  { id: 'reports', label: '定期报表', icon: FileText, href: '/reports' },
  { id: 'risk-alert', label: '风险预警', icon: AlertTriangle, href: '/risk-alert' },
  { id: 'data-source', label: '数据源管理', icon: Database, href: '/data-source' },
  { id: 'user-permission', label: '系统设置', icon: Settings, href: '/user-permission' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-[134px] bg-[#1a2332] text-white flex flex-col h-full">
      <div className="p-6 flex items-center gap-2">
        <div className="w-6 h-6 bg-blue-500 rounded" />
      </div>
      
      <nav className="flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          // Simple active check: if pathname starts with the href
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`w-full px-4 py-3 flex items-center gap-3 text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-[#252f3f]'
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
