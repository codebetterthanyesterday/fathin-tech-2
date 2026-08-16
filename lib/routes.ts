/**
 * Centralized Route Helper
 * Provides single source of truth for dynamically configured paths,
 * specifically the obfuscated Admin Portal route.
 */

export function getAdminSlug(): string {
  return (
    process.env.NEXT_PUBLIC_ADMIN_ROUTE_SECRET ||
    process.env.ADMIN_ROUTE_SECRET ||
    'portal'
  );
}

/**
 * Returns the fully qualified admin path with optional subpath.
 * Example: getAdminPath('/skills') -> '/portal/skills'
 *          getAdminPath() -> '/portal'
 */
export function getAdminPath(subpath: string = ''): string {
  const slug = getAdminSlug();
  const cleanSubpath = subpath.replace(/^\/+/, '');
  return cleanSubpath ? `/${slug}/${cleanSubpath}` : `/${slug}`;
}
