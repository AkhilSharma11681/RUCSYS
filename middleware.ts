import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as any)?.role;

  const isLearnerRoute = nextUrl.pathname.startsWith('/parcels');
  const isGuardRoute = nextUrl.pathname.startsWith('/guard');
  const isAdminRoute = nextUrl.pathname.startsWith('/admin');

  // Guard protected routes
  if (isLearnerRoute && (!isLoggedIn || role !== 'learner')) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  if (isGuardRoute && (!isLoggedIn || (role !== 'guard' && role !== 'admin'))) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  if (isAdminRoute && (!isLoggedIn || role !== 'admin')) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/parcels/:path*', '/guard/:path*', '/admin/:path*'],
};
