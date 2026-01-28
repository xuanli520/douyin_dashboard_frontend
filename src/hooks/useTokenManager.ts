// Token 管理 Hook - 自动刷新和状态管理
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getAccessToken, setAccessToken, clearTokens } from '@/lib/auth';
import { refreshToken } from '@/services/userService';
import { useRouter } from 'next/navigation';

// Token 有效期配置 (秒)
const ACCESS_TOKEN_EXPIRY = 1800; // 30分钟
const REFRESH_BEFORE_EXPIRY = 60 * 29; // 29分钟后刷新 (提前1分钟)

interface UseTokenManagerReturn {
  isAuthenticated: boolean;
  refreshTimer: React.MutableRefObject<NodeJS.Timeout | null>;
  startRefreshTimer: () => void;
  clearRefreshTimer: () => void;
  manualRefresh: () => Promise<void>;
}

export function useTokenManager(): UseTokenManagerReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // 检查认证状态
  useEffect(() => {
    const token = getAccessToken();
    setIsAuthenticated(!!token);
  }, []);

  // 清除定时器
  const clearRefreshTimer = useCallback(() => {
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current);
      refreshTimer.current = null;
    }
  }, []);

  // 启动自动刷新定时器
  const startRefreshTimer = useCallback(() => {
    clearRefreshTimer();

    // 检查是否已有 token
    if (!getAccessToken()) {
      return;
    }

    // 计算刷新时间 (29分钟后)
    const refreshDelay = REFRESH_BEFORE_EXPIRY * 1000;

    refreshTimer.current = setTimeout(async () => {
      try {
        await refreshToken();
        // 刷新成功后重启定时器
        startRefreshTimer();
      } catch (error) {
        // 刷新失败，清除 token 并跳转到登录页
        console.error('Token refresh failed:', error);
        clearTokens();
        setIsAuthenticated(false);
        router.push('/login?reason=session_expired');
      }
    }, refreshDelay);
  }, [clearRefreshTimer, router]);

  // 手动刷新 token
  const manualRefresh = useCallback(async () => {
    try {
      const response = await refreshToken();
      setAccessToken(response.access_token);
      // 重启定时器
      startRefreshTimer();
    } catch (error) {
      console.error('Manual token refresh failed:', error);
      throw error;
    }
  }, [startRefreshTimer]);

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      clearRefreshTimer();
    };
  }, [clearRefreshTimer]);

  return {
    isAuthenticated,
    refreshTimer,
    startRefreshTimer,
    clearRefreshTimer,
    manualRefresh,
  };
}

// 单例模式 - 用于应用级别管理 (非 React 组件)
class TokenRefreshManager {
  private static instance: TokenRefreshManager;
  private timer: NodeJS.Timeout | null = null;
  private refreshCallback: (() => Promise<void>) | null = null;

  private constructor() {}

  static getInstance(): TokenRefreshManager {
    if (!TokenRefreshManager.instance) {
      TokenRefreshManager.instance = new TokenRefreshManager();
    }
    return TokenRefreshManager.instance;
  }

  start(callback: () => Promise<void>): void {
    this.stop();
    this.refreshCallback = callback;

    const delay = REFRESH_BEFORE_EXPIRY * 1000;
    this.timer = setTimeout(async () => {
      try {
        await callback();
        // 成功后重启定时器
        this.start(callback);
      } catch (error) {
        console.error('Token refresh failed:', error);
        this.stop();
      }
    }, delay);
  }

  stop(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.refreshCallback = null;
  }

  isRunning(): boolean {
    return this.timer !== null;
  }
}

export const tokenRefreshManager = TokenRefreshManager.getInstance();
