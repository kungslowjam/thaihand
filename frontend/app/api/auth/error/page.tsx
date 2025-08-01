'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  
  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'OAuthSignin':
        return 'เกิดข้อผิดพลาดในการเริ่มต้น OAuth กรุณาตรวจสอบ LINE Client ID และ Secret';
      case 'OAuthCallback':
        return 'เกิดข้อผิดพลาดในการ callback OAuth กรุณาลองใหม่อีกครั้ง';
      case 'OAuthCreateAccount':
        return 'เกิดข้อผิดพลาดในการสร้างบัญชี OAuth';
      case 'OAuthAccountNotLinked':
        return 'บัญชีนี้เชื่อมต่อกับ provider อื่นอยู่แล้ว';
      case 'EmailCreateAccount':
        return 'เกิดข้อผิดพลาดในการสร้างบัญชีด้วยอีเมล';
      case 'Callback':
        return 'เกิดข้อผิดพลาดในการ callback';
      case 'OAuthSignin':
        return 'เกิดข้อผิดพลาดในการเริ่มต้น OAuth';
      case 'EmailSignin':
        return 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วยอีเมล';
      case 'CredentialsSignin':
        return 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย credentials';
      case 'SessionRequired':
        return 'กรุณาเข้าสู่ระบบก่อน';
      case 'Default':
      default:
        return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            ❌ เกิดข้อผิดพลาด
          </h2>
          <p className="text-sm text-gray-600">
            ไม่สามารถเข้าสู่ระบบได้
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ข้อผิดพลาดในการเข้าสู่ระบบ
            </h3>
            
            <p className="text-sm text-gray-600 mb-6">
              {getErrorMessage(error)}
            </p>

            <div className="space-y-3">
              <Link
                href="/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                ลองเข้าสู่ระบบใหม่
              </Link>
              
              <Link
                href="/"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                กลับหน้าหลัก
              </Link>
            </div>

            {error && (
              <div className="mt-6 p-3 bg-gray-50 rounded-md">
                <p className="text-xs text-gray-500">
                  รหัสข้อผิดพลาด: <code className="bg-gray-200 px-1 rounded">{error}</code>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            กำลังโหลด...
          </h2>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
} 