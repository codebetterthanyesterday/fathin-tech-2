'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { getAdminPath } from '@/lib/routes';
import { resolveArticle, ResolvedArticle } from '@/lib/translations';

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const articleSchema = z.object({
  title_id: z.string().min(1, 'Judul (ID) wajib diisi').max(200, 'Judul maksimal 200 karakter'),
  excerpt_id: z.string().max(500, 'Ringkasan maksimal 500 karakter').optional().or(z.literal('')),
  contentMd_id: z.string().min(1, 'Konten artikel markdown (ID) wajib diisi'),

  title_en: z.string().max(200, 'Judul maksimal 200 karakter').optional().or(z.literal('')),
  excerpt_en: z.string().max(500, 'Ringkasan maksimal 500 karakter').optional().or(z.literal('')),
  contentMd_en: z.string().optional().or(z.literal('')),

  slug: z.string().optional(),
  coverImage: z.string().url('URL gambar tidak valid').optional().or(z.literal('')),
  isPublished: z.boolean().default(false),
});

export type ArticleActionState = {
  success?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  articleId?: string;
};

export async function getArticles() {
  try {
    const articles = await prisma.article.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        translations: true,
      },
    });
    return { articles };
  } catch (error) {
    console.error('Failed to get articles:', error);
    return { error: 'Fetch failed: Unable to retrieve articles.', articles: [] };
  }
}

export async function getArticleById(id: string) {
  try {
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        translations: true,
      },
    });
    return { article };
  } catch (error) {
    console.error('Failed to get article:', error);
    return { error: 'Fetch failed: Article not found.', article: null };
  }
}

export async function getPublishedArticles(limit?: number, locale: string = 'id'): Promise<{
  articles: ResolvedArticle[];
  error?: string;
}> {
  try {
    const rawArticles = await prisma.article.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      include: {
        translations: true,
      },
    });

    const articles = rawArticles
      .map((a) => resolveArticle(a, locale))
      .filter((a): a is ResolvedArticle => a !== null);

    return { articles };
  } catch (error) {
    console.error('Failed to get published articles:', error);
    return { error: 'Fetch failed: Unable to retrieve published articles.', articles: [] };
  }
}

export async function getPublishedArticleBySlug(
  slug: string,
  locale: string = 'id'
): Promise<ResolvedArticle | null> {
  try {
    const rawArticle = await prisma.article.findFirst({
      where: {
        slug,
        isPublished: true,
      },
      include: {
        translations: true,
      },
    });

    return resolveArticle(rawArticle, locale);
  } catch (error) {
    console.error(`Failed to get article by slug ${slug}:`, error);
    return null;
  }
}

async function ensureUniqueArticleSlug(baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug || 'article';
  let counter = 1;
  while (true) {
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) {
      break;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

export async function upsertArticle(
  id: string | null,
  prevState: any,
  formData: FormData
): Promise<ArticleActionState> {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  const rawData = {
    title_id: (formData.get('title_id') as string) || (formData.get('title') as string) || '',
    excerpt_id: (formData.get('excerpt_id') as string) || (formData.get('excerpt') as string) || '',
    contentMd_id: (formData.get('contentMd_id') as string) || (formData.get('contentMd') as string) || '',

    title_en: (formData.get('title_en') as string) || '',
    excerpt_en: (formData.get('excerpt_en') as string) || '',
    contentMd_en: (formData.get('contentMd_en') as string) || '',

    slug: formData.get('slug') as string,
    coverImage: formData.get('coverImage') as string,
    isPublished: formData.get('isPublished') === 'on' || formData.get('isPublished') === 'true',
  };

  const validated = articleSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      error: 'Validation error: Check highlighted fields.',
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  const data = validated.data;

  try {
    const baseSlug = data.slug && data.slug.trim() !== '' ? slugify(data.slug) : slugify(data.title_id);
    const uniqueSlug = await ensureUniqueArticleSlug(baseSlug, id || undefined);

    let articleId: string;

    if (id) {
      // UPDATE
      const existing = await prisma.article.findUnique({ where: { id } });
      if (!existing) return { error: 'Update failed: Article not found.' };

      let newPublishedAt = existing.publishedAt;
      if (existing.publishedAt === null && data.isPublished) {
        newPublishedAt = new Date();
      }

      const updated = await prisma.article.update({
        where: { id },
        data: {
          slug: uniqueSlug,
          coverImage: data.coverImage || null,
          isPublished: data.isPublished,
          publishedAt: newPublishedAt,
        },
      });
      articleId = updated.id;
    } else {
      // CREATE
      const publishedAt = data.isPublished ? new Date() : null;

      const created = await prisma.article.create({
        data: {
          slug: uniqueSlug,
          coverImage: data.coverImage || null,
          isPublished: data.isPublished,
          publishedAt,
        },
      });
      articleId = created.id;
    }

    // Upsert Indonesian Translation (Default)
    await prisma.articleTranslation.upsert({
      where: {
        articleId_locale: {
          articleId,
          locale: 'id',
        },
      },
      create: {
        articleId,
        locale: 'id',
        title: data.title_id,
        excerpt: data.excerpt_id || null,
        contentMd: data.contentMd_id,
      },
      update: {
        title: data.title_id,
        excerpt: data.excerpt_id || null,
        contentMd: data.contentMd_id,
      },
    });

    // Upsert English Translation (if provided)
    if (data.title_en?.trim() || data.contentMd_en?.trim()) {
      await prisma.articleTranslation.upsert({
        where: {
          articleId_locale: {
            articleId,
            locale: 'en',
          },
        },
        create: {
          articleId,
          locale: 'en',
          title: data.title_en || data.title_id,
          excerpt: data.excerpt_en || null,
          contentMd: data.contentMd_en || data.contentMd_id,
        },
        update: {
          title: data.title_en || data.title_id,
          excerpt: data.excerpt_en || null,
          contentMd: data.contentMd_en || data.contentMd_id,
        },
      });
    }

    revalidatePath('/', 'layout');
    revalidatePath('/[locale]', 'layout');
    revalidatePath('/[locale]/articles', 'layout');
    revalidatePath(getAdminPath('articles'));

    return {
      success: id ? 'Artikel berhasil diperbarui.' : 'Artikel berhasil dibuat.',
      articleId,
    };
  } catch (error) {
    console.error('Failed to upsert article:', error);
    return { error: 'Save failed: Unable to write article to database.' };
  }
}

export async function deleteArticle(id: string): Promise<ArticleActionState> {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) return { error: 'Delete failed: Article not found.' };

    await prisma.article.delete({ where: { id } });

    revalidatePath('/', 'layout');
    revalidatePath('/[locale]', 'layout');
    revalidatePath('/[locale]/articles', 'layout');
    revalidatePath(getAdminPath('articles'));

    return { success: 'Artikel berhasil dihapus.' };
  } catch (error) {
    console.error('Failed to delete article:', error);
    return { error: 'Delete failed: Unable to remove article.' };
  }
}

export async function toggleArticlePublished(
  id: string,
  isPublished: boolean
): Promise<ArticleActionState> {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) return { error: 'Status update failed: Article not found.' };

    let newPublishedAt = existing.publishedAt;
    if (existing.publishedAt === null && isPublished) {
      newPublishedAt = new Date();
    }

    const updated = await prisma.article.update({
      where: { id },
      data: {
        isPublished,
        publishedAt: newPublishedAt,
      },
    });

    revalidatePath('/', 'layout');
    revalidatePath('/[locale]', 'layout');
    revalidatePath('/[locale]/articles', 'layout');
    revalidatePath(getAdminPath('articles'));

    return { success: isPublished ? 'Status: Dipublikasikan.' : 'Status: Draf.' };
  } catch (error) {
    console.error('Failed to toggle article published:', error);
    return { error: 'Status update failed: Unable to toggle publication.' };
  }
}
