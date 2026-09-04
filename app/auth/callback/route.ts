import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/parcels';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const role =
        user?.user_metadata?.role ||
        user?.app_metadata?.role ||
        (user?.email?.endsWith('@rishihood.edu.in') ? 'learner' : 'guard');

      if (role === 'admin') {
        return NextResponse.redirect(`${origin}/admin`);
      } else if (role === 'guard') {
        return NextResponse.redirect(`${origin}/guard`);
      } else {
        return NextResponse.redirect(`${origin}/parcels`);
      }
    }
  }

  // Return the user to an error page or login with error
  return NextResponse.redirect(`${origin}/login?error=Could%20not%20authenticate`);
}
