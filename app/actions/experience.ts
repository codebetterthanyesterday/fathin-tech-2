'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { getAdminPath } from '@/lib/routes';
import { ExperienceType } from '@/app/generated/prisma/client';

const experienceSchema = z.object({
  type: z.nativeEnum(ExperienceType),
  title_id: z.string().min(1, 'Posisi/Gelar (ID) wajib diisi'),
  description_id: z.string().optional(),
  title_en: z.string().optional(),
  description_en: z.string().optional(),
  institution: z.string().min(1, 'Institusi wajib diisi'),
  startDate: z.string().min(1, 'Tanggal mulai wajib diisi').transform((str) => new Date(str)),
  endDate: z.string().optional().transform((str) => (str ? new Date(str) : null)),
  isCurrent: z.boolean().default(false),
}).refine(data => {
  if (!data.isCurrent && !data.endDate) return false;
  return true;
}, {
  message: 'Tanggal selesai wajib diisi jika bukan posisi saat ini',
  path: ['endDate']
}).refine(data => {
  if (!data.isCurrent && data.endDate && data.startDate) {
    return data.endDate >= data.startDate;
  }
  return true;
}, {
  message: 'Tanggal selesai harus setelah atau sama dengan tanggal mulai',
  path: ['endDate']
});

export type ExperienceActionState = {
  success?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function getExperiences() {
  try {
    const rawExperiences = await prisma.experience.findMany({
      include: {
        translations: true,
      },
    });

    // Custom sort:
    // 1. endDate NULL (Present) comes first
    // 2. endDate DESC
    // 3. startDate DESC
    // 4. order ASC
    const sorted = rawExperiences.sort((a, b) => {
      // 1. Present comes first
      if (a.endDate === null && b.endDate !== null) return -1;
      if (b.endDate === null && a.endDate !== null) return 1;

      // 2. Both have endDate, sort DESC
      if (a.endDate && b.endDate) {
        const endDiff = b.endDate.getTime() - a.endDate.getTime();
        if (endDiff !== 0) return endDiff;
      }

      // 3. Same endDate or both NULL, sort by startDate DESC
      const startDiff = b.startDate.getTime() - a.startDate.getTime();
      if (startDiff !== 0) return startDiff;

      // 4. Tie-breaker by order
      return a.order - b.order;
    });

    return {
      work: sorted.filter(e => e.type === 'WORK'),
      education: sorted.filter(e => e.type === 'EDUCATION'),
    };
  } catch (error) {
    console.error('Failed to get experiences:', error);
    return { error: 'Fetch failed: Unable to retrieve experience records.' };
  }
}

export async function upsertExperience(
  prevState: any,
  formData: FormData
): Promise<ExperienceActionState> {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  const id = (formData.get('id') as string) || null;

  const rawData = {
    type: formData.get('type') as string,
    title_id: (formData.get('title_id') as string) || (formData.get('title') as string) || '',
    description_id: (formData.get('description_id') as string) || (formData.get('description') as string) || '',
    title_en: (formData.get('title_en') as string) || '',
    description_en: (formData.get('description_en') as string) || '',
    institution: formData.get('institution') as string,
    startDate: formData.get('startDate') as string,
    endDate: formData.get('endDate') as string,
    isCurrent: formData.get('isCurrent') === 'on' || formData.get('isCurrent') === 'true',
  };

  const validated = experienceSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      error: 'Validation error: Check highlighted fields.',
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  const data = validated.data;

  try {
    const basePayload = {
      type: data.type,
      institution: data.institution,
      startDate: data.startDate,
      endDate: data.isCurrent ? null : data.endDate,
    };

    let experienceId: string;

    if (id) {
      const updated = await prisma.experience.update({
        where: { id },
        data: basePayload,
      });
      experienceId = updated.id;
    } else {
      const created = await prisma.experience.create({
        data: {
          ...basePayload,
          order: 0,
        },
      });
      experienceId = created.id;
    }

    // Upsert Indonesian Translation
    await prisma.experienceTranslation.upsert({
      where: {
        experienceId_locale: {
          experienceId,
          locale: 'id',
        },
      },
      create: {
        experienceId,
        locale: 'id',
        title: data.title_id,
        description: data.description_id || null,
      },
      update: {
        title: data.title_id,
        description: data.description_id || null,
      },
    });

    // Upsert English Translation
    if (data.title_en?.trim() || data.description_en?.trim()) {
      await prisma.experienceTranslation.upsert({
        where: {
          experienceId_locale: {
            experienceId,
            locale: 'en',
          },
        },
        create: {
          experienceId,
          locale: 'en',
          title: data.title_en || data.title_id,
          description: data.description_en || null,
        },
        update: {
          title: data.title_en || data.title_id,
          description: data.description_en || null,
        },
      });
    }

    revalidatePath('/', 'layout');
    revalidatePath('/[locale]', 'layout');
    revalidatePath(getAdminPath('experience'));
    return { success: id ? 'Pengalaman berhasil diperbarui.' : 'Pengalaman berhasil dibuat.' };
  } catch (error) {
    console.error('Failed to upsert experience:', error);
    return { error: 'Save failed: Unable to write data.' };
  }
}

export async function deleteExperience(id: string) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    await prisma.experience.delete({ where: { id } });
    revalidatePath('/', 'layout');
    revalidatePath('/[locale]', 'layout');
    revalidatePath(getAdminPath('experience'));
    return { success: 'Pengalaman berhasil dihapus.' };
  } catch (error) {
    console.error('Failed to delete experience:', error);
    return { error: 'Delete failed: Unable to remove record.' };
  }
}
