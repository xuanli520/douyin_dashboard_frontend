'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Save, Camera, User, Mail, Phone, Building, Shield } from 'lucide-react';
import maleAvatar from '@/assets/male.jpg';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '管理员',
    email: 'admin@example.com',
    phone: '138****8888',
    department: '技术部',
    role: '系统管理员',
    position: '技术总监',
  });

  const handleSave = () => {
    setIsEditing(false);
    // TODO: 保存用户信息到后端
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm">
        {/* 标题 */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">个人信息</h1>
        </div>

        <div className="p-6">
          {/* 头像区域 */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden">
                <Image
                  src={maleAvatar}
                  alt="用户头像"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                <Camera size={14} />
              </button>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{formData.username}</h2>
              <p className="text-sm text-gray-500 mt-1">点击头像可更换</p>
            </div>
          </div>

          {/* 表单区域 */}
          <div className="max-w-2xl">
            <div className="grid grid-cols-2 gap-6">
              {/* 用户名 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="text-gray-400" />
                  用户名
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <p className="px-3 py-2 text-gray-900">{formData.username}</p>
                )}
              </div>

              {/* 邮箱 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} className="text-gray-400" />
                  邮箱
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <p className="px-3 py-2 text-gray-900">{formData.email}</p>
                )}
              </div>

              {/* 手机号 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone size={16} className="text-gray-400" />
                  手机号
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <p className="px-3 py-2 text-gray-900">{formData.phone}</p>
                )}
              </div>

              {/* 部门 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Building size={16} className="text-gray-400" />
                  部门
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <p className="px-3 py-2 text-gray-900">{formData.department}</p>
                )}
              </div>

              {/* 角色 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Shield size={16} className="text-gray-400" />
                  角色
                </label>
                <p className="px-3 py-2 text-gray-900">{formData.role}</p>
              </div>

              {/* 职位 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="text-gray-400" />
                  职位
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <p className="px-3 py-2 text-gray-900">{formData.position}</p>
                )}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    <Save size={16} />
                    保存
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  编辑资料
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
