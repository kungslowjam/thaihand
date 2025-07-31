import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  console.log('AUTH ERROR:', { error, errorDescription });

  // จัดการ LINE OAuth specific errors
  if (error === 'OAuthSignin' || error === 'OAuthCallback') {
    console.log('LINE OAUTH ERROR - Redirecting to login with error message');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'line_oauth_error');
    loginUrl.searchParams.set('message', 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ LINE กรุณาลองใหม่อีกครั้ง');
    return NextResponse.redirect(loginUrl);
  }

  // จัดการ general OAuth errors
  if (error?.includes('OAuth')) {
    console.log('GENERAL OAUTH ERROR - Redirecting to login');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'oauth_error');
    loginUrl.searchParams.set('message', 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง');
    return NextResponse.redirect(loginUrl);
  }

  // Default error handling
  const errorUrl = new URL('/login', request.url);
  errorUrl.searchParams.set('error', 'unknown_error');
  errorUrl.searchParams.set('message', 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ');
  return NextResponse.redirect(errorUrl);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  console.log('NextAuth Error POST:', body);
  
  // Redirect to login page with error message
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('error', 'oauth_error');
  loginUrl.searchParams.set('message', 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง');
  return NextResponse.redirect(loginUrl);
}