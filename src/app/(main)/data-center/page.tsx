'use client';

import React, { useState } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { MetricsGrid, SummaryBar } from '@/components/data-center/MetricsGrid';
import { ChartsSection } from '@/components/data-center/ChartsSection';

// Mock Data
const MOCK_UPDATE_TIME = '2023-07-05 18:19:00';
type TimeFilter = 'today' | 'week' | 'month';

const TIME_FILTERS: Array<{ id: TimeFilter; label: string }> = [
  { id: 'today', label: '今日' },
  { id: 'week', label: '本周' },
  { id: 'month', label: '本月' },
];

export default function DataCenterPage() {
  const { appTheme } = useThemeStore();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  
  // Theme styling helpers
  const isEnterprise = appTheme === 'enterprise';
  const pageBg = isEnterprise ? 'bg-[#f0f9ff]/50 dark:bg-[#0b1220]/60' : 'bg-white/60 dark:bg-transparent';
  const textColor = isEnterprise ? 'text-[#1e3a5a] dark:text-slate-100' : 'text-slate-900 dark:text-[#C8FDE6]';
  const iconColor = isEnterprise ? 'text-[#0284c7] dark:text-[#38bdf8]' : 'text-[#0284c7] dark:text-[#C8FDE6]';
  const secondaryTextColor = isEnterprise ? 'text-slate-500 dark:text-slate-400' : 'text-slate-600 dark:text-slate-400';
  const filterShellClass = isEnterprise
    ? 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/80'
    : 'border-slate-200 bg-white/80 dark:border-white/10 dark:bg-slate-900/70';
  const filterDividerClass = isEnterprise ? 'border-slate-200 dark:border-slate-700' : 'border-slate-200 dark:border-white/10';

  return (
    <div className={`flex h-full flex-col gap-6 ${pageBg}`}>
      {/* 1. Page Header (Top Action Bar) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <LayoutDashboard className={`w-8 h-8 ${iconColor}`} />
          <h1 className={`text-2xl font-bold ${textColor}`}>数据中控台</h1>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          {/* Time Filter */}
          <div className="flex items-center gap-2">
            <span className={`text-sm ${secondaryTextColor}`}>时间筛选:</span>
            <div className={`flex overflow-hidden rounded-md border ${filterShellClass}`}>
              {TIME_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setTimeFilter(filter.id)}
                  className={`px-4 py-1.5 text-sm transition-colors ${
                    timeFilter === filter.id
                      ? (isEnterprise ? 'bg-[#0284c7]/10 text-[#0284c7] dark:bg-[#0ea5e9]/20 dark:text-[#38bdf8] font-medium' : 'bg-[#0284c7]/10 text-[#0284c7] dark:bg-[#C8FDE6]/20 dark:text-[#C8FDE6]')
                      : (isEnterprise ? 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5')
                  } ${filter.id !== 'today' ? `border-l ${filterDividerClass}` : ''}`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Update Time */}
          <div className={`ml-4 flex items-center gap-1.5 text-sm ${secondaryTextColor}`}>
            {isEnterprise ? (
              <>
                <span className="text-lg">↻</span>
                <span>数据更新时间: {MOCK_UPDATE_TIME}</span>
              </>
            ) : (
              <>
                <span>数据更新时间: {MOCK_UPDATE_TIME}</span>
                <span className="text-[#C8FDE6] text-lg ml-1">↻</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Core Metrics Grid */}
      <MetricsGrid />

      {/* 3. Summary Bar */}
      <SummaryBar />

      {/* 4. Charts Section */}
      <ChartsSection />
    </div>
  );
}
