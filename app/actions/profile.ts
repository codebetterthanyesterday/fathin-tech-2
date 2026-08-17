'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { getAdminPath } from '@/lib/routes';

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
  tagline_id: z.string().optional(),
  bio_id: z.string().optional(),
  tagline_en: z.string().optional(),
  bio_en: z.string().optional(),
  photoUrl: z.string().url().optional().or(z.literal('')),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  phone: z.string().optional(),
  location: z.string().optional(),
  socialLinks: z.string().optional(), // Will be parsed to JSON
  resumeUrl: z.string().url().optional().or(z.literal('')),
});

export async function getProfile() {
  try {
    const profile = await prisma.profile.findFirst({
      include: {
        translations: true,
      },
    });
    return { profile };
  } catch (error) {
    console.error('Failed to get profile:', error);
    return { error: 'Fetch failed: Unable to retrieve profile data.' };
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
    tagline_id: (formData.get('tagline_id') as string) || (formData.get('tagline') as string) || '',
    bio_id: (formData.get('bio_id') as string) || (formData.get('bio') as string) || '',
    tagline_en: (formData.get('tagline_en') as string) || '',
    bio_en: (formData.get('bio_en') as string) || '',
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
      error: 'Validation error: Check highlighted fields.',
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
        return { error: `Parse error: Invalid social links format (${errorMessage}).` };
      }
      socialLinksJson = validatedSocial.data;
    } catch (e) {
      return { error: 'Parse error: Invalid social links JSON format.' };
    }
  }

  try {
    // Fetch existing profile or create one
    let existingProfile = await prisma.profile.findFirst();

    const basePayload = {
      name: data.name,
      photoUrl: data.photoUrl || null,
      email: data.email || null,
      phone: data.phone || null,
      location: data.location || null,
      socialLinks: socialLinksJson,
      resumeUrl: data.resumeUrl || null,
      themeAccentColor: existingProfile?.themeAccentColor || '#ffffff',
      themeFont: existingProfile?.themeFont || 'Geist',
      themeTemplate: existingProfile?.themeTemplate || 'minimal',
    };

    let profileId: string;

    if (existingProfile) {
      const updated = await prisma.profile.update({
        where: { id: existingProfile.id },
        data: basePayload,
      });
      profileId = updated.id;
    } else {
      const created = await prisma.profile.create({
        data: basePayload,
      });
      profileId = created.id;
    }

    // Upsert Indonesian translation (Default)
    await prisma.profileTranslation.upsert({
      where: {
        profileId_locale: {
          profileId,
          locale: 'id',
        },
      },
      create: {
        profileId,
        locale: 'id',
        tagline: data.tagline_id || null,
        bio: data.bio_id || null,
      },
      update: {
        tagline: data.tagline_id || null,
        bio: data.bio_id || null,
      },
    });

    // Upsert English translation
    if (data.tagline_en || data.bio_en) {
      await prisma.profileTranslation.upsert({
        where: {
          profileId_locale: {
            profileId,
            locale: 'en',
          },
        },
        create: {
          profileId,
          locale: 'en',
          tagline: data.tagline_en || null,
          bio: data.bio_en || null,
        },
        update: {
          tagline: data.tagline_en || null,
          bio: data.bio_en || null,
        },
      });
    }

    revalidatePath('/', 'layout');
    revalidatePath('/[locale]', 'layout');
    revalidatePath(getAdminPath('profile'));
    revalidatePath(getAdminPath('settings'));

    return { success: 'Profil berhasil disimpan.' };
  } catch (error) {
    console.error('Failed to upsert profile:', error);
    return { error: 'Save failed: Unable to write profile to database.' };
  }
}
