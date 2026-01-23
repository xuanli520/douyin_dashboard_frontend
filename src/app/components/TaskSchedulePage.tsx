'use client';

import { useState } from 'react';
import { Play, Edit, Copy, X } from 'lucide-react';

const tasks = [
  { 
    id: 1,
    name: '任务调度管理',
    lastStatus: '成功',
    lastRun: '2023-17-03 18:00:38',
    duration: '04ms'
  },
  { 
    id: 2,
    name: '任务调度管理',
    lastStatus: '成功',
    lastRun: '2023-17-03 14:03:39',
    duration: '96ms'
  },
  { 
    id: 3,
    name: '任务调度管理',
    lastStatus: '失败',
    lastRun: '2023-17-03 14:50:37',
    duration: '03ms'
  },
  { 
    id: 4,
    name: '任务调度管理',
    lastStatus: '成功',
    lastRun: '2023-17-03 14:50:30',
    duration: '03ms'
  },
  { 
    id: 5,
    name: '任务调度管理',
    lastStatus: '失败',
    lastRun: '2023-17-08 14:50:39',
    duration: '03ms'
  },
  { 
    id: 6,
    name: '任务调度管理',
    lastStatus: '成功',
    lastRun: '2023-17-03 14:50:37',
    duration: '03ms'
  },
];

const logContent = `1 terminal execution logs
[2022-01-13 12:26:38:02] Application log.tim
ts holesa
[2022-01-13 12:26:38:02] Application from oa
ion:trusted: Startruning successfully
[2022-01-13 12:38:35:03] Application log/ons
tex.log[2770].Sdnetthwin-enstmave applicatio
on [minitates] Enstraying successfully
[2022-01-12 12:38:18:02] Application log/ons
tex.log[2378].Cnbeumeened: Varieables logs we
re successful.
[2022-01-12 12:38:38:02] Application log/ons
tex.log[2970].Gneumeened: Varieables logs wor
nd successful.
[2022-01-12 12:38:35:03] Application log/ons
tex.log[2778].Gneumeened: varieables logs wor
ed successful.
[2022-01-12 12:38:56:01] Application log/ons
tex.log[2378].Gneuweened: varieables logs wer
d successful.`;

export default function TaskSchedulePage() {
  const [showLog, setShowLog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const handleViewLog = (task: any) => {
    setSelectedTask(task);
    setShowLog(true);
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">后台任务管理</h1>
          <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
            + 添加任务
          </button>
        </div>

        {/* 任务表格 */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">任务名称</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">上次运行状态</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">下次运行时间</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">持续时间</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{task.name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded text-sm ${
                      task.lastStatus === '成功' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {task.lastStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{task.lastRun}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{task.duration}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleViewLog(task)}
                        className="text-blue-600 hover:text-blue-700"
                        title="查看日志"
                      >
                        <Play size={16} />
                      </button>
                      <button className="text-blue-600 hover:text-blue-700" title="编辑">
                        <Edit size={16} />
                      </button>
                      <button className="text-blue-600 hover:text-blue-700" title="复制">
                        <Copy size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 执行日志侧边栏 */}
      {showLog && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-end">
          <div className="w-[600px] bg-white h-full shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">执行日志</h2>
              <button 
                onClick={() => setShowLog(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-auto">
              <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-xs leading-relaxed whitespace-pre-wrap">
                {logContent}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
