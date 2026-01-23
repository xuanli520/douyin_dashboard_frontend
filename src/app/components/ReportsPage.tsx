import { FileText, MoreVertical } from 'lucide-react';

const reports = [
  { id: 1, name: '2023年10月销售月报', date: '2023-11-01 10:00', type: 'pdf', icon: '📄' },
  { id: 2, name: '2023年Q3运营周报', date: '2023-11-01 10:00', type: 'excel', icon: '📊' },
  { id: 3, name: '2023年10月销售月报', date: '2023-11-01 10:00', type: 'pdf', icon: '📄' },
  { id: 4, name: '2023年Q3运营周报', date: '2023-11-01 10:00', type: 'excel', icon: '📊' },
];

const downloadFiles = [
  { name: '2023年10月销售月报 - Exc...', size: '36.9 MB', status: '生成中' },
  { name: '2023年Q3运营周报 - 2023...', size: '38.9 MB', status: '已完成' },
  { name: '2023年10月销售月报 - Exc...', size: '32.8 MB', status: '已完成' },
  { name: '2023年10月销售月报 - Exc...', size: '36.0 MB', status: '已完成' },
  { name: '2023年Q3运营周报 - 2023...', size: '3.92 MB', status: '已过期' },
];

export default function ReportsPage() {
  return (
    <div className="p-6">
      {/* 标签页 */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-8">
          <button className="pb-3 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
            定期报表
          </button>
          <button className="pb-3 text-sm font-medium text-gray-600 hover:text-gray-900">
            自定义导出
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 报表卡片区域 */}
        <div className="col-span-2">
          <div className="grid grid-cols-2 gap-4">
            {reports.map((report) => (
              <div key={report.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-20 mb-4 flex items-center justify-center">
                    {report.type === 'pdf' ? (
                      <div className="w-14 h-18 bg-blue-500 rounded flex items-center justify-center text-white text-2xl">
                        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                          <path d="M14 2v6h6"/>
                        </svg>
                      </div>
                    ) : (
                      <div className="w-14 h-18 bg-green-600 rounded flex items-center justify-center text-white text-2xl">
                        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                          <path d="M14 2v6h6"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-sm font-medium text-gray-900 mb-2">{report.name}</h3>
                  <p className="text-xs text-gray-500 mb-4">生成时间：{report.date}</p>
                  
                  <button className="px-6 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                    下载
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 文件下载中心 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">文件下载中心</h2>
          </div>

          <div className="divide-y divide-gray-100">
            <div className="px-4 py-3 bg-gray-50 grid grid-cols-3 gap-4 text-xs font-medium text-gray-700">
              <div>文件名</div>
              <div>大小</div>
              <div>状态</div>
            </div>

            {downloadFiles.map((file, index) => (
              <div key={index} className="px-4 py-3 grid grid-cols-3 gap-4 text-sm hover:bg-gray-50">
                <div className="text-gray-900 truncate">{file.name}</div>
                <div className="text-gray-700">{file.size}</div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${
                    file.status === '生成中' ? 'text-yellow-600' :
                    file.status === '已完成' ? 'text-green-600' :
                    'text-gray-500'
                  }`}>
                    {file.status}
                  </span>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreVertical size={16} className="text-gray-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
