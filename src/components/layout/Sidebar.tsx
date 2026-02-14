'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Home, BarChart3, Settings, FileText, AlertTriangle, Calendar, Database, User, LogOut, ChevronUp, ChevronDown, Users, Shield, Key, Workflow, Activity } from 'lucide-react';
import profileImage from '@/assets/male.jpg';
import femaleProfileImage from '@/assets/female.jpg';
import { useUserStore } from '@/stores/userStore';
import { usePermissionStore } from '@/stores/permissionStore';
import { can, canAny } from '@/lib/rbac';
import { ROUTES } from '@/config/routes';

interface MenuItem {
  id: string;
  label: string;
  icon?: any;
  href?: string;
  perm?: string;
  subItems?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { id: 'compass', label: '罗盘', icon: Home, href: ROUTES.COMPASS },
  { id: 'data-analysis', label: '数据分析', icon: BarChart3, href: ROUTES.DATA_ANALYSIS },
  { id: 'task-schedule', label: '任务调度', icon: Calendar, href: ROUTES.TASK_SCHEDULE },
  { id: 'reports', label: '定期报表', icon: FileText, href: ROUTES.REPORTS },
  { id: 'risk-alert', label: '风险预警', icon: AlertTriangle, href: ROUTES.RISK_ALERT },
  { id: 'data-source', label: '数据源管理', icon: Database, href: ROUTES.DATA_SOURCE },
  { id: 'scraping-rule', label: '采集规则', icon: Workflow, href: ROUTES.SCRAPING_RULE },
  // 系统管理
  {
    id: 'system-management',
    label: '系统管理',
    icon: Settings,
    subItems: [
      { id: 'admin-users', label: '用户管理', icon: Users, href: ROUTES.ADMIN_USERS, perm: 'user:read' },
      { id: 'admin-roles', label: '角色管理', icon: Shield, href: ROUTES.ADMIN_ROLES, perm: 'role:read' },
      { id: 'admin-permissions', label: '权限管理', icon: Key, href: ROUTES.ADMIN_PERMISSIONS, perm: 'permission:read' },
      { id: 'admin-login-audit', label: '登录审计', icon: Activity, href: ROUTES.ADMIN_LOGIN_AUDIT, perm: 'system:logs' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['system-management']);
  const [isInitialized, setIsInitialized] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { currentUser, logout, isLoading } = useUserStore();
  const { isSuperuser, userPermissions, isLoading: permissionLoading } = usePermissionStore();

  // 等待权限加载完成
  useEffect(() => {
    if (!permissionLoading) {
      setIsInitialized(true);
    }
  }, [permissionLoading]);


  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  // 点击外部关闭菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 鼠标移出侧边栏时收起子菜单（但保持在子菜单内时不收起）
  useEffect(() => {
    function handleMouseLeave(event: MouseEvent) {
      const relatedTarget = event.relatedTarget as Node | null;
      if (relatedTarget && sidebarRef.current?.contains(relatedTarget)) {
        return;
      }
      setExpandedMenus([]);
    }
    const sidebar = sidebarRef.current;
    if (sidebar) {
      sidebar.addEventListener('mouseleave', handleMouseLeave);
    }
    return () => {
      if (sidebar) {
        sidebar.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  const [logoutError, setLogoutError] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      setLogoutError(null);
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setLogoutError('退出失败，请重试');
    }
  };

  // 获取用户角色显示文本
  const getRoleText = () => {
    if (isSuperuser) return 'ADMIN';
    if (currentUser?.username) return currentUser.username.toUpperCase();
    return 'USER';
  };

  // 权限加载中时显示 loading
  if (permissionLoading) {
    return (
      <div ref={sidebarRef} className="w-[80px] h-[calc(100vh-32px)] my-4 ml-4 rounded-2xl bg-white/80 dark:bg-[#0a101f]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center z-50">
        <div className="w-8 h-8 border-2 border-slate-300 dark:border-slate-600 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div ref={sidebarRef} className="w-[80px] hover:w-[240px] transition-all duration-300 ease-cubic-bezier(0.4, 0, 0.2, 1) h-[calc(100vh-32px)] my-4 ml-4 rounded-2xl bg-white/80 dark:bg-[#0a101f]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 flex flex-col z-50 shadow-sm dark:shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] group overflow-hidden">
      {/* Decorative Glow - Only in dark mode or subtle in light */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C8FDE6]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <nav className="flex-1 py-6 flex flex-col gap-2 overflow-y-auto scrollbar-none">
        {menuItems.filter(item => {
          if (!item.perm) return true;
          return can({ is_superuser: isSuperuser, permissions: userPermissions }, item.perm);
        }).map((item) => {
          if (item.subItems) {
            // 系统管理菜单：超级管理员显示所有，普通用户检查是否有任一子菜单权限
            const subItemPerms = item.subItems.map(sub => sub.perm).filter((p): p is string => !!p);

            // 如果不是超级管理员，且没有任何子菜单权限，则不显示该菜单
            if (!isSuperuser && !canAny({ is_superuser: isSuperuser, permissions: userPermissions }, subItemPerms)) {
              return null;
            }

            const isExpanded = expandedMenus.includes(item.id);
            const Icon = item.icon;
            const isAnyActive = item.subItems.some(subItem => subItem.href && pathname.startsWith(subItem.href));

            return (
              <div key={item.id} className="flex flex-col">
                <button
                  onClick={() => toggleMenu(item.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`${item.id}-submenu`}
                  className={`relative px-4 py-3 mx-3 rounded-xl flex items-center gap-4 transition-all duration-300 group/item overflow-hidden ${
                    isAnyActive
                      ? 'bg-gradient-to-r from-[#C8FDE6]/30 to-[#F4D5BD]/30 text-slate-900 dark:text-[#C8FDE6] shadow-sm dark:shadow-[0_0_20px_rgba(200,253,230,0.15)] border border-[#C8FDE6]/40'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-[#C8FDE6] hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  {isAnyActive && (
                    <div className="absolute inset-y-0 left-0 w-1 bg-[#C8FDE6] rounded-full shadow-[0_0_10px_#C8FDE6]" />
                  )}
                  <Icon size={20} className={`flex-shrink-0 transition-transform duration-300 ${isAnyActive ? 'scale-110 drop-shadow-md dark:drop-shadow-[0_0_8px_rgba(200,253,230,0.5)]' : 'group-hover/item:scale-110'}`} />
                  <span className={`whitespace-nowrap font-medium tracking-wide transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${isAnyActive ? 'text-slate-900 dark:text-[#C8FDE6]' : ''}`}>
                    {item.label}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`flex-shrink-0 transition-transform duration-300 opacity-0 group-hover:opacity-100 ml-auto ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>
                {isExpanded && (
                  <div id={`${item.id}-submenu`} className="flex flex-col gap-1 mt-1 px-3">
                    {item.subItems.filter(subItem => {
                      if (!subItem.perm) return true;
                      return can({ is_superuser: isSuperuser, permissions: userPermissions }, subItem.perm);
                    }).map(subItem => {
                      const SubIcon = subItem.icon;
                      const isActive = subItem.href ? pathname.startsWith(subItem.href) : false;
                      return (
                        <Link
                          key={subItem.id}
                          href={subItem.href || '#'}
                          className={`relative px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 group/subitem ${
                            isActive
                              ? 'bg-gradient-to-r from-[#C8FDE6]/20 to-[#F4D5BD]/20 text-slate-900 dark:text-[#C8FDE6] shadow-sm'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-[#C8FDE6] hover:bg-slate-100 dark:hover:bg-white/5'
                          }`}
                        >
                          {isActive && (
                            <div className="absolute inset-y-0 left-0 w-1 bg-[#C8FDE6] rounded-full shadow-[0_0_10px_#C8FDE6]" />
                          )}
                          <SubIcon size={20} className={`flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-105 drop-shadow-[0_0_8px_rgba(200,253,230,0.5)]' : 'group-hover/subitem:scale-105'}`} />
                          <span className={`whitespace-nowrap font-medium tracking-wide transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${isActive ? 'text-slate-900 dark:text-[#C8FDE6]' : ''}`}>
                            {subItem.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const Icon = item.icon;
          const isActive = item.href ? pathname.startsWith(item.href) : false;
          return (
            <Link
              key={item.id}
              href={item.href || '#'}
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
      <div className="relative border-t border-slate-200 dark:border-white/5 p-3" ref={userMenuRef}>
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          aria-expanded={showUserMenu}
          aria-controls="user-menu"
          className={`w-full p-2 rounded-xl flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-300 ${showUserMenu ? 'bg-slate-100 dark:bg-white/5' : ''}`}
        >
          {isLoading ? (
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-white/5 ring-2 ring-slate-200 dark:ring-white/10">
              <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 border-t-cyan-500 rounded-full animate-spin" />
            </div>
          ) : (
            <div className={`w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-slate-200 dark:ring-white/10 transition-all shadow-md ${
              currentUser?.gender === 'female'
                ? 'group-hover:ring-pink-400/50 shadow-pink-400/20'
                : 'group-hover:ring-[#C8FDE6]/50'
            }`}>
              <Image
                src={currentUser?.gender === 'female' ? femaleProfileImage : profileImage}
                alt="用户头像"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 text-left overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="text-sm font-bold text-slate-700 dark:text-gray-200 truncate font-mono">
              {isLoading ? '加载中...' : getRoleText()}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-[#C8FDE6]/70 truncate tracking-wider">
              {isLoading ? '请稍候' : (isSuperuser ? 'SUPERUSER' : 'ONLINE')}
            </div>
          </div>
          <ChevronUp
            size={16}
            className={`text-slate-400 dark:text-gray-500 transition-transform flex-shrink-0 opacity-0 group-hover:opacity-100 ${showUserMenu ? 'rotate-180 text-slate-700 dark:text-[#C8FDE6]' : ''}`}
          />
        </button>

        {/* 用户菜单弹窗 */}
        {showUserMenu && !isLoading && (
          <div id="user-menu" className="absolute bottom-full left-0 w-[220px] mb-2 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-xl shadow-lg dark:shadow-[0_0_30px_-5px_rgba(0,0,0,0.8)] border border-slate-200 dark:border-white/10 overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5">
              <div className="text-sm font-medium text-slate-700 dark:text-gray-200">
                {currentUser?.username || '未知用户'}
              </div>
              <div className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                {currentUser?.email || '无邮箱'}
              </div>
            </div>
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
            {logoutError && (
              <div className="px-4 py-2 text-xs text-red-500 dark:text-red-400 bg-red-500/10">
                {logoutError}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
