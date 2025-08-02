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
    httpOptions: {
      timeout: 30000, // เพิ่ม timeout เป็น 30 วินาที
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
  debug: true, // เพิ่ม debug mode
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log('=== SIGNIN CALLBACK START ===');
      console.log('User:', user?.id, 'Provider:', account?.provider);
      console.log('Profile:', profile?.sub, 'Email:', email);
      
      try {
        // สำหรับ LINE OAuth ให้ยืดหยุ่นมากขึ้น
        if (account?.provider === 'line') {
          console.log('LINE OAUTH - Processing Line user');
          
          // ตรวจสอบว่า user มีข้อมูลครบหรือไม่
          if (!user || !user.id) {
            console.log('LINE OAUTH - Creating user from profile data');
            if (profile && profile.sub) {
              user.id = profile.sub;
              console.log('Set user.id from profile.sub:', profile.sub);
            } else if (account.providerAccountId) {
              user.id = account.providerAccountId;
              console.log('Set user.id from providerAccountId:', account.providerAccountId);
            }
          }
          
          // ตรวจสอบว่า user มีข้อมูลพื้นฐาน
          if (!user.name && profile && profile.name) {
            user.name = profile.name;
            console.log('Set user.name from profile:', profile.name);
          }
          if (!user.image && profile && (profile as any).picture) {
            user.image = (profile as any).picture;
            console.log('Set user.image from profile picture');
          }
          
          console.log('Final user object:', {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image
          });
        }
        
        console.log('=== SIGNIN CALLBACK SUCCESS ===');
        return true;
      } catch (error) {
        console.error('=== SIGNIN CALLBACK ERROR ===', error);
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      console.log('=== REDIRECT CALLBACK START ===');
      console.log('URL:', url, 'Base URL:', baseUrl);
      
      try {
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
        
        // ถ้าเป็น error ให้ไป login
        if (url.includes('error=')) {
          console.log('ERROR REDIRECT - Going to login page');
          return baseUrl + '/login?error=OAuthSignin';
        }
        
        // ถ้าเป็น internal URL ให้ไป dashboard
        if (url.startsWith(baseUrl)) {
          console.log('INTERNAL URL - Redirecting to dashboard');
          return baseUrl + '/dashboard';
        }
        
        console.log('EXTERNAL URL - Allowing redirect to:', url);
        return url;
      } catch (error) {
        console.error('=== REDIRECT CALLBACK ERROR ===', error);
        return baseUrl + '/login?error=OAuthCallback';
      }
    },
    async session({ session, token, user }) {
      console.log('=== SESSION CALLBACK START ===');
      console.log('Token:', token?.sub, 'User:', user?.id);
      
      try {
        if (token && session.user) {
          session.user.image = token.picture || session.user.image;
          session.user.id = token.sub || token.id || session.user.id;
        }
        session.accessToken = token?.accessToken || null;
        session.provider = token?.provider || null;
        
        console.log('Final session:', {
          user: session.user,
          accessToken: session.accessToken,
          provider: session.provider
        });
        
        return session;
      } catch (error) {
        console.error('=== SESSION CALLBACK ERROR ===', error);
        return session;
      }
    },
    async jwt({ token, account, profile }) {
      console.log('=== JWT CALLBACK START ===');
      console.log('Token sub:', token?.sub, 'Account:', account?.provider);
      
      try {
        if (profile && profile.sub) {
          token.sub = profile.sub;
          console.log('Set token.sub from profile:', profile.sub);
        }
        if (account && account.id && typeof account.id === 'string') {
          token.id = account.id;
          console.log('Set token.id from account:', account.id);
        }
        if (profile && typeof profile === 'object' && 'picture' in profile) {
          token.picture = String(profile.picture);
          console.log('Set token.picture from profile');
        }
        if (account && account.access_token) {
          token.accessToken = account.access_token;
          console.log('Set token.accessToken');
        }
        token.provider = account?.provider || token.provider || null;
        
        console.log('Final token:', {
          sub: token.sub,
          id: token.id,
          provider: token.provider
        });
        
        return token;
      } catch (error) {
        console.error('=== JWT CALLBACK ERROR ===', error);
        return token;
      }
    },
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('=== SIGNIN EVENT ===', {
        userId: user?.id,
        provider: account?.provider,
        isNewUser
      });
    },
    async signOut({ session, token }) {
      console.log('=== SIGNOUT EVENT ===');
    },
    async session({ session, token }) {
      console.log('=== SESSION EVENT ===');
    },
  },
});

export { handler as GET, handler as POST }; 