/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "profile.line-scdn.net",
      "lh3.googleusercontent.com",
      "abhprxkswysntmerxklb.supabase.co",
      // เพิ่ม domain อื่นๆ ที่ต้องการโหลดรูปได้ที่นี่
    ],
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
  cssModules: false,
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
        destination: process.env.NEXT_PUBLIC_API_URL
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`
          : 'http://localhost:8000/api/:path*',
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
