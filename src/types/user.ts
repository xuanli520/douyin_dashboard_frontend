// 用户相关类型定义

export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  gender?: string;
  department?: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
  phone?: string;
  gender?: string;
  department?: string;
}

export interface UserUpdate {
  username?: string;
  email?: string;
  password?: string;
  phone?: string;
  gender?: string;
  department?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  is_verified?: boolean;
}

export interface UserUpdateMe {
  username?: string;
  email?: string;
  password?: string;
  phone?: string;
  gender?: string;
  department?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginParams {
  username: string;
  password: string;
}

export interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  page_size: number;
}
