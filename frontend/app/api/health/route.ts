import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // ตรวจสอบ environment variables ที่จำเป็น
    const requiredEnvVars = [
      'NEXTAUTH_URL',
      'NEXTAUTH_SECRET',
      'LINE_CLIENT_ID',
      'LINE_CLIENT_SECRET',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET'
    ];

    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingEnvVars.length > 0) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Missing environment variables', 
          missing: missingEnvVars 
        },
        { status: 500 }
      );
    }

    // ตรวจสอบการเชื่อมต่อกับ LINE API
    const lineHealthCheck = async () => {
      try {
        const response = await fetch('https://api.line.me/v2/profile', {
          method: 'HEAD',
          headers: {
            'Authorization': 'Bearer dummy-token'
          }
        });
        return response.status !== 401; // ถ้าไม่ใช่ 401 แสดงว่า API ใช้งานได้
      } catch (error) {
        return false;
      }
    };

    const lineApiHealthy = await lineHealthCheck();

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      services: {
        nextauth: {
          url: process.env.NEXTAUTH_URL,
          secret: !!process.env.NEXTAUTH_SECRET,
          debug: process.env.NEXTAUTH_DEBUG === 'true'
        },
        line: {
          clientId: !!process.env.LINE_CLIENT_ID,
          clientSecret: !!process.env.LINE_CLIENT_SECRET,
          apiHealthy: lineApiHealthy
        },
        google: {
          clientId: !!process.env.GOOGLE_CLIENT_ID,
          clientSecret: !!process.env.GOOGLE_CLIENT_SECRET
        }
      }
    });

  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 