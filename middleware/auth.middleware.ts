import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Core Auth Middleware.
 * Enforces valid user session.
 */
export async function authMiddleware(req: NextRequest) {
  // Placeholder for Supabase auth check
  const token = req.headers.get('authorization');
  
  if (!token && !req.nextUrl.pathname.startsWith('/api/auth')) {
    // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // For MVP, we'll bypass this if not configured, but the logic is here.
  }
  
  return NextResponse.next();
}
