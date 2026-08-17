import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const adminSlug =
    process.env.ADMIN_ROUTE_SECRET ||
    process.env.NEXT_PUBLIC_ADMIN_ROUTE_SECRET ||
    'portal';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [`/${adminSlug}/`, '/login', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
