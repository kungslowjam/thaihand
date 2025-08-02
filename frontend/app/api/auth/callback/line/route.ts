import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const state = searchParams.get('state');
  const code = searchParams.get('code');

  console.log('LINE CALLBACK - Error:', error, 'Description:', errorDescription, 'State:', state, 'Code:', code);

  // ถ้ามี error ให้ redirect ไปยัง login page
  if (error) {
    console.log('LINE CALLBACK ERROR - Redirecting to login');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'OAuthCallback');
    loginUrl.searchParams.set('message', errorDescription || `เกิดข้อผิดพลาด: ${error}`);
    loginUrl.searchParams.set('provider', 'line');
    return NextResponse.redirect(loginUrl);
  }

  // ถ้ามี code ให้ redirect ไปยัง NextAuth callback
  if (code) {
    console.log('LINE CALLBACK SUCCESS - Redirecting to NextAuth callback');
    const nextAuthUrl = new URL('/api/auth/callback/line', request.url);
    nextAuthUrl.searchParams.set('code', code);
    if (state) {
      nextAuthUrl.searchParams.set('state', state);
    }
    return NextResponse.redirect(nextAuthUrl);
  }

  // ถ้าไม่มีทั้ง error และ code ให้ redirect ไปยัง login
  console.log('LINE CALLBACK - No error or code, redirecting to login');
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('error', 'OAuthCallback');
  loginUrl.searchParams.set('message', 'ไม่ได้รับข้อมูลการยืนยันจาก LINE');
  loginUrl.searchParams.set('provider', 'line');
  return NextResponse.redirect(loginUrl);
} 