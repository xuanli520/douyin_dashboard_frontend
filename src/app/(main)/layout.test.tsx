import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import MainLayout from '@/app/(main)/layout';
import { useThemeStore } from '@/stores/themeStore';

vi.mock('@/components/layout/Header', () => ({
  Header: () => <div data-testid="header" />,
}));

vi.mock('@/components/layout/Sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar" />,
}));

describe('MainLayout theme readiness', () => {
  beforeEach(() => {
    useThemeStore.setState({
      appTheme: 'enterprise',
      colorMode: 'system',
      isHydrated: false,
      isLoading: true,
    });
  });

  it('does not render layout content when theme is not hydrated', () => {
    const { container, queryByTestId } = render(
      <MainLayout>
        <div data-testid="content" />
      </MainLayout>
    );

    expect(container).toBeTruthy();
    expect(queryByTestId('header')).toBeNull();
    expect(queryByTestId('sidebar')).toBeNull();
    expect(queryByTestId('content')).toBeNull();
  });

  it('renders layout content after hydration', () => {
    useThemeStore.setState({
      isHydrated: true,
      isLoading: false,
      appTheme: 'enterprise',
    });

    const { getByTestId } = render(
      <MainLayout>
        <div data-testid="content" />
      </MainLayout>
    );

    expect(getByTestId('header')).toBeTruthy();
    expect(getByTestId('sidebar')).toBeTruthy();
    expect(getByTestId('content')).toBeTruthy();
  });
});
