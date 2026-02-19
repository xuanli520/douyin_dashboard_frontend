import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useThemeStore } from '@/stores/themeStore';

describe('themeStore', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark');
    useThemeStore.setState({
      appTheme: 'enterprise',
      colorMode: 'system',
      isHydrated: false,
    });
  });

  it('applies dark mode for enterprise', () => {
    useThemeStore.getState().setAppTheme('enterprise');
    useThemeStore.getState().setColorMode('dark');

    expect(document.documentElement.getAttribute('data-theme')).toBe('enterprise');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('applies dark mode for cyberpunk', () => {
    useThemeStore.getState().setAppTheme('cyberpunk');
    useThemeStore.getState().setColorMode('dark');

    expect(document.documentElement.getAttribute('data-theme')).toBe('cyberpunk');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('uses system mode when colorMode=system', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: true,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
    );

    useThemeStore.getState().setAppTheme('enterprise');
    useThemeStore.getState().setColorMode('system');

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});

describe('themeStore hydration', () => {
  it('sets isHydrated true after rehydrate', async () => {
    useThemeStore.setState({ isHydrated: false });
    await useThemeStore.persist.rehydrate();
    expect(useThemeStore.getState().isHydrated).toBe(true);
  });
});
