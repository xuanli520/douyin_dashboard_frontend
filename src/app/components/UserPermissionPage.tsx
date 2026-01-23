'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';

const users = [
  { id: 1, name: '张三', email: 'reav@', role: '管理员', status: '已激活' },
  { id: 2, name: '张三', email: 'john@', role: '运营', status: '已激活' },
  { id: 3, name: '张三', email: 'mian@', role: '分析师', status: '已激活' },
  { id: 4, name: '张四', email: 'mang@', role: '分析师', status: '已激活' },
  { id: 5, name: '张五', email: 'imaim@', role: '运营', status: '已激活' },
  { id: 6, name: '张九', email: 'mieh@', role: '运营', status: '已激活' },
  { id: 7, name: '张三', email: 'jostnrao@gmail.com', role: '管理员', status: '-' },
];

export default function UserPermissionPage() {
  const [searchText, setSearchText] = useState('');
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleEditPermission = (user: any) => {
    setSelectedUser(user);
    setShowPermissionModal(true);
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm">
        {/* 标题和搜索栏 */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">用户管理</h1>
          
          <div className="flex items-center justify-between">
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

            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              用户权限
            </button>
          </div>
        </div>

        {/* 用户表格 */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 w-12">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">用户</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">邮件</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">角色</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">状态</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                        {user.name.charAt(0)}
                      </div>
                      <span className="text-sm text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{user.role}</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${user.status === '已激活' ? 'text-gray-700' : 'text-gray-500'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleEditPermission(user)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        编辑
                      </button>
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
          <span className="text-sm text-gray-600 mr-4">共 30 页</span>
          <button className="p-2 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded">
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
          <button className="p-2 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* 权限编辑弹窗 */}
      {showPermissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[500px] max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">编辑权限 - 张三</h2>
              <button 
                onClick={() => setShowPermissionModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              {/* 菜单权限 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">菜单权限</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                    <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                    <span className="text-sm text-gray-700">首页</span>
                  </label>
                  
                  <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                    <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                    <span className="text-sm text-gray-700">数据分析</span>
                  </label>

                  <div className="ml-6 space-y-2">
                    <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                      <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                      <span className="text-sm text-gray-700">数据分析</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                      <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                      <span className="text-sm text-gray-700">库存盘点量</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-sm text-gray-700">下属组织筛查</span>
                    </label>
                  </div>

                  <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span className="text-sm text-gray-700">运营中心</span>
                  </label>
                  
                  <div className="ml-6">
                    <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-sm text-gray-700">运营中心</span>
                    </label>
                  </div>

                  <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span className="text-sm text-gray-700">系统设置</span>
                  </label>

                  <div className="ml-6">
                    <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-sm text-gray-700">系统设置</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 数据权限 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">数据权限</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                    <input type="radio" name="dataPermission" className="border-gray-300" defaultChecked />
                    <span className="text-sm text-gray-700">全部数据权限</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                    <input type="radio" name="dataPermission" className="border-gray-300" />
                    <span className="text-sm text-gray-700">本部门数据</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                    <input type="radio" name="dataPermission" className="border-gray-300" />
                    <span className="text-sm text-gray-700">个人数据</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button 
                onClick={() => setShowPermissionModal(false)}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
              >
                取消
              </button>
              <button 
                onClick={() => setShowPermissionModal(false)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
