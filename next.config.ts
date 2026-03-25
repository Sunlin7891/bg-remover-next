import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 允许公网访问开发服务器
  allowedDevOrigins: ['111.231.60.143', 'localhost', '127.0.0.1', '0.0.0.0'],
  
  // Cloudflare Pages 部署配置
  output: 'standalone',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
