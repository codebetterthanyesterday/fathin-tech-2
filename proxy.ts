import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { verifyToken } from './lib/auth';
import { NextRequest, NextResponse } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

const publicAuthRoutes = ['/login', '/forgot-password', '/reset-password'];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const adminSlug =
    process.env.ADMIN_ROUTE_SECRET ||
    process.env.NEXT_PUBLIC_ADMIN_ROUTE_SECRET ||
    'portal';
  const adminBasePath = `/${adminSlug}`;

  const isConfiguredAdminRoute =
    path === adminBasePath || path.startsWith(`${adminBasePath}/`);
  const isDirectInternalAdminRoute =
    path === '/admin-portal' || path.startsWith('/admin-portal/');
  const isAuthRoute = publicAuthRoutes.some((route) => path.startsWith(route));

  // 1. Direct access to internal /admin-portal is blocked unless adminSlug is literally 'admin-portal'
  if (isDirectInternalAdminRoute && adminSlug !== 'admin-portal') {
    return NextResponse.rewrite(new URL('/not-found', req.nextUrl));
  }

  // 2. Auth routes (/login, /forgot-password, /reset-password)
  if (isAuthRoute) {
    const sessionCookie = req.cookies.get('session')?.value;
    let session = null;
    if (sessionCookie) {
      session = await verifyToken(sessionCookie);
    }

    // Redirect to admin dashboard if accessing login/auth while already authenticated
    if (session) {
      return NextResponse.redirect(new URL(adminBasePath, req.nextUrl));
    }

    return NextResponse.next();
  }

  // 3. Admin protected routes
  if (isConfiguredAdminRoute) {
    const sessionCookie = req.cookies.get('session')?.value;
    let session = null;
    if (sessionCookie) {
      session = await verifyToken(sessionCookie);
    }

    // Redirect to login if accessing a protected route without valid session
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.nextUrl));
    }

    // Rewrite from public obfuscated path to internal admin-portal route
    const internalPath = path === adminBasePath
      ? '/admin-portal'
      : path.replace(new RegExp(`^${adminBasePath}`), '/admin-portal');

    const rewriteUrl = new URL(internalPath, req.nextUrl);
    rewriteUrl.search = req.nextUrl.search;
    return NextResponse.rewrite(rewriteUrl);
  }

  // 4. Bypass API routes, static files, and metadata routes from next-intl
  if (
    path.startsWith('/api') ||
    path.startsWith('/_next') ||
    path === '/robots.txt' ||
    path === '/sitemap.xml' ||
    path === '/favicon.ico' ||
    path.includes('.')
  ) {
    return NextResponse.next();
  }

  // 5. Public routes: let next-intl handle locale prefixing, detection, and redirects
  return handleI18nRouting(req);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)'],
};
