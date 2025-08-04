import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import LineProvider from "next-auth/providers/line";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

// Dynamic URL detection
const getBaseUrl = () => {
  // ใช้ NEXTAUTH_URL เสมอถ้ามี
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.NEXT_PUBLIC_FORCE_DOMAIN) return process.env.NEXT_PUBLIC_FORCE_DOMAIN;
  if (process.env.NODE_ENV === 'production') return process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://thaihand.shop';
  // ถ้าไม่มี environment variables ให้ใช้ production URL เป็น default
  return process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://thaihand.shop';
};

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    LineProvider({
      clientId: process.env.LINE_CLIENT_ID!,
      clientSecret: process.env.LINE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 วัน
  },
  debug: process.env.NEXTAUTH_DEBUG === 'true',
  logger: {
    error(code, ...message) {
      console.error(`[NextAuth][${code}]`, ...message);
    },
    warn(code, ...message) {
      console.warn(`[NextAuth][${code}]`, ...message);
    },
    debug(code, ...message) {
      console.log(`[NextAuth][${code}]`, ...message);
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('SignIn - Provider:', account?.provider, 'User:', user?.name);
      console.log('Account:', account);
      console.log('Profile:', profile);
      console.log('Environment - NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
      console.log('Environment - NODE_ENV:', process.env.NODE_ENV);
      console.log('getBaseUrl():', getBaseUrl());
      
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect - URL:', url, 'Base URL:', baseUrl);
      console.log('Environment - NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
      console.log('Environment - NODE_ENV:', process.env.NODE_ENV);
      console.log('getBaseUrl():', getBaseUrl());
      
      // จัดการ error URLs
      if (url.includes('error=')) {
        console.log('OAuth Error detected, redirecting to login');
        return `${baseUrl}/login?error=OAuthSignin&message=เกิดข้อผิดพลาดในการเข้าสู่ระบบ`;
      }
      
      // ถ้าเป็น callback ให้ไป dashboard
      if (url.includes('/api/auth/callback/')) {
        console.log('OAuth Callback detected, redirecting to dashboard');
        return `${baseUrl}/dashboard`;
      }
      
      // ถ้าเป็น internal URL ให้ไป dashboard
      if (url.startsWith(baseUrl)) {
        console.log('Internal URL detected, redirecting to dashboard');
        return `${baseUrl}/dashboard`;
      }
      
      console.log('Default redirect to:', url);
      return url;
    },
    async session({ session, token }) {
      console.log("Session callback - Token:", token);
      console.log("Session callback - Session before:", session);
      
      // เพิ่ม user ID, provider และ accessToken เข้า session
      if (token.sub) {
        session.user.id = token.sub;
      }
      if (token.provider) {
        (session as any).provider = token.provider;
      }
      if (token.accessToken) {
        (session as any).accessToken = token.accessToken;
      }
      
      console.log("Session callback - Session after:", session);
      return session;
    },
    async jwt({ token, user, account, profile }) {
      console.log("JWT callback - Token:", token);
      console.log("JWT callback - User:", user);
      console.log("JWT callback - Account:", account);
      
      // เพิ่มข้อมูล user และ provider เข้า token
      if (user) {
        token.id = user.id;
      }
      if (account) {
        token.provider = account.provider;
        token.accessToken = account.access_token;
        console.log("JWT callback - Set provider:", account.provider);
        console.log("JWT callback - Set accessToken:", account.access_token ? "exists" : "missing");
        if (account.access_token) {
          console.log("JWT callback - Access token preview:", account.access_token.substring(0, 20) + "...");
        }
      }
      
      console.log("JWT callback - Final token:", token);
      return token;
    },
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('SignIn Event - Provider:', account?.provider, 'User:', user?.name, 'IsNewUser:', isNewUser);
    },
    async signOut({ session, token }) {
      console.log('SignOut Event - Session:', session?.user?.name);
    }
  }
});

export { handler as GET, handler as POST }; 