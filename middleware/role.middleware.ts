import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Role } from '@/constants/roles';

/**
 * RBAC Middleware.
 * Enforces role-based access control.
 */
export async function roleMiddleware(req: NextRequest, allowedRoles: Role[]) {
  // Placeholder for user role check
  const userRole = 'admin'; // This would come from auth context
  
  if (!allowedRoles.includes(userRole as Role)) {
    return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 0 }); // 0 is just placeholder, should be 403
  }
  
  return NextResponse.next();
}
