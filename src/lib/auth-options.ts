import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';
import { findOrCreateOAuthUser, type OAuthProviderId } from '@/lib/auth';

function providers() {
  const list = [];
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    list.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: true,
      })
    );
  }
  if (
    process.env.APPLE_ID &&
    process.env.APPLE_SECRET
  ) {
    list.push(
      AppleProvider({
        clientId: process.env.APPLE_ID,
        clientSecret: process.env.APPLE_SECRET,
        allowDangerousEmailAccountLinking: true,
      })
    );
  }
  return list;
}

export const authOptions: NextAuthOptions = {
  providers: providers(),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7,
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile && (account.provider === 'google' || account.provider === 'apple')) {
        const provider = account.provider as OAuthProviderId;
        const p = profile as {
          email?: string;
          name?: string;
          given_name?: string;
          family_name?: string;
        };
        const email = p.email;
        if (!email) {
          throw new Error('Your Apple account did not share an email. Use Google or email/password, or update Apple settings.');
        }
        const u = await findOrCreateOAuthUser({
          provider,
          providerAccountId: account.providerAccountId,
          email,
          name: p.name,
          givenName: p.given_name,
          familyName: p.family_name,
        });
        token.appUserId = u.id;
        token.appEmail = u.email;
        token.name = [u.first_name, u.last_name].filter(Boolean).join(' ') || null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.appUserId && session.user) {
        (session.user as { id?: number }).id = token.appUserId as number;
        if (token.appEmail) session.user.email = String(token.appEmail);
      }
      return session;
    },
  },
};
