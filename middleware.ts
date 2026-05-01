import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 1. If no session, redirect to home (or login if implemented)
  // For MVP, we allow access to root, but protect /admin, /secretary, /consultant, /accountant
  const path = req.nextUrl.pathname;

  if (!session && (
    path.startsWith('/admin') || 
    path.startsWith('/secretary') || 
    path.startsWith('/consultant') || 
    path.startsWith('/accountant')
  )) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // 2. Role-based enforcement
  if (session) {
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (user) {
      const role = user.role;
      
      if (path.startsWith('/admin') && role !== 'admin') {
        return NextResponse.redirect(new URL('/', req.url));
      }
      if (path.startsWith('/secretary') && role !== 'secretary' && role !== 'admin') {
        return NextResponse.redirect(new URL('/', req.url));
      }
      if (path.startsWith('/consultant') && role !== 'consultant' && role !== 'admin') {
        return NextResponse.redirect(new URL('/', req.url));
      }
      if (path.startsWith('/accountant') && role !== 'accountant' && role !== 'admin') {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/secretary/:path*', '/consultant/:path*', '/accountant/:path*'],
};
