import { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';

const dataSources = [
  {
    id: 1,
    name: '抖音广告API',
    type: 'API',
    frequency: '实时',
    lastUpdate: '2024-05-20 10:30',
    status: 'normal'
  },
  {
    id: 2,
    name: 'MySQL数据库',
    type: '数据库',
    frequency: '每日',
    lastUpdate: '2024-05-19 23:00',
    status: 'error'
  },
];

export default function DataSourcePage() {
  const [searchText, setSearchText] = useState('');

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm">
        {/* 搜索和筛选栏 */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="搜索"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10 pr-4 py-2 w-[300px] border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>

            <select className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">
              <option>类型</option>
              <option>API</option>
              <option>数据库</option>
            </select>

            <select className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">
              <option>类型</option>
            </select>

            <select className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">
              <option>状态</option>
              <option>正常</option>
              <option>异常</option>
            </select>

            <select className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">
              <option>状态</option>
            </select>
          </div>

          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            添加数据源
          </button>
        </div>

        {/* 数据表格 */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">数据源名称</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">类型</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">频率</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">最后更新</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">状态</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody>
              {dataSources.map((source) => (
                <tr key={source.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{source.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{source.type}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{source.frequency}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{source.lastUpdate}</td>
                  <td className="px-6 py-4">
                    {source.status === 'normal' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                        正常
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 text-sm rounded-full">
                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                        异常
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button className="text-sm text-blue-600 hover:text-blue-700">编辑</button>
                      <button className="text-sm text-red-600 hover:text-red-700">删除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-center gap-2">
          <span className="text-sm text-gray-600 mr-4">1 页 一 页</span>
          <button className="p-2 hover:bg-gray-100 rounded disabled:opacity-50" disabled>
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded min-w-[32px]">1</button>
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
