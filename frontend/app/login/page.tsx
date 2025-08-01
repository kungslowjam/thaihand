"use client"

import { useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { ThaiHandLogo } from "@/components/thai-hand-logo"
import { signIn } from "next-auth/react"
import { useSession, signOut } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"

// Component สำหรับแสดง error
function ErrorDisplay({ error }: { error: string | null }) {
  if (!error) return null;
  
  return (
    <div className="w-full mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center">
        <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <span className="text-sm text-red-700">{error}</span>
      </div>
    </div>
  );
}

// Component สำหรับ login form
function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
    
    if (errorParam === 'line_oauth_error') {
      setError(messageParam || 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ LINE กรุณาลองใหม่อีกครั้ง');
    } else if (errorParam === 'oauth_error') {
      setError(messageParam || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง');
    } else if (errorParam === 'unknown_error') {
      setError(messageParam || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ');
    } else if (errorParam === 'OAuthSignin') {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อกับ LINE กรุณาตรวจสอบการตั้งค่าและลองใหม่อีกครั้ง');
    } else if (errorParam === 'Configuration') {
      setError('เกิดข้อผิดพลาดในการตั้งค่า OAuth กรุณาตรวจสอบการตั้งค่า LINE Client ID และ Secret');
    } else if (errorParam === 'AccessDenied') {
      setError('การเข้าสู่ระบบถูกปฏิเสธ กรุณาลองใหม่อีกครั้ง');
    } else if (errorParam === 'Verification') {
      setError('เกิดข้อผิดพลาดในการยืนยันตัวตน กรุณาลองใหม่อีกครั้ง');
    }
  }, [searchParams]);

  const handleLineLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('LINE LOGIN - Starting LINE OAuth');
      
      // ตรวจสอบ environment variables
      if (!process.env.NEXT_PUBLIC_LINE_CLIENT_ID) {
        console.error('LINE CLIENT ID not found');
        setError('เกิดข้อผิดพลาดในการตั้งค่า LINE กรุณาตรวจสอบการตั้งค่า');
        setIsLoading(false);
        return;
      }
      
      // ใช้ signIn พร้อม error handling
      const result = await signIn("line", { 
        callbackUrl: "/dashboard",
        redirect: false 
      });
      
      console.log('LINE LOGIN - Result:', result);
      
      if (result?.error) {
        console.error('LINE login error:', result.error);
        setError(`เกิดข้อผิดพลาดในการเข้าสู่ระบบ: ${result.error}`);
        setIsLoading(false);
      } else if (result?.url) {
        // ถ้าสำเร็จให้ redirect
        window.location.href = result.url;
      }
      
    } catch (error) {
      console.error("LINE login failed:", error);
      setError("ไม่สามารถเชื่อมต่อกับ LINE ได้ กรุณาลองใหม่อีกครั้ง");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { prompt: "select_account" })
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

          {/* Error Display */}
          <ErrorDisplay error={error} />

          <div className="flex flex-col gap-5 w-full">
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              variant="outline"
              className="w-full flex items-center justify-center border-2 border-gray-200 bg-white hover:bg-blue-50 text-gray-800 font-semibold text-lg py-4 rounded-xl shadow-sm hover:scale-105 transition-all duration-150"
            >
              <svg className="h-6 w-6 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              เข้าสู่ระบบด้วย Google
            </Button>

            <Button
              onClick={handleLineLogin}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  กำลังเชื่อมต่อ...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                  </svg>
                  เข้าสู่ระบบด้วย LINE
                </>
              )}
            </Button>
          </div>

          <div className="relative my-8 w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/80 px-3 text-gray-400 tracking-wider">หรือ</span>
            </div>
          </div>

          <div className="text-center mt-2">
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
