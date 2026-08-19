'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { getAdminPath } from '@/lib/routes';

// Helper to normalize and auto-prefix URLs
function normalizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

const socialLinksSchema = z.array(
  z.object({
    platform: z.string().default(''),
    url: z.string().default(''),
    iconClass: z.string().default('fa-solid fa-link'),
  })
);

const profileSchema = z.object({
  name: z.string().trim().min(1, 'Nama wajib diisi'),
  tagline_id: z.string().optional(),
  bio_id: z.string().optional(),
  location_id: z.string().optional(),
  tagline_en: z.string().optional(),
  bio_en: z.string().optional(),
  location_en: z.string().optional(),
  photoUrl: z.string().optional().nullable(),
  email: z.string().trim().email('Format email tidak valid').optional().or(z.literal('')),
  phone: z.string().trim().optional(),
  location: z.string().trim().optional(),
  socialLinks: z.string().optional(), // Will be parsed to JSON
  resumeUrl: z.string().optional().nullable(),
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
    console.error('[upsertProfile] Unauthorized submission attempt');
    return { error: 'Unauthorized: Sesi login Anda telah berakhir. Silakan login kembali.' };
  }

  // Extract raw data from formData with safe trimming
  const rawEmail = (formData.get('email') as string || '').trim();
  const rawPhoto = (formData.get('photoUrl') as string || '').trim();
  const rawResume = (formData.get('resumeUrl') as string || '').trim();

  const rawData = {
    name: (formData.get('name') as string || '').trim(),
    tagline_id: ((formData.get('tagline_id') as string) || (formData.get('tagline') as string) || '').trim(),
    bio_id: ((formData.get('bio_id') as string) || (formData.get('bio') as string) || '').trim(),
    location_id: ((formData.get('location_id') as string) || (formData.get('location') as string) || '').trim(),
    tagline_en: (formData.get('tagline_en') as string || '').trim(),
    bio_en: (formData.get('bio_en') as string || '').trim(),
    location_en: (formData.get('location_en') as string || '').trim(),
    photoUrl: rawPhoto ? normalizeUrl(rawPhoto) : '',
    email: rawEmail,
    phone: (formData.get('phone') as string || '').trim(),
    location: (formData.get('location') as string || '').trim(),
    socialLinks: (formData.get('socialLinks') as string || '').trim(),
    resumeUrl: rawResume ? normalizeUrl(rawResume) : '',
  };

  const validatedFields = profileSchema.safeParse(rawData);

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    console.error('[upsertProfile] Validation failed:', errors);
    return {
      error: 'Validation error: Periksa kembali isian form Anda.',
      fieldErrors: errors,
    };
  }

  const data = validatedFields.data;

  // Process and sanitize socialLinks JSON
  let socialLinksJson: any = null;
  if (data.socialLinks) {
    try {
      const parsed = JSON.parse(data.socialLinks);
      const validatedSocial = socialLinksSchema.safeParse(parsed);
      if (validatedSocial.success) {
        // Filter out empty rows and normalize URLs
        socialLinksJson = validatedSocial.data
          .filter((item) => item.platform.trim() || item.url.trim())
          .map((item) => ({
            platform: item.platform.trim(),
            url: normalizeUrl(item.url) || '',
            iconClass: item.iconClass.trim() || 'fa-solid fa-link',
          }));
      } else {
        console.warn('[upsertProfile] Invalid social links schema:', validatedSocial.error);
        socialLinksJson = [];
      }
    } catch (e) {
      console.error('[upsertProfile] Failed to parse socialLinks JSON:', e);
      socialLinksJson = [];
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
      location: data.location_id || data.location || data.location_en || null,
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
        location: data.location_id || data.location || null,
      },
      update: {
        tagline: data.tagline_id || null,
        bio: data.bio_id || null,
        location: data.location_id || data.location || null,
      },
    });

    // Upsert or remove English translation
    if (data.tagline_en || data.bio_en || data.location_en) {
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
          location: data.location_en || null,
        },
        update: {
          tagline: data.tagline_en || null,
          bio: data.bio_en || null,
          location: data.location_en || null,
        },
      });
    } else {
      // If user cleared EN fields, clean up EN translation row
      await prisma.profileTranslation.deleteMany({
        where: {
          profileId,
          locale: 'en',
        },
      });
    }

    // Comprehensive cache revalidation
    revalidatePath('/', 'layout');
    revalidatePath('/[locale]', 'layout');
    revalidatePath('/admin-portal', 'layout');
    revalidatePath('/admin-portal/profile');
    revalidatePath('/portal', 'layout');
    revalidatePath(getAdminPath('profile'));
    revalidatePath(getAdminPath('settings'));

    return { success: 'Profil berhasil diperbarui dan disimpan.' };
  } catch (error) {
    console.error('Failed to upsert profile:', error);
    return { error: 'Save failed: Terjadi kesalahan saat menyimpan profil ke database.' };
  }
}
