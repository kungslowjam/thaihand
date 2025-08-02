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
      params: {
        scope: 'profile openid email',
      },
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
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log('SIGNIN CALLBACK - User:', user?.id, 'Provider:', account?.provider);
      
      // สำหรับ LINE OAuth ให้ยืดหยุ่นมากขึ้น
      if (account?.provider === 'line') {
        // ตรวจสอบว่า user มีข้อมูลครบหรือไม่
        if (!user || !user.id) {
          console.log('LINE OAUTH - Creating user from profile data');
          if (profile && profile.sub) {
            user.id = profile.sub;
          } else if (account.providerAccountId) {
            user.id = account.providerAccountId;
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
      
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log('REDIRECT CALLBACK - URL:', url, 'Base URL:', baseUrl);
      
      // ตรวจสอบว่า URL เป็น localhost หรือไม่
      if (url.includes('localhost')) {
        console.log('REDIRECT FIX - Replacing localhost with production URL');
        url = url.replace('localhost', 'thaihand.shop');
      }
      
      // ถ้าเป็น OAuth callback ให้ไป dashboard
      if (url.includes('/api/auth/callback/')) {
        return baseUrl + '/dashboard';
      }
      
      // ถ้าเป็น error ให้ไป login
      if (url.includes('error=')) {
        return baseUrl + '/login?error=OAuthSignin';
      }
      
      // ถ้าเป็น internal URL ให้ไป dashboard
      if (url.startsWith(baseUrl)) {
        return baseUrl + '/dashboard';
      }
      
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