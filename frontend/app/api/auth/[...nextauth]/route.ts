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
  if (process.env.NEXT_PUBLIC_FORCE_DOMAIN) return process.env.NEXT_PUBLIC_FORCE_DOMAIN;
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.NODE_ENV === 'production') return 'https://thaihand.shop';
  return 'http://localhost:3000';
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
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect - URL:', url, 'Base URL:', baseUrl);
      
      // Force production URL เสมอ
      const productionUrl = 'https://thaihand.shop';
      console.log('Force Production URL:', productionUrl);
      
      // จัดการ error URLs
      if (url.includes('error=')) {
        console.log('OAuth Error detected, redirecting to login');
        return `${productionUrl}/login?error=OAuthSignin&message=เกิดข้อผิดพลาดในการเข้าสู่ระบบ`;
      }
      
      // ถ้าเป็น callback ให้ไป dashboard
      if (url.includes('/api/auth/callback/')) {
        console.log('OAuth Callback detected, redirecting to dashboard');
        return `${productionUrl}/dashboard`;
      }
      
      // ถ้าเป็น internal URL หรือ relative URL
      if (url.startsWith('/') || url.startsWith(baseUrl)) {
        console.log('Internal URL detected, redirecting to dashboard');
        return `${productionUrl}/dashboard`;
      }
      
      // ถ้าเป็น localhost ให้ไป production
      if (url.includes('localhost:3000')) {
        console.log('Localhost detected, redirecting to production');
        return `${productionUrl}/dashboard`;
      }
      
      // ถ้าเป็น production URL ให้ไป dashboard
      if (url.includes('thaihand.shop')) {
        console.log('Production URL detected, redirecting to dashboard');
        return `${productionUrl}/dashboard`;
      }
      
      return `${productionUrl}/dashboard`; // default fallback
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
      console.log('SignIn Event - Provider:', account?.provider, 'User:', user?.name, 'IsNewUser:', isNewUser);
    },
    async signOut({ session, token }) {
      console.log('SignOut Event - Session:', session?.user?.name);
    }
  }
});

export { handler as GET, handler as POST }; 