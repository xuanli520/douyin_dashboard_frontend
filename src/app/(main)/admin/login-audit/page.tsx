'use client';

import React, { useState } from 'react';
import { Search, Filter, Download, Calendar, MapPin, Monitor, Shield, AlertCircle, CheckCircle, XCircle, ChevronDown, Activity } from 'lucide-react';
import { CyberButton } from '@/components/ui/cyber/CyberButton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/app/components/ui/pagination';

// 模拟审计日志数据
const auditLogs = [
  {
    id: 1,
    user_id: 'USR-10001',
    username: '张三',
    account_type: '管理员',
    timestamp: '2026-02-09T09:30:15Z',
    source_ip: '192.168.1.105',
    geo_location: '中国/北京',
    device_info: 'Chrome 121 / Windows 10',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0.0.0',
    event_type: '登录',
    action_method: 'POST',
    status: 'Success',
    error_code: null,
    reason: null,
    session_id: 'SES-7f8d9e2a1b3c',
    trace_id: 'TRC-a1b2c3d4e5f6',
  },
  {
    id: 2,
    user_id: 'USR-10002',
    username: '李四',
    account_type: '运营',
    timestamp: '2026-02-09T09:28:42Z',
    source_ip: '58.220.34.128',
    geo_location: '中国/上海',
    device_info: 'Safari 17 / macOS 14',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) Safari/17.0',
    event_type: '登录',
    action_method: 'POST',
    status: 'Success',
    error_code: null,
    reason: null,
    session_id: 'SES-9a8b7c6d5e4f',
    trace_id: 'TRC-f6e5d4c3b2a1',
  },
  {
    id: 3,
    user_id: 'USR-10003',
    username: '王五',
    account_type: '分析师',
    timestamp: '2026-02-09T09:25:18Z',
    source_ip: '114.242.76.215',
    geo_location: '中国/深圳',
    device_info: 'Chrome 121 / Android 13',
    user_agent: 'Mozilla/5.0 (Linux; Android 13) Chrome/121.0.0.0 Mobile',
    event_type: '密码错误',
    action_method: 'POST',
    status: 'Failure',
    error_code: 'AUTH_001',
    reason: '密码输入错误',
    session_id: null,
    trace_id: 'TRC-1a2b3c4d5e6f',
  },
  {
    id: 4,
    user_id: 'USR-10004',
    username: '赵六',
    account_type: 'API账号',
    timestamp: '2026-02-09T09:20:33Z',
    source_ip: '203.208.60.47',
    geo_location: '美国/加州',
    device_info: 'Python/3.11 requests/2.31',
    user_agent: 'python-requests/2.31.0',
    event_type: '登录',
    action_method: 'POST',
    status: 'Failure',
    error_code: 'AUTH_003',
    reason: 'IP白名单限制',
    session_id: null,
    trace_id: 'TRC-9z8y7x6w5v4u',
  },
  {
    id: 5,
    user_id: 'USR-10001',
    username: '张三',
    account_type: '管理员',
    timestamp: '2026-02-09T09:15:27Z',
    source_ip: '192.168.1.105',
    geo_location: '中国/北京',
    device_info: 'Chrome 121 / Windows 10',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0.0.0',
    event_type: '登出',
    action_method: 'POST',
    status: 'Success',
    error_code: null,
    reason: null,
    session_id: 'SES-6e5f4d3c2b1a',
    trace_id: 'TRC-p0o9i8u7y6t5',
  },
  {
    id: 6,
    user_id: 'USR-10005',
    username: '孙七',
    account_type: '运营',
    timestamp: '2026-02-09T09:10:05Z',
    source_ip: '61.152.240.88',
    geo_location: '中国/杭州',
    device_info: 'Edge 121 / Windows 11',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/121.0.0.0',
    event_type: 'MFA验证',
    action_method: 'POST',
    status: 'Success',
    error_code: null,
    reason: null,
    session_id: 'SES-3c4d5e6f7g8h',
    trace_id: 'TRC-m1n2b3v4c5x6',
  },
  {
    id: 7,
    user_id: 'USR-10006',
    username: '周八',
    account_type: '分析师',
    timestamp: '2026-02-09T09:05:41Z',
    source_ip: '123.125.71.32',
    geo_location: '中国/广州',
    device_info: 'Firefox 122 / Ubuntu 22.04',
    user_agent: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64) Firefox/122.0',
    event_type: '登录',
    action_method: 'POST',
    status: 'Failure',
    error_code: 'AUTH_002',
    reason: '账号已锁定',
    session_id: null,
    trace_id: 'TRC-q2w3e4r5t6y7',
  },
  {
    id: 8,
    user_id: 'USR-10002',
    username: '李四',
    account_type: '运营',
    timestamp: '2026-02-09T09:00:12Z',
    source_ip: '58.220.34.128',
    geo_location: '中国/上海',
    device_info: 'Safari 17 / iOS 17',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/17.0',
    event_type: '敏感操作',
    action_method: 'DELETE',
    status: 'Success',
    error_code: null,
    reason: null,
    session_id: 'SES-8h9i0j1k2l3m',
    trace_id: 'TRC-a1s2d3f4g5h6',
  },
];

export default function LoginAuditPage() {
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failure'>('all');
  const [filterEventType, setFilterEventType] = useState('all');
  const [filterAccountType, setFilterAccountType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const itemsPerPage = 10;

  // 筛选逻辑
  const filteredLogs = auditLogs.filter(log => {
    const matchSearch = searchText === '' || 
      log.username.toLowerCase().includes(searchText.toLowerCase()) ||
      log.user_id.toLowerCase().includes(searchText.toLowerCase()) ||
      log.source_ip.includes(searchText) ||
      log.geo_location.toLowerCase().includes(searchText.toLowerCase());
    
    const matchStatus = filterStatus === 'all' || 
      (filterStatus === 'success' && log.status === 'Success') ||
      (filterStatus === 'failure' && log.status === 'Failure');
    
    const matchEventType = filterEventType === 'all' || log.event_type === filterEventType;
    
    const matchAccountType = filterAccountType === 'all' || log.account_type === filterAccountType;

    return matchSearch && matchStatus && matchEventType && matchAccountType;
  });

  // 分页逻辑
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 格式化时间
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  // 导出数据
  const handleExport = () => {
    console.log('导出审计日志数据');
  };

  return (
    <div className="space-y-6">
      {/* 顶部统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Logins */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-lg p-5 border border-slate-200 dark:border-slate-700 relative overflow-hidden group">
          <div className="absolute inset-0 bg-cyan-400/5 dark:bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm text-slate-600 dark:text-cyan-400 font-medium tracking-wide">总登录次数</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-cyan-200 mt-2 font-mono">{auditLogs.length}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-500/10 dark:bg-cyan-500/20 rounded-lg flex items-center justify-center border border-cyan-200 dark:border-cyan-500/30">
              <Shield className="text-cyan-600 dark:text-cyan-400" size={24} />
            </div>
          </div>
        </div>

        {/* Success */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-lg p-5 border border-slate-200 dark:border-emerald-500/30 relative overflow-hidden group">
           <div className="absolute inset-0 bg-emerald-400/5 dark:bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm text-slate-600 dark:text-emerald-400 font-medium tracking-wide">成功登录</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-emerald-200 mt-2 font-mono">
                {auditLogs.filter(log => log.status === 'Success').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-200 dark:border-emerald-500/30">
              <CheckCircle className="text-emerald-600 dark:text-emerald-400" size={24} />
            </div>
          </div>
        </div>

        {/* Failure */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-lg p-5 border border-slate-200 dark:border-rose-500/30 relative overflow-hidden group">
           <div className="absolute inset-0 bg-rose-400/5 dark:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm text-slate-600 dark:text-rose-400 font-medium tracking-wide">失败次数</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-rose-200 mt-2 font-mono">
                {auditLogs.filter(log => log.status === 'Failure').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-rose-500/10 dark:bg-rose-500/20 rounded-lg flex items-center justify-center border border-rose-200 dark:border-rose-500/30">
              <XCircle className="text-rose-600 dark:text-rose-400" size={24} />
            </div>
          </div>
        </div>

        {/* Unusual Locations */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-lg p-5 border border-slate-200 dark:border-purple-500/30 relative overflow-hidden group">
           <div className="absolute inset-0 bg-purple-400/5 dark:bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm text-slate-600 dark:text-purple-400 font-medium tracking-wide">异地登录</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-purple-200 mt-2 font-mono">1</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-200 dark:border-purple-500/30">
              <MapPin className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* 主表格区域 */}
      <div className="rounded-md border border-slate-200 bg-white dark:rounded-none dark:border-0 dark:bg-slate-950/30 dark:backdrop-blur-sm">
        {/* 工具栏 */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Activity className="text-cyan-500 dark:text-cyan-400" size={20} />
                登录审计日志
            </h2>
            <CyberButton onClick={handleExport} className="shadow-lg shadow-cyan-500/20 group">
              <Download className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              导出日志
            </CyberButton>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* 搜索框 */}
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input
                type="text"
                placeholder="搜索用户名、ID或IP地址..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:focus:ring-cyan-500 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>

            <div className="flex flex-wrap gap-4 w-full md:w-auto">
                {/* 状态筛选 */}
                <Select
                  value={filterStatus}
                  onValueChange={(value) => setFilterStatus(value as 'all' | 'success' | 'failure')}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="全部状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="success">成功</SelectItem>
                    <SelectItem value="failure">失败</SelectItem>
                  </SelectContent>
                </Select>

                {/* 事件类型筛选 */}
                <Select
                  value={filterEventType}
                  onValueChange={(value) => setFilterEventType(value)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="全部事件" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部事件</SelectItem>
                    <SelectItem value="登录">登录</SelectItem>
                    <SelectItem value="登出">登出</SelectItem>
                    <SelectItem value="密码错误">密码错误</SelectItem>
                    <SelectItem value="MFA验证">MFA验证</SelectItem>
                    <SelectItem value="敏感操作">敏感操作</SelectItem>
                  </SelectContent>
                </Select>

                {/* 账户类型筛选 */}
                <Select
                  value={filterAccountType}
                  onValueChange={(value) => setFilterAccountType(value)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="全部账户类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部账户类型</SelectItem>
                    <SelectItem value="管理员">管理员</SelectItem>
                    <SelectItem value="运营">运营</SelectItem>
                    <SelectItem value="分析师">分析师</SelectItem>
                    <SelectItem value="API账号">API账号</SelectItem>
                  </SelectContent>
                </Select>
            </div>
          </div>
        </div>

        {/* 表格 */}
        <div className="overflow-x-auto rounded-md border border-slate-200 bg-white dark:rounded-none dark:border-0 dark:bg-slate-950/30 dark:backdrop-blur-sm">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200 dark:bg-slate-900/80 dark:border-slate-800">
              <tr className="hover:bg-transparent border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider h-12 dark:text-cyan-500/60 dark:font-mono dark:tracking-widest">
                  用户信息
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider h-12 dark:text-cyan-500/60 dark:font-mono dark:tracking-widest">
                  时间
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider h-12 dark:text-cyan-500/60 dark:font-mono dark:tracking-widest">
                  来源位置
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider h-12 dark:text-cyan-500/60 dark:font-mono dark:tracking-widest">
                  事件类型
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider h-12 dark:text-cyan-500/60 dark:font-mono dark:tracking-widest">
                  状态
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider h-12 dark:text-cyan-500/60 dark:font-mono dark:tracking-widest">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col items-center gap-3">
                      <AlertCircle size={48} className="text-gray-300 dark:text-slate-600" />
                      <div>
                        <p className="text-gray-500 dark:text-slate-400 font-medium">暂无符合条件的审计日志</p>
                        <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">请尝试调整筛选条件</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr 
                      className={`group transition-all duration-200 cursor-pointer border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-cyan-950/20 dark:hover:shadow-[inset_2px_0_0_0_rgba(34,211,238,0.5)] ${
                          expandedRow === log.id 
                            ? 'bg-slate-100 dark:bg-cyan-950/30' 
                            : ''
                      }`}
                      onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                    >
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors font-normal dark:font-light">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm ${
                            log.account_type === '管理员' ? 'bg-purple-500 dark:bg-purple-600' :
                            log.account_type === '运营' ? 'bg-blue-500 dark:bg-blue-600' :
                            log.account_type === '分析师' ? 'bg-emerald-500 dark:bg-emerald-600' :
                            'bg-gray-500 dark:bg-slate-600'
                          }`}>
                            {log.username.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">{log.username}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">{log.user_id}</div>
                            <div className="text-xs mt-0.5">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${
                                log.account_type === '管理员' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20' :
                                log.account_type === '运营' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20' :
                                log.account_type === '分析师' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20' :
                                'bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                              }`}>
                                {log.account_type}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors font-normal dark:font-light">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar size={14} className="text-slate-400 dark:text-slate-500" />
                          <span className="font-mono text-xs">{formatTimestamp(log.timestamp)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors font-normal dark:font-light">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin size={14} className="text-slate-400 dark:text-slate-500" />
                            {log.geo_location}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-500 font-mono">{log.source_ip}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors font-normal dark:font-light">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-slate-900 dark:text-slate-200">{log.event_type}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">{log.action_method}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors font-normal dark:font-light">
                        {log.status === 'Success' ? (
                          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/50 dark:shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                            <CheckCircle size={14} className="text-emerald-600 dark:text-emerald-400" />
                            <span className="text-sm font-medium">成功</span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-100 text-red-700 border border-red-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/50 dark:shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                              <XCircle size={14} className="text-red-600 dark:text-rose-400" />
                              <span className="text-sm font-medium">失败</span>
                            </div>
                            {log.error_code && (
                              <div className="text-xs text-rose-600 dark:text-rose-300/80 font-mono">
                                {log.error_code}: {log.reason}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors font-normal dark:font-light">
                        <button
                          className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                              expandedRow === log.id 
                              ? 'text-cyan-700 dark:text-cyan-300' 
                              : 'text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300'
                          }`}
                        >
                          详情
                          <ChevronDown 
                            size={16} 
                            className={`transition-transform duration-200 ${expandedRow === log.id ? 'rotate-180' : ''}`}
                          />
                        </button>
                      </td>
                    </tr>
                    
                    {/* 展开的详细信息行 */}
                    {expandedRow === log.id && (
                      <tr className="bg-slate-50 dark:bg-slate-900/30 animate-in fade-in slide-in-from-top-1 duration-200">
                        <td colSpan={6} className="px-6 py-6 border-b border-slate-200 dark:border-slate-800 relative">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 dark:bg-cyan-500" />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-2">
                                <Monitor size={16} className="text-cyan-600 dark:text-cyan-400" />
                                设备信息
                              </h4>
                              <div className="bg-white dark:bg-slate-950/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                                <div className="flex justify-between text-sm group/row hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1 rounded transition-colors">
                                  <span className="text-slate-600 dark:text-slate-400">设备类型:</span>
                                  <span className="text-slate-900 dark:text-slate-200 font-mono">{log.device_info}</span>
                                </div>
                                <div className="flex flex-col gap-1 text-sm group/row hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1 rounded transition-colors">
                                  <span className="text-slate-600 dark:text-slate-400">User Agent:</span>
                                  <span className="text-slate-900 dark:text-slate-200 font-mono text-xs break-all leading-relaxed">{log.user_agent}</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-2">
                                <Shield size={16} className="text-purple-600 dark:text-purple-400" />
                                会话追踪
                              </h4>
                              <div className="bg-white dark:bg-slate-950/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                                <div className="flex justify-between text-sm group/row hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1 rounded transition-colors">
                                  <span className="text-slate-600 dark:text-slate-400">Session ID:</span>
                                  <span className="text-slate-900 dark:text-slate-200 font-mono text-xs">{log.session_id || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-sm group/row hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1 rounded transition-colors">
                                  <span className="text-slate-600 dark:text-slate-400">Trace ID:</span>
                                  <span className="text-slate-900 dark:text-slate-200 font-mono text-xs">{log.trace_id}</span>
                                </div>
                                <div className="flex justify-between text-sm group/row hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1 rounded transition-colors">
                                  <span className="text-slate-600 dark:text-slate-400">原始时间戳:</span>
                                  <span className="text-slate-900 dark:text-slate-200 font-mono text-xs">{log.timestamp}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
            <span>共 {filteredLogs.length} 条</span>
            <div className="flex items-center gap-1">
              <span>每页</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(val) => {
                  // 注意：登录审计页面固定每页10条，如果需要可调整
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-8 min-w-[50px] px-2 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side="top" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-lg">
                  {[10, 20, 50, 100].map(size => (
                    <SelectItem key={size} value={size.toString()} className="cursor-pointer">
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>条</span>
            </div>
          </div>

          {totalPages > 0 && (
            <Pagination className="mx-0">
              <PaginationContent className="gap-1">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={(e) => { e.preventDefault(); if(currentPage > 1) setCurrentPage(currentPage - 1); }}
                    aria-disabled={currentPage <= 1}
                    className={currentPage <= 1 ? "opacity-50 pointer-events-none" : "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"}
                  />
                </PaginationItem>

                {(() => {
                  const pages: (number | 'ellipsis')[] = [];
                  if (totalPages <= 7) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else if (currentPage <= 3) {
                    pages.push(1, 2, 3, 4, 'ellipsis', totalPages);
                  } else if (currentPage >= totalPages - 2) {
                    pages.push(1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                  } else {
                    pages.push(1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages);
                  }
                  return pages.map((p, i) => (
                    <PaginationItem key={i}>
                      {p === 'ellipsis' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          isActive={currentPage === p}
                          onClick={(e) => { e.preventDefault(); setCurrentPage(p as number); }}
                          className={currentPage === p ? "bg-cyan-500 text-white hover:bg-cyan-600 cursor-pointer" : "hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"}
                        >
                          {p}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ));
                })()}

                <PaginationItem>
                  <PaginationNext
                    onClick={(e) => { e.preventDefault(); if(currentPage < totalPages) setCurrentPage(currentPage + 1); }}
                    aria-disabled={currentPage >= totalPages}
                    className={currentPage >= totalPages ? "opacity-50 pointer-events-none" : "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </div>
  );
}
