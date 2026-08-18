import type {
  Profile,
  ProfileTranslation,
  Project,
  ProjectTranslation,
  ProjectImage,
  Article,
  ArticleTranslation,
  Experience,
  ExperienceTranslation,
  Testimonial,
  TestimonialTranslation,
  Skill,
  SkillTranslation,
} from '@/app/generated/prisma/client';

/**
 * Generic translation resolver implementing strict fallback order:
 * 1. Requested locale translation
 * 2. Default locale ('id') translation
 * 3. First available translation (if any)
 * 4. null
 */
export function resolveTranslation<T extends { locale: string }>(
  translations: T[] | undefined | null,
  requestedLocale: string,
  defaultLocale: string = 'id'
): T | null {
  if (!translations || translations.length === 0) return null;
  const exact = translations.find((t) => t.locale === requestedLocale);
  if (exact) return exact;
  const fallback = translations.find((t) => t.locale === defaultLocale);
  if (fallback) return fallback;
  return translations[0] || null;
}

// ─── Typed Resolved Entity Types ─────────────────────────────────────────────

export interface ResolvedProfile extends Omit<Profile, 'translations'> {
  tagline: string | null;
  bio: string | null;
  location: string | null;
  translations?: ProfileTranslation[];
}

export interface ResolvedProject extends Omit<Project, 'translations'> {
  title: string;
  summary: string;
  description: string | null;
  role: string | null;
  duration: string | null;
  challenges: string | null;
  solutions: string | null;
  keyMetrics: string[];
  images: ProjectImage[];
  translations?: ProjectTranslation[];
}

export interface ResolvedArticle extends Omit<Article, 'translations'> {
  title: string;
  excerpt: string | null;
  contentMd: string;
  translations?: ArticleTranslation[];
}

export interface ResolvedExperience extends Omit<Experience, 'translations'> {
  title: string;
  institution: string;
  description: string | null;
  translations?: ExperienceTranslation[];
}

export interface ResolvedTestimonial extends Omit<Testimonial, 'translations'> {
  role: string | null;
  quote: string;
  translations?: TestimonialTranslation[];
}

export interface ResolvedSkill extends Omit<Skill, 'translations'> {
  name: string;
  translations?: SkillTranslation[];
}

// ─── Entity Resolvers ───────────────────────────────────────────────────────

export function resolveProfile(
  profile: (Profile & { translations?: ProfileTranslation[] }) | null,
  locale: string = 'id'
): ResolvedProfile | null {
  if (!profile) return null;
  const trans = resolveTranslation<ProfileTranslation>(profile.translations, locale, 'id');

  return {
    ...profile,
    tagline: trans?.tagline || null,
    bio: trans?.bio || null,
    location: trans?.location || profile.location || null,
  };
}

export function resolveProject(
  project: (Project & { images?: ProjectImage[]; translations?: ProjectTranslation[] }) | null,
  locale: string = 'id'
): ResolvedProject | null {
  if (!project) return null;
  const trans = resolveTranslation<ProjectTranslation>(project.translations, locale, 'id');

  return {
    ...project,
    title: trans?.title || 'Untitled Project',
    summary: trans?.summary || '',
    description: trans?.description || null,
    role: trans?.role || null,
    duration: trans?.duration || null,
    challenges: trans?.challenges || null,
    solutions: trans?.solutions || null,
    keyMetrics: trans?.keyMetrics || [],
    images: project.images || [],
  };
}

export function resolveArticle(
  article: (Article & { translations?: ArticleTranslation[] }) | null,
  locale: string = 'id'
): ResolvedArticle | null {
  if (!article) return null;
  const trans = resolveTranslation<ArticleTranslation>(article.translations, locale, 'id');

  return {
    ...article,
    title: trans?.title || 'Untitled Article',
    excerpt: trans?.excerpt || null,
    contentMd: trans?.contentMd || '',
  };
}

export function resolveExperience(
  exp: (Experience & { translations?: ExperienceTranslation[] }) | null,
  locale: string = 'id'
): ResolvedExperience | null {
  if (!exp) return null;
  const trans = resolveTranslation<ExperienceTranslation>(exp.translations, locale, 'id');

  return {
    ...exp,
    title: trans?.title || 'Role / Degree',
    institution: trans?.institution || exp.institution,
    description: trans?.description || null,
  };
}

export function resolveTestimonial(
  testimonial: (Testimonial & { translations?: TestimonialTranslation[] }) | null,
  locale: string = 'id'
): ResolvedTestimonial | null {
  if (!testimonial) return null;
  const trans = resolveTranslation<TestimonialTranslation>(testimonial.translations, locale, 'id');

  return {
    ...testimonial,
    role: trans?.role || null,
    quote: trans?.quote || '',
  };
}

export function resolveSkill(
  skill: (Skill & { translations?: SkillTranslation[] }) | null,
  locale: string = 'id'
): ResolvedSkill | null {
  if (!skill) return null;
  const trans = resolveTranslation<SkillTranslation>(skill.translations, locale, 'id');

  return {
    ...skill,
    name: trans?.name || skill.name,
  };
}

