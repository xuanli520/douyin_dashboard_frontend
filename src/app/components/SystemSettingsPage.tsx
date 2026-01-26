'use client';

import { useState } from 'react';
import { Settings, Bell, Lock, Palette, Globe, Database, Shield, Save } from 'lucide-react';

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState({
    // 通知设置
    emailNotification: true,
    pushNotification: true,
    riskAlert: true,
    taskReminder: true,
    // 安全设置
    twoFactorAuth: false,
    sessionTimeout: '30',
    // 系统设置
    language: 'zh-CN',
    theme: 'light',
    timezone: 'Asia/Shanghai',
  });

  const handleSave = () => {
    // TODO: 保存设置到后端
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm">
        {/* 标题 */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">系统设置</h1>
        </div>

        <div className="p-6 space-y-8">
          {/* 通知设置 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Bell className="text-blue-600" size={20} />
              <h2 className="text-lg font-medium text-gray-900">通知设置</h2>
            </div>
            <div className="space-y-4 pl-8">
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">邮件通知</p>
                  <p className="text-sm text-gray-500">接收系统邮件通知</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotification}
                  onChange={(e) => setSettings({ ...settings, emailNotification: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">推送通知</p>
                  <p className="text-sm text-gray-500">接收浏览器推送通知</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.pushNotification}
                  onChange={(e) => setSettings({ ...settings, pushNotification: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">风险预警</p>
                  <p className="text-sm text-gray-500">接收风险预警通知</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.riskAlert}
                  onChange={(e) => setSettings({ ...settings, riskAlert: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">任务提醒</p>
                  <p className="text-sm text-gray-500">接收任务调度提醒</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.taskReminder}
                  onChange={(e) => setSettings({ ...settings, taskReminder: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </label>
            </div>
          </div>

          {/* 安全设置 */}
          <div className="border-t border-gray-100 pt-8">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="text-blue-600" size={20} />
              <h2 className="text-lg font-medium text-gray-900">安全设置</h2>
            </div>
            <div className="space-y-4 pl-8">
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">双因素认证</p>
                  <p className="text-sm text-gray-500">登录时需要手机验证码</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={(e) => setSettings({ ...settings, twoFactorAuth: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </label>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-2">会话超时时间</p>
                <select
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                >
                  <option value="15">15 分钟</option>
                  <option value="30">30 分钟</option>
                  <option value="60">1 小时</option>
                  <option value="120">2 小时</option>
                </select>
              </div>
            </div>
          </div>

          {/* 外观设置 */}
          <div className="border-t border-gray-100 pt-8">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="text-blue-600" size={20} />
              <h2 className="text-lg font-medium text-gray-900">外观设置</h2>
            </div>
            <div className="space-y-4 pl-8">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-2">主题</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSettings({ ...settings, theme: 'light' })}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      settings.theme === 'light'
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    浅色
                  </button>
                  <button
                    onClick={() => setSettings({ ...settings, theme: 'dark' })}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      settings.theme === 'dark'
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    深色
                  </button>
                  <button
                    onClick={() => setSettings({ ...settings, theme: 'system' })}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      settings.theme === 'system'
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    跟随系统
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 保存按钮 */}
          <div className="border-t border-gray-100 pt-8">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <Save size={16} />
              保存设置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
