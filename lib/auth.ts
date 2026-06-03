import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const systemUser = process.env.AUTH_USERNAME?.trim();
        const systemPass = process.env.AUTH_PASSWORD?.trim();

        if (!systemUser || !systemPass) {
          console.error('CRITICAL: AUTH_USERNAME or AUTH_PASSWORD not set in environment variables');
          return null;
        }

        if (
          credentials.username.trim() === systemUser &&
          credentials.password.trim() === systemPass
        ) {
          return {
            id: '1',
            name: 'NSE Analyst',
            email: 'analyst@fo-radar.local',
          };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
