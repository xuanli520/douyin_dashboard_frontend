# Theme System Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 统一企业/赛博主题与日夜模式的唯一状态源，移除 next-themes，实现高可用、易维护、可扩展的主题系统。

**Architecture:** 使用 Zustand 作为唯一主题状态源，通过 `data-theme` 控制主题族（enterprise/cyberpunk），通过 `class="dark"` 控制颜色模式；由 `ThemeInit` 负责 rehydrate、DOM 同步与系统主题监听，所有 UI 只读 store 状态。

**Tech Stack:** Next.js, React, Zustand(persist), Vitest, Tailwind CSS

## 方案选择
- 方案 A：以 Zustand 为唯一主题源，移除 next-themes，DOM 同步由 ThemeInit 统一处理（推荐）


### Task 1: 主题状态最小可测用例

**Files:**
- Create: `src/stores/__tests__/themeStore.test.ts`
- Modify: `src/stores/themeStore.ts`

**Step 1: Write the failing test**

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useThemeStore } from '@/stores/themeStore';

describe('themeStore', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark');
    useThemeStore.setState({
      appTheme: 'enterprise',
      colorMode: 'system',
      isHydrated: false,
    }, true);
  });

  it('forces light mode for enterprise', () => {
    useThemeStore.getState().setAppTheme('enterprise');
    useThemeStore.getState().setColorMode('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('enterprise');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('applies dark mode for cyberpunk', () => {
    useThemeStore.getState().setAppTheme('cyberpunk');
    useThemeStore.getState().setColorMode('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('cyberpunk');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('uses system mode when colorMode=system', () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    useThemeStore.getState().setAppTheme('cyberpunk');
    useThemeStore.getState().setColorMode('system');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/stores/__tests__/themeStore.test.ts`
Expected: FAIL (actions/DOM 同步未按预期)

**Step 3: Write minimal implementation**

```ts
type AppTheme = 'enterprise' | 'cyberpunk';
type ColorMode = 'light' | 'dark' | 'system';

type ThemeState = {
  appTheme: AppTheme;
  colorMode: ColorMode;
  isHydrated: boolean;
  setAppTheme: (theme: AppTheme) => void;
  setColorMode: (mode: ColorMode) => void;
  toggleEasterEgg: () => void;
  setHydrated: (hydrated: boolean) => void;
};

const resolveColorMode = (appTheme: AppTheme, colorMode: ColorMode) => {
  if (appTheme === 'enterprise') return 'light';
  if (colorMode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return colorMode;
};

const applyThemeToDOM = (appTheme: AppTheme, colorMode: ColorMode) => {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', appTheme);
  const resolved = resolveColorMode(appTheme, colorMode);
  root.classList.toggle('dark', resolved === 'dark');
};
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/stores/__tests__/themeStore.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/stores/__tests__/themeStore.test.ts src/stores/themeStore.ts
git commit -m "test: add themeStore DOM sync coverage"
```

### Task 2: 主题状态单一真值与持久化修复

**Files:**
- Modify: `src/stores/themeStore.ts`

**Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { useThemeStore } from '@/stores/themeStore';

describe('themeStore hydration', () => {
  it('sets isHydrated true after rehydrate', async () => {
    useThemeStore.setState({ isHydrated: false }, false);
    await useThemeStore.persist.rehydrate();
    expect(useThemeStore.getState().isHydrated).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/stores/__tests__/themeStore.test.ts`
Expected: FAIL (`isHydrated` 未正确更新)

**Step 3: Write minimal implementation**

```ts
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      appTheme: 'enterprise',
      colorMode: 'system',
      isHydrated: false,
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
      setAppTheme: (appTheme) => {
        set({ appTheme });
        applyThemeToDOM(appTheme, get().colorMode);
      },
      setColorMode: (colorMode) => {
        set({ colorMode });
        applyThemeToDOM(get().appTheme, colorMode);
      },
      toggleEasterEgg: () => {
        const next = get().appTheme === 'enterprise' ? 'cyberpunk' : 'enterprise';
        set({ appTheme: next });
        applyThemeToDOM(next, get().colorMode);
      },
    }),
    {
      name: 'app-theme-storage',
      onRehydrateStorage: () => () => {
        useThemeStore.getState().setHydrated(true);
        applyThemeToDOM(useThemeStore.getState().appTheme, useThemeStore.getState().colorMode);
      },
    }
  )
);
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/stores/__tests__/themeStore.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/stores/themeStore.ts
git commit -m "fix: unify theme state and hydration"
```

### Task 3: ThemeInit 统一 rehydrate 与系统模式监听

**Files:**
- Modify: `src/components/ThemeInit.tsx`
- Create: `src/components/__tests__/ThemeInit.test.tsx`

**Step 1: Write the failing test**

```ts
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeInit } from '@/components/ThemeInit';
import { useThemeStore } from '@/stores/themeStore';

describe('ThemeInit', () => {
  it('rehydrates and applies theme on mount', async () => {
    useThemeStore.setState({ appTheme: 'cyberpunk', colorMode: 'dark', isHydrated: false }, true);
    render(<ThemeInit />);
    expect(document.documentElement.getAttribute('data-theme')).toBe('cyberpunk');
  });

  it('listens to system theme when colorMode=system', () => {
    const add = vi.fn();
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: add,
      removeEventListener: vi.fn(),
    }));
    useThemeStore.setState({ appTheme: 'cyberpunk', colorMode: 'system', isHydrated: true }, true);
    render(<ThemeInit />);
    expect(add).toHaveBeenCalled();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/components/__tests__/ThemeInit.test.tsx`
Expected: FAIL (组件未实现 rehydrate/监听)

**Step 3: Write minimal implementation**

```tsx
'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/stores/themeStore';

export function ThemeInit() {
  const { appTheme, colorMode } = useThemeStore();

  useEffect(() => {
    useThemeStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const state = useThemeStore.getState();
      state.setAppTheme(state.appTheme);
    };
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [appTheme, colorMode]);

  return null;
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/components/__tests__/ThemeInit.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/ThemeInit.tsx src/components/__tests__/ThemeInit.test.tsx
git commit -m "feat: centralize theme rehydrate and system listener"
```

### Task 4: 移除 next-themes 依赖与替换使用点

**Files:**
- Modify: `src/app/providers.tsx`
- Modify: `src/app/components/ui/sonner.tsx`
- Modify: `src/app/(main)/dashboard/page.tsx`
- Modify: `src/app/(main)/compass/page.tsx`
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/app/components/ui/sonner.test.tsx`

**Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Toaster } from '@/app/components/ui/sonner';

describe('Toaster theme', () => {
  it('renders without next-themes provider', () => {
    const { container } = render(<Toaster />);
    expect(container.querySelector('.toaster')).toBeTruthy();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/app/components/ui/sonner.test.tsx`
Expected: FAIL (`useTheme` 依赖 next-themes)

**Step 3: Write minimal implementation**

```tsx
import { useThemeStore } from '@/stores/themeStore';

const Toaster = ({ ...props }: ToasterProps) => {
  const { appTheme, colorMode } = useThemeStore();
  const theme = appTheme === 'enterprise' ? 'light' : colorMode;
  return (
    <Sonner theme={theme as ToasterProps['theme']} className="toaster group" {...props} />
  );
};
```

```tsx
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-center" richColors closeButton duration={4000} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

```diff
-    "next-themes": "0.4.6",
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/app/components/ui/sonner.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/providers.tsx src/app/components/ui/sonner.tsx src/app/components/ui/sonner.test.tsx package.json package-lock.json
git commit -m "refactor: remove next-themes and use themeStore"
```

### Task 5: 页面与布局统一使用主题 store

**Files:**
- Modify: `src/app/(main)/dashboard/page.tsx`
- Modify: `src/app/(main)/compass/page.tsx`
- Modify: `src/app/(main)/layout.tsx`
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `src/app/components/SystemSettingsPage.tsx`
- Create: `src/app/(main)/layout.test.tsx`

**Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import MainLayout from '@/app/(main)/layout';

describe('MainLayout theme readiness', () => {
  it('renders without hydration mismatch when theme is not ready', () => {
    const { container } = render(<MainLayout><div /></MainLayout>);
    expect(container).toBeTruthy();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/app/(main)/layout.test.tsx`
Expected: FAIL (isLoading/isHydrated 逻辑未统一)

**Step 3: Write minimal implementation**

```tsx
const { isHydrated, isEnterprise } = useThemeStore();
if (!isHydrated) {
  return <div className="flex h-screen bg-[#f8fafc]" />;
}
```

```tsx
const { appTheme } = useThemeStore();
```

```diff
- import { useTheme } from 'next-themes';
- const { theme, setTheme } = useTheme();
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/app/(main)/layout.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/(main)/layout.tsx src/components/layout/Header.tsx src/components/layout/Sidebar.tsx src/app/components/SystemSettingsPage.tsx src/app/(main)/dashboard/page.tsx src/app/(main)/compass/page.tsx src/app/(main)/layout.test.tsx
git commit -m "refactor: unify theme store usage across layout"
```
