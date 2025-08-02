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