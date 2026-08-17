import { prisma } from './prisma';
import {
  resolveProfile,
  resolveProject,
  resolveExperience,
  ResolvedProfile,
  ResolvedProject,
  ResolvedExperience,
} from './translations';

export async function getPortfolioData(locale: string = 'id'): Promise<{
  profile: ResolvedProfile | null;
  skills: any[];
  projects: ResolvedProject[];
  experiences: ResolvedExperience[];
  error: string | null;
}> {
  try {
    // Parallel fetching for performance
    const [rawProfile, skills, rawProjects, rawExperiences] = await Promise.all([
      prisma.profile.findFirst({
        include: { translations: true },
      }),
      prisma.skill.findMany({
        orderBy: { order: 'asc' },
      }),
      prisma.project.findMany({
        where: { isFeatured: true },
        orderBy: { order: 'asc' },
        include: {
          images: { orderBy: { order: 'asc' } },
          translations: true,
        },
      }),
      prisma.experience.findMany({
        include: { translations: true },
      }),
    ]);

    // If no featured projects, fetch top 3 newest/ordered projects as fallback
    let candidateProjects = rawProjects;
    if (candidateProjects.length === 0) {
      candidateProjects = await prisma.project.findMany({
        take: 3,
        orderBy: { order: 'asc' },
        include: {
          images: { orderBy: { order: 'asc' } },
          translations: true,
        },
      });
    }

    const profile = resolveProfile(rawProfile, locale);
    const projects = candidateProjects
      .map((p) => resolveProject(p, locale))
      .filter((p): p is ResolvedProject => p !== null);

    // Sort experiences: Present first, then endDate DESC, then startDate DESC
    const sortedRawExperiences = rawExperiences.sort((a, b) => {
      if (a.endDate === null && b.endDate !== null) return -1;
      if (b.endDate === null && a.endDate !== null) return 1;

      if (a.endDate && b.endDate) {
        const endDiff = b.endDate.getTime() - a.endDate.getTime();
        if (endDiff !== 0) return endDiff;
      }

      const startDiff = b.startDate.getTime() - a.startDate.getTime();
      if (startDiff !== 0) return startDiff;

      return a.order - b.order;
    });

    const experiences = sortedRawExperiences
      .map((e) => resolveExperience(e, locale))
      .filter((e): e is ResolvedExperience => e !== null);

    return {
      profile,
      skills,
      projects,
      experiences,
      error: null,
    };
  } catch (error) {
    console.error('Failed to fetch portfolio data:', error);
    return {
      profile: null,
      skills: [],
      projects: [],
      experiences: [],
      error: 'Failed to fetch portfolio data.',
    };
  }
}

export async function getProjectBySlug(
  slug: string,
  locale: string = 'id'
): Promise<ResolvedProject | null> {
  try {
    const rawProject = await prisma.project.findUnique({
      where: { slug },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        translations: true,
      },
    });

    return resolveProject(rawProject, locale);
  } catch (error) {
    console.error(`Failed to fetch project with slug ${slug}:`, error);
    return null;
  }
}

// ─── Section fetchers (PBI-010) ─────────────────────────────────────────────

/** For the public homepage: only visible sections, ordered. */
export async function getSections() {
  try {
    const sections = await prisma.section.findMany({
      where: { isVisible: true },
      orderBy: { order: 'asc' },
    });
    return { sections };
  } catch (error) {
    console.error('Failed to fetch sections:', error);
    return { sections: [] };
  }
}

/** For the admin panel: all sections regardless of visibility. */
export async function getAllSections() {
  try {
    const sections = await prisma.section.findMany({
      orderBy: { order: 'asc' },
    });
    return { sections };
  } catch (error) {
    console.error('Failed to fetch all sections:', error);
    return { sections: [] };
  }
}
