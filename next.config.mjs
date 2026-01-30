/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // All API routes: /api/v1/* -> http://.../api/v1/*
      {
        source: '/api/v1/:path*',
        destination: 'http://100.77.18.82:8000/api/v1/:path*',
      },
    ];
  },
};

export default nextConfig;
