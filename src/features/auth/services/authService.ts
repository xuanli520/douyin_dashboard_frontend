import { queryKeys } from '@/lib/query/keys';
import { httpClient } from '@/lib/http/client';
import { queryClient } from '@/lib/query/client';
import { storeTokens, clearTokens, getRefreshToken, setAccessToken } from '@/lib/auth';
import { ApiResponse } from '@/lib/http/types';
import { User, TokenResponse, LoginParams } from '@/types/user';
import { API_ENDPOINTS } from '@/config/api';

export const authService = {
  // 当前用户查询
  getCurrentUserQuery: () => ({
    queryKey: queryKeys.auth.user(),
    queryFn: async () => {
      const response = await httpClient.get<ApiResponse<User>>(API_ENDPOINTS.USERS_ME);
      return response.data;
    },
    retry: false,
  }),
  
  // 登录
  loginMutation: {
    mutationFn: async (credentials: LoginParams) => {
      const formData = new URLSearchParams();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);
      
      const response = await httpClient.post<TokenResponse>(
        API_ENDPOINTS.JWT_LOGIN,
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      
      storeTokens({
        access_token: response.access_token,
        refresh_token: response.refresh_token,
      });
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
  },
  
  // 登出
  logoutMutation: {
    mutationFn: async () => {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          await httpClient.post(
            `${API_ENDPOINTS.JWT_LOGOUT}?refresh_token=${encodeURIComponent(refreshToken)}`
          );
        } catch {
          // 忽略登出错误
        }
      }
      clearTokens();
      return true;
    },
    onSuccess: () => {
      queryClient.clear();
    },
  },
  
  // 刷新 Token
  refreshTokenMutation: {
    mutationFn: async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token');
      }
      
      const response = await httpClient.post<{ access_token: string; token_type: string }>(
        `${API_ENDPOINTS.JWT_REFRESH}?refresh_token=${encodeURIComponent(refreshToken)}`
      );
      
      storeTokens({
        access_token: response.access_token,
      });
      return response;
    },
  },
};
