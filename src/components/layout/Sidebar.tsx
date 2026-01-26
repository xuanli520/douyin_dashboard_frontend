'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Home, BarChart3, Settings, FileText, AlertTriangle, Calendar, Database, User, LogOut, ChevronUp } from 'lucide-react';
import { logout } from '@/lib/auth';
import profileImage from '@/assets/male.jpg';

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
    <div className="w-[80px] hover:w-[240px] transition-all duration-300 ease-cubic-bezier(0.4, 0, 0.2, 1) h-[calc(100vh-32px)] my-4 ml-4 rounded-2xl bg-white/80 dark:bg-[#0a101f]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 flex flex-col z-50 shadow-sm dark:shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] group overflow-hidden">
      {/* Decorative Glow - Only in dark mode or subtle in light */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C8FDE6]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <nav className="flex-1 py-6 flex flex-col gap-2 overflow-y-auto scrollbar-none">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`relative px-4 py-3 mx-3 rounded-xl flex items-center gap-4 transition-all duration-300 group/item overflow-hidden ${
                isActive
                  ? 'bg-gradient-to-r from-[#C8FDE6]/30 to-[#F4D5BD]/30 text-slate-900 dark:text-[#C8FDE6] shadow-sm dark:shadow-[0_0_20px_rgba(200,253,230,0.15)] border border-[#C8FDE6]/40'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-[#C8FDE6] hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              {isActive && (
                <div className="absolute inset-y-0 left-0 w-1 bg-[#C8FDE6] rounded-full shadow-[0_0_10px_#C8FDE6]" />
              )}
              <Icon size={20} className={`flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-md dark:drop-shadow-[0_0_8px_rgba(200,253,230,0.5)]' : 'group-hover/item:scale-110'}`} />
              <span className={`whitespace-nowrap font-medium tracking-wide transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${isActive ? 'text-slate-900 dark:text-[#C8FDE6]' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* 用户信息区域 */}
      <div className="relative border-t border-slate-200 dark:border-white/5 p-3" ref={menuRef}>
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className={`w-full p-2 rounded-xl flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-300 ${showUserMenu ? 'bg-slate-100 dark:bg-white/5' : ''}`}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-slate-200 dark:ring-white/10 group-hover:ring-[#C8FDE6]/50 transition-all shadow-md">
            <Image
              src={profileImage}
              alt="用户头像"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 text-left overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="text-sm font-bold text-slate-700 dark:text-gray-200 truncate font-mono">COMMANDER</div>
            <div className="text-[10px] text-slate-500 dark:text-[#C8FDE6]/70 truncate tracking-wider">ONLINE</div>
          </div>
          <ChevronUp
            size={16}
            className={`text-slate-400 dark:text-gray-500 transition-transform flex-shrink-0 opacity-0 group-hover:opacity-100 ${showUserMenu ? 'rotate-180 text-slate-700 dark:text-[#C8FDE6]' : ''}`}
          />
        </button>

        {/* 用户菜单弹窗 */}
        {showUserMenu && (
          <div className="absolute bottom-full left-0 w-[220px] mb-2 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-xl shadow-lg dark:shadow-[0_0_30px_-5px_rgba(0,0,0,0.8)] border border-slate-200 dark:border-white/10 overflow-hidden z-50">
            <button
              onClick={() => {
                setShowUserMenu(false);
                router.push('/profile');
              }}
              className="w-full px-4 py-3 flex items-center gap-3 text-sm text-slate-600 dark:text-gray-300 hover:bg-[#C8FDE6]/10 hover:text-slate-900 dark:hover:text-[#C8FDE6] transition-colors border-b border-slate-100 dark:border-white/5"
            >
              <User size={16} />
              <span>个人信息</span>
            </button>
            <button
              onClick={() => {
                setShowUserMenu(false);
                router.push('/system-settings');
              }}
              className="w-full px-4 py-3 flex items-center gap-3 text-sm text-slate-600 dark:text-gray-300 hover:bg-[#C8FDE6]/10 hover:text-slate-900 dark:hover:text-[#C8FDE6] transition-colors border-b border-slate-100 dark:border-white/5"
            >
              <Settings size={16} />
              <span>系统设置</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 flex items-center gap-3 text-sm text-red-500 dark:text-red-400 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-300 transition-colors"
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
