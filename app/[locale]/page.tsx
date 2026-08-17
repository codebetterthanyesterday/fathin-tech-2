import { getPortfolioData, getSections } from '@/lib/data';
import { Metadata } from 'next';
import {
  ProjectsGridContent,
  ExperienceTimelineContent,
  SkillsGridContent,
  TestimonialsContent,
  ArticlesListContent,
} from '@/lib/sections/schema';
import { prisma } from '@/lib/prisma';
import ContactSection from '@/components/public/contact-section';
import JsonLd from '@/components/public/json-ld';
import ThemeToggle from '@/components/public/layout/theme-toggle';
import SearchTrigger from '@/components/public/search/search-trigger';
import LanguageSwitcher from '@/components/public/layout/language-switcher';
import { setRequestLocale } from 'next-intl/server';
import {
  resolveProject,
  resolveExperience,
  resolveTestimonial,
  resolveArticle,
} from '@/lib/translations';

// Minimal Template Imports
import MinimalHeroSection from '@/components/public/templates/minimal/hero-section';
import MinimalSkillsSection from '@/components/public/templates/minimal/skills-section';
import MinimalFeaturedProjects from '@/components/public/templates/minimal/featured-projects';
import MinimalExperienceTimeline from '@/components/public/templates/minimal/experience-timeline';
import MinimalTestimonialsSection from '@/components/public/templates/minimal/testimonials-section';
import MinimalArticlesSection from '@/components/public/templates/minimal/articles-section';

// Immersive Template Imports
import ImmersiveHeroSection from '@/components/public/templates/immersive/hero-section';
import ImmersiveSkillsSection from '@/components/public/templates/immersive/skills-section';
import ImmersiveFeaturedProjects from '@/components/public/templates/immersive/featured-projects';
import ImmersiveExperienceTimeline from '@/components/public/templates/immersive/experience-timeline';
import ImmersiveTestimonialsSection from '@/components/public/templates/immersive/testimonials-section';
import ImmersiveArticlesSection from '@/components/public/templates/immersive/articles-section';

const templates: Record<string, any> = {
  minimal: {
    HeroSection: MinimalHeroSection,
    SkillsSection: MinimalSkillsSection,
    FeaturedProjects: MinimalFeaturedProjects,
    ExperienceTimeline: MinimalExperienceTimeline,
    TestimonialsSection: MinimalTestimonialsSection,
    ArticlesSection: MinimalArticlesSection,
  },
  immersive: {
    HeroSection: ImmersiveHeroSection,
    SkillsSection: ImmersiveSkillsSection,
    FeaturedProjects: ImmersiveFeaturedProjects,
    ExperienceTimeline: ImmersiveExperienceTimeline,
    TestimonialsSection: ImmersiveTestimonialsSection,
    ArticlesSection: ImmersiveArticlesSection,
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { profile } = await getPortfolioData(locale);

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
      url: `/${locale}`,
      siteName: profile.name,
      locale: locale === 'id' ? 'id_ID' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        id: '/id',
        en: '/en',
        'x-default': '/id',
      },
    },
  };
}

// ─── Section data fetchers scoped per type with localized resolution ───────────

async function fetchProjectsData(content: ProjectsGridContent, locale: string) {
  const filter = content.filter ?? 'featured';
  const limit = content.limit;

  let rawProjects;
  if (filter === 'featured') {
    rawProjects = await prisma.project.findMany({
      where: { isFeatured: true },
      orderBy: { order: 'asc' },
      take: limit,
      include: {
        images: { orderBy: { order: 'asc' } },
        translations: true,
      },
    });
    if (rawProjects.length === 0) {
      rawProjects = await prisma.project.findMany({
        take: limit ?? 3,
        orderBy: { order: 'asc' },
        include: {
          images: { orderBy: { order: 'asc' } },
          translations: true,
        },
      });
    }
  } else {
    rawProjects = await prisma.project.findMany({
      orderBy: { order: 'asc' },
      take: limit,
      include: {
        images: { orderBy: { order: 'asc' } },
        translations: true,
      },
    });
  }

  return rawProjects
    .map((p) => resolveProject(p, locale))
    .filter(Boolean);
}

async function fetchExperienceData(content: ExperienceTimelineContent, locale: string) {
  const types = content.types && content.types.length > 0 ? content.types : undefined;
  const rawExperiences = await prisma.experience.findMany({
    where: types ? { type: { in: types } } : undefined,
    take: content.limit,
    include: {
      translations: true,
    },
  });

  const sorted = rawExperiences.sort((a, b) => {
    if (a.endDate === null && b.endDate !== null) return -1;
    if (b.endDate === null && a.endDate !== null) return 1;
    if (a.endDate && b.endDate) {
      const diff = b.endDate.getTime() - a.endDate.getTime();
      if (diff !== 0) return diff;
    }
    return b.startDate.getTime() - a.startDate.getTime();
  });

  return sorted
    .map((e) => resolveExperience(e, locale))
    .filter(Boolean);
}

async function fetchSkillsData(content: SkillsGridContent) {
  const categories = content.categories && content.categories.length > 0 ? content.categories : undefined;
  return prisma.skill.findMany({
    where: categories ? { category: { in: categories as any } } : undefined,
    orderBy: { order: 'asc' },
  });
}

async function fetchTestimonialsData(content: TestimonialsContent, locale: string) {
  const rawTestimonials = await prisma.testimonial.findMany({
    where: { isVisible: true },
    take: content.limit || undefined,
    orderBy: { order: 'asc' },
    include: {
      translations: true,
    },
  });

  return rawTestimonials
    .map((t) => resolveTestimonial(t, locale))
    .filter(Boolean);
}

async function fetchArticlesData(content: ArticlesListContent, locale: string) {
  const rawArticles = await prisma.article.findMany({
    where: { isPublished: true },
    take: content.limit || 3,
    orderBy: { publishedAt: 'desc' },
    include: {
      translations: true,
    },
  });

  return rawArticles
    .map((a) => resolveArticle(a, locale))
    .filter(Boolean);
}

// ─── Main page ───────────────────────────────────────────────────────────────

interface HomePageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home(props: HomePageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const searchParams = await props.searchParams;
  const { profile, error } = await getPortfolioData(locale);
  const { sections } = await getSections();

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center text-[var(--text-primary)] p-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Portfolio Not Ready</h1>
          <p className="text-[var(--text-secondary)]">The portfolio data has not been configured yet.</p>
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

  const requestedTemplate = typeof searchParams?.template === 'string' ? searchParams.template : undefined;
  const themeTemplate = (
    (requestedTemplate && (requestedTemplate === 'minimal' || requestedTemplate === 'immersive')
      ? requestedTemplate
      : profile.themeTemplate) as 'minimal' | 'immersive'
  ) || 'minimal';
  const Template = templates[themeTemplate] || templates['minimal'];

  // Floating Controls (Theme Toggle + Search + Language Switcher)
  const floatingToggle = (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
      <SearchTrigger variant="compact" className="shadow-lg backdrop-blur-xl bg-[var(--bg-elevated)]/85" />
      <LanguageSwitcher variant={themeTemplate} />
      <ThemeToggle />
    </div>
  );

  // If no sections configured yet, fall back to the legacy layout
  if (sections.length === 0) {
    const [skills, projects, rawExperiences] = await Promise.all([
      prisma.skill.findMany({ orderBy: { order: 'asc' } }),
      prisma.project.findMany({
        where: { isFeatured: true },
        orderBy: { order: 'asc' },
        include: { images: { orderBy: { order: 'asc' } }, translations: true },
      }),
      prisma.experience.findMany({
        include: { translations: true },
      }),
    ]);

    const resolvedProjects = projects.map((p) => resolveProject(p, locale)).filter(Boolean);
    const sorted = rawExperiences.sort((a, b) => {
      if (a.endDate === null && b.endDate !== null) return -1;
      if (b.endDate === null && a.endDate !== null) return 1;
      return b.startDate.getTime() - a.startDate.getTime();
    });
    const resolvedExperiences = sorted.map((e) => resolveExperience(e, locale)).filter(Boolean);

    return (
      <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[var(--selection-bg)] selection:text-[var(--selection-text)] overflow-hidden relative">
        <JsonLd data={personSchema} />
        {floatingToggle}
        <Template.HeroSection profile={profile} />
        {skills.length > 0 && <Template.SkillsSection skills={skills} />}
        {resolvedProjects.length > 0 && <Template.FeaturedProjects projects={resolvedProjects} />}
        {resolvedExperiences.length > 0 && <Template.ExperienceTimeline experiences={resolvedExperiences} />}
        <ContactSection />
        <footer className="py-8 text-center border-t border-[var(--border-subtle)] text-sm text-[var(--text-tertiary)] bg-[var(--bg-surface)]">
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
        const projects = await fetchProjectsData(rawContent as ProjectsGridContent, locale);
        if (projects.length > 0) {
          renderedSections.push(<Template.FeaturedProjects key={section.id} projects={projects} />);
        }
        break;
      }

      case 'EXPERIENCE_TIMELINE': {
        const experiences = await fetchExperienceData(rawContent as ExperienceTimelineContent, locale);
        if (experiences.length > 0) {
          renderedSections.push(<Template.ExperienceTimeline key={section.id} experiences={experiences} />);
        }
        break;
      }

      case 'CUSTOM_TEXT': {
        if (rawContent?.heading && rawContent?.body) {
          renderedSections.push(
            <section key={section.id} className="py-24 px-4 sm:px-8 border-t border-[var(--border-subtle)]">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-6">{rawContent.heading}</h2>
                <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{rawContent.body}</p>
              </div>
            </section>
          );
        }
        break;
      }

      case 'TESTIMONIALS': {
        const testimonials = await fetchTestimonialsData(rawContent as TestimonialsContent, locale);
        if (testimonials.length > 0) {
          renderedSections.push(<Template.TestimonialsSection key={section.id} testimonials={testimonials} />);
        }
        break;
      }

      case 'ARTICLES_LIST': {
        const articles = await fetchArticlesData(rawContent as ArticlesListContent, locale);
        if (articles.length > 0) {
          renderedSections.push(<Template.ArticlesSection key={section.id} articles={articles} />);
        }
        break;
      }

      default:
        break;
    }
  }

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[var(--selection-bg)] selection:text-[var(--selection-text)] overflow-hidden relative">
      <JsonLd data={personSchema} />
      {floatingToggle}

      {renderedSections}

      {/* Contact section is always rendered outside the section system */}
      <ContactSection />

      <footer className="py-8 text-center border-t border-[var(--border-subtle)] text-sm text-[var(--text-tertiary)] bg-[var(--bg-surface)]">
        <p>© {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
      </footer>
    </main>
  );
}
