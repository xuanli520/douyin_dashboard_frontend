/**
 * 双主题状态管理
 * 支持企业主题(默认)和赛博朋克彩蛋主题
 * 企业主题：只有亮色模式
 * 赛博朋克主题：支持暗/亮模式切换
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AppTheme = 'enterprise' | 'cyberpunk';

interface ThemeState {
  // 主题类型
  appTheme: AppTheme;
  // 暗/亮模式（仅赛博朋克主题有效）
  colorMode: 'light' | 'dark' | 'system';
  // 是否正在加载（等待持久化恢复）
  isLoading: boolean;

  // Actions
  setAppTheme: (theme: AppTheme) => void;
  setColorMode: (mode: 'light' | 'dark' | 'system') => void;
  toggleEasterEgg: () => void;
  isEnterprise: () => boolean;
  isCyberpunk: () => boolean;
}

// 应用主题到DOM
const applyThemeToDOM = (appTheme: AppTheme, colorMode: 'light' | 'dark' | 'system') => {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  
  // 设置应用主题属性
  root.setAttribute('data-theme', appTheme);
  
  // 处理暗/亮模式
  if (appTheme === 'enterprise') {
    // 企业主题：强制亮色模式
    root.classList.remove('dark');
  } else {
    // 赛博朋克主题：根据colorMode设置
    let isDark = false;
    
    if (colorMode === 'system') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      isDark = colorMode === 'dark';
    }
    
    root.classList.toggle('dark', isDark);
  }
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      appTheme: 'enterprise',
      colorMode: 'system',
      isLoading: true,

      setAppTheme: (appTheme) => {
        set({ appTheme });
        applyThemeToDOM(appTheme, get().colorMode);
      },

      setColorMode: (colorMode) => {
        set({ colorMode });
        applyThemeToDOM(get().appTheme, colorMode);
      },

      toggleEasterEgg: () => {
        const currentTheme = get().appTheme;
        const newTheme = currentTheme === 'enterprise' ? 'cyberpunk' : 'enterprise';
        set({ appTheme: newTheme });
        applyThemeToDOM(newTheme, get().colorMode);
      },

      isEnterprise: () => get().appTheme === 'enterprise',
      isCyberpunk: () => get().appTheme === 'cyberpunk',
    }),
    {
      name: 'app-theme-storage',
      onRehydrateStorage: () => (state) => {
        // 持久化恢复后应用主题
        if (state) {
          state.isLoading = false;
          applyThemeToDOM(state.appTheme, state.colorMode);
        }
      },
    }
  )
);

// 初始化主题（用于应用启动时）
export const initializeTheme = () => {
  if (typeof window === 'undefined') return;
  
  const stored = localStorage.getItem('app-theme-storage');
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      if (state) {
        applyThemeToDOM(state.appTheme, state.colorMode);
      }
    } catch {
      // 解析失败时使用默认主题
      applyThemeToDOM('enterprise', 'system');
    }
  } else {
    // 首次访问，使用默认企业主题
    applyThemeToDOM('enterprise', 'system');
  }
};
