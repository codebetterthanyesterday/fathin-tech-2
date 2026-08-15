'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const themeSettingsSchema = z.object({
  themeAccentColor: z.string().min(1, 'Warna aksen wajib diisi').default('#ffffff'),
  themeFont: z.string().min(1, 'Font tema wajib diisi').default('Geist'),
  themeTemplate: z.enum(['minimal', 'immersive']).default('minimal'),
});

export type SettingsActionState = {
  success?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function updateThemeSettings(
  prevState: any,
  formData: FormData
): Promise<SettingsActionState> {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized' };
  }

  const rawData = {
    themeAccentColor: formData.get('themeAccentColor') as string,
    themeFont: formData.get('themeFont') as string,
    themeTemplate: formData.get('themeTemplate') as string,
  };

  const validated = themeSettingsSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      error: 'Validasi pengaturan tema gagal.',
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  const data = validated.data;

  try {
    const existingProfile = await prisma.profile.findFirst();

    if (existingProfile) {
      await prisma.profile.update({
        where: { id: existingProfile.id },
        data: {
          themeAccentColor: data.themeAccentColor,
          themeFont: data.themeFont,
          themeTemplate: data.themeTemplate,
        },
      });
    } else {
      await prisma.profile.create({
        data: {
          name: 'My Portfolio',
          themeAccentColor: data.themeAccentColor,
          themeFont: data.themeFont,
          themeTemplate: data.themeTemplate,
        },
      });
    }

    revalidatePath('/');
    revalidatePath('/admin/settings');
    revalidatePath('/admin/profile');

    return { success: 'Pengaturan tema dan tampilan berhasil disimpan!' };
  } catch (error) {
    console.error('Failed to update theme settings:', error);
    return { error: 'Terjadi kesalahan saat menyimpan pengaturan tema ke database.' };
  }
}
