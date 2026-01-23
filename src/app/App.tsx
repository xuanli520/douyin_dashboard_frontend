import { useState } from 'react';
import { Home, BarChart3, Settings, FileText, AlertTriangle, Calendar, Database } from 'lucide-react';
import LoginPage from '@/app/components/LoginPage';
import DashboardPage from '@/app/components/DashboardPage';
import DataAnalysisPage from '@/app/components/DataAnalysisPage';
import DataSourcePage from '@/app/components/DataSourcePage';
import UserPermissionPage from '@/app/components/UserPermissionPage';
import ReportsPage from '@/app/components/ReportsPage';
import RiskAlertPage from '@/app/components/RiskAlertPage';
import TaskSchedulePage from '@/app/components/TaskSchedulePage';

type PageType = 'login' | 'dashboard' | 'dataAnalysis' | 'dataSource' | 'userPermission' | 'reports' | 'riskAlert' | 'taskSchedule';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const menuItems = [
    { id: 'dashboard', label: '首页', icon: Home },
    { id: 'dataAnalysis', label: '数据分析', icon: BarChart3 },
    { id: 'taskSchedule', label: '任务调度', icon: Calendar },
    { id: 'reports', label: '定期报表', icon: FileText },
    { id: 'riskAlert', label: '风险预警', icon: AlertTriangle },
    { id: 'dataSource', label: '数据源管理', icon: Database },
    { id: 'userPermission', label: '系统设置', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 侧边栏 */}
      <div className="w-[134px] bg-[#1a2332] text-white flex flex-col">
        <div className="p-6 flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500 rounded" />
        </div>
        
        <nav className="flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id as PageType)}
                className={`w-full px-4 py-3 flex items-center gap-3 text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-[#252f3f]'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部导航栏 */}
        <header className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>首页</span>
            {currentPage !== 'dashboard' && (
              <>
                <span>/</span>
                <span className="text-gray-900">
                  {menuItems.find(item => item.id === currentPage)?.label}
                </span>
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
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                管
              </div>
              <span className="text-sm text-gray-700">管理员</span>
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 overflow-auto">
          {currentPage === 'dashboard' && <DashboardPage />}
          {currentPage === 'dataAnalysis' && <DataAnalysisPage />}
          {currentPage === 'dataSource' && <DataSourcePage />}
          {currentPage === 'userPermission' && <UserPermissionPage />}
          {currentPage === 'reports' && <ReportsPage />}
          {currentPage === 'riskAlert' && <RiskAlertPage />}
          {currentPage === 'taskSchedule' && <TaskSchedulePage />}
        </main>
      </div>
    </div>
  );
}
