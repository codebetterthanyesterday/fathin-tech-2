'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { getAdminPath } from '@/lib/routes';
import { z } from 'zod';

export type CategoryDimension = 'SKILL' | 'ISSUER' | 'TYPE';

export type CertificationActionState = {
  success?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

const categoryInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  dimension: z.enum(['SKILL', 'ISSUER', 'TYPE']),
});

const certificationSchema = z.object({
  id: z.string().optional(),
  issueDate: z.string().min(1, 'Issue date is required'),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  credentialUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  imageUrl: z.string().optional().or(z.literal('')),
  isVisible: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  title_id: z.string().min(1, 'Judul (ID) wajib diisi'),
  issuingOrg_id: z.string().min(1, 'Penerbit (ID) wajib diisi'),
  title_en: z.string().optional(),
  issuingOrg_en: z.string().optional(),
  categoriesJson: z.string().optional(),
});

export async function getCertifications() {
  try {
    const certifications = await prisma.certification.findMany({
      orderBy: { order: 'asc' },
      include: {
        translations: true,
        categories: { include: { category: true } },
      },
    });
    return { certifications };
  } catch (error) {
    console.error('Failed to fetch certifications:', error);
    return { error: 'Failed to fetch certifications.', certifications: [] };
  }
}

export async function getCertificationById(id: string) {
  try {
    const certification = await prisma.certification.findUnique({
      where: { id },
      include: {
        translations: true,
        categories: { include: { category: true } },
      },
    });
    return { certification };
  } catch (error) {
    console.error('Failed to fetch certification:', error);
    return { error: 'Failed to fetch certification.', certification: null };
  }
}

export async function getCertificationCategories() {
  try {
    const categories = await prisma.certificationCategory.findMany({
      orderBy: [{ dimension: 'asc' }, { name: 'asc' }],
    });
    return { categories };
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return { error: 'Failed to fetch categories.', categories: [] };
  }
}

const PAGE_SIZE = 12;

export async function getPublicCertifications(filter: { page?: number; categoryIds?: string[] } = {}) {
  const { page = 1, categoryIds } = filter;
  const skip = (page - 1) * PAGE_SIZE;

  let where: any = { isVisible: true };

  if (categoryIds && categoryIds.length > 0) {
    const selectedCategories = await prisma.certificationCategory.findMany({
      where: { id: { in: categoryIds } },
    });

    const byDimension: Record<string, string[]> = {};
    for (const cat of selectedCategories) {
      if (!byDimension[cat.dimension]) byDimension[cat.dimension] = [];
      byDimension[cat.dimension].push(cat.id);
    }

    const dimensionClauses = Object.entries(byDimension).map(([, ids]) => ({
      categories: { some: { categoryId: { in: ids } } },
    }));

    if (dimensionClauses.length > 0) {
      where = { ...where, AND: dimensionClauses };
    }
  }

  try {
    const [total, certifications] = await Promise.all([
      prisma.certification.count({ where }),
      prisma.certification.findMany({
        where,
        orderBy: [{ order: 'asc' }, { issueDate: 'desc' }],
        skip,
        take: PAGE_SIZE,
        include: {
          translations: true,
          categories: { include: { category: true } },
        },
      }),
    ]);

    return {
      certifications,
      total,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil(total / PAGE_SIZE),
    };
  } catch (error) {
    console.error('Failed to get public certifications:', error);
    return { certifications: [], total: 0, page, pageSize: PAGE_SIZE, totalPages: 0 };
  }
}

export async function getPublicCertificationById(id: string) {
  try {
    const cert = await prisma.certification.findUnique({
      where: { id, isVisible: true },
      include: {
        translations: true,
        categories: { include: { category: true } },
      },
    });
    return cert;
  } catch (error) {
    console.error('Failed to get public certification by id:', error);
    return null;
  }
}

export async function getFeaturedCertifications(limit = 4) {
  try {
    let certs = await prisma.certification.findMany({
      where: { isVisible: true, isFeatured: true },
      orderBy: [{ order: 'asc' }, { issueDate: 'desc' }],
      take: limit,
      include: {
        translations: true,
        categories: { include: { category: true } },
      },
    });
    if (certs.length === 0) {
      certs = await prisma.certification.findMany({
        where: { isVisible: true },
        orderBy: { issueDate: 'desc' },
        take: limit,
        include: {
          translations: true,
          categories: { include: { category: true } },
        },
      });
    }
    return certs;
  } catch (error) {
    console.error('Failed to get featured certifications:', error);
    return [];
  }
}

function slugify(name: string, dimension: string): string {
  return `${dimension.toLowerCase()}-${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')}`;
}

export async function upsertCertification(
  prevState: CertificationActionState,
  formData: FormData
): Promise<CertificationActionState> {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  const raw = {
    id: (formData.get('id') as string) || undefined,
    issueDate: formData.get('issueDate') as string,
    expiryDate: (formData.get('expiryDate') as string) || undefined,
    credentialId: (formData.get('credentialId') as string) || undefined,
    credentialUrl: (formData.get('credentialUrl') as string) || '',
    imageUrl: (formData.get('imageUrl') as string) || '',
    isVisible: formData.get('isVisible') === 'true',
    isFeatured: formData.get('isFeatured') === 'true',
    title_id: formData.get('title_id') as string,
    issuingOrg_id: formData.get('issuingOrg_id') as string,
    title_en: (formData.get('title_en') as string) || undefined,
    issuingOrg_en: (formData.get('issuingOrg_en') as string) || undefined,
    categoriesJson: (formData.get('categoriesJson') as string) || '[]',
  };

  const parsed = certificationSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  if (data.expiryDate && data.expiryDate.trim() !== '') {
    if (new Date(data.expiryDate) <= new Date(data.issueDate)) {
      return { fieldErrors: { expiryDate: ['Expiry date must be after issue date'] } };
    }
  }

  let parsedCategories: Array<{ id?: string; name: string; dimension: string }> = [];
  try {
    const rawCats = JSON.parse(data.categoriesJson || '[]');
    parsedCategories = rawCats
      .map((c: any) => categoryInputSchema.safeParse(c))
      .filter((r: any) => r.success)
      .map((r: any) => r.data);
  } catch {
    // ignore
  }

  try {
    const categoryIds: string[] = [];
    for (const cat of parsedCategories) {
      if (cat.id) {
        categoryIds.push(cat.id);
      } else {
        const slug = slugify(cat.name, cat.dimension);
        const existing = await prisma.certificationCategory.findUnique({ where: { slug } });
        if (existing) {
          categoryIds.push(existing.id);
        } else {
          const created = await prisma.certificationCategory.create({
            data: { name: cat.name, slug, dimension: cat.dimension as any },
          });
          categoryIds.push(created.id);
        }
      }
    }

    const issueDate = new Date(data.issueDate);
    const expiryDate =
      data.expiryDate && data.expiryDate.trim() !== '' ? new Date(data.expiryDate) : null;

    if (data.id) {
      await prisma.certification.update({
        where: { id: data.id },
        data: {
          title: data.title_id,
          issuingOrg: data.issuingOrg_id,
          credentialId: data.credentialId || null,
          credentialUrl: data.credentialUrl || null,
          imageUrl: data.imageUrl || null,
          issueDate,
          expiryDate,
          isVisible: data.isVisible,
          isFeatured: data.isFeatured,
        },
      });

      await prisma.certificationTranslation.upsert({
        where: { certificationId_locale: { certificationId: data.id, locale: 'id' } },
        create: { certificationId: data.id, locale: 'id', title: data.title_id, issuingOrg: data.issuingOrg_id },
        update: { title: data.title_id, issuingOrg: data.issuingOrg_id },
      });
      await prisma.certificationTranslation.upsert({
        where: { certificationId_locale: { certificationId: data.id, locale: 'en' } },
        create: {
          certificationId: data.id,
          locale: 'en',
          title: data.title_en || data.title_id,
          issuingOrg: data.issuingOrg_en || data.issuingOrg_id,
        },
        update: {
          title: data.title_en || data.title_id,
          issuingOrg: data.issuingOrg_en || data.issuingOrg_id,
        },
      });

      await prisma.certificationCategoryOnCertification.deleteMany({
        where: { certificationId: data.id },
      });
      if (categoryIds.length > 0) {
        await prisma.certificationCategoryOnCertification.createMany({
          data: categoryIds.map((catId) => ({ certificationId: data.id!, categoryId: catId })),
          skipDuplicates: true,
        });
      }
    } else {
      const maxOrder = await prisma.certification.aggregate({ _max: { order: true } });
      const newOrder = (maxOrder._max.order ?? -1) + 1;

      const cert = await prisma.certification.create({
        data: {
          title: data.title_id,
          issuingOrg: data.issuingOrg_id,
          credentialId: data.credentialId || null,
          credentialUrl: data.credentialUrl || null,
          imageUrl: data.imageUrl || null,
          issueDate,
          expiryDate,
          isVisible: data.isVisible,
          isFeatured: data.isFeatured,
          order: newOrder,
        },
      });

      await prisma.certificationTranslation.createMany({
        data: [
          { certificationId: cert.id, locale: 'id', title: data.title_id, issuingOrg: data.issuingOrg_id },
          {
            certificationId: cert.id,
            locale: 'en',
            title: data.title_en || data.title_id,
            issuingOrg: data.issuingOrg_en || data.issuingOrg_id,
          },
        ],
      });

      if (categoryIds.length > 0) {
        await prisma.certificationCategoryOnCertification.createMany({
          data: categoryIds.map((catId) => ({ certificationId: cert.id, categoryId: catId })),
          skipDuplicates: true,
        });
      }
    }

    revalidatePath('/');
    revalidatePath('/certifications');
    revalidatePath(getAdminPath('certifications'));
    return { success: data.id ? 'Certification updated.' : 'Certification created.' };
  } catch (error) {
    console.error('Failed to upsert certification:', error);
    return { error: 'Failed to save certification. Please try again.' };
  }
}

export async function deleteCertification(id: string): Promise<CertificationActionState> {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    await prisma.certification.delete({ where: { id } });
    revalidatePath('/');
    revalidatePath('/certifications');
    revalidatePath(getAdminPath('certifications'));
    return { success: 'Certification deleted.' };
  } catch (error) {
    console.error('Failed to delete certification:', error);
    return { error: 'Failed to delete certification.' };
  }
}

export async function reorderCertifications(orderedIds: string[]): Promise<CertificationActionState> {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.certification.update({ where: { id }, data: { order: index } })
      )
    );
    revalidatePath('/');
    revalidatePath('/certifications');
    revalidatePath(getAdminPath('certifications'));
    return { success: 'Order updated.' };
  } catch (error) {
    console.error('Failed to reorder certifications:', error);
    return { error: 'Failed to update order.' };
  }
}
