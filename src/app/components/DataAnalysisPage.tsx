'use client';

import { useState } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { X, ChevronDown, Calendar, Filter, BarChart2 } from 'lucide-react';
import { GlassCard } from '@/app/components/ui/glass-card';
import { NeonTitle } from '@/app/components/ui/neon-title';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableFooter,
} from '@/app/components/ui/table';

const chartData = [
  { month: '1月', sales: 220, profit: 150, profitRate: 35 },
  { month: '2月', sales: 280, profit: 180, profitRate: 32 },
  { month: '3月', sales: 290, profit: 200, profitRate: 34 },
  { month: '4月', sales: 280, profit: 190, profitRate: 38 },
  { month: '5月', sales: 450, profit: 280, profitRate: 40 },
  { month: '6月', sales: 490, profit: 300, profitRate: 38 },
  { month: '7月', sales: 350, profit: 200, profitRate: 35 },
  { month: '8月', sales: 380, profit: 220, profitRate: 37 },
  { month: '9月', sales: 420, profit: 240, profitRate: 36 },
  { month: '10月', sales: 380, profit: 210, profitRate: 33 },
  { month: '11月', sales: 240, profit: 180, profitRate: 32 },
  { month: '12月', sales: 400, profit: 220, profitRate: 38 },
];

const tableData = [
  {
    date: '2022-03-04',
    store: '店铺总计数店',
    category: '美妆护肤',
    sales: '¥1,900',
    salesRate: '23.82%',
    profitRate: '7.50%',
    moveRate: '56.83%',
    productUser: '¥1,300.00',
    count: '¥1,175.00'
  },
  {
    date: '2023-03-18',
    store: '店铺总计数店',
    category: '数码3C',
    sales: '¥8,500',
    salesRate: '23.82%',
    profitRate: '6.50%',
    moveRate: '50.83%',
    productUser: '¥1,245.00',
    count: '¥1,175.00'
  },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-[#050714]/90 border border-slate-200 dark:border-cyan-500/30 p-3 rounded-lg backdrop-blur-md shadow-lg dark:shadow-[0_0_20px_rgba(6,182,212,0.15)]">
        <p className="text-slate-900 dark:text-cyan-50 font-mono text-xs mb-1 border-b border-slate-200 dark:border-white/10 pb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs py-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-600 dark:text-slate-300">{entry.name === 'sales' ? '销售额' : entry.name === 'profit' ? '毛利' : '毛利率'}:</span>
            <span className="font-bold font-mono" style={{ color: entry.color }}>
              {entry.name === 'profitRate' ? `${entry.value}%` : `¥${entry.value}`}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DataAnalysisPage() {
  const [filters, setFilters] = useState({
    stores: ['店铺1', '店铺2'],
    categories: ['销售额', '毛利率'],
  });

  const removeFilter = (type: 'stores' | 'categories', value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item !== value)
    }));
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground p-6 space-y-6 relative overflow-hidden">
       {/* Background Ambience */}
      <div className="fixed top-20 right-[-10%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none" />
      
      {/* 筛选区域 */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Date Picker */}
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-slate-200 dark:border-white/10 rounded-full hover:bg-white/10 transition-colors group">
            <Calendar size={14} className="text-cyan-400" />
            <span className="text-xs font-mono text-slate-700 dark:text-cyan-100">2022-07-28</span>
            <ChevronDown size={14} className="text-slate-500 group-hover:text-cyan-400" />
          </div>

          {/* Label: Stores */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider">店铺</span>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-cyan-950/30 border border-slate-200 dark:border-cyan-500/20 rounded-full">
              <span className="text-xs text-slate-700 dark:text-cyan-300">店铺1</span>
              <X size={12} className="text-slate-400 dark:text-cyan-500/50 hover:text-slate-600 dark:hover:text-cyan-400 cursor-pointer" />
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-cyan-950/30 border border-slate-200 dark:border-cyan-500/20 rounded-full">
              <span className="text-xs text-slate-700 dark:text-cyan-300">店铺2</span>
              <X size={12} className="text-slate-400 dark:text-cyan-500/50 hover:text-slate-600 dark:hover:text-cyan-400 cursor-pointer" />
            </div>
             <button className="p-1.5 bg-white/5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5">
                <ChevronDown size={12} className="text-slate-500 dark:text-slate-400" />
            </button>
          </div>

           {/* Label: Categories */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider">指标</span>
            {filters.categories.map((category) => (
              <div key={category} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/20 rounded-full">
                <span className="text-xs text-indigo-700 dark:text-indigo-300">{category}</span>
                <button onClick={() => removeFilter('categories', category)}>
                  <X size={12} className="text-indigo-400 dark:text-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400" />
                </button>
              </div>
            ))}
             <button className="flex items-center gap-2 px-3 py-1.5 text-xs border border-dashed border-slate-400 dark:border-slate-600 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-600 dark:hover:border-slate-400 transition-colors">
              + 添加指标
            </button>
          </div>
        </div>
      </GlassCard>

      {/* 图表区域 */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-8">
          <NeonTitle icon={BarChart2}>核心指标趋势</NeonTitle>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">销售额</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">毛利</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">毛利率</span>
            </div>
             <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10 mx-2"/>
             <button className="px-3 py-1 text-[10px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/50 rounded hover:bg-cyan-500/20 transition-all shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                导出报表
            </button>
          </div>
        </div>

        <div className="w-full h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis 
                dataKey="month" 
                stroke="#475569"
                tick={{fill: '#64748b', fontSize: 10, fontFamily: 'monospace'}}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                yAxisId="left" 
                stroke="#475569" 
                tick={{fill: '#64748b', fontSize: 10, fontFamily: 'monospace'}}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                stroke="#475569" 
                tick={{fill: '#64748b', fontSize: 10, fontFamily: 'monospace'}}
                axisLine={false}
                tickLine={false}
                unit="%"
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                yAxisId="left" 
                dataKey="sales" 
                fill="#22d3ee" 
                barSize={20} 
                radius={[4, 4, 0, 0]}
                style={{ filter: 'drop-shadow(0px 0px 4px rgba(34, 211, 238, 0.3))' }}
              />
              <Bar 
                yAxisId="left" 
                dataKey="profit" 
                fill="#6366f1" 
                barSize={20} 
                radius={[4, 4, 0, 0]}
                style={{ filter: 'drop-shadow(0px 0px 4px rgba(99, 102, 241, 0.3))' }}
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="profitRate" 
                stroke="#34d399" 
                strokeWidth={2}
                dot={{r: 4, fill: '#050714', stroke: '#34d399', strokeWidth: 2}}
                activeDot={{r: 6, fill: '#34d399', stroke: '#fff'}}
                style={{ filter: 'drop-shadow(0px 0px 4px rgba(52, 211, 153, 0.5))' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* 数据表格 */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {['日期', '店铺', '商品类目', '销售额', '销售占比', '毛利率', '动销率', '客单价', '复购金额'].map((header) => (
                <TableHead key={header}>
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row, index) => (
              <TableRow key={index} className="relative">
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.store}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs border border-slate-300 dark:border-slate-700">
                      {row.category}
                  </span>
                </TableCell>
                <TableCell className="font-bold text-cyan-600 dark:text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]">
                  {row.sales}
                </TableCell>
                <TableCell>{row.salesRate}</TableCell>
                <TableCell className="text-emerald-600 dark:text-emerald-400">{row.profitRate}</TableCell>
                <TableCell>{row.moveRate}</TableCell>
                <TableCell>{row.productUser}</TableCell>
                <TableCell>{row.count}</TableCell>
                
                {/* Hover Scan Effect Line */}
                 <TableCell className="absolute inset-0 border-y border-transparent pointer-events-none group-hover:border-cyan-500/20 group-hover:shadow-[inset_0_0_20px_rgba(34,211,238,0.05)] transition-all duration-300 p-0" aria-hidden="true" />
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
             <TableRow>
                <TableCell colSpan={9}>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-mono">Showing 1 to 2 of 2 entries</span>
                        <div className="flex gap-2">
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-30">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <button className="px-3 py-1 bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/50 rounded-lg text-xs font-mono shadow-[0_0_10px_rgba(34,211,238,0.2)]">1</button>
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    </div>
                </TableCell>
             </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}