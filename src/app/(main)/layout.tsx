/**
 * 主布局 - 支持企业主题和赛博朋克彩蛋主题
 * 根据主题显示不同的背景效果
 */

'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useThemeStore } from '@/stores/themeStore';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isEnterprise, isCyberpunk, isLoading } = useThemeStore();

  // 等待主题加载完成，避免水合不匹配
  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#f8fafc] text-[#0f172a] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#e0f2fe]/30 via-[#f8fafc] to-[#f0f9ff] z-0 pointer-events-none" />
        <div className="relative z-10 flex h-full">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          <Header />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // 企业主题布局 - 简洁专业风格
  if (isEnterprise()) {
    return (
      <div className="flex h-screen bg-[#f8fafc] text-[#0f172a] relative overflow-hidden">
        {/* 企业主题背景 - 简洁淡蓝渐变 */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#e0f2fe]/30 via-[#f8fafc] to-[#f0f9ff] z-0 pointer-events-none" />

        {/* 侧边栏 */}
        <div className="relative z-10 flex h-full">
          <Sidebar />
        </div>

        {/* 主内容区 */}
        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          {/* 顶部导航栏 */}
          <Header />

          {/* 页面内容 */}
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // 赛博朋克主题布局 - 科技感霓虹风格
  return (
    <div className="flex h-screen bg-background text-foreground relative overflow-hidden">
      {/* 赛博朋克背景 - 霓虹光效 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#C8FDE6]/30 via-background to-background dark:from-[#1a2c4e] dark:via-[#02040a] dark:to-[#02040a] opacity-60 dark:opacity-40 z-0 pointer-events-none" />

      {/* 侧边栏 */}
      <div className="relative z-10 flex h-full">
        <Sidebar />
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* 背景光效 */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-30 dark:opacity-40 overflow-hidden">
           <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary blur-[120px] opacity-20 animate-pulse"></div>
           <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-secondary blur-[150px] opacity-20"></div>
        </div>

        {/* 顶部导航栏 */}
        <Header />

        {/* 页面内容 */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
