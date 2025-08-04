import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const responseType = searchParams.get('response_type');
    const clientId = searchParams.get('client_id');
    const redirectUri = searchParams.get('redirect_uri');
    const state = searchParams.get('state');
    const scope = searchParams.get('scope');

    console.log('LINE OAuth - Response Type:', responseType);
    console.log('LINE OAuth - Client ID:', clientId);
    console.log('LINE OAuth - Redirect URI:', redirectUri);
    console.log('LINE OAuth - State:', state);
    console.log('LINE OAuth - Scope:', scope);

    // ตรวจสอบ parameters ที่จำเป็น
    if (!responseType || !clientId || !redirectUri || !state) {
      console.error('LINE OAuth - Missing required parameters');
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/login?error=invalid_request&message=พารามิเตอร์ไม่ครบถ้วน`
      );
    }

    // สร้าง LINE OAuth URL
    const lineAuthUrl = new URL('https://access.line.me/oauth2/v2.1/authorize');
    lineAuthUrl.searchParams.set('response_type', responseType);
    lineAuthUrl.searchParams.set('client_id', clientId);
    lineAuthUrl.searchParams.set('redirect_uri', redirectUri);
    lineAuthUrl.searchParams.set('state', state);
    lineAuthUrl.searchParams.set('scope', scope || 'profile openid email');
    lineAuthUrl.searchParams.set('bot_prompt', 'normal');

    console.log('Redirecting to LINE OAuth:', lineAuthUrl.toString());
    
    return NextResponse.redirect(lineAuthUrl.toString());
  } catch (error) {
    console.error('LINE OAuth Error:', error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/login?error=OAuthSignin&message=เกิดข้อผิดพลาดในการเริ่มต้น LINE OAuth`
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
} 