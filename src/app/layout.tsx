import '../styles/index.css';
import type { Metadata } from 'next';
import { Providers } from "./providers"
import { ErrorBoundary } from '@/lib/error/boundary';
import { UserProvider } from '@/stores/userStore';

export const metadata: Metadata = {
  title: 'Douyin Frontend',
  description: 'Data Analysis and Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ErrorBoundary>
          <Providers>
            <UserProvider>
              {children}
            </UserProvider>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
