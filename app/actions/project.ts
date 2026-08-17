'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { getAdminPath } from '@/lib/routes';

// Helper to slugify a string
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-');      // Replace multiple - with single -
}

const projectImageSchema = z.object({
  id: z.string().optional(),
  url: z.string().url(),
  altText: z.string().optional(),
  order: z.number().default(0),
});

const projectSchema = z.object({
  title_id: z.string().min(1, 'Judul (ID) wajib diisi'),
  summary_id: z.string().min(1, 'Ringkasan (ID) wajib diisi'),
  description_id: z.string().optional(),
  role_id: z.string().optional(),
  duration_id: z.string().optional(),
  challenges_id: z.string().optional(),
  solutions_id: z.string().optional(),
  keyMetrics_id: z.array(z.string()).default([]),

  title_en: z.string().optional(),
  summary_en: z.string().optional(),
  description_en: z.string().optional(),
  role_en: z.string().optional(),
  duration_en: z.string().optional(),
  challenges_en: z.string().optional(),
  solutions_en: z.string().optional(),
  keyMetrics_en: z.array(z.string()).default([]),

  slug: z.string().optional(), // If empty, we'll auto-generate from title_id
  techStack: z.array(z.string()).default([]),
  demoUrl: z.string().url('URL tidak valid').optional().or(z.literal('')),
  repoUrl: z.string().url('URL tidak valid').optional().or(z.literal('')),
  isFeatured: z.boolean().default(false),
  images: z.array(projectImageSchema).default([]),
  teamSize: z.coerce.number().optional().or(z.literal('')),
  videoUrl: z.string().url('URL tidak valid').optional().or(z.literal('')),
  categories: z.array(z.string()).default([]),
});

export type ProjectActionState = {
  success?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function getProjects() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { order: 'asc' },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        translations: true,
      },
    });
    return { projects };
  } catch (error) {
    console.error('Failed to get projects:', error);
    return { error: 'Fetch failed: Unable to retrieve projects data.' };
  }
}

export async function getProject(id: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        translations: true,
      },
    });
    return { project };
  } catch (error) {
    console.error('Failed to get project:', error);
    return { error: 'Fetch failed: Project not found.' };
  }
}

async function ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await prisma.project.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) {
      break;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

export async function upsertProject(
  prevState: any,
  formData: FormData
): Promise<ProjectActionState> {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  const id = (formData.get('id') as string) || null;

  // Parse arrays from JSON form data
  const parseJsonArray = (fieldName: string) => {
    const raw = formData.get(fieldName);
    if (!raw) return [];
    try {
      return JSON.parse(raw as string);
    } catch {
      return [];
    }
  };

  const techStack = parseJsonArray('techStack');
  const images = parseJsonArray('images');
  const categories = parseJsonArray('categories');
  const keyMetrics_id = parseJsonArray('keyMetrics_id');
  const keyMetrics_en = parseJsonArray('keyMetrics_en');

  const rawData = {
    title_id: (formData.get('title_id') as string) || (formData.get('title') as string) || '',
    summary_id: (formData.get('summary_id') as string) || (formData.get('summary') as string) || '',
    description_id: (formData.get('description_id') as string) || (formData.get('description') as string) || '',
    role_id: (formData.get('role_id') as string) || (formData.get('role') as string) || '',
    duration_id: (formData.get('duration_id') as string) || (formData.get('duration') as string) || '',
    challenges_id: (formData.get('challenges_id') as string) || (formData.get('challenges') as string) || '',
    solutions_id: (formData.get('solutions_id') as string) || (formData.get('solutions') as string) || '',
    keyMetrics_id,

    title_en: (formData.get('title_en') as string) || '',
    summary_en: (formData.get('summary_en') as string) || '',
    description_en: (formData.get('description_en') as string) || '',
    role_en: (formData.get('role_en') as string) || '',
    duration_en: (formData.get('duration_en') as string) || '',
    challenges_en: (formData.get('challenges_en') as string) || '',
    solutions_en: (formData.get('solutions_en') as string) || '',
    keyMetrics_en,

    slug: formData.get('slug') as string,
    demoUrl: formData.get('demoUrl') as string,
    repoUrl: formData.get('repoUrl') as string,
    isFeatured: formData.get('isFeatured') === 'on' || formData.get('isFeatured') === 'true',
    techStack,
    images,
    teamSize: formData.get('teamSize'),
    videoUrl: formData.get('videoUrl') as string,
    categories,
  };

  const validated = projectSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      error: 'Validation error: Check highlighted fields.',
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  const data = validated.data;
  
  try {
    // Determine unique slug
    const baseSlug = data.slug ? slugify(data.slug) : slugify(data.title_id);
    const uniqueSlug = await ensureUniqueSlug(baseSlug, id || undefined);

    const basePayload = {
      slug: uniqueSlug,
      techStack: data.techStack,
      demoUrl: data.demoUrl || null,
      repoUrl: data.repoUrl || null,
      isFeatured: data.isFeatured,
      teamSize: typeof data.teamSize === 'number' ? data.teamSize : null,
      videoUrl: data.videoUrl || null,
      categories: data.categories,
    };

    let projectId: string;

    if (id) {
      // UPDATE BASE
      await prisma.project.update({
        where: { id },
        data: {
          ...basePayload,
          images: {
            deleteMany: {},
            create: data.images.map((img, idx) => ({
              url: img.url,
              altText: img.altText || null,
              order: idx,
            })),
          },
        },
      });
      projectId = id;
    } else {
      // CREATE BASE
      const lastProject = await prisma.project.findFirst({
        orderBy: { order: 'desc' },
      });
      const newOrder = lastProject ? lastProject.order + 1 : 0;

      const created = await prisma.project.create({
        data: {
          ...basePayload,
          order: newOrder,
          images: {
            create: data.images.map((img, idx) => ({
              url: img.url,
              altText: img.altText || null,
              order: idx,
            })),
          },
        },
      });
      projectId = created.id;
    }

    // Upsert Indonesian Translation (Default)
    await prisma.projectTranslation.upsert({
      where: {
        projectId_locale: {
          projectId,
          locale: 'id',
        },
      },
      create: {
        projectId,
        locale: 'id',
        title: data.title_id,
        summary: data.summary_id,
        description: data.description_id || null,
        role: data.role_id || null,
        duration: data.duration_id || null,
        challenges: data.challenges_id || null,
        solutions: data.solutions_id || null,
        keyMetrics: data.keyMetrics_id,
      },
      update: {
        title: data.title_id,
        summary: data.summary_id,
        description: data.description_id || null,
        role: data.role_id || null,
        duration: data.duration_id || null,
        challenges: data.challenges_id || null,
        solutions: data.solutions_id || null,
        keyMetrics: data.keyMetrics_id,
      },
    });

    // Upsert English Translation (if provided)
    if (data.title_en?.trim() || data.summary_en?.trim()) {
      await prisma.projectTranslation.upsert({
        where: {
          projectId_locale: {
            projectId,
            locale: 'en',
          },
        },
        create: {
          projectId,
          locale: 'en',
          title: data.title_en || data.title_id,
          summary: data.summary_en || data.summary_id,
          description: data.description_en || null,
          role: data.role_en || null,
          duration: data.duration_en || null,
          challenges: data.challenges_en || null,
          solutions: data.solutions_en || null,
          keyMetrics: data.keyMetrics_en,
        },
        update: {
          title: data.title_en || data.title_id,
          summary: data.summary_en || data.summary_id,
          description: data.description_en || null,
          role: data.role_en || null,
          duration: data.duration_en || null,
          challenges: data.challenges_en || null,
          solutions: data.solutions_en || null,
          keyMetrics: data.keyMetrics_en,
        },
      });
    }

    revalidatePath('/', 'layout');
    revalidatePath('/[locale]', 'layout');
    revalidatePath(getAdminPath('projects'));
    return { success: id ? 'Proyek berhasil diperbarui.' : 'Proyek berhasil dibuat.' };
  } catch (error) {
    console.error('Failed to upsert project:', error);
    return { error: 'Save failed: Unable to write project to database.' };
  }
}

export async function deleteProject(id: string) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    await prisma.project.delete({ where: { id } });
    revalidatePath('/', 'layout');
    revalidatePath('/[locale]', 'layout');
    revalidatePath(getAdminPath('projects'));
    return { success: 'Proyek berhasil dihapus.' };
  } catch (error) {
    console.error('Failed to delete project:', error);
    return { error: 'Delete failed: Unable to remove project.' };
  }
}

export async function reorderProjects(updates: { id: string; order: number }[]) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    const queries = updates.map((update) => 
      prisma.project.update({
        where: { id: update.id },
        data: { order: update.order },
      })
    );
    
    await prisma.$transaction(queries);
    
    revalidatePath('/', 'layout');
    revalidatePath('/[locale]', 'layout');
    revalidatePath(getAdminPath('projects'));
    return { success: 'Urutan proyek berhasil diperbarui.' };
  } catch (error) {
    console.error('Failed to reorder projects:', error);
    return { error: 'Reorder failed: Unable to update projects order.' };
  }
}

export async function toggleFeaturedProject(id: string, isFeatured: boolean) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    await prisma.project.update({
      where: { id },
      data: { isFeatured },
    });
    
    revalidatePath('/', 'layout');
    revalidatePath('/[locale]', 'layout');
    revalidatePath(getAdminPath('projects'));
    return { success: `Proyek ${isFeatured ? 'dijadikan unggulan' : 'batal diunggulkan'}.` };
  } catch (error) {
    console.error('Failed to toggle featured status:', error);
    return { error: 'Toggle failed: Unable to update project.' };
  }
}

export async function getExistingTechStacks() {
  try {
    const projects = await prisma.project.findMany({
      select: { techStack: true },
    });
    const set = new Set<string>();
    for (const p of projects) {
      if (Array.isArray(p.techStack)) {
        for (const t of p.techStack) {
          if (t) set.add(t);
        }
      }
    }
    return { tags: Array.from(set) };
  } catch (error) {
    console.error('Failed to get existing tech stacks:', error);
    return { tags: [] };
  }
}

export async function checkProjectSlug(slug: string, currentId?: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { slug },
      select: { id: true },
    });
    return {
      available: !project || project.id === currentId,
    };
  } catch (error) {
    console.error('Failed to check project slug:', error);
    return { available: true };
  }
}

