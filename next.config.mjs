/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",

  async rewrites() {
    const apiBase = process.env.API_PROXY_TARGET;
    if (!apiBase) {
      throw new Error("API_PROXY_TARGET is required");
    }
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiBase}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
