"use client"

import { useState, Suspense, useEffect } from "react"
import { ThaiHandLogo } from "@/components/thai-hand-logo"
import { GoogleLoginButton } from "@/components/GoogleLoginButton"
import { LineLoginButton } from "@/components/LineLoginButton"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"

// Component สำหรับ login form
function LoginForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    const messageParam = searchParams.get('message');
    
    if (errorParam) {
      let errorMsg = messageParam || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      
      if (errorParam === 'OAuthSignin') {
        errorMsg = messageParam || 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ OAuth provider กรุณาลองใหม่อีกครั้ง';
      } else if (errorParam === 'ECONNRESET') {
        errorMsg = 'การเชื่อมต่อถูกตัด กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่อีกครั้ง';
      } else if (errorParam === 'timeout') {
        errorMsg = 'การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง';
      } else if (errorParam === 'ENOTFOUND') {
        errorMsg = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
      } else if (errorParam === 'access_denied') {
        errorMsg = 'การเข้าสู่ระบบถูกปฏิเสธ กรุณาลองใหม่อีกครั้ง';
      } else if (errorParam === 'invalid_request') {
        errorMsg = 'คำขอไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง';
      }
      
      setErrorMessage(errorMsg);
      console.error('Login error:', errorMsg);
    }
  }, [searchParams]);

  const handleError = (message: string) => {
    setErrorMessage(message);
  }

  const clearError = () => {
    setErrorMessage(null);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200">
      <div className="w-full max-w-lg p-6">
        <div className="rounded-3xl shadow-2xl bg-white/70 backdrop-blur-md px-8 py-10 flex flex-col items-center border border-white/40">
          <div className="mb-8 flex flex-col items-center">
            <ThaiHandLogo className="h-14 w-14 mb-2 drop-shadow" />
            <span className="text-4xl font-extrabold text-gray-900 tracking-tight">ฝากซื้อไทย</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">เข้าสู่ระบบ</h1>
          <p className="text-base text-gray-500 mb-8 text-center">เลือกวิธีเข้าสู่ระบบที่คุณต้องการ</p>

          {/* Error Message */}
          {errorMessage && (
            <div className="w-full mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-in slide-in-from-top-2">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-red-700 text-sm font-medium">{errorMessage}</p>
                  <button 
                    onClick={clearError}
                    className="text-red-500 text-xs hover:text-red-700 mt-1 underline"
                  >
                    ปิดข้อความ
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-5 w-full">
            {/* Google Login Button */}
            <GoogleLoginButton onError={handleError} />
            
            {/* LINE Login Button */}
            <LineLoginButton onError={handleError} />
          </div>

          <div className="text-center mt-8">
            <p className="text-base text-gray-500">ยังไม่มีบัญชี? <span className="font-medium text-blue-600 hover:underline cursor-pointer">การเข้าสู่ระบบครั้งแรกจะสร้างบัญชีให้อัตโนมัติ</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main component ที่ wrap ด้วย Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
