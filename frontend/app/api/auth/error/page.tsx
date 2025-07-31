"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const error = searchParams.get('error')
    const message = searchParams.get('message') || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'

    // Redirect ไปหน้า login พร้อม error message
    const loginUrl = `/login?error=oauth_error&message=${encodeURIComponent(message)}`
    router.replace(loginUrl)
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">กำลัง redirect...</p>
      </div>
    </div>
  )
} 