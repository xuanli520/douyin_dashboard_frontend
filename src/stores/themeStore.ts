import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';
type Language = 'zh' | 'en';

interface ThemeState {
  theme: Theme;
  language: Language;
  
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      language: 'zh',
      
      setTheme: (theme) => {
        set({ theme });
        // 应用主题到 document
        if (typeof window !== 'undefined') {
          if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
              ? 'dark' 
              : 'light';
            document.documentElement.classList.toggle('dark', systemTheme === 'dark');
          } else {
            document.documentElement.classList.toggle('dark', theme === 'dark');
          }
        }
      },
      
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'theme-storage',
    }
  )
);
