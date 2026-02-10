import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RouteGuard } from '../RouteGuard';
import * as permissionStore from '@/stores/permissionStore';
import * as authStore from '@/stores/authStore';

vi.mock('@/stores/permissionStore');
vi.mock('@/stores/authStore');

describe('RouteGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children when authorized', async () => {
    (authStore.useAuthStore as vi.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });
    (permissionStore.usePermissionStore as vi.Mock).mockReturnValue({
      checkAllPermissions: vi.fn(() => true),
      checkRole: vi.fn(() => true),
      isSuperuser: false,
    });

    render(
      <RouteGuard config={{ route: '/test', requiredPermissions: ['read:test'] }}>
        <button>Authorized Content</button>
      </RouteGuard>
    );

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  it('should redirect when not authenticated', async () => {
    const replaceMock = vi.fn();
    (authStore.useAuthStore as vi.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    render(
      <RouteGuard config={{ route: '/test', requiredPermissions: ['read:test'] }}>
        <button>Content</button>
      </RouteGuard>
    );

    await waitFor(() => {
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  it('should render fallback when not authorized', async () => {
    (authStore.useAuthStore as vi.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });
    (permissionStore.usePermissionStore as vi.Mock).mockReturnValue({
      checkAllPermissions: vi.fn(() => false),
      checkRole: vi.fn(() => false),
      isSuperuser: false,
    });

    render(
      <RouteGuard
        config={{ route: '/test', requiredPermissions: ['read:test'] }}
        fallback={<span>Access Denied</span>}
      >
        <button>Content</button>
      </RouteGuard>
    );

    await waitFor(() => {
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });
  });
});
