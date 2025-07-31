'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(errorParam);
    }
  }, [searchParams]);

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'SIGNIN_OAUTH_ERROR':
        return 'เกิดข้อผิดพลาดในการเข้าสู่ระบบผ่าน OAuth กรุณาลองใหม่อีกครั้ง';
      case 'OAUTH_CALLBACK_ERROR':
        return 'เกิดข้อผิดพลาดในการ callback จาก OAuth provider';
      case 'OAUTH_CREATE_ACCOUNT_ERROR':
        return 'เกิดข้อผิดพลาดในการสร้างบัญชีใหม่';
      case 'OAUTH_ACCOUNT_LINK_ERROR':
        return 'เกิดข้อผิดพลาดในการเชื่อมต่อบัญชี';
      case 'EMAIL_CREATE_ACCOUNT_ERROR':
        return 'เกิดข้อผิดพลาดในการสร้างบัญชีด้วยอีเมล';
      case 'CALLBACK_OAUTH_ERROR':
        return 'เกิดข้อผิดพลาดในการ callback OAuth';
      case 'OAUTH_SIGNIN_ERROR':
        return 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ OAuth';
      case 'OAUTH_V1_LEGACY_USER_ID_ERROR':
        return 'เกิดข้อผิดพลาดกับ legacy user ID';
      case 'OAuthSignin':
        return 'เกิดข้อผิดพลาดในการเริ่มต้น OAuth กรุณาตรวจสอบ LINE Client ID และ Secret';
      case 'OAuthCallback':
        return 'เกิดข้อผิดพลาดในการ callback OAuth กรุณาลองใหม่อีกครั้ง';
      case 'OAuthCreateAccount':
        return 'เกิดข้อผิดพลาดในการสร้างบัญชี OAuth';
      case 'OAuthAccountLink':
        return 'เกิดข้อผิดพลาดในการเชื่อมต่อบัญชี OAuth';
      case 'EmailCreateAccount':
        return 'เกิดข้อผิดพลาดในการสร้างบัญชีด้วยอีเมล';
      case 'Callback':
        return 'เกิดข้อผิดพลาดในการ callback';
      default:
        return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            เกิดข้อผิดพลาด
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {getErrorMessage(error)}
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  รหัสข้อผิดพลาด: {error}
                </h3>
              </div>
            </div>
          </div>
          <div className="flex space-x-4">
            <a
              href="/login"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              กลับไปหน้าเข้าสู่ระบบ
            </a>
            <a
              href="/"
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              กลับหน้าหลัก
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">กำลังโหลด...</p>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthErrorContent />
    </Suspense>
  );
} 