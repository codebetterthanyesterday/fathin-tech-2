'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// Using Zod to parse and validate social links stringified JSON
const socialLinksSchema = z.array(
  z.object({
    platform: z.string(),
    url: z.string().url('Pastikan link menggunakan format http:// atau https://').or(z.literal('')),
    iconClass: z.string(),
  })
);

const profileSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  tagline: z.string().optional(),
  bio: z.string().optional(),
  photoUrl: z.string().url().optional().or(z.literal('')),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  phone: z.string().optional(),
  location: z.string().optional(),
  socialLinks: z.string().optional(), // Will be parsed to JSON
  resumeUrl: z.string().url().optional().or(z.literal('')),
});

export async function getProfile() {
  try {
    const profile = await prisma.profile.findFirst();
    return { profile };
  } catch (error) {
    console.error('Failed to get profile:', error);
    return { error: 'Gagal mengambil data profil' };
  }
}

export type ProfileActionState = {
  success?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function upsertProfile(prevState: any, formData: FormData): Promise<ProfileActionState> {
  // Check auth
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized' };
  }

  // Extract raw data from formData
  const rawData = {
    name: formData.get('name') as string,
    tagline: formData.get('tagline') as string,
    bio: formData.get('bio') as string,
    photoUrl: formData.get('photoUrl') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    location: formData.get('location') as string,
    socialLinks: formData.get('socialLinks') as string,
    resumeUrl: formData.get('resumeUrl') as string,
  };

  const validatedFields = profileSchema.safeParse(rawData);

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    return {
      error: 'Validasi gagal, silakan periksa kembali input Anda.',
      fieldErrors: errors,
    };
  }

  const data = validatedFields.data;

  // Process socialLinks JSON
  let socialLinksJson: any = null;
  if (data.socialLinks) {
    try {
      const parsed = JSON.parse(data.socialLinks);
      const validatedSocial = socialLinksSchema.safeParse(parsed);
      if (!validatedSocial.success) {
        const firstIssue = validatedSocial.error.issues[0];
        const errorMessage = firstIssue ? firstIssue.message : 'harus berupa JSON array';
        return { error: `Format Social Links tidak valid: ${errorMessage}` };
      }
      socialLinksJson = validatedSocial.data;
    } catch (e) {
      return { error: 'Format Social Links tidak valid: Pastikan menggunakan format JSON yang benar' };
    }
  }

  try {
    // There is only one profile in the system. We fetch the first one.
    const existingProfile = await prisma.profile.findFirst();

    const updatePayload = {
      name: data.name,
      tagline: data.tagline || null,
      bio: data.bio || null,
      photoUrl: data.photoUrl || null,
      email: data.email || null,
      phone: data.phone || null,
      location: data.location || null,
      socialLinks: socialLinksJson,
      resumeUrl: data.resumeUrl || null,
      // Preserve existing theme settings without overwriting them
      themeAccentColor: existingProfile?.themeAccentColor || '#ffffff',
      themeFont: existingProfile?.themeFont || 'Geist',
      themeTemplate: existingProfile?.themeTemplate || 'minimal',
    };

    if (existingProfile) {
      await prisma.profile.update({
        where: { id: existingProfile.id },
        data: updatePayload as any,
      });
    } else {
      await prisma.profile.create({
        data: updatePayload as any,
      });
    }

    revalidatePath('/');
    revalidatePath('/admin/profile');
    revalidatePath('/admin/settings');

    return { success: 'Profil berhasil disimpan!' };
  } catch (error) {
    console.error('Failed to upsert profile:', error);
    return { error: 'Terjadi kesalahan saat menyimpan profil ke database.' };
  }
}
