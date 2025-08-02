// Line Authentication Utility Functions

export interface LineUserInfo {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export interface LineTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
}

/**
 * ตรวจสอบว่า Line login ใช้งานได้หรือไม่
 */
export const isLineLoginAvailable = (): boolean => {
  return !!(process.env.NEXT_PUBLIC_LINE_CLIENT_ID && process.env.LINE_CLIENT_SECRET);
};

/**
 * สร้าง Line OAuth URL
 */
export const createLineAuthUrl = (): string => {
  const clientId = process.env.NEXT_PUBLIC_LINE_CLIENT_ID;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback/line`;
  const state = Math.random().toString(36).substring(7);
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId!,
    redirect_uri: redirectUri,
    state: state,
    scope: 'profile openid',
  });

  return `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;
};

/**
 * แลกเปลี่ยน authorization code เป็น access token
 */
export const exchangeLineCodeForToken = async (code: string): Promise<LineTokenResponse> => {
  const clientId = process.env.LINE_CLIENT_ID;
  const clientSecret = process.env.LINE_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback/line`;

  const response = await fetch('https://api.line.me/oauth2/v2.1/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
      client_id: clientId!,
      client_secret: clientSecret!,
    }),
  });

  if (!response.ok) {
    throw new Error(`Line token exchange failed: ${response.statusText}`);
  }

  return response.json();
};

/**
 * ดึงข้อมูลผู้ใช้จาก Line API
 */
export const getLineUserInfo = async (accessToken: string): Promise<LineUserInfo> => {
  const response = await fetch('https://api.line.me/v2/profile', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Line user info failed: ${response.statusText}`);
  }

  return response.json();
};

/**
 * ตรวจสอบ Line access token
 */
export const verifyLineToken = async (accessToken: string): Promise<boolean> => {
  try {
    const response = await fetch('https://api.line.me/oauth2/v2.1/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        access_token: accessToken,
      }),
  });

    return response.ok;
  } catch (error) {
    console.error('Line token verification failed:', error);
    return false;
  }
};

/**
 * Refresh Line access token
 */
export const refreshLineToken = async (refreshToken: string): Promise<LineTokenResponse> => {
  const clientId = process.env.LINE_CLIENT_ID;
  const clientSecret = process.env.LINE_CLIENT_SECRET;

  const response = await fetch('https://api.line.me/oauth2/v2.1/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId!,
      client_secret: clientSecret!,
    }),
  });

  if (!response.ok) {
    throw new Error(`Line token refresh failed: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Revoke Line access token
 */
export const revokeLineToken = async (accessToken: string): Promise<void> => {
  const clientId = process.env.LINE_CLIENT_ID;
  const clientSecret = process.env.LINE_CLIENT_SECRET;

  const response = await fetch('https://api.line.me/oauth2/v2.1/revoke', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      access_token: accessToken,
      client_id: clientId!,
      client_secret: clientSecret!,
    }),
  });

  if (!response.ok) {
    throw new Error(`Line token revocation failed: ${response.statusText}`);
  }
};

/**
 * สร้าง Line user profile สำหรับ NextAuth
 */
export const createLineUserProfile = (lineUserInfo: LineUserInfo) => {
  return {
    id: lineUserInfo.userId,
    name: lineUserInfo.displayName,
    email: `${lineUserInfo.userId}@line.me`,
    image: lineUserInfo.pictureUrl,
    provider: 'line',
  };
};

/**
 * จัดการ Line login error
 */
export const handleLineLoginError = (error: any): string => {
  console.error('Line login error:', error);
  
  if (error.message?.includes('invalid_grant')) {
    return 'การเข้าสู่ระบบ LINE หมดอายุ กรุณาลองใหม่อีกครั้ง';
  }
  
  if (error.message?.includes('invalid_client')) {
    return 'การตั้งค่า LINE OAuth ไม่ถูกต้อง กรุณาติดต่อผู้ดูแลระบบ';
  }
  
  if (error.message?.includes('network')) {
    return 'ไม่สามารถเชื่อมต่อกับ LINE ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
  }
  
  return 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ LINE กรุณาลองใหม่อีกครั้ง';
}; 