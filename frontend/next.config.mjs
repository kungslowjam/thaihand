/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "profile.line-scdn.net",
      "lh3.googleusercontent.com",
      "abhprxkswysntmerxklb.supabase.co",
      // เพิ่ม domain อื่นๆ ที่ต้องการโหลดรูปได้ที่นี่
    ],
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', port: '', pathname: '/**', },
      { protocol: 'https', hostname: 'profile.line-scdn.net', port: '', pathname: '/**', },
      { protocol: 'https', hostname: 'abhprxkswysntmerxklb.supabase.co', port: '', pathname: '/**', },
    ],
    unoptimized: true, // เปลี่ยนเป็น true เพื่อปิด Image Optimization
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable static generation for problematic pages
  trailingSlash: false,
  // Production optimizations
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  // CSS handling
  sassOptions: {},
  // Static file handling
  assetPrefix: '',
  basePath: '',
  async rewrites() {
    return [
      // NextAuth endpoints ทำงานที่ frontend (ไม่ proxy)
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
      // API อื่นๆ proxy ไป backend
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'development' 
          ? 'http://localhost:8000/api/:path*'
          : 'https://thaihand.shop/api/:path*',
      },
    ]
  },
  // Handle build errors gracefully
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig;
