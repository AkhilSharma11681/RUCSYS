import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const path = url.pathname;

  // Protected route prefixes
  const isLearnerRoute = path.startsWith('/parcels');
  const isGuardRoute = path.startsWith('/guard');
  const isAdminRoute = path.startsWith('/admin');

  if (isLearnerRoute || isGuardRoute || isAdminRoute) {
    if (!user) {
      url.pathname = '/login';
      url.searchParams.set('redirectTo', path);
      return NextResponse.redirect(url);
    }

    const role =
      user.user_metadata?.role ||
      user.app_metadata?.role ||
      (user.email?.endsWith('@rishihood.edu.in') ? 'learner' : 'guard');

    // Role-based route gating
    if (isGuardRoute && role !== 'guard' && role !== 'admin') {
      url.pathname = '/parcels';
      return NextResponse.redirect(url);
    }

    if (isAdminRoute && role !== 'admin') {
      url.pathname = role === 'guard' ? '/guard' : '/parcels';
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated user from /login to their default dashboard
  if (path === '/login' && user) {
    const role =
      user.user_metadata?.role ||
      user.app_metadata?.role ||
      (user.email?.endsWith('@rishihood.edu.in') ? 'learner' : 'guard');

    if (role === 'admin') {
      url.pathname = '/admin';
    } else if (role === 'guard') {
      url.pathname = '/guard';
    } else {
      url.pathname = '/parcels';
    }
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/parcels/:path*',
    '/guard/:path*',
    '/admin/:path*',
    '/login',
  ],
};
