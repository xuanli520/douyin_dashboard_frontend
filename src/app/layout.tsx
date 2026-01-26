import '../styles/index.css';
import type { Metadata } from 'next';
import { ThemeProvider } from "./providers"

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
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
