import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 需要登录才能访问的路由
const protectedRoutes = [
  '/dashboard',
  '/data-analysis',
  '/data-source',
  '/reports',
  '/risk-alert',
  '/task-schedule',
  '/user-permission',
  '/admin',
];

// 公开的路由（无需登录即可访问）
const publicRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 检查是否是受保护路由
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // 检查是否是公开路由
  const isPublicRoute = publicRoutes.some(route =>
    pathname.startsWith(route)
  );

  // 从 cookie 读取 token（auth_token 由登录成功后设置）
  const token = request.cookies.get('auth_token')?.value;

  // 如果访问受保护路由但没有 token，重定向到登录页
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 如果已登录用户访问登录页，跳转到仪表盘
  if (isPublicRoute && token && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 匹配所有路由除了:
     * - api (API 路由)
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (网站图标)
     * - 公开路由: /login, /register
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|register).*)',
  ],
};
