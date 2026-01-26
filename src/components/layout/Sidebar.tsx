'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Home, BarChart3, Settings, FileText, AlertTriangle, Calendar, Database, User, LogOut, ChevronUp } from 'lucide-react';
import { logout } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import maleAvatar from '@/assets/male.jpg';

const menuItems = [
  { id: 'dashboard', label: '首页', icon: Home, href: '/dashboard' },
  { id: 'data-analysis', label: '数据分析', icon: BarChart3, href: '/data-analysis' },
  { id: 'task-schedule', label: '任务调度', icon: Calendar, href: '/task-schedule' },
  { id: 'reports', label: '定期报表', icon: FileText, href: '/reports' },
  { id: 'risk-alert', label: '风险预警', icon: AlertTriangle, href: '/risk-alert' },
  { id: 'data-source', label: '数据源管理', icon: Database, href: '/data-source' },
  { id: 'user-permission', label: '用户管理', icon: Settings, href: '/user-permission' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="w-[180px] bg-[#1a2332] text-white flex flex-col h-full">
      {/* Logo 区域 - 已移除蓝色圆角矩形 */}

      <nav className="flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
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

      {/* 用户信息区域 */}
      <div className="relative border-t border-[#2d3748]" ref={menuRef}>
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#252f3f] transition-colors"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-700">
            <Image
              src={maleAvatar}
              alt="用户头像"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 text-left overflow-hidden">
            <div className="text-sm font-medium truncate">管理员</div>
            <div className="text-xs text-gray-400 truncate">admin@example.com</div>
          </div>
          <ChevronUp
            size={16}
            className={`text-gray-400 transition-transform flex-shrink-0 ${showUserMenu ? 'rotate-180' : ''}`}
          />
        </button>

        {/* 用户菜单弹窗 */}
        {showUserMenu && (
          <div className="absolute bottom-full left-0 right-0 mb-1 mx-2 bg-[#2d3748] rounded-lg shadow-xl border border-gray-700 overflow-hidden">
            <button
              onClick={() => {
                setShowUserMenu(false);
                // 跳转到用户信息页面
                router.push('/user-permission');
              }}
              className="w-full px-4 py-3 flex items-center gap-3 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
            >
              <User size={16} />
              <span>个人信息</span>
            </button>
            <button
              onClick={() => {
                setShowUserMenu(false);
                router.push('/user-permission');
              }}
              className="w-full px-4 py-3 flex items-center gap-3 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
            >
              <Settings size={16} />
              <span>系统设置</span>
            </button>
            <div className="border-t border-gray-700 my-1" />
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 flex items-center gap-3 text-sm text-red-400 hover:bg-gray-700 transition-colors"
            >
              <LogOut size={16} />
              <span>退出登录</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
