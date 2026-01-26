/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  async rewrites() {
    if (isProd) {
      return [
        {
          source: "/app",
          destination: "https://app.webbi.com",
        },
        {
          source: "/app/:path*",
          destination: "https://app.webbi.com/:path*",
        },
      ];
    }

    return [];
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
