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

// Validate environment variables
const requiredEnvVars = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  LINE_CLIENT_ID: process.env.LINE_CLIENT_ID,
  LINE_CLIENT_SECRET: process.env.LINE_CLIENT_SECRET,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
};

console.log('NextAuth Config - Environment Variables:');
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  console.log(`${key}:`, value ? 'SET' : 'NOT SET');
  if (!value) {
    console.error(`❌ ${key} is not set!`);
  }
});

// Check if all required env vars are set
const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key, _]) => key);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing environment variables:', missingEnvVars);
  throw new Error(`Missing environment variables: ${missingEnvVars.join(', ')}`);
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
      httpOptions: {
        timeout: 30000, // 30 seconds timeout
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
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log('SIGNIN CALLBACK:', { user, account, profile, email, credentials });
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log('REDIRECT CALLBACK:', { url, baseUrl });
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    async session({ session, token, user }) {
      console.log('SESSION CALLBACK: token =', token, 'session =', session);
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