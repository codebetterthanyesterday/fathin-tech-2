'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { getAdminPath } from '@/lib/routes';
import { z } from 'zod';

const TestimonialSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(100),
  role_id: z.string().max(100).optional(),
  quote_id: z.string().min(1, 'Testimoni (ID) wajib diisi').max(3000, 'Testimoni terlalu panjang'),
  role_en: z.string().max(100).optional(),
  quote_en: z.string().max(3000, 'Testimoni terlalu panjang').optional(),
  photoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export type TestimonialActionState = {
  success?: string;
  error?: string;
  fieldErrors?: {
    name?: string[];
    role_id?: string[];
    quote_id?: string[];
    role_en?: string[];
    quote_en?: string[];
    photoUrl?: string[];
  };
};

export async function getTestimonials() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { order: 'asc' },
      include: {
        translations: true,
      },
    });
    return { testimonials };
  } catch (error) {
    console.error('Failed to fetch testimonials:', error);
    return { error: 'Fetch failed: Unable to retrieve testimonials.', testimonials: [] };
  }
}

export async function createTestimonial(
  prevState: TestimonialActionState,
  formData: FormData
): Promise<TestimonialActionState> {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  const rawData = {
    name: formData.get('name') as string,
    role_id: (formData.get('role_id') as string) || (formData.get('role') as string) || '',
    quote_id: (formData.get('quote_id') as string) || (formData.get('quote') as string) || '',
    role_en: (formData.get('role_en') as string) || '',
    quote_en: (formData.get('quote_en') as string) || '',
    photoUrl: formData.get('photoUrl') as string,
  };

  const validated = TestimonialSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      fieldErrors: validated.error.flatten().fieldErrors,
      error: 'Validation error: Check highlighted fields.',
    };
  }

  try {
    const lastTestimonial = await prisma.testimonial.findFirst({
      orderBy: { order: 'desc' },
    });
    const nextOrder = lastTestimonial ? lastTestimonial.order + 1 : 0;

    const testimonial = await prisma.testimonial.create({
      data: {
        name: validated.data.name,
        photoUrl: validated.data.photoUrl || null,
        order: nextOrder,
        isVisible: true,
      },
    });

    // Upsert Indonesian translation
    await prisma.testimonialTranslation.upsert({
      where: {
        testimonialId_locale: {
          testimonialId: testimonial.id,
          locale: 'id',
        },
      },
      create: {
        testimonialId: testimonial.id,
        locale: 'id',
        role: validated.data.role_id || null,
        quote: validated.data.quote_id,
      },
      update: {
        role: validated.data.role_id || null,
        quote: validated.data.quote_id,
      },
    });

    // Upsert English translation if provided
    if (validated.data.quote_en?.trim() || validated.data.role_en?.trim()) {
      await prisma.testimonialTranslation.upsert({
        where: {
          testimonialId_locale: {
            testimonialId: testimonial.id,
            locale: 'en',
          },
        },
        create: {
          testimonialId: testimonial.id,
          locale: 'en',
          role: validated.data.role_en || validated.data.role_id || null,
          quote: validated.data.quote_en || validated.data.quote_id,
        },
        update: {
          role: validated.data.role_en || validated.data.role_id || null,
          quote: validated.data.quote_en || validated.data.quote_id,
        },
      });
    }

    revalidatePath('/', 'layout');
    revalidatePath('/[locale]', 'layout');
    revalidatePath(getAdminPath('testimonials'));
    return { success: 'Testimoni berhasil dibuat.' };
  } catch (error) {
    console.error('Failed to create testimonial:', error);
    return { error: 'Save failed: Unable to create testimonial.' };
  }
}

export async function updateTestimonial(
  id: string,
  prevState: TestimonialActionState,
  formData: FormData
): Promise<TestimonialActionState> {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  const rawData = {
    name: formData.get('name') as string,
    role_id: (formData.get('role_id') as string) || (formData.get('role') as string) || '',
    quote_id: (formData.get('quote_id') as string) || (formData.get('quote') as string) || '',
    role_en: (formData.get('role_en') as string) || '',
    quote_en: (formData.get('quote_en') as string) || '',
    photoUrl: formData.get('photoUrl') as string,
  };

  const validated = TestimonialSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      fieldErrors: validated.error.flatten().fieldErrors,
      error: 'Validation error: Check highlighted fields.',
    };
  }

  try {
    await prisma.testimonial.update({
      where: { id },
      data: {
        name: validated.data.name,
        photoUrl: validated.data.photoUrl || null,
      },
    });

    // Upsert Indonesian translation
    await prisma.testimonialTranslation.upsert({
      where: {
        testimonialId_locale: {
          testimonialId: id,
          locale: 'id',
        },
      },
      create: {
        testimonialId: id,
        locale: 'id',
        role: validated.data.role_id || null,
        quote: validated.data.quote_id,
      },
      update: {
        role: validated.data.role_id || null,
        quote: validated.data.quote_id,
      },
    });

    // Upsert English translation
    if (validated.data.quote_en?.trim() || validated.data.role_en?.trim()) {
      await prisma.testimonialTranslation.upsert({
        where: {
          testimonialId_locale: {
            testimonialId: id,
            locale: 'en',
          },
        },
        create: {
          testimonialId: id,
          locale: 'en',
          role: validated.data.role_en || validated.data.role_id || null,
          quote: validated.data.quote_en || validated.data.quote_id,
        },
        update: {
          role: validated.data.role_en || validated.data.role_id || null,
          quote: validated.data.quote_en || validated.data.quote_id,
        },
      });
    }

    revalidatePath('/', 'layout');
    revalidatePath('/[locale]', 'layout');
    revalidatePath(getAdminPath('testimonials'));
    return { success: 'Testimoni berhasil diperbarui.' };
  } catch (error) {
    console.error('Failed to update testimonial:', error);
    return { error: 'Save failed: Unable to update testimonial.' };
  }
}

export async function deleteTestimonial(id: string): Promise<TestimonialActionState> {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    await prisma.testimonial.delete({ where: { id } });
    revalidatePath('/', 'layout');
    revalidatePath('/[locale]', 'layout');
    revalidatePath(getAdminPath('testimonials'));
    return { success: 'Testimoni berhasil dihapus.' };
  } catch (error) {
    return { error: 'Delete failed: Unable to remove testimonial.' };
  }
}

export async function toggleTestimonialVisibility(
  id: string,
  isVisible: boolean
): Promise<TestimonialActionState> {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    await prisma.testimonial.update({
      where: { id },
      data: { isVisible },
    });
    revalidatePath('/', 'layout');
    revalidatePath('/[locale]', 'layout');
    revalidatePath(getAdminPath('testimonials'));
    return { success: 'Visibilitas testimoni diperbarui.' };
  } catch (error) {
    return { error: 'Update failed: Unable to save visibility.' };
  }
}

export async function moveTestimonialOrder(
  id: string,
  direction: 'up' | 'down'
): Promise<TestimonialActionState> {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    const testimonials = await prisma.testimonial.findMany({ orderBy: { order: 'asc' } });
    const index = testimonials.findIndex(t => t.id === id);

    if (index === -1) return { error: 'Testimonial not found.' };
    if (direction === 'up' && index === 0) return { error: 'Already at top.' };
    if (direction === 'down' && index === testimonials.length - 1) return { error: 'Already at bottom.' };

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const swapTarget = testimonials[swapIndex];
    const current = testimonials[index];

    await prisma.$transaction([
      prisma.testimonial.update({ where: { id: current.id }, data: { order: swapTarget.order } }),
      prisma.testimonial.update({ where: { id: swapTarget.id }, data: { order: current.order } }),
    ]);

    revalidatePath('/', 'layout');
    revalidatePath('/[locale]', 'layout');
    revalidatePath(getAdminPath('testimonials'));
    return { success: 'Urutan testimoni berhasil diperbarui.' };
  } catch (error) {
    return { error: 'Reorder failed: Unable to save new order.' };
  }
}
