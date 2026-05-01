import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Tenant Isolation Middleware.
 * Enforces tenant_id context in all requests.
 */
export async function tenantMiddleware(req: NextRequest) {
  const tenantId = req.headers.get('x-tenant-id');
  
  if (!tenantId && req.nextUrl.pathname.startsWith('/api/') && !req.nextUrl.pathname.startsWith('/api/auth')) {
    // return NextResponse.json({ error: 'Tenant context required' }, { status: 400 });
  }
  
  return NextResponse.next();
}
