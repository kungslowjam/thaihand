import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    console.log('LINE Callback - Code:', code ? 'exists' : 'missing');
    console.log('LINE Callback - State:', state);
    console.log('LINE Callback - Error:', error);
    console.log('LINE Callback - Error Description:', errorDescription);

    if (error) {
      console.error('LINE OAuth Error:', error, errorDescription);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/login?error=OAuthSignin&message=เกิดข้อผิดพลาดในการเข้าสู่ระบบ LINE: ${errorDescription || error}`
      );
    }

    if (!code) {
      console.error('LINE Callback - No authorization code received');
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/login?error=OAuthSignin&message=ไม่ได้รับ authorization code จาก LINE`
      );
    }

    // ส่งต่อไปยัง NextAuth handler
    const nextAuthUrl = `${process.env.NEXTAUTH_URL}/api/auth/callback/line?code=${code}&state=${state}`;
    console.log('Redirecting to NextAuth:', nextAuthUrl);
    
    return NextResponse.redirect(nextAuthUrl);
  } catch (error) {
    console.error('LINE Callback Error:', error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/login?error=OAuthSignin&message=เกิดข้อผิดพลาดในการประมวลผล LINE callback`
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
} 