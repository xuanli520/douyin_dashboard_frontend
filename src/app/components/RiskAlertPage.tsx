import { AlertTriangle } from 'lucide-react';

const alerts = [
  { 
    id: 1, 
    level: 'P0', 
    title: 'GMV 跌幅超过 20%', 
    time: '2021-11-24 09:07',
    duration: '1秒',
    status: '待处理',
    color: 'red'
  },
  { 
    id: 2, 
    level: 'P1', 
    title: '服务器负载过高', 
    time: '2021-11-24 09:07',
    duration: '1秒',
    status: '处理中',
    color: 'orange'
  },
  { 
    id: 3, 
    level: 'P1', 
    title: '服务器负载过高', 
    time: '2021-11-24 09:07',
    duration: '1秒',
    status: '待处理',
    color: 'orange'
  },
  { 
    id: 4, 
    level: 'P1', 
    title: '服务器负载过高', 
    time: '2021-11-24 09:07',
    duration: '1秒',
    status: '待处理',
    color: 'orange'
  },
  { 
    id: 5, 
    level: 'P1', 
    title: '服务器负载过高', 
    time: '2021-11-24 09:07',
    duration: '1秒',
    status: '处理中',
    color: 'orange'
  },
  { 
    id: 6, 
    level: 'P1', 
    title: 'GMV 跌幅超过 20%', 
    time: '2021-11-24 09:07',
    duration: '1秒',
    status: '已解决',
    color: 'orange'
  },
  { 
    id: 7, 
    level: 'P1', 
    title: '服务器负载过高', 
    time: '2021-11-24 09:07',
    duration: '1秒',
    status: '已解决',
    color: 'orange'
  },
];

export default function RiskAlertPage() {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h1 className="text-xl font-semibold text-gray-900 mb-6">风险预警中心</h1>

          <div className="grid grid-cols-12 gap-6">
            {/* 预警等级侧边栏 */}
            <div className="col-span-2 space-y-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="text-4xl font-bold text-red-600 mb-1">P0</div>
                <div className="text-sm text-gray-700">P0 严重预警</div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="text-4xl font-bold text-orange-600 mb-1">P1</div>
                <div className="text-sm text-gray-700">P1 重要预警</div>
              </div>
            </div>

            {/* 预警列表 */}
            <div className="col-span-10">
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className={`w-1 h-16 rounded-full ${
                      alert.color === 'red' ? 'bg-red-500' : 'bg-orange-500'
                    }`} />

                    <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-4">
                        <div className="font-medium text-gray-900 mb-1">{alert.title}</div>
                        <div className="text-xs text-gray-500">
                          发生时间：{alert.time} &nbsp; 时长：{alert.duration}
                        </div>
                      </div>

                      <div className="col-span-2">
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm ${
                          alert.status === '待处理' ? 'bg-yellow-100 text-yellow-700' :
                          alert.status === '处理中' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {alert.status}
                        </span>
                      </div>

                      <div className="col-span-6 flex items-center justify-end gap-2">
                        <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                          指派
                        </button>
                        {alert.status === '已解决' ? (
                          <>
                            <button className="px-4 py-2 text-gray-700 border border-gray-300 text-sm rounded hover:bg-gray-50">
                              忽略
                            </button>
                            <button className="px-4 py-2 text-gray-700 border border-gray-300 text-sm rounded hover:bg-gray-50">
                              标记解决
                            </button>
                          </>
                        ) : alert.status === '处理中' ? (
                          <>
                            <button className="px-4 py-2 text-gray-700 border border-gray-300 text-sm rounded hover:bg-gray-50">
                              忽略
                            </button>
                            <button className="px-4 py-2 text-gray-700 border border-gray-300 text-sm rounded hover:bg-gray-50">
                              标记解决
                            </button>
                          </>
                        ) : (
                          <button className="px-4 py-2 text-gray-700 border border-gray-300 text-sm rounded hover:bg-gray-50">
                            忽略
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
