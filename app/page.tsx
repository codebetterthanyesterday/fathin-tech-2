import { getPortfolioData, getSections } from '@/lib/data';
import { Metadata } from 'next';
import {
  ProjectsGridContent,
  ExperienceTimelineContent,
  SkillsGridContent,
} from '@/lib/sections/schema';
import { prisma } from '@/lib/prisma';
import ContactSection from '@/components/public/contact-section';
import JsonLd from '@/components/public/json-ld';

// Minimal Template Imports
import MinimalHeroSection from '@/components/public/templates/minimal/hero-section';
import MinimalSkillsSection from '@/components/public/templates/minimal/skills-section';
import MinimalFeaturedProjects from '@/components/public/templates/minimal/featured-projects';
import MinimalExperienceTimeline from '@/components/public/templates/minimal/experience-timeline';

// Immersive Template Imports
import ImmersiveHeroSection from '@/components/public/templates/immersive/hero-section';
import ImmersiveSkillsSection from '@/components/public/templates/immersive/skills-section';
import ImmersiveFeaturedProjects from '@/components/public/templates/immersive/featured-projects';
import ImmersiveExperienceTimeline from '@/components/public/templates/immersive/experience-timeline';

const templates: Record<string, any> = {
  minimal: {
    HeroSection: MinimalHeroSection,
    SkillsSection: MinimalSkillsSection,
    FeaturedProjects: MinimalFeaturedProjects,
    ExperienceTimeline: MinimalExperienceTimeline,
  },
  immersive: {
    HeroSection: ImmersiveHeroSection,
    SkillsSection: ImmersiveSkillsSection,
    FeaturedProjects: ImmersiveFeaturedProjects,
    ExperienceTimeline: ImmersiveExperienceTimeline,
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getPortfolioData();

  if (!profile) {
    return {
      title: 'Portfolio',
      description: 'Personal Portfolio',
    };
  }

  const title = `${profile.name} — ${profile.tagline}`;
  const description = profile.bio || profile.tagline || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: '/',
      siteName: profile.name,
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: '/',
    },
  };
}

// ─── Section data fetchers scoped per type ───────────────────────────────────

async function fetchProjectsData(content: ProjectsGridContent) {
  const filter = content.filter ?? 'featured';
  const limit = content.limit;

  if (filter === 'featured') {
    let projects = await prisma.project.findMany({
      where: { isFeatured: true },
      orderBy: { order: 'asc' },
      take: limit,
      include: { images: { orderBy: { order: 'asc' } } },
    });
    // Fallback: if no featured projects, show top N by order
    if (projects.length === 0) {
      projects = await prisma.project.findMany({
        take: limit ?? 3,
        orderBy: { order: 'asc' },
        include: { images: { orderBy: { order: 'asc' } } },
      });
    }
    return projects;
  }

  return prisma.project.findMany({
    orderBy: { order: 'asc' },
    take: limit,
    include: { images: { orderBy: { order: 'asc' } } },
  });
}

async function fetchExperienceData(content: ExperienceTimelineContent) {
  const types = content.types && content.types.length > 0 ? content.types : undefined;
  const rawExperiences = await prisma.experience.findMany({
    where: types ? { type: { in: types } } : undefined,
    take: content.limit,
  });

  return rawExperiences.sort((a, b) => {
    if (a.endDate === null && b.endDate !== null) return -1;
    if (b.endDate === null && a.endDate !== null) return 1;
    if (a.endDate && b.endDate) {
      const diff = b.endDate.getTime() - a.endDate.getTime();
      if (diff !== 0) return diff;
    }
    return b.startDate.getTime() - a.startDate.getTime();
  });
}

async function fetchSkillsData(content: SkillsGridContent) {
  const categories = content.categories && content.categories.length > 0 ? content.categories : undefined;
  return prisma.skill.findMany({
    where: categories ? { category: { in: categories as any } } : undefined,
    orderBy: { order: 'asc' },
  });
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default async function Home() {
  const { profile, error } = await getPortfolioData();
  const { sections } = await getSections();

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white p-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Portfolio Not Ready</h1>
          <p className="text-zinc-400">The portfolio data has not been configured yet.</p>
        </div>
      </div>
    );
  }

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    description: profile.bio || profile.tagline,
    jobTitle: profile.tagline,
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    ...(profile.photoUrl ? { image: profile.photoUrl } : {}),
    ...(profile.email ? { email: profile.email } : {}),
    sameAs: profile.socialLinks
      ? (Array.isArray(profile.socialLinks)
        ? profile.socialLinks.map((link: any) => (typeof link === 'string' ? link : link.url)).filter((v: any) => typeof v === 'string')
        : Object.values(profile.socialLinks).filter(v => typeof v === 'string'))
      : [],
  };

  const themeTemplate = profile.themeTemplate || 'minimal';
  const Template = templates[themeTemplate] || templates['minimal'];

  // If no sections configured yet, fall back to the legacy hardcoded layout
  // This ensures zero regressions if seed hasn't been run yet
  if (sections.length === 0) {
    const [skills, projects, rawExperiences] = await Promise.all([
      prisma.skill.findMany({ orderBy: { order: 'asc' } }),
      prisma.project.findMany({ where: { isFeatured: true }, orderBy: { order: 'asc' }, include: { images: { orderBy: { order: 'asc' } } } }),
      prisma.experience.findMany(),
    ]);
    const experiences = rawExperiences.sort((a, b) => {
      if (a.endDate === null && b.endDate !== null) return -1;
      if (b.endDate === null && a.endDate !== null) return 1;
      return b.startDate.getTime() - a.startDate.getTime();
    });
    return (
      <main className="min-h-screen bg-[#050505] text-white selection:bg-white/20 selection:text-white overflow-hidden">
        <JsonLd data={personSchema} />
        <Template.HeroSection profile={profile} />
        {skills.length > 0 && <Template.SkillsSection skills={skills} />}
        {projects.length > 0 && <Template.FeaturedProjects projects={projects} />}
        {experiences.length > 0 && <Template.ExperienceTimeline experiences={experiences} />}
        <ContactSection />
        <footer className="py-8 text-center border-t border-white/5 text-sm text-zinc-600 bg-[#0a0a0a]">
          <p>© {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
        </footer>
      </main>
    );
  }

  // ─── Render sections dynamically ──────────────────────────────────────────

  const renderedSections: React.ReactNode[] = [];

  for (const section of sections) {
    const rawContent = section.content as any;

    switch (section.type) {
      case 'HERO':
        renderedSections.push(<Template.HeroSection key={section.id} profile={profile} ctaOverride={rawContent} />);
        break;

      case 'SKILLS_GRID': {
        const skills = await fetchSkillsData(rawContent as SkillsGridContent);
        if (skills.length > 0) {
          renderedSections.push(<Template.SkillsSection key={section.id} skills={skills} />);
        }
        break;
      }

      case 'PROJECTS_GRID': {
        const projects = await fetchProjectsData(rawContent as ProjectsGridContent);
        if (projects.length > 0) {
          renderedSections.push(<Template.FeaturedProjects key={section.id} projects={projects} />);
        }
        break;
      }

      case 'EXPERIENCE_TIMELINE': {
        const experiences = await fetchExperienceData(rawContent as ExperienceTimelineContent);
        if (experiences.length > 0) {
          renderedSections.push(<Template.ExperienceTimeline key={section.id} experiences={experiences} />);
        }
        break;
      }

      // Kerangka types — rendered as placeholder in production
      case 'CUSTOM_TEXT': {
        if (rawContent?.heading && rawContent?.body) {
          renderedSections.push(
            <section key={section.id} className="py-24 px-4 sm:px-8 border-t border-white/5">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold text-white mb-6">{rawContent.heading}</h2>
                <p className="text-zinc-400 leading-relaxed whitespace-pre-wrap">{rawContent.body}</p>
              </div>
            </section>
          );
        }
        break;
      }

      // TESTIMONIALS and ARTICLES_LIST are stubs — no-op until their PBIs
      case 'TESTIMONIALS':
      case 'ARTICLES_LIST':
        break;

      default:
        break;
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-white/20 selection:text-white overflow-hidden">
      <JsonLd data={personSchema} />

      {renderedSections}

      {/* Contact section is always rendered outside the section system */}
      <ContactSection />

      <footer className="py-8 text-center border-t border-white/5 text-sm text-zinc-600 bg-[#0a0a0a]">
        <p>© {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
      </footer>
    </main>
  );
}
