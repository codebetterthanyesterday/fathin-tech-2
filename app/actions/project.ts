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
  title: z.string().min(1, 'Judul wajib diisi'),
  slug: z.string().optional(), // If empty, we'll auto-generate
  summary: z.string().min(1, 'Ringkasan wajib diisi'),
  description: z.string().optional(),
  techStack: z.array(z.string()).default([]),
  demoUrl: z.string().url('URL tidak valid').optional().or(z.literal('')),
  repoUrl: z.string().url('URL tidak valid').optional().or(z.literal('')),
  isFeatured: z.boolean().default(false),
  images: z.array(projectImageSchema).default([]),
  // Enriched fields
  role: z.string().optional(),
  duration: z.string().optional(),
  teamSize: z.coerce.number().optional().or(z.literal('')),
  keyMetrics: z.array(z.string()).default([]),
  challenges: z.string().optional(),
  solutions: z.string().optional(),
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
  id: string | null,
  prevState: any,
  formData: FormData
): Promise<ProjectActionState> {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  // Parse complex data from formData
  // techStack is submitted as JSON string array
  const techStackRaw = formData.get('techStack');
  let techStack = [];
  try {
    if (techStackRaw) techStack = JSON.parse(techStackRaw as string);
  } catch (e) {
    return { error: 'Parse error: Invalid techStack format.' };
  }

  // images is submitted as JSON string array
  const imagesRaw = formData.get('images');
  let images = [];
  try {
    if (imagesRaw) images = JSON.parse(imagesRaw as string);
  } catch (e) {
    return { error: 'Parse error: Invalid images format.' };
  }

  // keyMetrics is submitted as JSON string array
  const keyMetricsRaw = formData.get('keyMetrics');
  let keyMetrics = [];
  try {
    if (keyMetricsRaw) keyMetrics = JSON.parse(keyMetricsRaw as string);
  } catch (e) {
    return { error: 'Parse error: Invalid keyMetrics format.' };
  }

  // categories is submitted as JSON string array
  const categoriesRaw = formData.get('categories');
  let categories = [];
  try {
    if (categoriesRaw) categories = JSON.parse(categoriesRaw as string);
  } catch (e) {
    return { error: 'Parse error: Invalid categories format.' };
  }

  const rawData = {
    title: formData.get('title') as string,
    slug: formData.get('slug') as string,
    summary: formData.get('summary') as string,
    description: formData.get('description') as string,
    demoUrl: formData.get('demoUrl') as string,
    repoUrl: formData.get('repoUrl') as string,
    isFeatured: formData.get('isFeatured') === 'on' || formData.get('isFeatured') === 'true',
    techStack,
    images,
    role: formData.get('role') as string,
    duration: formData.get('duration') as string,
    teamSize: formData.get('teamSize'),
    challenges: formData.get('challenges') as string,
    solutions: formData.get('solutions') as string,
    videoUrl: formData.get('videoUrl') as string,
    keyMetrics,
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
    // Determine slug
    const baseSlug = data.slug ? slugify(data.slug) : slugify(data.title);
    const uniqueSlug = await ensureUniqueSlug(baseSlug, id || undefined);

    const payload = {
      title: data.title,
      slug: uniqueSlug,
      summary: data.summary,
      description: data.description || null,
      techStack: data.techStack,
      demoUrl: data.demoUrl || null,
      repoUrl: data.repoUrl || null,
      isFeatured: data.isFeatured,
      role: data.role || null,
      duration: data.duration || null,
      teamSize: typeof data.teamSize === 'number' ? data.teamSize : null,
      challenges: data.challenges || null,
      solutions: data.solutions || null,
      videoUrl: data.videoUrl || null,
      keyMetrics: data.keyMetrics,
      categories: data.categories,
    };

    if (id) {
      // UPDATE
      await prisma.project.update({
        where: { id },
        data: {
          ...payload,
          // Since it's a 1-to-many, the easiest way to handle images is delete all and recreate them,
          // OR use a transactional create/update/delete.
          // Because we only care about the URL and order, deleting and recreating is safe and clean.
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
    } else {
      // CREATE
      const lastProject = await prisma.project.findFirst({
        orderBy: { order: 'desc' },
      });
      const newOrder = lastProject ? lastProject.order + 1 : 0;

      await prisma.project.create({
        data: {
          ...payload,
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
    }

    revalidatePath('/');
    revalidatePath(getAdminPath('projects'));
    return { success: id ? 'Project updated.' : 'Project created.' };
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
    revalidatePath('/');
    revalidatePath(getAdminPath('projects'));
    return { success: 'Project deleted.' };
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
    
    revalidatePath('/');
    revalidatePath(getAdminPath('projects'));
    return { success: true };
  } catch (error) {
    console.error('Failed to reorder projects:', error);
    return { error: 'Reorder failed: Unable to save new order.' };
  }
}

export async function getExistingTechStacks() {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    const projects = await prisma.project.findMany({
      select: { techStack: true },
    });

    // Flatten and get unique tags
    const allTags = projects.flatMap((p) => p.techStack);
    const uniqueTags = Array.from(new Set(allTags)).sort();

    return { tags: uniqueTags };
  } catch (error) {
    console.error('Failed to fetch tech stacks:', error);
    return { error: 'Failed to retrieve tags.' };
  }
}

export async function checkProjectSlug(slug: string, excludeId?: string) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    const existing = await prisma.project.findUnique({ where: { slug } });
    if (existing && existing.id !== excludeId) {
      return { isAvailable: false };
    }
    return { isAvailable: true };
  } catch (error) {
    console.error('Failed to check slug:', error);
    return { error: 'Failed to check slug availability.' };
  }
}
