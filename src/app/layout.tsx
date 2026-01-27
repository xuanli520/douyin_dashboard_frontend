import '../styles/index.css';
import type { Metadata } from 'next';
import { ThemeProvider } from "./providers"
import { UserProvider } from '@/stores/userStore';
import { Toaster } from '@/app/components/ui/sonner';

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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider>
            {children}
          </UserProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
