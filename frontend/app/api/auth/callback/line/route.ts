import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  console.log('LINE Callback - Code:', code, 'State:', state, 'Error:', error);

  // ถ้ามี error ให้ redirect ไป login page
  if (error) {
    console.error('LINE OAuth Error:', error, errorDescription);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'OAuthSignin');
    loginUrl.searchParams.set('message', `เกิดข้อผิดพลาดในการเข้าสู่ระบบ LINE: ${errorDescription || error}`);
    return NextResponse.redirect(loginUrl);
  }

  // ถ้าไม่มี code ให้ redirect ไป login page
  if (!code) {
    console.error('LINE OAuth - No code provided');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'OAuthSignin');
    loginUrl.searchParams.set('message', 'ไม่ได้รับ authorization code จาก LINE');
    return NextResponse.redirect(loginUrl);
  }

  try {
    // สร้าง URL สำหรับ NextAuth callback
    const callbackUrl = new URL('/api/auth/callback/line', request.url);
    callbackUrl.searchParams.set('code', code);
    if (state) {
      callbackUrl.searchParams.set('state', state);
    }

    console.log('LINE Callback - Redirecting to NextAuth callback:', callbackUrl.toString());
    
    // Redirect ไปยัง NextAuth callback
    return NextResponse.redirect(callbackUrl);
  } catch (error) {
    console.error('LINE Callback Error:', error);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'OAuthSignin');
    loginUrl.searchParams.set('message', 'เกิดข้อผิดพลาดในการประมวลผล callback');
    return NextResponse.redirect(loginUrl);
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
} 