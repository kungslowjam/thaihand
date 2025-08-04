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

// Production URL detection
const getBaseUrl = () => {
  // ใช้ NEXTAUTH_URL จาก .env หรือ fallback
  return process.env.NEXTAUTH_URL || 'https://thaihand.shop';
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
  debug: process.env.DEBUG === 'True',
  logger: {
    error(code, ...message) {
      console.error(`[NextAuth][${code}]`, ...message);
    },
    warn(code, ...message) {
      console.warn(`[NextAuth][${code}]`, ...message);
    },
    debug(code, ...message) {
      if (process.env.DEBUG === 'True') {
        console.log(`[NextAuth][${code}]`, ...message);
      }
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // เพิ่ม debug logs เพื่อแก้ปัญหา
      if (process.env.DEBUG === 'True') {
        console.log('SignIn - Provider:', account?.provider, 'User:', user?.name);
        console.log('Environment - NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
        console.log('getBaseUrl():', getBaseUrl());
      }
      
      return true;
    },
    async redirect({ url, baseUrl }) {
      if (process.env.DEBUG === 'True') {
        console.log('Redirect - URL:', url, 'Base URL:', baseUrl);
      }
      
      // จัดการ error URLs
      if (url.includes('error=')) {
        if (process.env.DEBUG === 'True') {
          console.log('OAuth Error detected, redirecting to login');
        }
        return `${baseUrl}/login?error=OAuthSignin&message=เกิดข้อผิดพลาดในการเข้าสู่ระบบ`;
      }
      
      // ถ้าเป็น callback ให้ไป dashboard
      if (url.includes('/api/auth/callback/')) {
        if (process.env.DEBUG === 'True') {
          console.log('OAuth Callback detected, redirecting to dashboard');
        }
        return `${baseUrl}/dashboard`;
      }
      
      // ถ้าเป็น internal URL ให้ไป dashboard
      if (url.startsWith(baseUrl)) {
        if (process.env.DEBUG === 'True') {
          console.log('Internal URL detected, redirecting to dashboard');
        }
        return `${baseUrl}/dashboard`;
      }
      
      if (process.env.DEBUG === 'True') {
        console.log('Default redirect to:', url);
      }
      return url;
    },
    async session({ session, token }) {
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
      
      return session;
    },
    async jwt({ token, user, account, profile }) {
      // เพิ่มข้อมูล user และ provider เข้า token
      if (user) {
        token.id = user.id;
      }
      if (account) {
        token.provider = account.provider;
        token.accessToken = account.access_token;
      }
      
      return token;
    },
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      if (process.env.DEBUG === 'True') {
        console.log('SignIn Event - Provider:', account?.provider, 'User:', user?.name, 'IsNewUser:', isNewUser);
      }
    },
    async signOut({ session, token }) {
      if (process.env.DEBUG === 'True') {
        console.log('SignOut Event - Session:', session?.user?.name);
      }
    }
  },
  // เพิ่ม CSRF protection
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
});

export { handler as GET, handler as POST }; 