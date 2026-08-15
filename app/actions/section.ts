'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { SectionContentSchema, DEFAULT_CONTENT } from '@/lib/sections/schema';

export type SectionActionState = {
  success?: string;
  error?: string;
};

// ─── Toggle visibility ───────────────────────────────────────────────────────

export async function toggleSectionVisibility(
  id: string,
  isVisible: boolean
): Promise<SectionActionState> {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    await prisma.section.update({
      where: { id },
      data: { isVisible },
    });

    revalidatePath('/');
    revalidatePath('/admin/sections');
    return { success: 'Section visibility updated.' };
  } catch (error) {
    console.error('Failed to toggle section visibility:', error);
    return { error: 'Failed to update section.' };
  }
}

// ─── Move section order (simple up/down until PBI-011) ──────────────────────

export async function moveSectionOrder(
  id: string,
  direction: 'up' | 'down'
): Promise<SectionActionState> {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    const sections = await prisma.section.findMany({ orderBy: { order: 'asc' } });
    const index = sections.findIndex(s => s.id === id);

    if (index === -1) return { error: 'Section not found.' };
    if (direction === 'up' && index === 0) return { error: 'Already at top.' };
    if (direction === 'down' && index === sections.length - 1) return { error: 'Already at bottom.' };

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const swapTarget = sections[swapIndex];
    const current = sections[index];

    // Swap orders in a transaction
    await prisma.$transaction([
      prisma.section.update({ where: { id: current.id }, data: { order: swapTarget.order } }),
      prisma.section.update({ where: { id: swapTarget.id }, data: { order: current.order } }),
    ]);

    revalidatePath('/');
    revalidatePath('/admin/sections');
    return { success: 'Section order updated.' };
  } catch (error) {
    console.error('Failed to move section:', error);
    return { error: 'Failed to reorder section.' };
  }
}

// ─── Update section title ────────────────────────────────────────────────────

export async function updateSectionTitle(
  id: string,
  title: string
): Promise<SectionActionState> {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    await prisma.section.update({ where: { id }, data: { title: title || null } });
    revalidatePath('/');
    revalidatePath('/admin/sections');
    return { success: 'Title updated.' };
  } catch (error) {
    return { error: 'Failed to update title.' };
  }
}

// ─── Update section content (validated via Zod) ──────────────────────────────

export async function updateSectionContent(
  id: string,
  rawContent: unknown
): Promise<SectionActionState> {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  const parsed = SectionContentSchema.safeParse(rawContent);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return { error: `Invalid content: ${firstError?.message ?? 'unknown error'}` };
  }

  try {
    await prisma.section.update({
      where: { id },
      data: { content: parsed.data as any },
    });
    revalidatePath('/');
    revalidatePath('/admin/sections');
    return { success: 'Section content saved.' };
  } catch (error) {
    return { error: 'Failed to save section content.' };
  }
}

// ─── Batch reorder (PBI-011) ─────────────────────────────────────────────────

/**
 * Accepts the new ordered list of section IDs and batch-updates
 * all `order` fields in a single Prisma $transaction.
 *
 * Strategy: assign order = index (0,1,2,...) for every id in the array.
 * We update ALL positions in one transaction rather than just the swapped
 * pair, so that the list stays consistent even after multiple rapid reorders.
 */
export async function reorderSections(
  orderedIds: string[]
): Promise<SectionActionState> {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.section.update({ where: { id }, data: { order: index } })
      )
    );

    revalidatePath('/');
    revalidatePath('/admin/sections');
    return { success: 'Order saved.' };
  } catch (error) {
    console.error('Failed to reorder sections:', error);
    return { error: 'Failed to save new order. Please try again.' };
  }
}

