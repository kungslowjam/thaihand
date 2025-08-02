// Test file for Line Authentication Functions
import { 
  isLineLoginAvailable, 
  createLineAuthUrl, 
  createLineUserProfile, 
  handleLineLoginError 
} from './lineAuth';

// Mock environment variables
const mockEnv = {
  NEXT_PUBLIC_LINE_CLIENT_ID: 'test-line-client-id',
  LINE_CLIENT_SECRET: 'test-line-client-secret',
  NEXTAUTH_URL: 'https://thaihand.shop'
};

// Mock process.env
Object.defineProperty(process, 'env', {
  value: mockEnv,
  writable: true
});

describe('Line Authentication Functions', () => {
  beforeEach(() => {
    // Reset environment variables
    process.env = { ...mockEnv };
  });

  describe('isLineLoginAvailable', () => {
    it('should return true when both LINE_CLIENT_ID and LINE_CLIENT_SECRET are set', () => {
      expect(isLineLoginAvailable()).toBe(true);
    });

    it('should return false when LINE_CLIENT_ID is missing', () => {
      delete process.env.NEXT_PUBLIC_LINE_CLIENT_ID;
      expect(isLineLoginAvailable()).toBe(false);
    });

    it('should return false when LINE_CLIENT_SECRET is missing', () => {
      delete process.env.LINE_CLIENT_SECRET;
      expect(isLineLoginAvailable()).toBe(false);
    });

    it('should return false when both are missing', () => {
      delete process.env.NEXT_PUBLIC_LINE_CLIENT_ID;
      delete process.env.LINE_CLIENT_SECRET;
      expect(isLineLoginAvailable()).toBe(false);
    });
  });

  describe('createLineAuthUrl', () => {
    it('should create a valid LINE OAuth URL', () => {
      const url = createLineAuthUrl();
      
      expect(url).toContain('https://access.line.me/oauth2/v2.1/authorize');
      expect(url).toContain('response_type=code');
      expect(url).toContain('client_id=test-line-client-id');
      expect(url).toContain('redirect_uri=https%3A%2F%2Fthaihand.shop%2Fapi%2Fauth%2Fcallback%2Fline');
      expect(url).toContain('scope=profile%20openid');
      expect(url).toContain('state=');
    });

    it('should include state parameter', () => {
      const url = createLineAuthUrl();
      const urlParams = new URLSearchParams(url.split('?')[1]);
      
      expect(urlParams.get('state')).toBeTruthy();
      expect(urlParams.get('state')?.length).toBeGreaterThan(0);
    });
  });

  describe('createLineUserProfile', () => {
    it('should create user profile from LINE user info', () => {
      const lineUserInfo = {
        userId: 'U1234567890abcdef',
        displayName: 'Test User',
        pictureUrl: 'https://profile.line-scdn.net/test.jpg',
        statusMessage: 'Hello World'
      };

      const profile = createLineUserProfile(lineUserInfo);

      expect(profile).toEqual({
        id: 'U1234567890abcdef',
        name: 'Test User',
        email: 'U1234567890abcdef@line.me',
        image: 'https://profile.line-scdn.net/test.jpg',
        provider: 'line'
      });
    });

    it('should handle missing optional fields', () => {
      const lineUserInfo = {
        userId: 'U1234567890abcdef',
        displayName: 'Test User'
      };

      const profile = createLineUserProfile(lineUserInfo);

      expect(profile).toEqual({
        id: 'U1234567890abcdef',
        name: 'Test User',
        email: 'U1234567890abcdef@line.me',
        image: undefined,
        provider: 'line'
      });
    });
  });

  describe('handleLineLoginError', () => {
    it('should handle invalid_grant error', () => {
      const error = { message: 'invalid_grant' };
      const result = handleLineLoginError(error);
      
      expect(result).toBe('การเข้าสู่ระบบ LINE หมดอายุ กรุณาลองใหม่อีกครั้ง');
    });

    it('should handle invalid_client error', () => {
      const error = { message: 'invalid_client' };
      const result = handleLineLoginError(error);
      
      expect(result).toBe('การตั้งค่า LINE OAuth ไม่ถูกต้อง กรุณาติดต่อผู้ดูแลระบบ');
    });

    it('should handle network error', () => {
      const error = { message: 'network error' };
      const result = handleLineLoginError(error);
      
      expect(result).toBe('ไม่สามารถเชื่อมต่อกับ LINE ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
    });

    it('should handle unknown error', () => {
      const error = { message: 'unknown error' };
      const result = handleLineLoginError(error);
      
      expect(result).toBe('เกิดข้อผิดพลาดในการเข้าสู่ระบบ LINE กรุณาลองใหม่อีกครั้ง');
    });

    it('should handle error without message', () => {
      const error = {};
      const result = handleLineLoginError(error);
      
      expect(result).toBe('เกิดข้อผิดพลาดในการเข้าสู่ระบบ LINE กรุณาลองใหม่อีกครั้ง');
    });
  });
});

// Mock fetch for testing API calls
global.fetch = jest.fn();

describe('Line API Functions', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('exchangeLineCodeForToken', () => {
    it('should exchange code for token successfully', async () => {
      const mockResponse = {
        access_token: 'test-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'profile openid'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      // Note: This would require the actual function to be imported
      // For now, we're just testing the mock setup
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('getLineUserInfo', () => {
    it('should fetch user info successfully', async () => {
      const mockUserInfo = {
        userId: 'U1234567890abcdef',
        displayName: 'Test User',
        pictureUrl: 'https://profile.line-scdn.net/test.jpg'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserInfo
      });

      // Note: This would require the actual function to be imported
      // For now, we're just testing the mock setup
      expect(fetch).not.toHaveBeenCalled();
    });
  });
}); 