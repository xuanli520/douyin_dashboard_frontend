import { DataCenterResponse } from '@/types/data-center';

const BASE_PATH = '/api/v1/data-center';

export const dataCenterService = {
  /**
   * 获取数据中控台全量数据
   * @param timeRange 'today' | 'week' | 'month'
   * @param shopId 店铺ID，可选
   */
  async getDashboardData(timeRange: string = 'today', shopId?: string): Promise<DataCenterResponse> {
    const params: Record<string, string> = { timeRange };
    if (shopId && shopId !== '全部店铺') {
      params.shopId = shopId;
    }

    // Backend integration hook:
    // return http.get<DataCenterResponse>(`${BASE_PATH}/dashboard`, { params });

    // For now, we simulate an API call resolving after 500ms
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          updateTime: '2023-07-05 18:19:00',
          metrics: {
            comprehensiveScore: { title: '综合评分', value: 96.8, change: 0.6, trend: [] },
            productExperience: { title: '商品体验分', value: 97.2, change: 0.8, trend: [] },
            logisticsExperience: { title: '物流体验分', value: 95.6, change: -0.3, trend: [] },
            serviceExperience: { title: '服务体验分', value: 96.4, change: 0.5, trend: [] },
            negativeReviewRisk: { title: '差评风险', value: 1.8, change: -0.4, trend: [] }
          },
          summary: {
            monitoredShops: 128,
            dataCoverage: 98.6
          },
          charts: {
            trend: [],
            radar: [],
            rank: [],
            scoreDistribution: [],
            problemDistribution: []
          }
        } as unknown as DataCenterResponse);
      }, 500);
    });
  },

  /**
   * 获取可用的店铺列表
   */
  async getAvailableShops(): Promise<string[]> {
    // return http.get<string[]>(`${BASE_PATH}/shops`);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(['全部店铺', '旗舰店A', '专营店B', '授权店C']);
      }, 200);
    });
  }
};
