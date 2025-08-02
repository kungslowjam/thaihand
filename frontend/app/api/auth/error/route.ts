import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const error = searchParams.get('error');
  const message = searchParams.get('message');

  console.log('OAUTH ERROR ROUTE - Error:', error, 'Message:', message);

  // Redirect ไปยัง login page พร้อม error parameters
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('error', error || 'unknown_error');
  if (message) {
    loginUrl.searchParams.set('message', message);
  }

  return NextResponse.redirect(loginUrl);
} 