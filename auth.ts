import NextAuth from 'next-auth';
import SpotifyProvider from 'next-auth/providers/spotify';
import { SPOTIFY_SCOPES, refreshSpotifyToken } from './lib/spotify';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    error?: string;
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID || '',
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET || '',
      authorization: `https://accounts.spotify.com/authorize?scope=${encodeURIComponent(SPOTIFY_SCOPES)}&show_dialog=true`,
    }),
  ],
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development-32chars',
  callbacks: {
    async jwt({ token, account, user }) {
      // Initial sign-in
      if (account && user) {
        return {
          ...token,
          id: account.providerAccountId,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: (account.expires_at ?? 0) * 1000,
          user,
        };
      }

      // Return previous token if the access token has not expired yet
      const expiresAt = (token.accessTokenExpires as number) || 0;
      if (Date.now() < expiresAt - 60000) { // 1 min safety buffer
        return token;
      }

      // Access token has expired, refresh it
      if (token.refreshToken) {
        const refreshed = await refreshSpotifyToken(token.refreshToken as string);
        if (refreshed) {
          return {
            ...token,
            accessToken: refreshed.accessToken,
            refreshToken: refreshed.refreshToken,
            accessTokenExpires: refreshed.expiresAt,
          };
        }
      }

      return {
        ...token,
        error: 'RefreshAccessTokenError',
      };
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.error = token.error as string;
      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string);
      }
      return session;
    },
  },
  pages: {
    signIn: '/host', // custom entry point or default
  },
});
