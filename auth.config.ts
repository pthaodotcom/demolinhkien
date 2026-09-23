import type { NextAuthConfig } from 'next-auth';
import { NextResponse } from 'next/server';

export const authConfig = {
  trustHost: true,
  providers: [], // Required by NextAuthConfig type
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      return session;
    },
    authorized({ request, auth }) {
      // Array of regex patterns of paths we want to protect
      const protectedPaths = [
        /\/shipping-address/,
        /\/payment-method/,
        /\/place-order/,
        /\/profile/,
        /\/user\/(.*)/,
        /\/order\/(.*)/,
        /\/admin/,
      ];

      // Get pathname from the req URL object
      const { pathname } = request.nextUrl;

      const customerOnlyPaths = [
        '/',
        '/search',
        '/product',
        '/cart',
        '/checkout',
        '/shipping-address',
        '/payment-method',
        '/place-order',
        '/user',
        '/order',
        '/sign-in',
        '/sign-up',
      ];
      const isCustomerPage = customerOnlyPaths.some(
        (path) => pathname === path || (path !== '/' && pathname.startsWith(`${path}/`))
      );

      if (auth?.user?.role === 'admin' && pathname.startsWith('/order/')) {
        const orderId = pathname.slice('/order/'.length);
        return NextResponse.redirect(
          new URL(`/admin/orders/${orderId}`, request.nextUrl)
        );
      }

      if (auth?.user?.role === 'admin' && isCustomerPage) {
        return NextResponse.redirect(new URL('/admin/overview', request.nextUrl));
      }

      // Check if user is not authenticated and accessing a protected path
      if (!auth && protectedPaths.some((p) => p.test(pathname))) return false;

      // Check for session cart cookie
      if (!request.cookies.get('sessionCartId')) {
        // Generate new session cart id cookie
        const sessionCartId = crypto.randomUUID();

        // Create new response and add the new headers
        const response = NextResponse.next({
          request: {
            headers: new Headers(request.headers),
          },
        });

        // Set newly generated sessionCartId in the response cookies
        response.cookies.set('sessionCartId', sessionCartId);

        return response;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
