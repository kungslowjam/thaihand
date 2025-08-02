import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import LineProvider from "next-auth/providers/line";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// สร้าง providers array
const providers = [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
  LineProvider({
    clientId: process.env.LINE_CLIENT_ID!,
    clientSecret: process.env.LINE_CLIENT_SECRET!,
    authorization: {
      url: "https://access.line.me/oauth2/v2.1/authorize",
      params: {
        scope: 'profile openid',
        response_type: 'code',
        state: 'random_state_string',
      },
    },
    token: {
      url: "https://api.line.me/oauth2/v2.1/token",
    },
    userinfo: {
      url: "https://api.line.me/v2/profile",
    },
  }),
];

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    accessToken?: string | null;
    provider?: string | null;
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    accessToken?: string;
    provider?: string | null;
  }
}

const handler = NextAuth({
  providers: providers,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 วัน
  },
  useSecureCookies: process.env.NODE_ENV === 'production',
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log('SIGNIN CALLBACK - User:', user?.id, 'Provider:', account?.provider);
      
      // สำหรับ LINE OAuth ให้ยืดหยุ่นมากขึ้น
      if (account?.provider === 'line') {
        console.log('LINE OAUTH - Processing LINE user data');
        
        // ตรวจสอบว่า user มีข้อมูลครบหรือไม่
        if (!user || !user.id) {
          console.log('LINE OAUTH - Creating user from profile data');
          if (profile && profile.sub) {
            user.id = profile.sub;
          } else if (account.providerAccountId) {
            user.id = account.providerAccountId;
          } else if (profile && (profile as any).userId) {
            user.id = (profile as any).userId;
          }
        }
        
        // ตรวจสอบว่า user มีข้อมูลพื้นฐาน
        if (!user.name && profile && profile.name) {
          user.name = profile.name;
        } else if (!user.name && profile && (profile as any).displayName) {
          user.name = (profile as any).displayName;
        }
        
        if (!user.image && profile && (profile as any).picture) {
          user.image = (profile as any).picture;
        } else if (!user.image && profile && (profile as any).pictureUrl) {
          user.image = (profile as any).pictureUrl;
        }
        
        // สร้าง email จาก LINE userId ถ้าไม่มี
        if (!user.email && profile && (profile as any).userId) {
          user.email = `${(profile as any).userId}@line.me`;
        }
        
        console.log('LINE OAUTH - Final user data:', {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image
        });
      }
      
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log('REDIRECT CALLBACK - URL:', url, 'Base URL:', baseUrl);
      
      // ตรวจสอบและแก้ไข localhost URLs
      if (url.includes('localhost:3000')) {
        console.log('REDIRECT FIX - Replacing localhost:3000 with production URL');
        url = url.replace('localhost:3000', 'thaihand.shop');
      }
      if (url.includes('localhost')) {
        console.log('REDIRECT FIX - Replacing localhost with production URL');
        url = url.replace('localhost', 'thaihand.shop');
      }
      
      // ถ้าเป็น OAuth callback ให้ไป dashboard
      if (url.includes('/api/auth/callback/')) {
        console.log('OAUTH CALLBACK - Redirecting to dashboard');
        return baseUrl + '/dashboard';
      }
      
      // จัดการ error ของ LINE OAuth
      if (url.includes('error=')) {
        console.log('ERROR REDIRECT - Processing OAuth error');
        
        if (url.includes('access_denied')) {
          return baseUrl + '/login?error=AccessDenied&message=การเข้าสู่ระบบถูกปฏิเสธ';
        }
        
        if (url.includes('invalid_request')) {
          return baseUrl + '/login?error=Configuration&message=การตั้งค่า OAuth ไม่ถูกต้อง';
        }
        
        if (url.includes('unauthorized_client')) {
          return baseUrl + '/login?error=Configuration&message=LINE Client ID หรือ Client Secret ไม่ถูกต้อง';
        }
        
        if (url.includes('unsupported_response_type')) {
          return baseUrl + '/login?error=Configuration&message=การตั้งค่า response_type ไม่ถูกต้อง';
        }
        
        if (url.includes('server_error')) {
          return baseUrl + '/login?error=unknown_error&message=เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ LINE';
        }
        
        if (url.includes('temporarily_unavailable')) {
          return baseUrl + '/login?error=unknown_error&message=LINE OAuth ปัจจุบันไม่พร้อมใช้งาน';
        }
        
        // error ทั่วไป
        return baseUrl + '/login?error=OAuthSignin&message=เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      }
      
      // ถ้าเป็น internal URL ให้ไป dashboard
      if (url.startsWith(baseUrl)) {
        console.log('INTERNAL URL - Redirecting to dashboard');
        return baseUrl + '/dashboard';
      }
      
      console.log('EXTERNAL URL - Allowing redirect to:', url);
      return url;
    },
    async session({ session, token, user }) {
      if (token && session.user) {
        session.user.image = token.picture || session.user.image;
        session.user.id = token.sub || token.id || session.user.id;
      }
      session.accessToken = token?.accessToken || null;
      session.provider = token?.provider || null;
      return session;
    },
    async jwt({ token, account, profile }) {
      if (profile && profile.sub) {
        token.sub = profile.sub;
      }
      if (account && account.id && typeof account.id === 'string') {
        token.id = account.id;
      }
      if (profile && typeof profile === 'object' && 'picture' in profile) {
        token.picture = String(profile.picture);
      }
      if (account && account.access_token) {
        token.accessToken = account.access_token;
      }
      token.provider = account?.provider || token.provider || null;
      return token;
    },
  },
});

export { handler as GET, handler as POST }; 