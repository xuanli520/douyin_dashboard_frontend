'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';

const salesData = [
  { month: '1月', value1: 100, value2: 150, value3: 200 },
  { month: '2月', value1: 200, value2: 180, value3: 220 },
  { month: '3月', value1: 180, value2: 250, value3: 280 },
  { month: '4月', value1: 280, value2: 200, value3: 300 },
  { month: '5月', value1: 350, value2: 280, value3: 320 },
  { month: '6月', value1: 420, value2: 350, value3: 380 },
  { month: '7月', value1: 280, value2: 280, value3: 300 },
  { month: '8月', value1: 250, value2: 320, value3: 280 },
  { month: '9月', value1: 320, value2: 280, value3: 300 },
  { month: '10月', value1: 350, value2: 300, value3: 320 },
  { month: '11月', value1: 380, value2: 350, value3: 360 },
  { month: '12月', value1: 450, value2: 400, value3: 420 },
];

const channelData = [
  { name: '线上', value: 50, color: '#3b82f6' },
  { name: '线下', value: 25, color: '#06b6d4' },
  { name: '合作', value: 25, color: '#10b981' },
];

const alerts = [
  { title: '服务器负载过高', time: '下调了时上前' },
  { title: '库存预警', time: '下调临时事前' },
  { title: '服务器负载过高', time: '1周比能早前' },
];

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* 关键指标卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600 mb-2">总销售额</div>
          <div className="text-3xl font-bold text-gray-900 mb-3">¥1,245,000</div>
          <div className="h-12">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData.slice(-7)}>
                <Line type="monotone" dataKey="value1" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600 mb-2">订单量</div>
          <div className="text-3xl font-bold text-gray-900 mb-3">8,500</div>
          <div className="h-12">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData.slice(-7)}>
                <Line type="monotone" dataKey="value2" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600 mb-2">活跃用户</div>
          <div className="text-3xl font-bold text-gray-900 mb-3">12,300</div>
          <div className="h-12">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData.slice(-7)}>
                <Line type="monotone" dataKey="value3" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600 mb-2">转化率</div>
          <div className="text-3xl font-bold text-gray-900 mb-3">4.5%</div>
          <div className="h-12">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData.slice(-7)}>
                <Line type="monotone" dataKey="value1" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 销售趋势 */}
        <div className="col-span-2 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">销售趋势</h2>
            <div className="flex gap-2">
              <select className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">
                <option>每月销售</option>
                <option>今日销售</option>
              </select>
              <select className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">
                <option>今日日期</option>
              </select>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#999" fontSize={12} />
              <YAxis stroke="#999" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="value1" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="value2" stroke="#06b6d4" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="value3" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 渠道分布 */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">渠道分布</h2>
          
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={channelData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {channelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-6 space-y-2">
            {channelData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-700">{item.name}</span>
                </div>
                <span className="text-gray-900 font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 最近警报 */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">最近警报</h2>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-700">{alert.title}</span>
                <span className="text-sm text-gray-500">{alert.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 任务状态 */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">任务状态</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700">数据同步</span>
                <span className="text-gray-900 font-medium">100%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: '100%' }} />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700">报表生成</span>
                <span className="text-gray-900 font-medium">80%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: '80%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700">数据同步</span>
                <span className="text-gray-900 font-medium">50%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: '50%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
