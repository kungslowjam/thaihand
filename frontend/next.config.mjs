/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "profile.line-scdn.net",
      "lh3.googleusercontent.com",
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
};

export default nextConfig;
