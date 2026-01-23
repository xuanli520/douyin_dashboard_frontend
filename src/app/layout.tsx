import '../styles/index.css';
import type { Metadata } from 'next';

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
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
