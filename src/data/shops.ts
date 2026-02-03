import { ShopData } from '@/components/compass/ShopCard';

export const MOCK_SHOPS: Record<string, ShopData> = {
  c1: {
    id: 'c1',
    name: 'Kailas 旗舰店',
    score: 100,
    status: 'live',
    risk: 0,
    trend: [80, 85, 90, 88, 92, 95, 100],
  },
  c2: {
    id: 'c2',
    name: 'Kailas 行无疆专卖',
    score: 66,
    status: 'warning',
    risk: 15,
    trend: [60, 55, 62, 58, 65, 60, 66],
  },
  c3: {
    id: 'c3',
    name: 'Kailas 乔戈里专卖',
    score: 0,
    status: 'critical',
    risk: 0,
    trend: [20, 15, 10, 5, 2, 0, 0],
  },
  c4: {
    id: 'c4',
    name: '持恒户外专营店',
    score: 0,
    status: 'offline',
    risk: 0,
    trend: [10, 10, 10, 10, 10, 10, 10],
  },
};

export const SHOP_OPTIONS = Object.values(MOCK_SHOPS).map(shop => ({
  value: shop.id,
  label: shop.name,
}));
