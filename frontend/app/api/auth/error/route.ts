import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const error = searchParams.get('error');
  const message = searchParams.get('message');
  const provider = searchParams.get('provider');

  console.log('OAUTH ERROR ROUTE - Error:', error, 'Message:', message, 'Provider:', provider);

  // Redirect ไปยัง login page พร้อม error parameters
  const loginUrl = new URL('/login', request.url);
  
  // จัดการ error ตาม provider
  if (provider === 'line') {
    loginUrl.searchParams.set('error', 'line_oauth_error');
  } else {
    loginUrl.searchParams.set('error', error || 'unknown_error');
  }
  
  if (message) {
    loginUrl.searchParams.set('message', message);
  }

  // เพิ่ม provider parameter เพื่อแสดงข้อความที่เหมาะสม
  if (provider) {
    loginUrl.searchParams.set('provider', provider);
  }

  return NextResponse.redirect(loginUrl);
} 