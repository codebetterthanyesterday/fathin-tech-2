import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

const publicRoutes = ['/login'];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const adminSlug =
    process.env.ADMIN_ROUTE_SECRET ||
    process.env.NEXT_PUBLIC_ADMIN_ROUTE_SECRET ||
    'portal';
  const adminBasePath = `/${adminSlug}`;

  const isProtectedRoute =
    path === adminBasePath || path.startsWith(`${adminBasePath}/`);
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route));

  const sessionCookie = req.cookies.get('session')?.value;
  let session = null;
  if (sessionCookie) {
    session = await verifyToken(sessionCookie);
  }

  // Redirect to login if accessing a protected route without valid session
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // Redirect to admin dashboard if accessing login while already authenticated
  if (isPublicRoute && session && !isProtectedRoute) {
    return NextResponse.redirect(new URL(adminBasePath, req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
