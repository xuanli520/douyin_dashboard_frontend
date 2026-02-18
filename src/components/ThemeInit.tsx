/**
 * 主题初始化组件
 * 在应用启动时初始化主题设置
 */

'use client';

import { useEffect } from 'react';
import { initializeTheme } from '@/stores/themeStore';

export function ThemeInit() {
  useEffect(() => {
    // 初始化主题
    initializeTheme();
  }, []);

  // 这个组件不渲染任何内容
  return null;
}
