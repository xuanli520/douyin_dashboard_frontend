// 用户状态管理 (React Context + Hook)
'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from 'react';
import type { User, UserCreate, UserUpdate, LoginParams } from '@/types/user';
import * as userService from '@/services/userService';
import { useRouter } from 'next/navigation';
import { getAccessToken, TOKEN_REFRESH_INTERVAL_MS } from '@/lib/auth';
import { useAuthStore } from './authStore';
import { initializePermissionStore, usePermissionStore } from './permissionStore';

// Token 刷新定时器引用
let refreshTimer: NodeJS.Timeout | null = null;

interface UserState {
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  isSuperuser: boolean;
}

interface UserActions {
  // 认证
  login: (params: LoginParams) => Promise<boolean>;
  logout: () => Promise<void>;

  // 用户管理
  fetchUsers: () => Promise<void>;
  createUser: (data: UserCreate) => Promise<void>;
  updateUser: (id: number, data: UserUpdate) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;

  // 当前用户
  fetchCurrentUser: () => Promise<void>;
  clearError: () => void;
}

type UserStore = UserState & UserActions;

const UserContext = createContext<UserStore | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<UserState>({
    users: [],
    currentUser: null,
    isLoading: false,
    error: null,
    isSuperuser: false,
  });

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // 清除 token 刷新定时器
  const clearRefreshTimer = useCallback(() => {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      refreshTimer = null;
    }
  }, []);

  // 启动 token 刷新定时器
  const startRefreshTimer = useCallback(() => {
    // 清除已有定时器
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }

    // 设置新的刷新定时器
    refreshTimer = setTimeout(async () => {
      try {
        await userService.refreshToken();
        // 刷新成功后重启定时器
        startRefreshTimer();
      } catch (error) {
        // 刷新失败，清除状态并跳转到登录页
        console.error('Token refresh failed:', error);
        setState({
          users: [],
          currentUser: null,
          isLoading: false,
          error: null,
          isSuperuser: false,
        });
        router.push('/login?reason=session_expired');
      }
    }, TOKEN_REFRESH_INTERVAL_MS);
  }, [router]);

  const fetchCurrentUser = useCallback(async (retryCount = 3) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retryCount; attempt++) {
      try {
        const user = await userService.getCurrentUser();
        setState((prev) => ({
          ...prev,
          currentUser: {
            ...user,
            is_active: user.is_active ?? true,
            is_superuser: user.is_superuser ?? false,
            is_verified: user.is_verified ?? false,
          } as User,
          isSuperuser: user.is_superuser ?? false,
          isLoading: false,
        }));
        return;
      } catch (error: any) {
        lastError = error;
        if (error.message?.includes('401') || error.message?.includes('未授权')) {
          setState((prev) => ({
            ...prev,
            currentUser: null,
            isSuperuser: false,
            isLoading: false,
          }));
          return;
        }
        if (attempt < retryCount - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 500));
        }
      }
    }

    console.error('Failed to fetch current user after retries:', lastError);
    setState((prev) => ({
      ...prev,
      currentUser: null,
      isSuperuser: false,
      isLoading: false,
    }));
  }, []);

  const login = useCallback(async (params: LoginParams): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await userService.login(params);
      await fetchCurrentUser();
      // 登录成功后清理权限缓存并重新获取
      usePermissionStore.getState().clearPermissions();
      await initializePermissionStore();
      // 登录成功后启动自动刷新定时器
      startRefreshTimer();
      useAuthStore.getState().initialize();
      return true;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || '登录失败',
        isLoading: false,
      }));
      return false;
    }
  }, [fetchCurrentUser, startRefreshTimer]);

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      await userService.logout();
    } catch {
      // 忽略登出错误
    } finally {
      // 清除刷新定时器
      clearRefreshTimer();
      useAuthStore.getState().setUnauthenticated();
      setState({
        users: [],
        currentUser: null,
        isLoading: false,
        error: null,
        isSuperuser: false,
      });
    }
  }, [clearRefreshTimer]);

  const fetchUsers = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      // 由于后端没有用户列表端点，我们尝试获取当前用户信息
      // 并检查是否为 superuser
      const isSuperuser = await userService.checkIsSuperuser();

      if (isSuperuser) {
        // 如果是超级管理员，尝试获取用户列表
        // 注意：后端可能没有这个端点，我们需要处理 404 或 403
        try {
          // 暂时无法获取用户列表，因为后端没有 /auth/users 端点
          // 这里设置空数组
          setState((prev) => ({
            ...prev,
            users: [],
            isLoading: false,
          }));
        } catch {
          setState((prev) => ({
            ...prev,
            users: [],
            isLoading: false,
          }));
        }
      } else {
        // 非超级管理员只能看到当前用户
        const currentUser = await userService.getCurrentUser();
        const normalizedUser: User = {
          ...currentUser,
          is_active: currentUser.is_active ?? true,
          is_superuser: currentUser.is_superuser ?? false,
          is_verified: currentUser.is_verified ?? false,
        };
        setState((prev) => ({
          ...prev,
          users: [normalizedUser],
          isLoading: false,
        }));
      }
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || '获取用户列表失败',
        isLoading: false,
      }));
    }
  }, []);

  const createUser = useCallback(async (data: UserCreate) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      // 后端可能没有创建用户端点，这里需要根据实际情况调整
      throw new Error('需要 superuser 权限');
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || '创建用户失败',
        isLoading: false,
      }));
      throw error;
    }
  }, []);

  const updateUser = useCallback(async (id: number, data: UserUpdate) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await userService.updateUser(id, data);
      await fetchUsers();
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || '更新用户失败',
        isLoading: false,
      }));
      throw error;
    }
  }, [fetchUsers]);

  const deleteUser = useCallback(async (id: number) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await userService.deleteUser(id);
      await fetchUsers();
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || '删除用户失败',
        isLoading: false,
      }));
      throw error;
    }
  }, [fetchUsers]);

  // 初始化时获取当前用户并启动刷新定时器
  useEffect(() => {
    const initializeAuth = async () => {
      useAuthStore.getState().initialize();
      const hasToken = !!getAccessToken();
      if (hasToken) {
        // 如果有 token，启动刷新定时器并获取用户信息
        startRefreshTimer();
        try {
          await fetchCurrentUser();
        } catch (error) {
          // 获取用户信息失败时继续尝试获取权限
          console.warn('Failed to fetch current user, trying to fetch permissions anyway');
        }
        // 无论用户信息是否获取成功，都尝试初始化权限（登录成功后 login() 已调用过，这里是页面刷新时）
        await initializePermissionStore();
      }
      // 如果没有 token，不尝试获取用户信息和权限（避免 401）
    };
    initializeAuth();
  }, [fetchCurrentUser, startRefreshTimer]);

  // 组件卸载时清除刷新定时器
  useEffect(() => {
    return () => {
      clearRefreshTimer();
    };
  }, [clearRefreshTimer]);

  const value: UserStore = {
    ...state,
    login,
    logout,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    fetchCurrentUser,
    clearError,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserStore() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserStore must be used within a UserProvider');
  }
  return context;
}
