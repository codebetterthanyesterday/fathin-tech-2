'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const TestimonialSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  role: z.string().max(100).optional(),
  quote: z.string().min(1, 'Quote is required').max(3000, 'Quote is too long'),
  photoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export type TestimonialActionState = {
  success?: string;
  error?: string;
  fieldErrors?: {
    name?: string[];
    role?: string[];
    quote?: string[];
    photoUrl?: string[];
  };
};

export async function getTestimonials() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { order: 'asc' },
    });
    return { testimonials };
  } catch (error) {
    console.error('Failed to fetch testimonials:', error);
    return { error: 'Failed to load testimonials', testimonials: [] };
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
    role: formData.get('role') as string,
    quote: formData.get('quote') as string,
    photoUrl: formData.get('photoUrl') as string,
  };

  const validated = TestimonialSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      fieldErrors: validated.error.flatten().fieldErrors,
      error: 'Please correct the errors in the form.',
    };
  }

  try {
    // Get highest order
    const lastTestimonial = await prisma.testimonial.findFirst({
      orderBy: { order: 'desc' },
    });
    const nextOrder = lastTestimonial ? lastTestimonial.order + 1 : 0;

    await prisma.testimonial.create({
      data: {
        name: validated.data.name,
        role: validated.data.role || null,
        quote: validated.data.quote,
        photoUrl: validated.data.photoUrl || null,
        order: nextOrder,
        isVisible: true,
      },
    });

    revalidatePath('/');
    revalidatePath('/admin/testimonials');
    return { success: 'Testimonial created successfully!' };
  } catch (error) {
    console.error('Failed to create testimonial:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
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
    role: formData.get('role') as string,
    quote: formData.get('quote') as string,
    photoUrl: formData.get('photoUrl') as string,
  };

  const validated = TestimonialSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      fieldErrors: validated.error.flatten().fieldErrors,
      error: 'Please correct the errors in the form.',
    };
  }

  try {
    await prisma.testimonial.update({
      where: { id },
      data: {
        name: validated.data.name,
        role: validated.data.role || null,
        quote: validated.data.quote,
        photoUrl: validated.data.photoUrl || null,
      },
    });

    revalidatePath('/');
    revalidatePath('/admin/testimonials');
    return { success: 'Testimonial updated successfully!' };
  } catch (error) {
    console.error('Failed to update testimonial:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function deleteTestimonial(id: string): Promise<TestimonialActionState> {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    await prisma.testimonial.delete({ where: { id } });
    revalidatePath('/');
    revalidatePath('/admin/testimonials');
    return { success: 'Testimonial deleted successfully.' };
  } catch (error) {
    return { error: 'Failed to delete testimonial.' };
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
    revalidatePath('/');
    revalidatePath('/admin/testimonials');
    return { success: 'Visibility updated.' };
  } catch (error) {
    return { error: 'Failed to update visibility.' };
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

    revalidatePath('/');
    revalidatePath('/admin/testimonials');
    return { success: 'Order updated.' };
  } catch (error) {
    return { error: 'Failed to reorder.' };
  }
}
