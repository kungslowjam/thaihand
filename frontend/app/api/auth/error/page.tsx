"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThaiHandLogo } from "@/components/thai-hand-logo"
import Link from "next/link"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const message = searchParams.get('message')

  const getErrorMessage = () => {
    switch (error) {
      case 'OAuthSignin':
        return 'เกิดข้อผิดพลาดในการเริ่มต้น OAuth กรุณาตรวจสอบ LINE Client ID และ Secret'
      case 'OAuthCallback':
        return 'เกิดข้อผิดพลาดในการ callback กรุณาลองใหม่อีกครั้ง'
      case 'OAuthCreateAccount':
        return 'เกิดข้อผิดพลาดในการสร้างบัญชี'
      case 'EmailCreateAccount':
        return 'เกิดข้อผิดพลาดในการสร้างบัญชีด้วยอีเมล'
      case 'Callback':
        return 'เกิดข้อผิดพลาดในการ callback'
      case 'OAuthAccountNotLinked':
        return 'บัญชีนี้เชื่อมต่อกับ provider อื่นแล้ว'
      case 'EmailSignin':
        return 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วยอีเมล'
      case 'CredentialsSignin':
        return 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย credentials'
      case 'SessionRequired':
        return 'กรุณาเข้าสู่ระบบก่อน'
      default:
        return message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200">
      <div className="w-full max-w-lg p-6">
        <div className="rounded-3xl shadow-2xl bg-white/70 backdrop-blur-md px-8 py-10 flex flex-col items-center border border-white/40">
          <div className="mb-8 flex flex-col items-center">
            <ThaiHandLogo className="h-14 w-14 mb-2 drop-shadow" />
            <span className="text-4xl font-extrabold text-gray-900 tracking-tight">ฝากซื้อไทย</span>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">เกิดข้อผิดพลาด</h1>
            <p className="text-gray-700 mb-4">{getErrorMessage()}</p>
            <p className="text-sm text-gray-500">รหัสข้อผิดพลาด: {error}</p>
          </div>

          <div className="flex flex-col gap-4 w-full">
            <Link href="/login">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                กลับไปหน้าเข้าสู่ระบบ
              </Button>
            </Link>
            
            <Link href="/">
              <Button variant="outline" className="w-full">
                กลับหน้าหลัก
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 