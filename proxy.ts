import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function proxy(req) {
    const pathname = req.nextUrl.pathname;
    
    // Allow sign-in page without redirect
    if (pathname === '/admin/sign-in') {
      const response = NextResponse.next();
      response.headers.set('x-invoke-path', pathname);
      return response;
    }

    const token = req.nextauth.token;
    const isAdmin = token?.role === 'ADMIN';
    const isAdminRoute = pathname.startsWith('/admin');

    // If accessing admin route but not admin, redirect to sign-in
    if (isAdminRoute && !isAdmin) {
      return NextResponse.redirect(new URL('/admin/sign-in', req.url));
    }

    const response = NextResponse.next();
    response.headers.set('x-invoke-path', pathname);
    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to sign-in page without auth
        if (req.nextUrl.pathname === '/admin/sign-in') {
          return true;
        }

        const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');

        // Require auth for other admin routes
        if (isAdminRoute) {
          return !!token && token.role === 'ADMIN';
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/admin/:path*'],
};

