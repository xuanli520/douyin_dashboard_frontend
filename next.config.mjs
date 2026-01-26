/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'http://100.77.18.82:8000/auth/:path*',
      },
    ];
  },
};

export default nextConfig;
