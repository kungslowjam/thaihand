import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import LineProvider from "next-auth/providers/line";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// ตรวจสอบ environment variables
const requiredEnvVars = {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  LINE_CLIENT_ID: process.env.LINE_CLIENT_ID,
  LINE_CLIENT_SECRET: process.env.LINE_CLIENT_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
};

// ตรวจสอบว่า environment variables ครบหรือไม่
const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingEnvVars.length > 0) {
  console.error('Missing environment variables:', missingEnvVars);
  console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('CLIENT')));
}

// สร้าง providers array ตาม environment variables ที่มี
const providers = [];

// เพิ่ม Google provider ถ้ามี environment variables
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

// เพิ่ม LINE provider ถ้ามี environment variables
if (process.env.LINE_CLIENT_ID && process.env.LINE_CLIENT_SECRET) {
  providers.push(
    LineProvider({
      clientId: process.env.LINE_CLIENT_ID,
      clientSecret: process.env.LINE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'profile openid email',
        },
      },
    })
  );
}

// ตรวจสอบว่ามี providers หรือไม่
if (providers.length === 0) {
  console.error('No OAuth providers configured. Please check environment variables.');
} else {
  console.log('OAuth providers configured:', providers.map(p => p.id));
}

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
  debug: false, // ปิด debug ใน production
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 วัน
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('EVENT: signIn', { user: user?.id, provider: account?.provider, isNewUser });
    },
    async signOut({ session, token }) {
      console.log('EVENT: signOut', { session: session?.user?.name, provider: token?.provider });
    },
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log('SIGNIN CALLBACK - User:', user?.id, 'Provider:', account?.provider);
      
      // ตรวจสอบ environment variables
      if (account?.provider === 'google') {
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
          console.log('GOOGLE OAUTH ERROR - Missing environment variables');
          return false;
        }
        console.log('GOOGLE OAUTH SUCCESS - Environment variables OK');
      }
      
      if (account?.provider === 'line') {
        if (!process.env.LINE_CLIENT_ID || !process.env.LINE_CLIENT_SECRET) {
          console.log('LINE OAUTH ERROR - Missing environment variables');
          return false;
        }
        console.log('LINE OAUTH SUCCESS - Environment variables OK');
        
        // สำหรับ LINE OAuth ให้ยืดหยุ่นมากขึ้น
        if (!user || !user.id) {
          console.log('LINE OAUTH - Creating user from profile data');
          // สร้าง user ID จาก LINE profile
          if (profile && profile.sub) {
            user.id = profile.sub;
          } else if (account.providerAccountId) {
            user.id = account.providerAccountId;
          } else if (profile && (profile as any).id) {
            user.id = (profile as any).id;
          }
        }
        
        // ตรวจสอบว่า user มีข้อมูลพื้นฐาน
        if (!user.name && profile && profile.name) {
          user.name = profile.name;
        }
        if (!user.image && profile && (profile as any).picture) {
          user.image = (profile as any).picture;
        }
      }
      
      // ตรวจสอบว่ามี access_token หรือไม่ (ยืดหยุ่นสำหรับ LINE)
      if (account && !account.access_token && account.provider !== 'line') {
        console.log(`${account.provider?.toUpperCase()} OAUTH ERROR - No access token`);
        return false;
      }
      
      console.log(`${account?.provider?.toUpperCase()} OAUTH SUCCESS - Authentication successful`);
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log('REDIRECT CALLBACK - URL:', url, 'Base URL:', baseUrl);
      
      // ถ้าเป็น OAuth callback ให้ไป dashboard (ทั้ง Google และ LINE)
      if (url.includes('/api/auth/callback/')) {
        console.log('OAUTH CALLBACK - Redirecting to dashboard');
        return baseUrl + '/dashboard';
      }
      
      // ถ้าเป็น OAuth signin ให้อนุญาต (ทั้ง Google และ LINE)
      if (url.includes('/api/auth/signin/')) {
        console.log('OAUTH SIGNIN - Allowing OAuth redirect');
        return url;
      }
      
      // ถ้าเป็น internal URL ให้ไป dashboard
      if (url.startsWith(baseUrl)) {
        console.log('INTERNAL URL - Redirecting to dashboard');
        return baseUrl + '/dashboard';
      }
      
      console.log('EXTERNAL URL - Allowing redirect');
      return url;
    },
    async session({ session, token, user }) {
      console.log('SESSION CALLBACK: token =', token?.provider, 'session =', session?.user?.name);
      
      // เพิ่ม image จาก token (ทั้ง Google และ LINE)
      if (token && session.user) {
        session.user.image = token.picture || session.user.image;
        session.user.id = token.sub || token.id || session.user.id;
      }
      
      // เพิ่ม accessToken และ provider เข้า session (ทั้ง Google และ LINE)
      if (token && token.accessToken) {
        session.accessToken = token.accessToken;
      } else {
        session.accessToken = null;
      }
      
      // แนบ provider เสมอ (ทั้ง Google และ LINE)
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
      
      // ดึง url รูปจาก profile (ทั้ง Google และ LINE)
      if (profile && profile.sub) {
        token.sub = profile.sub;
      }
      if (account && account.id && typeof account.id === 'string') {
        token.id = account.id;
      }
      if (profile && typeof profile === 'object' && 'picture' in profile) {
        token.picture = String(profile.picture);
      }
      
      // ดึง accessToken และ provider จาก account (ตอน login) - ทั้ง Google และ LINE
      if (account && account.access_token) {
        token.accessToken = account.access_token;
      }
      
      // แนบ provider เสมอ (ทั้ง Google และ LINE)
      token.provider = account?.provider || token.provider || null;
      
      console.log('JWT CALLBACK: token.accessToken =', !!token.accessToken, 'provider =', token.provider);
      return token;
    },
  },
});

export { handler as GET, handler as POST }; 