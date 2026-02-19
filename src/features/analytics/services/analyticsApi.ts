import { API_ENDPOINTS } from '@/config/api';
import { httpClient } from '@/lib/http/client';
import { ApiResponse } from '@/lib/http/types';

export const analyticsApi = {
  getOverview: async (): Promise<ApiResponse<Record<string, unknown>>> => {
    return httpClient.get<ApiResponse<Record<string, unknown>>>(API_ENDPOINTS.ANALYSIS_OVERVIEW);
  },
};
