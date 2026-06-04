import type { NextConfig } from "next";

const apiUrl = process.env.API_URL;

if (!apiUrl) {
  throw new Error("API_URL 환경변수가 설정되지 않았습니다.");
}

const nextConfig: NextConfig = {
  trailingSlash: false,
  poweredByHeader: false,

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },

  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 640],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pickz.co.kr",
      },
    ],
  },

  experimental: {
    optimizePackageImports: ["zustand"],
  },
};

export default nextConfig;
