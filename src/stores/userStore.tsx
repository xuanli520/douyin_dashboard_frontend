// 用户状态管理 (React Context + Hook)
'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { User, UserCreate, UserUpdate, LoginParams } from '@/types/user';
import * as userService from '@/services/userService';

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

  const login = useCallback(async (params: LoginParams): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await userService.login(params);
      await fetchCurrentUser();
      return true;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || '登录失败',
        isLoading: false,
      }));
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      await userService.logout();
    } catch {
      // 忽略登出错误
    } finally {
      setState({
        users: [],
        currentUser: null,
        isLoading: false,
        error: null,
        isSuperuser: false,
      });
    }
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const user = await userService.getCurrentUser();
      setState((prev) => ({
        ...prev,
        currentUser: user,
        isSuperuser: user.is_superuser,
      }));
    } catch (error: any) {
      // 未登录或令牌过期
      setState((prev) => ({
        ...prev,
        currentUser: null,
        isSuperuser: false,
      }));
    }
  }, []);

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
        setState((prev) => ({
          ...prev,
          users: [currentUser],
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

  // 初始化时获取当前用户
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

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
