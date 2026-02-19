import { queryKeys } from '@/lib/query/keys';
import { httpClient } from '@/lib/http/client';
import { queryClient } from '@/lib/query/client';
import { buildRefreshTokenUrl, clearTokens, normalizeTokenResponse, storeTokens } from '@/lib/auth';
import { ApiResponse } from '@/lib/http/types';
import { User, TokenResponse, LoginParams } from '@/types/user';
import { API_ENDPOINTS } from '@/config/api';

export const authService = {
  getCurrentUserQuery: () => ({
    queryKey: queryKeys.auth.user(),
    queryFn: async () => {
      const response = await httpClient.get<ApiResponse<User>>(API_ENDPOINTS.USERS_ME);
      return response.data;
    },
    retry: false,
  }),

  loginMutation: {
    mutationFn: async (credentials: LoginParams) => {
      const formData = new URLSearchParams();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);

      const response = await httpClient.post(
        API_ENDPOINTS.JWT_LOGIN,
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const tokenData = normalizeTokenResponse<TokenResponse>(response);
      storeTokens(tokenData);
      return tokenData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
  },

  logoutMutation: {
    mutationFn: async () => {
      try {
        await httpClient.post(buildRefreshTokenUrl(API_ENDPOINTS.JWT_LOGOUT));
      } catch {
      }
      clearTokens();
      return true;
    },
    onSuccess: () => {
      queryClient.clear();
    },
  },

  refreshTokenMutation: {
    mutationFn: async () => {
      const response = await httpClient.post(
        buildRefreshTokenUrl(API_ENDPOINTS.JWT_REFRESH)
      );

      const tokenData = normalizeTokenResponse<{ access_token: string; token_type: string }>(response);
      storeTokens({
        access_token: tokenData.access_token,
      });
      return tokenData;
    },
  },
};
