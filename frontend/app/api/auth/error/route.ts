import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const error = searchParams.get('error');
  
  console.log('NextAuth Error:', error);
  
  // Return error response
  return NextResponse.json(
    { 
      error: error || 'Authentication error',
      message: 'An authentication error occurred'
    },
    { status: 400 }
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  console.log('NextAuth Error POST:', body);
  
  // Return error response
  return NextResponse.json(
    { 
      error: 'Authentication error',
      message: 'An authentication error occurred'
    },
    { status: 400 }
  );
}