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
      clientId: process.env.LINE_CLIENT_ID!,
      clientSecret: process.env.LINE_CLIENT_SECRET!,
      authorization: {
        url: 'https://access.line.me/oauth2/v2.1/authorize',
        params: {
          scope: 'openid profile',
          response_type: 'code',
        },
      },
      token: {
        url: 'https://api.line.me/oauth2/v2.1/token',
      },
      userinfo: {
        url: 'https://api.line.me/v2/profile',
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
      httpOptions: {
        timeout: 60000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ThaiHand/1.0)',
        },
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/api/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // เปิด debug เพื่อดู error
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 วัน
  },
  // เพิ่ม error handling
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('EVENT: signIn', { user, account, profile, isNewUser });
    },
    async signOut({ session, token }) {
      console.log('EVENT: signOut', { session, token });
    },
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log('SIGNIN CALLBACK:', { user, account, profile, email, credentials });
      console.log('LINE OAUTH DEBUG - Account:', account);
      console.log('LINE OAUTH DEBUG - Profile:', profile);
      
      // เพิ่ม error handling สำหรับ LINE OAuth
      if (account?.provider === 'line') {
        console.log('LINE OAUTH DEBUG - Processing LINE signin');
        
        // ถ้าไม่มี account หรือ access_token แสดงว่าเกิด error
        if (!account || !account.access_token) {
          console.error('LINE OAUTH ERROR - No account or access token received');
          console.error('LINE OAUTH ERROR - Account:', account);
          return false;
        }
        
        console.log('LINE OAUTH SUCCESS - Access token received');
        return true;
      }
      
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log('REDIRECT CALLBACK:', { url, baseUrl });
      console.log('LINE OAUTH DEBUG - Redirect URL:', url);
      
      // ถ้าเป็น LINE OAuth และได้ access token แล้ว ให้ redirect ไป dashboard ทันที
      if (url.includes('access.line.me') || url.includes('line.me')) {
        console.log('LINE OAUTH DEBUG - Redirecting to dashboard after successful login');
        return `${baseUrl}/dashboard`;
      }
      
      // ป้องกัน infinite redirect loop
      if (url.includes('login?callbackUrl=') && url.includes('login%3FcallbackUrl%3D')) {
        console.log('LINE OAUTH DEBUG - Detected redirect loop, redirecting to home');
        return baseUrl;
      }
      
      // ตรวจสอบว่า URL ถูกต้อง
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url.startsWith(baseUrl) ? url : baseUrl;
      }
      
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    async session({ session, token, user }) {
      console.log('SESSION CALLBACK: token =', token, 'session =', session);
      console.log('SESSION DEBUG - Token provider:', token?.provider);
      console.log('SESSION DEBUG - Token accessToken:', token?.accessToken ? 'EXISTS' : 'MISSING');
      
      // เพิ่ม image จาก token (Google จะส่ง url รูปมาใน token)
      if (token && session.user) {
        session.user.image = token.picture || session.user.image;
        session.user.id = token.sub || token.id || session.user.id;
      }
      // เพิ่ม log ตรวจสอบ accessToken
      console.log('SESSION CALLBACK: token.accessToken =', token && token.accessToken);
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
      console.log('JWT CALLBACK: account =', account, 'token =', token);
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
      // เพิ่ม log ตรวจสอบ accessToken
      console.log('JWT CALLBACK: token.accessToken =', token && token.accessToken, 'provider =', token && token.provider);
      return token;
    },
  },
  // สามารถเพิ่ม options อื่น ๆ ได้ เช่น callbacks, session ฯลฯ
});

export { handler as GET, handler as POST }; 