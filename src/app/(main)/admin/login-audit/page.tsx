'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Search, Download, Calendar, MapPin, Monitor, Shield, AlertCircle, CheckCircle, XCircle, ChevronDown } from 'lucide-react';
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
import { useLoginAuditLogs, LoginAuditFilters } from '@/features/audit-login/hooks';

export default function LoginAuditPage() {
  const {
    items,
    meta,
    loading,
    error,
    stats,
    filters,
    updateFilters,
    applyFilters,
    refetch
  } = useLoginAuditLogs();

  const safeItems = items ?? [];
  const safeMeta = meta ?? { total: 0, page: 1, pages: 0, has_next: false, has_prev: false };
  const safeStats = stats ?? { success: 0, failure: 0 };

  const [uiFilters, setUiFilters] = useState<LoginAuditFilters>({
    search: '',
    status: 'all',
    event_type: 'all',
    account_type: 'all',
  });

  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const handleFilterChange = useCallback((newFilters: Partial<LoginAuditFilters>) => {
    setUiFilters(prev => {
      const updated = { ...prev, ...newFilters };
      applyFilters(updated);
      return updated;
    });
  }, [applyFilters]);

  const handleSearch = useCallback((value: string) => {
    handleFilterChange({ search: value });
  }, [handleFilterChange]);

  const handleStatusChange = useCallback((value: 'all' | 'success' | 'failure') => {
    handleFilterChange({ status: value });
  }, [handleFilterChange]);

  const handleEventTypeChange = useCallback((value: string) => {
    handleFilterChange({ event_type: value });
  }, [handleFilterChange]);

  const handleAccountTypeChange = useCallback((value: string) => {
    handleFilterChange({ account_type: value });
  }, [handleFilterChange]);

  const handlePageChange = useCallback((page: number) => {
    updateFilters({ page });
  }, [updateFilters]);

  const handleSizeChange = useCallback((size: number) => {
    updateFilters({ size, page: 1 });
  }, [updateFilters]);

  const totalCount = safeMeta.total;

  const successCount = useMemo(() => {
    if (filters.result === 'success') return safeMeta.total;
    if (filters.result === 'failure') return 0;
    return safeStats.success;
  }, [filters.result, safeMeta.total, safeStats.success]);

  const failureCount = useMemo(() => {
    if (filters.result === 'failure') return safeMeta.total;
    if (filters.result === 'success') return 0;
    return safeStats.failure;
  }, [filters.result, safeMeta.total, safeStats.failure]);

  const normalizeStatus = useCallback((status: string | null | undefined) => {
    return (status ?? '').toLowerCase();
  }, []);

  const abnormalCount = useMemo(() => {
    return safeItems.filter(item => {
      const isFailure = normalizeStatus(item.status) === 'failure';
      const location = item.geo_location?.toString().toLowerCase() ?? '';
      const isRemote = location && !location.includes('本地') && !location.includes('local');
      return isFailure || isRemote;
    }).length;
  }, [safeItems, normalizeStatus]);

  const currentPage = safeMeta.page;
  const totalPages = safeMeta.pages;
  const hasNextPage = safeMeta.has_next;
  const hasPrevPage = safeMeta.has_prev;

  const getRoleDisplayName = useCallback((accountType: string | null | undefined): string => {
    if (!accountType) return 'Unknown';
    return accountType;
  }, []);

  const eventTypeMap = useMemo<Record<string, string>>(() => ({
    login: '登录',
    logout: '登出',
    refresh: '刷新令牌',
    register: '注册',
  }), []);

  const getEventTypeLabel = useCallback((eventType: string | null | undefined): string => {
    if (!eventType) return '-';
    return eventTypeMap[eventType.toLowerCase()] || eventType;
  }, [eventTypeMap]);

  const formatTimestamp = useCallback((timestamp: string | null | undefined) => {
    if (!timestamp) return '-';
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
  }, []);

  const escapeCsvValue = useCallback((value: string | number | null | undefined) => {
    if (value == null) return '';
    const str = String(value);
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }, []);

  const handleExport = useCallback(() => {
    const header = ['用户名', '账户类型', '时间', '来源IP', '事件类型', '状态'];
    const rows = [
      header.map(escapeCsvValue).join(','),
      ...safeItems.map(log => ([
        log.username ?? '',
        log.account_type ?? '',
        log.timestamp ?? '',
        log.source_ip ?? '',
        log.event_type ?? '',
        log.status ?? '',
      ].map(escapeCsvValue).join(',')))
    ];
    const csvContent = rows.join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `login-audit-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [safeItems, escapeCsvValue]);

  const paginationPages = useMemo<(number | 'ellipsis')[]>(() => {
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
    return pages;
  }, [currentPage, totalPages]);

  if (loading && safeItems.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <AlertCircle size={48} className="text-rose-500 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400 mb-4">加载失败: {error.message}</p>
            <CyberButton onClick={refetch}>
              重试
            </CyberButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-lg p-5 border border-slate-200 dark:border-slate-700 relative overflow-hidden group">
          <div className="absolute inset-0 bg-cyan-400/5 dark:bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm text-slate-600 dark:text-cyan-400 font-medium tracking-wide">日志条数</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-cyan-200 mt-2 font-mono">{totalCount}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-500/10 dark:bg-cyan-500/20 rounded-lg flex items-center justify-center border border-cyan-200 dark:border-cyan-500/30">
              <Shield className="text-cyan-600 dark:text-cyan-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-lg p-5 border border-slate-200 dark:border-rose-500/30 relative overflow-hidden group">
          <div className="absolute inset-0 bg-rose-400/5 dark:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm text-slate-600 dark:text-rose-400 font-medium tracking-wide">失败次数</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-rose-200 mt-2 font-mono">{failureCount}</p>
            </div>
            <div className="w-12 h-12 bg-rose-500/10 dark:bg-rose-500/20 rounded-lg flex items-center justify-center border border-rose-200 dark:border-rose-500/30">
              <XCircle className="text-rose-600 dark:text-rose-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-lg p-5 border border-slate-200 dark:border-purple-500/30 relative overflow-hidden group">
          <div className="absolute inset-0 bg-purple-400/5 dark:bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm text-slate-600 dark:text-purple-400 font-medium tracking-wide">异常次数</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-purple-200 mt-2 font-mono">{abnormalCount}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-200 dark:border-purple-500/30">
              <AlertCircle className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-lg p-5 border border-slate-200 dark:border-emerald-500/30 relative overflow-hidden group">
          <div className="absolute inset-0 bg-emerald-400/5 dark:bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm text-slate-600 dark:text-emerald-400 font-medium tracking-wide">成功次数</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-emerald-200 mt-2 font-mono">{successCount}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-200 dark:border-emerald-500/30">
              <CheckCircle className="text-emerald-600 dark:text-emerald-400" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-white dark:rounded-none dark:border-0 dark:bg-slate-950/30 dark:backdrop-blur-sm">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
            <CyberButton onClick={handleExport} className="shadow-lg shadow-cyan-500/20 group">
              <Download className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              导出日志
            </CyberButton>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input
                type="text"
                placeholder="搜索IP地址..."
                value={uiFilters.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:focus:ring-cyan-500 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>

            <div className="flex flex-wrap gap-4 w-full md:w-auto">
              <Select
                value={uiFilters.status || 'all'}
                onValueChange={(value) => handleStatusChange(value as 'all' | 'success' | 'failure')}
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

              <Select
                value={uiFilters.event_type || 'all'}
                onValueChange={(value) => handleEventTypeChange(value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="全部事件" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部事件</SelectItem>
                  <SelectItem value="login">登录</SelectItem>
                  <SelectItem value="logout">登出</SelectItem>
                  <SelectItem value="refresh">刷新</SelectItem>
                  <SelectItem value="register">注册</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={uiFilters.account_type || 'all'}
                onValueChange={(value) => handleAccountTypeChange(value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="全部账户类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部账户类型</SelectItem>
                  <SelectItem value="admin">管理员</SelectItem>
                  <SelectItem value="operator">运营</SelectItem>
                  <SelectItem value="analyst">分析师</SelectItem>
                  <SelectItem value="api">API账号</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

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
              {safeItems.length === 0 ? (
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
                safeItems.map((log) => (
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
                            log.account_type === 'admin' ? 'bg-purple-500 dark:bg-purple-600' :
                            log.account_type === 'operator' ? 'bg-blue-500 dark:bg-blue-600' :
                            log.account_type === 'analyst' ? 'bg-emerald-500 dark:bg-emerald-600' :
                            'bg-gray-500 dark:bg-slate-600'
                          }`}>
                            {log.username ? String(log.username).charAt(0) : '?'}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">{String(log.username || 'Unknown')}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">{String(log.user_id || '-')}</div>
                            <div className="text-xs mt-0.5">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${
                                log.account_type === 'admin' || log.account_type === 'superadmin' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20' :
                                log.account_type === 'operator' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20' :
                                log.account_type === 'analyst' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20' :
                                'bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                              }`}>
                                {getRoleDisplayName(log.account_type as string | null | undefined)}
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
                            {log.geo_location || '-'}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-500 font-mono">{log.source_ip || '-'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors font-normal dark:font-light">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-slate-900 dark:text-slate-200">{log.event_type || '-'}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{getEventTypeLabel(log.event_type as string | null | undefined)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors font-normal dark:font-light">
                        {normalizeStatus(log.status) === 'success' ? (
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
                                <div className="flex flex-col gap-1 text-sm group/row hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1 rounded transition-colors">
                                  <span className="text-slate-600 dark:text-slate-400">User Agent:</span>
                                  <span className="text-slate-900 dark:text-slate-200 font-mono text-xs break-all leading-relaxed">{log.user_agent || '-'}</span>
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
                                  <span className="text-slate-600 dark:text-slate-400">原始时间戳:</span>
                                  <span className="text-slate-900 dark:text-slate-200 font-mono text-xs">{log.timestamp || '-'}</span>
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

        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
            <span>共 {totalCount} 条</span>
            <div className="flex items-center gap-1">
              <span>每页</span>
              <Select
                value={filters.size?.toString() || '20'}
                onValueChange={(val) => handleSizeChange(parseInt(val, 10))}
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
                    onClick={(e) => { e.preventDefault(); if (hasPrevPage) handlePageChange(currentPage - 1); }}
                    aria-disabled={!hasPrevPage}
                    className={!hasPrevPage ? "opacity-50 pointer-events-none" : "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"}
                  />
                </PaginationItem>

                {paginationPages.map((p, i) => (
                  <PaginationItem key={i}>
                    {p === 'ellipsis' ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        isActive={currentPage === p}
                        onClick={(e) => { e.preventDefault(); handlePageChange(p as number); }}
                        className={currentPage === p ? "bg-cyan-500 text-white hover:bg-cyan-600 cursor-pointer" : "hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"}
                      >
                        {p}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={(e) => { e.preventDefault(); if (hasNextPage) handlePageChange(currentPage + 1); }}
                    aria-disabled={!hasNextPage}
                    className={!hasNextPage ? "opacity-50 pointer-events-none" : "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"}
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
