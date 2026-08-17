import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { routing } from '@/i18n/routing';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Fetch all projects and published articles in parallel
  const [projects, articles] = await Promise.all([
    prisma.project.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        order: 'asc',
      },
    }),
    prisma.article.findMany({
      where: { isPublished: true },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
    }),
  ]);

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Home pages (/id, /en)
  for (const locale of routing.locales) {
    sitemapEntries.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${baseUrl}/${l}`])
        ),
      },
    });
  }

  // Articles list pages (/id/articles, /en/articles)
  for (const locale of routing.locales) {
    sitemapEntries.push({
      url: `${baseUrl}/${locale}/articles`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${baseUrl}/${l}/articles`])
        ),
      },
    });
  }

  // Project detail pages (/id/projects/:slug, /en/projects/:slug)
  for (const project of projects) {
    for (const locale of routing.locales) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/projects/${project.slug}`,
        lastModified: project.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, `${baseUrl}/${l}/projects/${project.slug}`])
          ),
        },
      });
    }
  }

  // Article detail pages (/id/articles/:slug, /en/articles/:slug)
  for (const article of articles) {
    for (const locale of routing.locales) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/articles/${article.slug}`,
        lastModified: article.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, `${baseUrl}/${l}/articles/${article.slug}`])
          ),
        },
      });
    }
  }

  return sitemapEntries;
}
