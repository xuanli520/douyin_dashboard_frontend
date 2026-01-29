/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // Auth routes: /api/auth/* -> http://.../auth/* (No /api prefix on backend)
      {
        source: '/api/auth/:path*',
        destination: 'http://100.77.18.82:8000/auth/:path*',
      },
      // Other routes (Admin, etc.): /api/* -> http://.../api/* (Keep /api prefix)
      {
        source: '/api/:path*',
        destination: 'http://100.77.18.82:8000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
