/**
 * 系统设置页面
 * 根据主题显示不同的样式
 * 注意：主题切换只能通过Logo点击彩蛋触发，不在设置页面显示
 */

'use client';

import { useState } from 'react';
import { Settings, Bell, Lock, Save, Moon, Sun, Monitor } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { SettingSelect } from '@/app/components/ui/styled-select';
import { SelectItem } from '@/app/components/ui/select';

export default function SystemSettingsPage() {
  const { appTheme, colorMode, setColorMode, isHydrated } = useThemeStore();
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
    timezone: 'Asia/Shanghai',
  });

  const handleSave = () => {
    // TODO: 保存设置到后端
  };

  const Toggle = ({ checked, onChange }: { checked: boolean, onChange: (checked: boolean) => void }) => {
    if (appTheme === 'enterprise') {
      // 企业主题样式
      return (
        <button 
          onClick={() => onChange(!checked)}
          className={`w-11 h-6 rounded-full relative transition-all duration-200 ${
            checked ? 'bg-[#0ea5e9]' : 'bg-slate-200'
          }`}
        >
          <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`} />
        </button>
      );
    }
    
    // 赛博朋克主题样式
    return (
      <button 
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full relative transition-all duration-300 ${
          checked ? 'bg-cyan-600 shadow-[0_0_10px_rgba(8,145,178,0.5)]' : 'bg-slate-200 dark:bg-slate-700'
        }`}
      >
        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${
          checked ? 'translate-x-6' : 'translate-x-0'
        }`} />
      </button>
    );
  };

  if (!isHydrated) {
    return null;
  }

  // 企业主题样式
  if (appTheme === 'enterprise') {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          {/* 标题 */}
          <div className="mb-8 border-b border-slate-200 pb-6 flex items-center gap-4">
            <div className="p-3 bg-[#e0f2fe] rounded-lg text-[#0ea5e9]">
              <Settings size={24} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[#1e3a5a]">系统设置</h1>
              <p className="text-sm text-[#64748b] mt-1">配置全局参数和用户偏好</p>
            </div>
          </div>

          <div className="space-y-10">
            {/* 通知设置 */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Bell size={18} className="text-[#0ea5e9]" />
                <h2 className="text-lg font-medium text-[#1e3a5a]">通知设置</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-[#1e3a5a]">邮件通知</p>
                    <p className="text-xs text-[#64748b] mt-1">通过邮件接收每日报告</p>
                  </div>
                  <Toggle checked={settings.emailNotification} onChange={(c) => setSettings({ ...settings, emailNotification: c })} />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-[#1e3a5a]">推送通知</p>
                    <p className="text-xs text-[#64748b] mt-1">浏览器推送通知</p>
                  </div>
                  <Toggle checked={settings.pushNotification} onChange={(c) => setSettings({ ...settings, pushNotification: c })} />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-[#1e3a5a]">风险预警</p>
                    <p className="text-xs text-[#64748b] mt-1">P0/P1风险即时预警</p>
                  </div>
                  <Toggle checked={settings.riskAlert} onChange={(c) => setSettings({ ...settings, riskAlert: c })} />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-[#1e3a5a]">任务提醒</p>
                    <p className="text-xs text-[#64748b] mt-1">定时任务完成提醒</p>
                  </div>
                  <Toggle checked={settings.taskReminder} onChange={(c) => setSettings({ ...settings, taskReminder: c })} />
                </div>
              </div>
            </div>

            {/* 安全设置 */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Lock size={18} className="text-[#0ea5e9]" />
                <h2 className="text-lg font-medium text-[#1e3a5a]">安全设置</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-[#1e3a5a]">双因素认证 (2FA)</p>
                    <p className="text-xs text-[#64748b] mt-1">登录时需要手机验证码</p>
                  </div>
                  <Toggle checked={settings.twoFactorAuth} onChange={(c) => setSettings({ ...settings, twoFactorAuth: c })} />
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#1e3a5a]">会话超时时间</p>
                    <p className="text-xs text-[#64748b] mt-1">自动登出时间</p>
                  </div>
                  <SettingSelect
                    value={settings.sessionTimeout}
                    onValueChange={(val) => setSettings({ ...settings, sessionTimeout: val })}
                  >
                    <SelectItem value="15">15 分钟</SelectItem>
                    <SelectItem value="30">30 分钟</SelectItem>
                    <SelectItem value="60">1 小时</SelectItem>
                    <SelectItem value="120">2 小时</SelectItem>
                  </SettingSelect>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Monitor size={18} className="text-[#0ea5e9]" />
                <h2 className="text-lg font-medium text-[#1e3a5a]">外观设置</h2>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-sm font-medium text-[#1e3a5a] mb-4">界面模式</p>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setColorMode('light')}
                    className={`flex flex-col items-center gap-3 p-4 rounded-lg border transition-all ${
                      colorMode === 'light'
                        ? 'bg-[#e0f2fe] border-[#7dd3fc] text-[#0ea5e9]'
                        : 'bg-white border-slate-200 text-[#64748b] hover:bg-slate-50'
                    }`}
                  >
                    <Sun size={22} />
                    <span className="text-xs">浅色</span>
                  </button>
                  <button
                    onClick={() => setColorMode('dark')}
                    className={`flex flex-col items-center gap-3 p-4 rounded-lg border transition-all ${
                      colorMode === 'dark'
                        ? 'bg-[#e0f2fe] border-[#7dd3fc] text-[#0ea5e9]'
                        : 'bg-white border-slate-200 text-[#64748b] hover:bg-slate-50'
                    }`}
                  >
                    <Moon size={22} />
                    <span className="text-xs">深色</span>
                  </button>
                  <button
                    onClick={() => setColorMode('system')}
                    className={`flex flex-col items-center gap-3 p-4 rounded-lg border transition-all ${
                      colorMode === 'system'
                        ? 'bg-[#e0f2fe] border-[#7dd3fc] text-[#0ea5e9]'
                        : 'bg-white border-slate-200 text-[#64748b] hover:bg-slate-50'
                    }`}
                  >
                    <Monitor size={22} />
                    <span className="text-xs">自动</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 提示信息 */}
            <div className="p-4 bg-[#e0f2fe] rounded-lg border border-[#bfdbfe]">
              <p className="text-sm text-[#1e3a5a]">
                <span className="font-medium">提示：</span>
                可在本页或罗盘页调整界面模式，自动模式会跟随系统主题
              </p>
            </div>

            {/* 保存按钮 */}
            <div className="pt-6 border-t border-slate-200 flex justify-end">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-md transition-all shadow-sm font-medium"
              >
                <Save size={18} />
                保存设置
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 赛博朋克主题样式
  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-8">
        {/* 标题 */}
        <div className="mb-8 border-b border-border pb-6 flex items-center gap-4">
           <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                <Settings size={24} />
           </div>
           <div>
               <h1 className="text-xl font-bold text-foreground tracking-tight">系统设置 (System Config)</h1>
               <p className="text-sm text-muted-foreground font-mono mt-1">Configure global parameters and user preferences</p>
           </div>
        </div>

        <div className="space-y-10">
          {/* 通知设置 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Bell size={18} className="text-cyan-400" />
              <h2 className="text-lg font-bold text-foreground font-mono">通知设置 (Notifications)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors">
                <div>
                  <p className="text-sm font-medium text-foreground">邮件通知</p>
                  <p className="text-xs text-muted-foreground mt-1">Receive daily reports via email</p>
                </div>
                <Toggle checked={settings.emailNotification} onChange={(c) => setSettings({ ...settings, emailNotification: c })} />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors">
                <div>
                  <p className="text-sm font-medium text-foreground">推送通知</p>
                  <p className="text-xs text-muted-foreground mt-1">Browser push notifications</p>
                </div>
                <Toggle checked={settings.pushNotification} onChange={(c) => setSettings({ ...settings, pushNotification: c })} />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors">
                <div>
                  <p className="text-sm font-medium text-foreground">风险预警</p>
                  <p className="text-xs text-muted-foreground mt-1">Instant alerts for P0/P1 risks</p>
                </div>
                <Toggle checked={settings.riskAlert} onChange={(c) => setSettings({ ...settings, riskAlert: c })} />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors">
                <div>
                  <p className="text-sm font-medium text-foreground">任务提醒</p>
                  <p className="text-xs text-muted-foreground mt-1">Schedule task completion alerts</p>
                </div>
                <Toggle checked={settings.taskReminder} onChange={(c) => setSettings({ ...settings, taskReminder: c })} />
              </div>
            </div>
          </div>

          {/* 安全设置 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lock size={18} className="text-cyan-400" />
              <h2 className="text-lg font-bold text-foreground font-mono">安全设置 (Security)</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-foreground">双因素认证 (2FA)</p>
                  <p className="text-xs text-muted-foreground mt-1">Require mobile verification for login</p>
                </div>
                <Toggle checked={settings.twoFactorAuth} onChange={(c) => setSettings({ ...settings, twoFactorAuth: c })} />
              </div>

              <div className="p-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-xl flex items-center justify-between">
                 <div>
                    <p className="text-sm font-medium text-foreground">会话超时时间</p>
                    <p className="text-xs text-muted-foreground mt-1">Auto-logout duration</p>
                 </div>
                <SettingSelect
                  value={settings.sessionTimeout}
                  onValueChange={(val) => setSettings({ ...settings, sessionTimeout: val })}
                >
                  <SelectItem value="15">15 Minutes</SelectItem>
                  <SelectItem value="30">30 Minutes</SelectItem>
                  <SelectItem value="60">1 Hour</SelectItem>
                  <SelectItem value="120">2 Hours</SelectItem>
                </SettingSelect>
              </div>
            </div>
          </div>

          {/* 外观设置 - 仅赛博朋克主题显示暗/亮模式切换 */}
          <div>
             <div className="flex items-center gap-2 mb-4">
               <Monitor size={18} className="text-cyan-400" />
               <h2 className="text-lg font-bold text-foreground font-mono">外观设置 (Appearance)</h2>
             </div>
             <div className="p-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-xl">
                <p className="text-sm font-medium text-foreground mb-4">界面模式</p>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setColorMode('light')}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
                      colorMode === 'light'
                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-500 dark:text-cyan-400'
                        : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/5 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <Sun size={24} />
                    <span className="text-xs font-mono">浅色</span>
                  </button>
                  <button
                    onClick={() => setColorMode('dark')}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
                      colorMode === 'dark'
                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                        : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/5 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <Moon size={24} />
                    <span className="text-xs font-mono">深色</span>
                  </button>
                  <button
                    onClick={() => setColorMode('system')}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
                      colorMode === 'system'
                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-500 dark:text-cyan-400'
                        : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/5 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <Monitor size={24} />
                    <span className="text-xs font-mono">自动</span>
                  </button>
                </div>
              </div>
          </div>

          {/* 提示信息 */}
          <div className="p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
            <p className="text-sm text-cyan-400 font-mono">
              提示: 可在本页或罗盘页调整界面模式，自动模式会跟随系统主题
            </p>
          </div>

          {/* 保存按钮 */}
          <div className="pt-6 border-t border-border dark:border-white/10 flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-all shadow-md dark:shadow-[0_0_20px_rgba(34,211,238,0.4)] font-bold tracking-wide"
            >
              <Save size={18} />
              保存当前配置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
