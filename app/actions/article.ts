'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

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
  title: z.string().min(1, 'Judul wajib diisi').max(200, 'Judul maksimal 200 karakter'),
  slug: z.string().optional(),
  excerpt: z.string().max(500, 'Ringkasan maksimal 500 karakter').optional().or(z.literal('')),
  contentMd: z.string().min(1, 'Konten artikel markdown wajib diisi'),
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
    });
    return { articles };
  } catch (error) {
    console.error('Failed to get articles:', error);
    return { error: 'Gagal mengambil data artikel.', articles: [] };
  }
}

export async function getArticleById(id: string) {
  try {
    const article = await prisma.article.findUnique({
      where: { id },
    });
    return { article };
  } catch (error) {
    console.error('Failed to get article:', error);
    return { error: 'Gagal mengambil artikel.', article: null };
  }
}

export async function getPublishedArticles(limit?: number) {
  try {
    const articles = await prisma.article.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });
    return { articles };
  } catch (error) {
    console.error('Failed to get published articles:', error);
    return { error: 'Gagal mengambil artikel terbit.', articles: [] };
  }
}

export async function getPublishedArticleBySlug(slug: string) {
  try {
    const article = await prisma.article.findFirst({
      where: {
        slug,
        isPublished: true,
      },
    });
    return article;
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
    title: formData.get('title') as string,
    slug: formData.get('slug') as string,
    excerpt: formData.get('excerpt') as string,
    contentMd: formData.get('contentMd') as string,
    coverImage: formData.get('coverImage') as string,
    isPublished: formData.get('isPublished') === 'on' || formData.get('isPublished') === 'true',
  };

  const validated = articleSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      error: 'Validasi gagal. Mohon periksa isian form.',
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  const data = validated.data;

  try {
    const baseSlug = data.slug && data.slug.trim() !== '' ? slugify(data.slug) : slugify(data.title);
    const uniqueSlug = await ensureUniqueArticleSlug(baseSlug, id || undefined);

    if (id) {
      // UPDATE
      const existing = await prisma.article.findUnique({ where: { id } });
      if (!existing) return { error: 'Artikel tidak ditemukan.' };

      // publishedAt logic:
      // Set publishedAt ONLY if currently null AND isPublished becomes true.
      // If already has publishedAt, retain it forever even if unpublished/republished.
      let newPublishedAt = existing.publishedAt;
      if (existing.publishedAt === null && data.isPublished) {
        newPublishedAt = new Date();
      }

      const updated = await prisma.article.update({
        where: { id },
        data: {
          title: data.title,
          slug: uniqueSlug,
          excerpt: data.excerpt || null,
          contentMd: data.contentMd,
          coverImage: data.coverImage || null,
          isPublished: data.isPublished,
          publishedAt: newPublishedAt,
        },
      });

      revalidatePath('/');
      revalidatePath('/articles');
      revalidatePath(`/articles/${uniqueSlug}`);
      if (existing.slug !== uniqueSlug) {
        revalidatePath(`/articles/${existing.slug}`);
      }
      revalidatePath('/admin/articles');

      return {
        success: 'Artikel berhasil diperbarui!',
        articleId: updated.id,
      };
    } else {
      // CREATE
      const publishedAt = data.isPublished ? new Date() : null;

      const created = await prisma.article.create({
        data: {
          title: data.title,
          slug: uniqueSlug,
          excerpt: data.excerpt || null,
          contentMd: data.contentMd,
          coverImage: data.coverImage || null,
          isPublished: data.isPublished,
          publishedAt,
        },
      });

      revalidatePath('/');
      revalidatePath('/articles');
      revalidatePath(`/articles/${uniqueSlug}`);
      revalidatePath('/admin/articles');

      return {
        success: 'Artikel berhasil dibuat!',
        articleId: created.id,
      };
    }
  } catch (error) {
    console.error('Failed to upsert article:', error);
    return { error: 'Terjadi kesalahan saat menyimpan data artikel.' };
  }
}

export async function deleteArticle(id: string): Promise<ArticleActionState> {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) return { error: 'Artikel tidak ditemukan.' };

    await prisma.article.delete({ where: { id } });

    revalidatePath('/');
    revalidatePath('/articles');
    revalidatePath(`/articles/${existing.slug}`);
    revalidatePath('/admin/articles');

    return { success: 'Artikel berhasil dihapus!' };
  } catch (error) {
    console.error('Failed to delete article:', error);
    return { error: 'Gagal menghapus artikel.' };
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
    if (!existing) return { error: 'Artikel tidak ditemukan.' };

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

    revalidatePath('/');
    revalidatePath('/articles');
    revalidatePath(`/articles/${updated.slug}`);
    revalidatePath('/admin/articles');

    return { success: isPublished ? 'Artikel dipublikasikan!' : 'Artikel diubah ke draft.' };
  } catch (error) {
    console.error('Failed to toggle article published:', error);
    return { error: 'Gagal mengubah status publikasi artikel.' };
  }
}
