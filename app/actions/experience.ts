'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { ExperienceType } from '@/app/generated/prisma/client';

const experienceSchema = z.object({
  type: z.nativeEnum(ExperienceType),
  title: z.string().min(1, 'Posisi/Gelar wajib diisi'),
  institution: z.string().min(1, 'Institusi wajib diisi'),
  description: z.string().optional(),
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
    const rawExperiences = await prisma.experience.findMany();

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
    return { error: 'Gagal mengambil data riwayat' };
  }
}

export async function upsertExperience(
  id: string | null,
  prevState: any,
  formData: FormData
): Promise<ExperienceActionState> {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  const rawData = {
    type: formData.get('type') as string,
    title: formData.get('title') as string,
    institution: formData.get('institution') as string,
    description: formData.get('description') as string,
    startDate: formData.get('startDate') as string,
    endDate: formData.get('endDate') as string,
    isCurrent: formData.get('isCurrent') === 'on' || formData.get('isCurrent') === 'true',
  };

  const validated = experienceSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      error: 'Validasi gagal.',
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  const data = validated.data;
  
  try {
    const payload = {
      type: data.type,
      title: data.title,
      institution: data.institution,
      description: data.description || null,
      startDate: data.startDate,
      endDate: data.isCurrent ? null : data.endDate,
    };

    if (id) {
      await prisma.experience.update({
        where: { id },
        data: payload,
      });
    } else {
      await prisma.experience.create({
        data: {
          ...payload,
          order: 0, // order can be overridden manually later if needed, but defaults to 0
        },
      });
    }

    revalidatePath('/');
    revalidatePath('/admin/experience');
    return { success: id ? 'Riwayat berhasil diperbarui!' : 'Riwayat berhasil ditambahkan!' };
  } catch (error) {
    console.error('Failed to upsert experience:', error);
    return { error: 'Terjadi kesalahan saat menyimpan data.' };
  }
}

export async function deleteExperience(id: string) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    await prisma.experience.delete({ where: { id } });
    revalidatePath('/');
    revalidatePath('/admin/experience');
    return { success: 'Riwayat berhasil dihapus!' };
  } catch (error) {
    console.error('Failed to delete experience:', error);
    return { error: 'Gagal menghapus riwayat.' };
  }
}
