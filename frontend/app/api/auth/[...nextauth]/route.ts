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
      provider?: string;
    };
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
  callbacks: {
    async signIn({ user, account, profile }) {
      // สำหรับ LINE provider
      if (account?.provider === 'line') {
        // LINE อาจไม่มี email ให้ใช้ LINE ID แทน
        if (!user.email && profile?.sub) {
          user.email = `${profile.sub}@line.me`;
        }
        
        // ใช้ LINE display name ถ้าไม่มี name
        if (!user.name && (profile as any)?.name) {
          user.name = (profile as any).name;
        }
        
        // ใช้ LINE picture ถ้าไม่มี image
        if (!user.image && (profile as any)?.picture) {
          user.image = (profile as any).picture;
        }
      }
      
      return true;
    },
    async redirect({ url, baseUrl }) {
      // จัดการ error URLs
      if (url.includes('error=')) {
        return `${baseUrl}/login?error=OAuthSignin&message=เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง`;
      }
      
      // ถ้าเป็น callback ให้ไป dashboard
      if (url.includes('/api/auth/callback/')) {
        return `${baseUrl}/dashboard`;
      }
      
      // ถ้าเป็น internal URL ให้ไป dashboard
      if (url.startsWith(baseUrl)) {
        return `${baseUrl}/dashboard`;
      }
      
      return url;
    },
    async session({ session, token }) {
      // เพิ่ม user ID และ provider เข้า session
      if (token.sub) {
        session.user.id = token.sub;
      }
      if (token.provider) {
        session.user.provider = token.provider as string;
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
  }
});

export { handler as GET, handler as POST }; 