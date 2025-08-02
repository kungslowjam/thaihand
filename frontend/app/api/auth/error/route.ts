import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const provider = searchParams.get('provider');

  console.log('OAUTH ERROR ROUTE - Error:', error, 'Description:', errorDescription, 'Provider:', provider);

  // สร้าง error message ที่เหมาะสม
  let errorMessage = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
  
  if (error === 'ECONNRESET' || errorDescription?.includes('ECONNRESET')) {
    errorMessage = 'การเชื่อมต่อถูกตัด กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่อีกครั้ง';
  } else if (error === 'timeout' || errorDescription?.includes('timeout')) {
    errorMessage = 'การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง';
  } else if (error === 'ENOTFOUND' || errorDescription?.includes('ENOTFOUND')) {
    errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
  } else if (error === 'OAuthSignin') {
    errorMessage = 'เกิดข้อผิดพลาดในการเริ่มต้น OAuth กรุณาลองใหม่อีกครั้ง';
  } else if (error === 'OAuthCallback') {
    errorMessage = 'เกิดข้อผิดพลาดในการ callback กรุณาลองใหม่อีกครั้ง';
  } else if (error === 'Configuration') {
    errorMessage = 'การตั้งค่า OAuth ไม่ถูกต้อง กรุณาตรวจสอบการตั้งค่า';
  } else if (error === 'AccessDenied') {
    errorMessage = 'การเข้าสู่ระบบถูกปฏิเสธ กรุณาลองใหม่อีกครั้ง';
  } else if (error === 'invalid_client') {
    errorMessage = 'Client ID หรือ Client Secret ไม่ถูกต้อง กรุณาตรวจสอบการตั้งค่า LINE OAuth';
  } else if (error === 'invalid_grant') {
    errorMessage = 'Authorization code ไม่ถูกต้องหรือหมดอายุ กรุณาลองใหม่อีกครั้ง';
  } else if (error === 'invalid_request') {
    errorMessage = 'คำขอไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง';
  } else if (error === 'invalid_scope') {
    errorMessage = 'Scope ที่ขอไม่ถูกต้อง กรุณาตรวจสอบการตั้งค่า';
  } else if (error === 'server_error') {
    errorMessage = 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ LINE กรุณาลองใหม่อีกครั้ง';
  } else if (error === 'temporarily_unavailable') {
    errorMessage = 'บริการ LINE OAuth ไม่พร้อมใช้งานชั่วคราว กรุณาลองใหม่อีกครั้ง';
  } else if (error === 'unauthorized_client') {
    errorMessage = 'Client ไม่ได้รับอนุญาตให้ใช้ LINE OAuth กรุณาตรวจสอบการตั้งค่า';
  } else if (error === 'unsupported_grant_type') {
    errorMessage = 'Grant type ไม่รองรับ กรุณาตรวจสอบการตั้งค่า';
  } else if (error === 'unsupported_response_type') {
    errorMessage = 'Response type ไม่รองรับ กรุณาตรวจสอบการตั้งค่า';
  }

  // เพิ่ม provider-specific error messages
  if (provider === 'line') {
    if (error === 'access_denied') {
      errorMessage = 'คุณได้ปฏิเสธการเข้าสู่ระบบผ่าน LINE กรุณาลองใหม่อีกครั้ง';
    } else if (error === 'invalid_redirect_uri') {
      errorMessage = 'Redirect URI ไม่ถูกต้อง กรุณาตรวจสอบการตั้งค่า LINE OAuth';
    }
  }

  // Redirect ไปยัง login page พร้อม error message
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('error', 'OAuthSignin');
  loginUrl.searchParams.set('message', errorMessage);
  
  if (provider) {
    loginUrl.searchParams.set('provider', provider);
  }

  console.log('Redirecting to login with error:', errorMessage);
  return NextResponse.redirect(loginUrl);
}

export async function POST(request: NextRequest) {
  return GET(request);
} 