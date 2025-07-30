import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('NextAuth Log:', body);
    
    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('NextAuth Log Error:', error);
    
    return NextResponse.json(
      { error: 'Failed to process log' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  console.log('NextAuth Log GET request');
  
  // Return success response for GET requests
  return NextResponse.json({ 
    success: true,
    message: 'Log endpoint is working'
  });
}