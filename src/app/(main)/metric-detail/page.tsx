'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Info, TrendingUp, AlertCircle,
  Package, Truck, MessageCircle, AlertTriangle,
  ChevronRight, Calculator
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- 模拟数据 (基于你的截图) ---
const CHART_DATA = Array.from({ length: 30 }, (_, i) => ({
  date: `2026-01-${i + 1}`,
  value: 4.8 + Math.random() * 0.2
}));

const METRICS_DATA = {
  product: {
    id: 'product',
    label: '商品体验',
    icon: Package,
    score: 100,
    color: 'text-blue-500',
    subMetrics: [
      {
        id: 'p1',
        title: '商品综合评分',
        score: 100,
        weight: '90%',
        value: '4.8702',
        unit: '分',
        desc: '近30天物流签收订单的消费者评价加权平均分',
        thresholds: [
          { label: '<4.568', score: 0, pos: '0%' },
          { label: '≥4.568', score: 50, pos: '25%' },
          { label: '≥4.640', score: 70, pos: '50%' },
          { label: '≥4.791', score: 100, pos: '100%' }
        ],
        calculation: {
          formula: '加权总分 / 有效评价订单数',
          numerator: { label: '5★x5 + 4★x4 + ... + 1★x1', value: '750分' },
          denominator: { label: '总评价订单数', value: '154单' }
        }
      },
      {
        id: 'p2',
        title: '商品品质退货率',
        score: 100,
        weight: '10%',
        value: '0.195%',
        unit: '',
        desc: '因商品品质原因产生的退货/售后订单占比',
        thresholds: [
          { label: '>1.31%', score: 50, pos: '0%' },
          { label: '≤1.31%', score: 60, pos: '33%' },
          { label: '≤0.26%', score: 100, pos: '100%' }
        ],
        calculation: {
          formula: '品质退货订单数 / 签收订单数',
          numerator: { label: '近30天品质原因退货数', value: '6' },
          denominator: { label: '近30天签收订单量', value: '3067' }
        }
      }
    ]
  },
  logistics: {
    id: 'logistics',
    label: '物流体验',
    icon: Truck,
    score: 100,
    color: 'text-orange-500',
    subMetrics: [
      {
        id: 'l1',
        title: '揽收时效达成率',
        score: 100,
        weight: '15%',
        value: '100.000%',
        unit: '',
        thresholds: [
          { label: '<59.55%', score: 50, pos: '0%' },
          { label: '≥75.80%', score: 70, pos: '50%' },
          { label: '≥96.84%', score: 100, pos: '100%' }
        ],
        calculation: {
          formula: '及时揽收订单 / 应揽收订单',
          numerator: { label: '近30天达成揽收要求订单', value: '3196' },
          denominator: { label: '近30天应揽收订单数', value: '3196' }
        }
      },
      {
        id: 'l2',
        title: '运单配送时效达成率',
        score: 100,
        weight: '70%',
        value: '95.790%',
        unit: '',
        thresholds: [
          { label: '<79.33%', score: 50, pos: '0%' },
          { label: '≥86.56%', score: 70, pos: '50%' },
          { label: '≥93.34%', score: 100, pos: '100%' }
        ],
        calculation: {
          formula: '及时配送运单 / 应考核运单',
          numerator: { label: '近30天达成配送时效运单', value: '2889' },
          denominator: { label: '近30天应达成配送要求运单', value: '3016' }
        }
      },
      {
        id: 'l3',
        title: '发货物流品退率',
        score: 100,
        weight: '15%',
        value: '0.0237%',
        unit: '',
        thresholds: [
          { label: '>0.334%', score: 50, pos: '0%' },
          { label: '≤0.180%', score: 70, pos: '50%' },
          { label: '≤0.026%', score: 100, pos: '100%' }
        ],
        calculation: {
          formula: '物流原因售后数 / 支付订单数',
          numerator: { label: '近30天物流原因售后订单', value: '1' },
          denominator: { label: '近30天支付订单数', value: '4212' }
        }
      }
    ]
  },
  service: {
    id: 'service',
    label: '服务体验',
    icon: MessageCircle,
    score: 100,
    color: 'text-purple-500',
    subMetrics: [
      {
        id: 's1',
        title: '飞鸽平均响应时长',
        score: 100,
        weight: '70%',
        value: '10.615',
        unit: '秒',
        thresholds: [
          { label: '>180s', score: 50, pos: '0%' },
          { label: '≤120s', score: 70, pos: '50%' },
          { label: '≤15s', score: 100, pos: '100%' }
        ],
        calculation: {
          formula: '总响应时长 / 总对话轮次',
          numerator: { label: '近30天总响应时长之和', value: '106823' },
          denominator: { label: '近30天人工咨询对话轮次', value: '10063' }
        }
      },
      {
        id: 's2',
        title: '售后处理时长达成率',
        score: 100,
        weight: '30%',
        value: '95.597%',
        unit: '',
        thresholds: [
          { label: '<79.71%', score: 50, pos: '0%' },
          { label: '≥85.49%', score: 70, pos: '50%' },
          { label: '≥89.04%', score: 100, pos: '100%' }
        ],
        calculation: {
          formula: '及时处理售后单 / 总售后单',
          numerator: { label: '近30天达成处理时长单数', value: '1563' },
          denominator: { label: '近30天退款成功售后单数', value: '1635' }
        }
      }
    ]
  },
  risk: {
    id: 'risk',
    label: '差行为/违规',
    icon: AlertTriangle,
    score: 0, // 这里的逻辑是扣分制，这里展示扣分总分
    color: 'text-red-500',
    isDeduction: true,
    subMetrics: [
      {
        id: 'r1',
        title: '虚假交易刷体验分扣分',
        score: 0,
        value: '0分',
        unit: '',
        thresholds: [
          { label: '不扣分', score: 0, pos: '0%' },
          { label: '-15分', score: -15, pos: '100%' }
        ],
        calculation: null, // 差行为没有复杂的分子分母，通常是计数
        customContent: '近30天未发现虚假交易行为'
      },
      {
        id: 'r2',
        title: '影响消费者体验扣分',
        score: 0,
        value: '0分',
        unit: '',
        thresholds: [
          { label: '不扣分', score: 0, pos: '0%' },
          { label: '-15分', score: -15, pos: '100%' }
        ],
        calculation: null,
        customContent: '近30天未发现影响消费者体验的违规行为'
      }
    ]
  }
};

// --- 通用样式包装器 (复用你主页面的风格) ---
const GlassPanel = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`
    glass-panel relative overflow-hidden transition-all duration-300
    bg-white/40 dark:bg-[#0f172a]/20 backdrop-blur-xl
    border border-white/20 dark:border-white/5 shadow-sm
    rounded-2xl ${className}
  `}>
    {children}
  </div>
);

// --- 阈值进度条组件 (还原截图中的 Step Bar) ---
const ThresholdBar = ({ thresholds, currentValue }: { thresholds: any[], currentValue: string }) => {
  return (
    <div className="w-full mt-8 mb-6 relative px-2">
      {/* 轴线 */}
      <div className="h-0.5 bg-slate-200 dark:bg-slate-700 w-full relative flex items-center justify-between">
        {/* 渲染节点 */}
        {thresholds.map((t, idx) => (
          <div key={idx} className="relative group">
             {/* 刻度点 */}
            <div className="w-0.5 h-2 bg-slate-300 dark:bg-slate-600 absolute -top-1 left-1/2 -translate-x-1/2" />

            {/* 上方分数 */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-slate-400 whitespace-nowrap">
               {t.score !== undefined ? `${Math.abs(t.score)}分` : ''}
            </div>

            {/* 下方阈值文案 */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 whitespace-nowrap">
              {t.label}
            </div>
          </div>
        ))}

        {/* 模拟当前值的位置指示器 (蓝色高亮区域) */}
        <div className="absolute right-0 top-0 h-0.5 bg-blue-500 w-1/4 shadow-[0_0_10px_theme(colors.blue.500)]">
           <div className="absolute right-0 -top-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full
shadow-sm z-10" />
           <div className="absolute right-0 -top-8 text-blue-600 font-bold text-xs whitespace-nowrap">
              当前得分 100分
           </div>
        </div>
      </div>
    </div>
  );
};

// --- 核心子指标卡片组件 ---
const MetricDetailCard = ({ metric, isDeduction = false }: { metric: any, isDeduction?: boolean }) => {
  return (
    <GlassPanel className="p-6 mb-6">
      {/* 1. 标题头 */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
               <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center
text-xs font-bold">
                 {metric.id.slice(-1)}
               </span>
               {metric.title}
            </h3>
            {metric.weight && (
              <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded border
border-slate-200 dark:border-slate-700">
                权重 {metric.weight}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 pl-8">{metric.desc}</p>
        </div>

        <div className="text-right">
          <div className={`text-2xl font-bold ${isDeduction ? 'text-red-500' : 'text-blue-600'}`}>
            {metric.score}<span className="text-sm font-normal text-slate-500">分</span>
          </div>
          {metric.weight && (
            <div className="text-xs text-slate-400">
               {isDeduction ? '无差行为' : '较前1日持平'}
            </div>
          )}
        </div>
      </div>

      {/* 2. 区间刻度条 (模拟图 1, 2, 3 的进度条) */}
      <div className="bg-slate-50/50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-100
dark:border-slate-800 mb-6">
         <div className="flex items-center gap-2 mb-4">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs
font-bold">1</span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              根据「{metric.title}」对应得分
            </span>
         </div>
         <ThresholdBar thresholds={metric.thresholds} currentValue={metric.value} />
      </div>

      {/* 3. 计算方法区 (模拟图中的计算公式) */}
      <div className="bg-slate-50/50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-100
dark:border-slate-800 mb-6">
         <div className="flex items-center gap-2 mb-4">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs
font-bold">2</span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              「{metric.title}」计算方法
            </span>
         </div>

         {metric.calculation ? (
           <div className="flex items-center justify-between gap-4 md:gap-8 overflow-x-auto pb-2">
              {/* 当前值 */}
              <div className="min-w-[120px]">
                 <div className="text-xs text-slate-400 mb-1">{metric.title}</div>
                 <div className="text-2xl font-bold text-slate-800 dark:text-white">
                   {metric.value}
                 </div>
              </div>

              {/* 等号 */}
              <div className="text-slate-300 text-xl font-light">=</div>

              {/* 分子 */}
              <div className="flex-1 min-w-[200px]">
                 <div className="text-xs text-slate-400 mb-1">{metric.calculation.numerator.label}</div>
                 <div className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                   {metric.calculation.numerator.value}
                 </div>
              </div>

              {/* 除号 */}
              <div className="text-slate-300 text-xl font-light">÷</div>

              {/* 分母 */}
              <div className="flex-1 min-w-[160px]">
                 <div className="text-xs text-slate-400 mb-1">{metric.calculation.denominator.label}</div>
                 <div className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                   {metric.calculation.denominator.value}
                 </div>
              </div>
           </div>
         ) : (
           <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              {metric.customContent || "暂无详细计算公式"}
           </div>
         )}
      </div>

      {/* 4. 分析诊断 (趋势图) */}
      <div>
        <div className="flex items-center justify-between mb-4">
           <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">近30日指标趋势</h4>
           <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-7 text-xs">单天口径</Button>
              <Button variant="outline" size="sm" className="h-7 text-xs bg-blue-50 text-blue-600
border-blue-200">30天口径</Button>
           </div>
        </div>
        <div className="h-[200px] w-full">
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={CHART_DATA}>
               <defs>
                 <linearGradient id={`gradient-${metric.id}`} x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                   <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                 </linearGradient>
               </defs>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
               <XAxis dataKey="date" hide />
               <YAxis hide domain={['dataMin - 0.1', 'dataMax + 0.1']} />
               <Tooltip
                 contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                 itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                 formatter={(value: any) => [value.toFixed(4), metric.title]}
               />
               <Area
                 type="monotone"
                 dataKey="value"
                 stroke="#3b82f6"
                 strokeWidth={2}
                 fill={`url(#gradient-${metric.id})`}
               />
             </AreaChart>
           </ResponsiveContainer>
        </div>
      </div>
    </GlassPanel>
  );
};

function MetricDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 从 URL 获取当前激活的 Tab，默认为 'product'
  // URL 示例: /details?type=logistics
  const typeParam = searchParams.get('type') as keyof typeof METRICS_DATA;
  const initialTab = (typeParam && METRICS_DATA[typeParam]) ? typeParam : 'product';

  const [activeTab, setActiveTab] = useState<keyof typeof METRICS_DATA>(initialTab);

  useEffect(() => {
    if (typeParam && METRICS_DATA[typeParam]) {
      setActiveTab(typeParam);
    }
  }, [typeParam]);

  const handleTabChange = (key: keyof typeof METRICS_DATA) => {
    setActiveTab(key);
    // 更新 URL 且不刷新页面，方便分享
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('type', key);
    router.replace(`?${newParams.toString()}`);
  };

  const currentData = METRICS_DATA[activeTab];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 font-sans">

      {/* 顶部导航 */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-white/50">
           <ArrowLeft size={20} />
        </Button>
        <div>
           <h1 className="text-2xl font-bold text-slate-800 dark:text-white">体验详情分析</h1>
           <p className="text-xs text-slate-500">最后更新时间：2026/02/07 11:00:36 <span className="bg-blue-100
text-blue-600 px-1 rounded ml-2">今日已更新</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* 左侧导航栏 - 大指标切换 */}
        <div className="md:col-span-3 lg:col-span-2 space-y-3">
          {Object.entries(METRICS_DATA).map(([key, data]) => {
            const isActive = activeTab === key;
            const Icon = data.icon;

            return (
              <div
                key={key}
                onClick={() => handleTabChange(key as any)}
                className={`
                   cursor-pointer p-4 rounded-xl transition-all duration-200 border
                   flex items-center justify-between group
                   ${isActive
                     ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-900 shadow-md ring-1 ring-blue-500/20'
                     : 'bg-white/40 dark:bg-slate-900/40 border-transparent hover:bg-white hover:shadow-sm'
                   }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500 group-hover:bg-white'}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className={`font-semibold ${isActive ? 'text-slate-800 dark:text-white' :
'text-slate-500'}`}>
                      {data.label}
                    </div>
                    <div className={`text-xs ${isActive ? data.color : 'text-slate-400'}`}>
                       得分 {data.score}
                    </div>
                  </div>
                </div>
                {isActive && <ChevronRight size={16} className="text-blue-500" />}
              </div>
            );
          })}
        </div>

        {/* 右侧内容区域 - 具体子指标详情 */}
        <div className="md:col-span-9 lg:col-span-10">
           {/* 大指标概览卡片 */}
           <GlassPanel className="p-6 mb-6 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center
justify-center border-4 border-blue-100 dark:border-blue-900/30">
                      <span className={`text-2xl font-bold ${currentData.color}`}>{currentData.score}</span>
                   </div>
                   <div>
                     <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">
                       {currentData.label}综合得分
                     </h2>
                     <p className="text-sm text-slate-500 flex items-center gap-2">
                       较前1日 <span className="text-slate-400">持平</span>
                     </p>
                   </div>
                </div>
                {/* 可以在这里放一些大指标级别的总趋势图或摘要 */}
              </div>
           </GlassPanel>

           {/* 循环渲染子指标 */}
           <div className="space-y-6">
             {currentData.subMetrics.map((subMetric) => (
               <MetricDetailCard
                  key={subMetric.id}
                  metric={subMetric}
                  isDeduction={currentData.isDeduction}
               />
             ))}
           </div>

           {/* 底部占位 */}
           <div className="h-20 text-center text-slate-400 text-sm pt-8">
              到底了，没有更多数据
           </div>
        </div>
      </div>
    </div>
  );
}

export default function MetricDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>}>
      <MetricDetailContent />
    </Suspense>
  );
}