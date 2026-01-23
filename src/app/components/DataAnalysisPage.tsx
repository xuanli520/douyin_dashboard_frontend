import { useState } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { X, ChevronDown, Calendar, Search } from 'lucide-react';

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
    category: '商品类目',
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
    category: '商品类目',
    sales: '¥8,500',
    salesRate: '23.82%',
    profitRate: '6.50%',
    moveRate: '50.83%',
    productUser: '¥1,245.00',
    count: '¥1,175.00'
  },
];

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
    <div className="p-6 space-y-4">
      {/* 筛选区域 */}
      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded">
            <Calendar size={16} className="text-gray-500" />
            <span className="text-sm">DateRange...</span>
            <span className="text-sm text-gray-600">2022-07-28</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">店铺</span>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded">
              <span className="text-sm">店铺1</span>
              <X size={14} className="text-gray-500 cursor-pointer" />
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded">
              <span className="text-sm">店铺2</span>
              <X size={14} className="text-gray-500 cursor-pointer" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">
              多选... <ChevronDown size={14} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">商品类目</span>
            <span className="text-sm text-gray-700">商品类目</span>
            <span className="text-sm text-gray-700">商品类目</span>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">
              课戴证录 <ChevronDown size={14} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {filters.categories.map((category) => (
            <div key={category} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded">
              <span className="text-sm">{category}</span>
              <button onClick={() => removeFilter('categories', category)}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 图表区域 */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">互性剃须刀毛利率</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded" />
              <span className="text-sm text-gray-700">销售额</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded" />
              <span className="text-sm text-gray-700">毛利率</span>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#999" fontSize={12} />
            <YAxis yAxisId="left" stroke="#999" fontSize={12} />
            <YAxis yAxisId="right" orientation="right" stroke="#999" fontSize={12} />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-3 shadow-lg rounded border border-gray-200 text-sm">
                      <div className="font-medium mb-1">2022-05-18</div>
                      <div className="text-gray-700">销售额: ¥{payload[0].value?.toLocaleString()}</div>
                      <div className="text-gray-700">毛利率: {payload[1].value}%</div>
                      <div className="text-gray-700">商品类目: 12.93%</div>
                      <div className="text-gray-700">毛利率: 17.45%</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar yAxisId="left" dataKey="sales" fill="#3b82f6" barSize={30} />
            <Bar yAxisId="left" dataKey="profit" fill="#10b981" barSize={30} />
            <Line yAxisId="right" type="monotone" dataKey="profitRate" stroke="#3b82f6" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>

        <div className="flex justify-between items-center mt-6">
          <div className="flex gap-3">
            <button className="px-4 py-1.5 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50">
              线
            </button>
            <button className="px-4 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
              柱
            </button>
            <button className="px-4 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
              表
            </button>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
            导出 Excel
          </button>
        </div>
      </div>

      {/* 数据表格 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">日期</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">店铺</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">商品类目</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">销售额</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">毛利率</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">毛利率</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">移动拉率</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">商品用户</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">数值</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{row.date}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{row.store}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{row.category}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{row.sales}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{row.salesRate}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{row.profitRate}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{row.moveRate}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{row.productUser}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded">1</button>
          <button className="p-2 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
