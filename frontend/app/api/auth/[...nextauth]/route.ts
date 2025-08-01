import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import LineProvider from "next-auth/providers/line";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

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
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    LineProvider({
      clientId: process.env.LINE_CLIENT_ID || '',
      clientSecret: process.env.LINE_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: 'profile openid email',
        },
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 วัน
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('EVENT: signIn', { 
        user: user?.id, 
        provider: account?.provider, 
        isNewUser,
        hasAccessToken: !!account?.access_token 
      });
    },
    async signOut({ session, token }) {
      console.log('EVENT: signOut', { session: session?.user?.name, provider: token?.provider });
    },
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log('SIGNIN CALLBACK - User:', user?.id, 'Provider:', account?.provider);
      
      // ตรวจสอบ environment variables สำหรับ LINE
      if (account?.provider === 'line') {
        if (!process.env.LINE_CLIENT_ID || !process.env.LINE_CLIENT_SECRET) {
          console.log('LINE OAUTH ERROR - Missing environment variables');
          return false;
        }
        
        console.log('LINE OAUTH - Account details:', {
          provider: account.provider,
          type: account.type,
          hasAccessToken: !!account.access_token,
          hasRefreshToken: !!account.refresh_token,
          expiresAt: account.expires_at
        });
        
        // ตรวจสอบว่ามี access_token หรือไม่
        if (!account.access_token) {
          console.log('LINE OAUTH ERROR - No access token');
          return false;
        }
        
        // ตรวจสอบว่า user มีข้อมูลครบหรือไม่
        if (!user || !user.id) {
          console.log('LINE OAUTH ERROR - No user data');
          return false;
        }
        
        console.log('LINE OAUTH SUCCESS - Access token received');
        return true;
      }
      
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log('REDIRECT CALLBACK - URL:', url, 'Base URL:', baseUrl);
      
      // ถ้าเป็น LINE OAuth callback ให้ไป dashboard
      if (url.startsWith(baseUrl + '/api/auth/callback/line')) {
        console.log('LINE OAUTH CALLBACK - Redirecting to dashboard');
        return baseUrl + '/dashboard';
      }
      
      // ถ้าเป็น LINE OAuth signin ให้ไป LINE
      if (url.startsWith(baseUrl + '/api/auth/signin/line')) {
        console.log('LINE OAUTH SIGNIN - Allowing LINE redirect');
        return url;
      }
      
      // ถ้าเป็น error ให้ไป login พร้อม error message
      if (url.includes('error=OAuthSignin')) {
        console.log('OAUTH ERROR - Redirecting to login with error');
        return baseUrl + '/login?error=line_oauth_error&message=เกิดข้อผิดพลาดในการเชื่อมต่อกับ LINE';
      }
      
      // ถ้าเป็น OAuth error อื่นๆ
      if (url.includes('error=')) {
        console.log('OAUTH ERROR - Redirecting to login with generic error');
        return baseUrl + '/login?error=oauth_error&message=เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      }
      
      // อื่นๆ ให้ไป dashboard
      if (url.startsWith(baseUrl)) {
        console.log('INTERNAL URL - Redirecting to dashboard');
        return baseUrl + '/dashboard';
      }
      
      console.log('EXTERNAL URL - Allowing redirect');
      return url;
    },
    async session({ session, token, user }) {
      console.log('SESSION CALLBACK: token =', token?.provider, 'session =', session?.user?.name);
      
      // เพิ่ม image จาก token (Google จะส่ง url รูปมาใน token)
      if (token && session.user) {
        session.user.image = token.picture || session.user.image;
        session.user.id = token.sub || token.id || session.user.id;
      }
      
      // เพิ่ม accessToken และ provider เข้า session
      if (token && token.accessToken) {
        session.accessToken = token.accessToken;
      } else {
        session.accessToken = null;
      }
      
      // แนบ provider เสมอ
      session.provider = token?.provider || null;
      
      console.log('SESSION DEBUG - Final session:', {
        user: session.user?.name,
        provider: session.provider,
        hasAccessToken: !!session.accessToken
      });
      
      return session;
    },
    async jwt({ token, account, profile }) {
      console.log('JWT CALLBACK: account =', account?.provider, 'token =', token?.provider);
      
      // ดึง url รูปจาก profile (Google)
      if (profile && profile.sub) {
        token.sub = profile.sub;
      }
      if (account && account.id && typeof account.id === 'string') {
        token.id = account.id;
      }
      if (profile && typeof profile === 'object' && 'picture' in profile) {
        token.picture = String(profile.picture);
      }
      
      // ดึง accessToken และ provider จาก account (ตอน login)
      if (account && account.access_token) {
        token.accessToken = account.access_token;
      }
      
      // แนบ provider เสมอ
      token.provider = account?.provider || token.provider || null;
      
      console.log('JWT CALLBACK: token.accessToken =', !!token.accessToken, 'provider =', token.provider);
      return token;
    },
  },
});

export { handler as GET, handler as POST }; 