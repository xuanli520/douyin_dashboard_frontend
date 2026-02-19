/**
 * 枚举值汉化映射工具
 * 用于将英文枚举值转换为中文显示
 */

import type {
  DataSourceType,
  DataSourceStatus,
  TargetType,
  ScrapingRuleStatus,
  ImportStatus,
} from '@/types';

// 数据源类型映射
export const dataSourceTypeMap: Record<DataSourceType, string> = {
  DOUYIN_API: '抖音API',
  DOUYIN_SHOP: '抖音小店',
  DOUYIN_APP: '抖音应用',
  FILE_IMPORT: '文件导入',
  FILE_UPLOAD: '文件上传',
  SELF_HOSTED: '自主托管',
};

// 数据源状态映射
export const dataSourceStatusMap: Record<DataSourceStatus, string> = {
  ACTIVE: '已激活',
  INACTIVE: '未激活',
  ERROR: '错误',
};

// 采集目标类型映射
export const targetTypeMap: Record<TargetType, string> = {
  SHOP_OVERVIEW: '店铺概览',
  TRAFFIC: '流量分析',
  PRODUCT: '商品分析',
  LIVE: '直播分析',
  CONTENT_VIDEO: '视频内容',
  ORDER_FULFILLMENT: '订单履约',
  AFTERSALE_REFUND: '售后退款',
  CUSTOMER: '客户分析',
  ADS: '广告投放',
};

// 采集规则状态映射
export const scrapingRuleStatusMap: Record<ScrapingRuleStatus, string> = {
  ACTIVE: '已激活',
  INACTIVE: '未激活',
};

// 导入状态映射
export const importStatusMap: Record<ImportStatus, string> = {
  PENDING: '待处理',
  PROCESSING: '处理中',
  SUCCESS: '成功',
  FAILED: '失败',
  PARTIAL: '部分成功',
  CANCELLED: '已取消',
  VALIDATION_FAILED: '验证失败',
};

// 获取数据源类型中文名
export function getDataSourceTypeLabel(type: DataSourceType): string {
  return dataSourceTypeMap[type] || type;
}

// 获取数据源状态中文名
export function getDataSourceStatusLabel(status: DataSourceStatus): string {
  return dataSourceStatusMap[status] || status;
}

// 获取采集目标类型中文名
export function getTargetTypeLabel(type: TargetType): string {
  return targetTypeMap[type] || type;
}

// 获取采集规则状态中文名
export function getScrapingRuleStatusLabel(status: ScrapingRuleStatus): string {
  return scrapingRuleStatusMap[status] || status;
}

// 获取导入状态中文名
export function getImportStatusLabel(status: ImportStatus): string {
  return importStatusMap[status] || status;
}
