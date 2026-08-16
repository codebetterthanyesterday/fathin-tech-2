'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { getAdminPath } from '@/lib/routes';
import { SkillCategory } from '@/app/generated/prisma/client';

const skillSchema = z.object({
  name: z.string().min(1, 'Nama skill wajib diisi'),
  category: z.nativeEnum(SkillCategory, { message: 'Kategori tidak valid' }),
  level: z.coerce.number().min(1).max(5).optional().or(z.literal('')),
});

export type SkillActionState = {
  success?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function getSkills() {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: [
        { category: 'asc' },
        { order: 'asc' }
      ],
    });
    return { skills };
  } catch (error) {
    console.error('Failed to get skills:', error);
    return { error: 'Fetch failed: Unable to retrieve skills data.' };
  }
}

export async function createSkill(prevState: any, formData: FormData): Promise<SkillActionState> {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  const rawData = {
    name: formData.get('name') as string,
    category: formData.get('category') as string,
    level: formData.get('level'),
  };

  const validated = skillSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      error: 'Validation error: Check highlighted fields.',
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  const data = validated.data;
  const levelNum = data.level === '' || data.level === undefined ? null : Number(data.level);

  try {
    // Get highest order for the category
    const lastSkill = await prisma.skill.findFirst({
      where: { category: data.category },
      orderBy: { order: 'desc' },
    });
    
    const newOrder = lastSkill ? lastSkill.order + 1 : 0;

    await prisma.skill.create({
      data: {
        name: data.name,
        category: data.category,
        level: levelNum,
        order: newOrder,
      },
    });

    revalidatePath('/');
    revalidatePath(getAdminPath('skills'));
    return { success: 'Skill added.' };
  } catch (error) {
    console.error('Failed to create skill:', error);
    return { error: 'Save failed: Unable to create skill.' };
  }
}

export async function updateSkill(id: string, prevState: any, formData: FormData): Promise<SkillActionState> {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  const rawData = {
    name: formData.get('name') as string,
    category: formData.get('category') as string,
    level: formData.get('level'),
  };

  const validated = skillSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      error: 'Validation error: Check highlighted fields.',
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  const data = validated.data;
  const levelNum = data.level === '' || data.level === undefined ? null : Number(data.level);

  try {
    const existing = await prisma.skill.findUnique({ where: { id } });
    if (!existing) return { error: 'Update failed: Skill not found.' };

    let newOrder = existing.order;
    // If category changed, assign new order at the end of the new category
    if (existing.category !== data.category) {
      const lastSkill = await prisma.skill.findFirst({
        where: { category: data.category },
        orderBy: { order: 'desc' },
      });
      newOrder = lastSkill ? lastSkill.order + 1 : 0;
    }

    await prisma.skill.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        level: levelNum,
        order: newOrder,
      },
    });

    revalidatePath('/');
    revalidatePath(getAdminPath('skills'));
    return { success: 'Skill updated.' };
  } catch (error) {
    console.error('Failed to update skill:', error);
    return { error: 'Save failed: Unable to update skill.' };
  }
}

export async function deleteSkill(id: string) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    await prisma.skill.delete({ where: { id } });
    revalidatePath('/');
    revalidatePath(getAdminPath('skills'));
    return { success: 'Skill deleted.' };
  } catch (error) {
    console.error('Failed to delete skill:', error);
    return { error: 'Delete failed: Unable to remove skill.' };
  }
}

export async function reorderSkills(updates: { id: string; order: number }[]) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    // Prisma transaction to update multiple rows
    const queries = updates.map((update) => 
      prisma.skill.update({
        where: { id: update.id },
        data: { order: update.order },
      })
    );
    
    await prisma.$transaction(queries);
    
    revalidatePath('/');
    revalidatePath(getAdminPath('skills'));
    return { success: true };
  } catch (error) {
    console.error('Failed to reorder skills:', error);
    return { error: 'Reorder failed: Unable to save new order.' };
  }
}
