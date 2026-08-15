import { prisma } from './prisma';

export async function getPortfolioData() {
  try {
    // Parallel fetching for performance
    const [profile, skills, projects, rawExperiences] = await Promise.all([
      prisma.profile.findFirst(),
      prisma.skill.findMany({
        orderBy: { order: 'asc' },
      }),
      prisma.project.findMany({
        where: { isFeatured: true },
        orderBy: { order: 'asc' },
        include: { images: { orderBy: { order: 'asc' } } }
      }),
      prisma.experience.findMany()
    ]);

    // If no featured projects, fetch top 3 newest/ordered projects as fallback
    let featuredProjects = projects;
    if (featuredProjects.length === 0) {
      featuredProjects = await prisma.project.findMany({
        take: 3,
        orderBy: { order: 'asc' },
        include: { images: { orderBy: { order: 'asc' } } }
      });
    }

    // Sort experiences: Present first, then endDate DESC, then startDate DESC
    const experiences = rawExperiences.sort((a, b) => {
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

    return {
      profile,
      skills,
      projects: featuredProjects,
      experiences,
      error: null
    };
  } catch (error) {
    console.error("Failed to fetch portfolio data:", error);
    return {
      profile: null,
      skills: [],
      projects: [],
      experiences: [],
      error: 'Failed to fetch portfolio data.'
    };
  }
}

export async function getProjectBySlug(slug: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { slug },
      include: {
        images: {
          orderBy: { order: 'asc' }
        }
      }
    });
    return project;
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
