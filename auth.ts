import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/db/prisma';
import { cookies } from 'next/headers';
import { compare } from './lib/encrypt';
import CredentialsProvider from 'next-auth/providers/credentials';
import sampleData from '@/db/sample-data';

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        account: { type: 'text' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        if (credentials == null) return null;
        const account = String(credentials.account || '').trim();
        const password = String(credentials.password || '');

        // Demo accounts are checked first so demo login never waits for or
        // depends on a database connection. Keep this disabled in production.
        if (process.env.NEXT_PUBLIC_DEMO_AUTH_ENABLED === 'true') {
          const sampleUser = sampleData.users.find(
            (user) =>
              user.username.toLowerCase() === account.toLowerCase() &&
              password === user.password
          );

          if (sampleUser) {
            return {
              id:
                sampleUser.role === 'admin'
                  ? 'sample-admin-id'
                  : 'sample-user-id',
              name: sampleUser.name,
              email: sampleUser.email,
              role: sampleUser.role,
            };
          }
        }

        // Try find user in database
        try {
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: account },
                { email: `${account.toLowerCase()}@prostore.local` },
              ],
            },
          });

          if (user && user.password) {
            const isMatch = await compare(password, user.password);

            if (isMatch) {
              return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
              };
            }
          }
        } catch (e) {
          console.warn('Prisma auth check failed:', (e as Error).message);
        }

        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, user, trigger, token }) {
      // Set the user ID from the token
      session.user.id = token.sub;
      session.user.role = token.role;
      session.user.name = token.name;

      // If there is an update, set the user name
      if (trigger === 'update') {
        session.user.name = user.name;
      }

      return session;
    },
    async jwt({ token, user, trigger, session }) {
      // Assign user fields to token
      if (user) {
        token.id = user.id;
        token.role = user.role;

        // If user has no name then use the email
        if (user.name === 'NO_NAME') {
          token.name = user.email!.split('@')[0];

          try {
            // Update database to reflect the token name
            await prisma.user.update({
              where: { id: user.id },
              data: { name: token.name },
            });
          } catch {}
        }

        if (trigger === 'signIn' || trigger === 'signUp') {
          try {
            const cookiesObject = await cookies();
            const sessionCartId = cookiesObject.get('sessionCartId')?.value;

            if (sessionCartId) {
              const sessionCart = await prisma.cart.findFirst({
                where: { sessionCartId },
              });

              if (sessionCart) {
                // Delete current user cart
                await prisma.cart.deleteMany({
                  where: { userId: user.id },
                });

                // Assign new cart
                await prisma.cart.update({
                  where: { id: sessionCart.id },
                  data: { userId: user.id },
                });
              }
            }
          } catch {}
        }
      }

      // Handle session updates
      if (session?.user.name && trigger === 'update') {
        token.name = session.user.name;
      }

      return token;
    },
  },
});
