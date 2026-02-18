import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppTheme = 'enterprise' | 'cyberpunk';
export type ColorMode = 'light' | 'dark' | 'system';

interface ThemeState {
  appTheme: AppTheme;
  colorMode: ColorMode;
  isHydrated: boolean;
  isLoading: boolean;
  setHydrated: (hydrated: boolean) => void;
  setAppTheme: (theme: AppTheme) => void;
  setColorMode: (mode: ColorMode) => void;
  toggleEasterEgg: () => void;
  isEnterprise: () => boolean;
  isCyberpunk: () => boolean;
}

const resolveColorMode = (colorMode: ColorMode) => {
  if (colorMode === 'system') {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }
  return colorMode;
};

const applyThemeToDOM = (appTheme: AppTheme, colorMode: ColorMode) => {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  root.setAttribute('data-theme', appTheme);
  const resolved = resolveColorMode(colorMode);
  root.classList.toggle('dark', resolved === 'dark');
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      appTheme: 'enterprise',
      colorMode: 'system',
      isHydrated: false,
      isLoading: true,
      setHydrated: (hydrated) => set({ isHydrated: hydrated, isLoading: !hydrated }),

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
      partialize: (state) => ({ appTheme: state.appTheme, colorMode: state.colorMode }),
      onRehydrateStorage: () => () => {
        const state = useThemeStore.getState();
        state.setHydrated(true);
        applyThemeToDOM(state.appTheme, state.colorMode);
      },
    }
  )
);

export const initializeTheme = () => {
  const state = useThemeStore.getState();
  applyThemeToDOM(state.appTheme, state.colorMode);
};
