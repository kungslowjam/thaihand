import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const error = searchParams.get('error');
  
  console.log('OAUTH ERROR ROUTE - Error:', error);
  
  // Redirect to login page with error
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('error', error || 'OAuthCallback');
  
  return NextResponse.redirect(loginUrl);
} 