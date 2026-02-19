/**
 * Header组件 - 支持企业主题和赛博朋克彩蛋主题
 * Logo点击5次触发彩蛋主题切换
 */

'use client';

import { usePathname } from 'next/navigation';
import { Bell, Search } from 'lucide-react';
import Image from 'next/image';
import { ROUTES } from '@/config/routes';
import { useThemeStore } from '@/stores/themeStore';
import { useEasterEgg } from '@/hooks/useEasterEgg';
import logoImage from '@/assets/logo.png';

const menuItems = [
  { id: 'compass', label: '罗盘', href: ROUTES.COMPASS },
  { id: 'dashboard', label: '店铺详情', href: ROUTES.DASHBOARD },
  { id: 'metric-detail', label: '体验详情', href: ROUTES.METRIC_DETAIL },
  { id: 'data-analysis', label: '数据分析', href: ROUTES.DATA_ANALYSIS },
  { id: 'task-schedule', label: '任务调度', href: ROUTES.TASK_SCHEDULE },
  { id: 'reports', label: '定期报表', href: ROUTES.REPORTS },
  { id: 'risk-alert', label: '风险预警', href: ROUTES.RISK_ALERT },
  { id: 'data-source', label: '数据源管理', href: ROUTES.DATA_SOURCE },
  { id: 'scraping-rule', label: '采集规则', href: ROUTES.SCRAPING_RULE },
  { id: 'user-permission', label: '用户管理', href: ROUTES.USER_PERMISSION },
  { id: 'login-audit', label: '登录审计', href: ROUTES.ADMIN_LOGIN_AUDIT },
  { id: 'role-management', label: '角色管理', href: ROUTES.ADMIN_ROLES },
  { id: 'permission-management', label: '权限管理', href: ROUTES.ADMIN_PERMISSIONS },
  { id: 'profile', label: '个人信息', href: ROUTES.PROFILE },
  { id: 'system-settings', label: '系统设置', href: ROUTES.SYSTEM_SETTINGS },
];

export function Header() {
  const pathname = usePathname();
  const currentItem = menuItems.find(item => pathname.startsWith(item.href));
  const { appTheme, isHydrated } = useThemeStore();
  const { handleLogoClick, isTriggered } = useEasterEgg();

  // 等待主题加载完成，避免水合不匹配
  if (!isHydrated) {
    return (
      <header className="h-[80px] px-8 flex items-center justify-between z-40 bg-transparent">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-3 py-2">
            <Image
              src={logoImage}
              alt="智服云声"
              width={40}
              height={40}
              className="rounded-md"
            />
            <div className="flex flex-col items-start">
              <span className="text-lg font-bold text-[#1e3a5a]">智服云声数据看板</span>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200 mx-2" />
          <h1 className="text-xl font-semibold text-[#1e3a5a]">
            {currentItem?.label || '用户管理'}
          </h1>
        </div>
      </header>
    );
  }

  // 企业主题样式
  if (appTheme === 'enterprise') {
    return (
      <header className="header-enterprise h-[80px] px-8 flex items-center justify-between z-40 bg-transparent">
        {/* Logo and Page Title */}
        <div className="flex items-center gap-4">
          {/* Logo - 点击触发彩蛋 */}
          <button 
            onClick={handleLogoClick}
            className={`relative flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 hover:bg-slate-100 dark:hover:bg-white/10 ${
              isTriggered ? 'scale-95' : ''
            }`}
            title="点击Logo 5次切换主题"
          >
            <Image 
              src={logoImage} 
              alt="智服云声" 
              width={40} 
              height={40} 
              className="rounded-md"
            />
            <div className="flex flex-col items-start">
              <span className="enterprise-brand-title text-lg font-bold text-[#1e3a5a] dark:text-slate-100">智服云声数据看板</span>
            </div>
          </button>
          
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700/80 mx-2" />
          
          <h1 className="page-title text-xl font-semibold text-[#1e3a5a] dark:text-slate-100">
            {currentItem?.label || '用户管理'}
          </h1>
        </div>

        {/* Right Section - Search and Actions */}
        <div className="flex items-center gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input
              type="text"
              placeholder="搜索..."
              className="w-[240px] pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] text-slate-700 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          {/* Notification Button */}
          <button 
            className="relative p-2.5 rounded-md text-slate-500 dark:text-slate-300 hover:text-[#0ea5e9] dark:hover:text-[#38bdf8] hover:bg-slate-100 dark:hover:bg-white/10 transition-all duration-200"
            title="通知"
          >
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full" />
            <Bell size={20} />
          </button>
        </div>
      </header>
    );
  }

  // 赛博朋克主题样式
  return (
    <header className="header-cyberpunk h-[80px] px-8 flex items-center justify-between z-40 bg-transparent">
      {/* Page Title - Cyberpunk HUD Style */}
      <div className="flex flex-col">
        <div className="flex items-center gap-3">
          <h1 className="page-title text-2xl font-bold tracking-wider font-mono uppercase">
            {currentItem?.label || '用户管理'}
          </h1>
          <div className="sys-online-tag px-2 py-0.5 rounded-full text-[10px] font-mono tracking-widest">
            <span className="sys-online-text">SYS.ONLINE</span>
          </div>

          {/* Logo - Cyberpunk Easter Egg Trigger (MOVED HERE) */}
          {/* 移除了 absolute 定位，放入了 flex 流中，位于 SYS.ONLINE 旁边 */}
          <button 
            onClick={handleLogoClick}
            className={`flex items-center justify-center p-1 ml-2 rounded hover:bg-white/10 transition-all duration-300 ${
              isTriggered ? 'scale-95' : ''
            }`}
            title="点击Logo 5次切换主题"
          >
            <Image 
              src={logoImage} 
              alt="智服云声" 
              width={24}  // 稍微调小一点以适应单行高度
              height={24} 
              className="rounded opacity-80 hover:opacity-100 transition-opacity"
            />
          </button>
        </div>
        
        {/* English Text - Won't be covered now */}
        <div className="text-[10px] text-slate-500 font-mono tracking-[0.2em] mt-1 pl-1">
          // ABYSSAL COMMAND DECK // V.2.0.4
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        {/* Search Input - Cyberpunk Style */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#C8FDE6] to-[#F4D5BD] rounded-lg blur opacity-10 dark:opacity-20 group-hover:opacity-30 dark:group-hover:opacity-40 transition-opacity duration-300" />
          <input
            type="text"
            placeholder="搜索数据..."
            className="relative w-[240px] px-4 py-2 text-sm bg-white/80 dark:bg-[#0a101f]/80 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-[#C8FDE6]/50 focus:bg-white dark:focus:bg-[#0f172a] text-slate-800 dark:text-[#C8FDE6] placeholder-slate-400 dark:placeholder-slate-600 transition-all font-mono tracking-wide"
          />
        </div>

        {/* Notification Button */}
        <div className="flex items-center gap-2">
           <button 
            className="relative p-2.5 rounded-lg hover:bg-[#C8FDE6]/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-[#C8FDE6] transition-all duration-300 group border border-transparent hover:border-[#C8FDE6]/30"
            title="通知"
          >
            <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_8px_red] animate-pulse" />
            <Bell className="w-5 h-5 transition-transform group-hover:scale-110" />
          </button>
        </div>
      </div>
    </header>
  );
}
