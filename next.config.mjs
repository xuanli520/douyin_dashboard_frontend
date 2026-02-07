/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // All API routes: /api/v1/* -> http://.../api/v1/*
      {
        source: '/api/v1/:path*',
        destination: 'http://8.137.84.161:8000/api/v1/:path*',
      },
    ];
  },
};

export default nextConfig;
